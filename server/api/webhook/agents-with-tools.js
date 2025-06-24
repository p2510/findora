// server/api/webhook/agents-with-tools.js
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import axios from "axios";
import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";
import { adaptiveSearch } from "~/server/utils/adaptive-search";
import { searchCache } from "~/server/utils/cache";
import { generateOptimizedPrompt } from "~/server/utils/embeddings";
import { getAgentTools, handleToolCall } from "~/server/utils/tools-handler";

export default defineEventHandler(async (event) => {
  console.log("🚀 Webhook Agent IA avec Tools - Début");

  // Configuration constants
  const config = useRuntimeConfig();
  const supabaseUrl = "https://puxvccwmxfpgyocglioe.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";

  const CONVERSATION_TIMEOUT_MINUTES = 30;
  const DEFAULT_BOT_RESPONSE = "Nous vous répondrons dans un instant";
  const MAX_EXCHANGES = 32;
  let SUPPORT_PHONE = "2250500145177";

  // Initialiser OpenAI
  const openai = new OpenAI({
    apiKey: config.openai_api_key || "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",
  });

  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: "agent_ia" },
  });
  const supabasePublic = createClient(supabaseUrl, supabaseKey);

  // Obtenir les tools depuis le gestionnaire
  const tools = getAgentTools();

  try {
    const requestBody = await readBody(event);
    const { messages, channel_id: channelId } = requestBody;

    if (!messages || !messages.length || !channelId) {
      return { success: false, message: "Données de webhook invalides" };
    }

    // Validation du canal et récupération des informations
    const channelValidation = await validateChannel(channelId, supabasePublic);
    if (!channelValidation.valid) {
      return { success: false, message: channelValidation.message };
    }

    const { token, userId } = channelValidation;

    // Vérifier l'abonnement
    const subscriptionCheck = await checkSubscription(userId, supabasePublic);
    if (!subscriptionCheck.valid) {
      return { success: false, message: subscriptionCheck.message };
    }

    // Récupérer l'agent
    const agentData = await getAgent(userId, supabase);
    if (!agentData.valid) {
      return { success: false, message: agentData.message };
    }

    const { agent } = agentData;

    // Vérifier WhatsApp
    const whatsappCheck = await verifyWhatsApp(token);
    if (!whatsappCheck.valid) {
      return { success: false, message: whatsappCheck.message };
    }

    // Récupérer le numéro de support
    SUPPORT_PHONE = await getSupportPhone(channelId) || SUPPORT_PHONE;

    // Traiter les messages
    const processedMessages = [];

    await Promise.all(
      messages.map(async (message) => {
        if (message.from_me) return;

        const messageData = await extractMessageContent(message, openai);
        if (!messageData.content) return;

        try {
          const result = await processMessage({
            ...messageData,
            agent,
            userId,
            token,
            SUPPORT_PHONE,
            supabase,
            supabasePublic,
            openai,
            tools,
            MAX_EXCHANGES,
            DEFAULT_BOT_RESPONSE,
            CONVERSATION_TIMEOUT_MINUTES
          });

          processedMessages.push(result);
        } catch (error) {
          console.error(`Erreur traitement message ${messageData.senderPhone}:`, error);
          processedMessages.push({
            phone: messageData.senderPhone,
            status: "error",
            error: error.message
          });
        }
      })
    );

    return {
      success: true,
      message: "Messages traités avec succès",
      processed: processedMessages,
    };
  } catch (error) {
    console.error("Erreur globale:", error);
    return {
      success: false,
      message: "Erreur lors du traitement de la webhook",
      error: error.message,
    };
  }
});

// Fonctions utilitaires séparées

async function validateChannel(channelId, supabasePublic) {
  const { data: channel, error } = await supabasePublic
    .from("whatsapp_backlogs")
    .select("expire_date, chanel_id, token, user_id")
    .eq("chanel_id", channelId)
    .single();

  if (error) {
    console.error("Erreur récupération canal:", error);
    return { valid: false, message: "Canal introuvable" };
  }

  if (new Date() > new Date(channel.expire_date)) {
    return { valid: false, message: "Canal expiré" };
  }

  return { valid: true, token: channel.token, userId: channel.user_id };
}

async function checkSubscription(userId, supabasePublic) {
  const { data: subscription, error } = await supabasePublic
    .from("subscriptions")
    .select("subscription_type, max_limit")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Erreur récupération abonnement:", error);
    return { valid: false, message: "Abonnement introuvable" };
  }

  if (subscription.max_limit <= 0) {
    return { valid: false, message: "Crédit insuffisant" };
  }

  return { valid: true, subscription };
}

async function getAgent(userId, supabase) {
  const { data: agent, error } = await supabase
    .from("agent_configs")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Erreur récupération agent:", error);
    return { valid: false, message: "Agent non trouvé" };
  }

  if (!agent.status) {
    return { valid: false, message: "Agent inactif" };
  }

  return { valid: true, agent };
}

async function verifyWhatsApp(token) {
  try {
    const healthResponse = await fetch("https://gate.whapi.cloud/health", {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());

    if (healthResponse.status?.text !== "AUTH") {
      return { valid: false, message: "Canal WhatsApp non autorisé" };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, message: "Erreur vérification WhatsApp" };
  }
}

async function getSupportPhone(channelId) {
  try {
    const usersResponse = await fetch(
      `https://manager.whapi.cloud/channels/${channelId}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImExZDI2YWYyYmY4MjVmYjI5MzVjNWI3OTY3ZDA3YmYwZTMxZWIxYjcifQ.eyJwYXJ0bmVyIjp0cnVlLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vd2hhcGktYTcyMWYiLCJhdWQiOiJ3aGFwaS1hNzIxZiIsImF1dGhfdGltZSI6MTc0MDI0MjM1NCwidXNlcl9pZCI6IlQyTWlGanlkSnBlaGhIbWcyUWszTnFTMlFKOTIiLCJzdWIiOiJUMk1pRmp5ZEpwZWhoSG1nMlFrM05xUzJRSjkyIiwiaWF0IjoxNzQwMjQyMzU0LCJleHAiOjE4MDA3MjIzNTQsImVtYWlsIjoicG91cG9pbmFrYTAzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInBvdXBvaW5ha2EwM0BnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.SeY-wcxw9lYuKOsgUN4Yyq4mSLq5WR_6K5hHh8kwjjUxG022yh21OaUmX2v4fY8S2lMZ4ndASEvHh-LAgV4Z38JGlC-vjmjciaznvur-XSrj7Vp2bOGYuGVstze_2KdQYXozQnR0HhafIUkI-JFSjy3dl2KYbiLGiVBw52-por8BcleeNfe1Sa75PbDrYI79Y3_ey7aOl3BiyrEKC-w7cJf9tCvOE-4cj8cLfIn6IkapygX6kpIdi3FFIkmk_XSNtfbJZhSnKC6KWRNA6V7zvN9JpkI3_bU5IzOWpEGzFele3Yq5tauPruS1uq6og6Yi265DqO0ZmHFGfz3B60ovXw`,
        },
      }
    ).then((res) => res.json());

    return usersResponse?.phone;
  } catch (err) {
    console.log("Impossible de récupérer le numéro de support");
    return null;
  }
}

async function extractMessageContent(message, openai) {
  const senderPhone = message.from;
  const senderName = message?.from_name || "";
  let messageContent = null;

  if (message.text) {
    messageContent = message.text?.body || "";
  } else if (message.voice) {
    try {
      messageContent = await transcribeVoiceMessage(message.voice, openai);
    } catch (error) {
      console.error("Erreur transcription:", error);
      messageContent = "Je n'ai pas pu comprendre votre message vocal. Pourriez-vous envoyer un message texte à la place?";
    }
  }

  return { senderPhone, senderName, content: messageContent };
}

async function transcribeVoiceMessage(voice, openai) {
  const tempDir = "/tmp";
  const voiceUrl = voice.link;

  if (!voiceUrl) throw new Error("URL audio manquante");

  const tempFilePath = path.join(
    tempDir,
    `voice_${Date.now()}_${Math.random().toString(36).substring(2, 15)}.oga`
  );

  const response = await axios({
    method: "GET",
    url: voiceUrl,
    responseType: "arraybuffer",
  });

  await fsPromises.writeFile(tempFilePath, response.data);

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(tempFilePath),
    model: "whisper-1",
    response_format: "text",
  });

  await fsPromises.unlink(tempFilePath);
  return transcription;
}

async function processMessage(params) {
  const {
    senderPhone,
    senderName,
    content,
    agent,
    userId,
    token,
    SUPPORT_PHONE,
    supabase,
    supabasePublic,
    openai,
    tools,
    MAX_EXCHANGES,
    DEFAULT_BOT_RESPONSE,
    CONVERSATION_TIMEOUT_MINUTES
  } = params;

  // Gérer la conversation
  const { conversationId, isNewConversation } = await handleConversation(
    supabase,
    agent.id,
    userId,
    senderPhone,
    senderName,
    CONVERSATION_TIMEOUT_MINUTES
  );

  // Vérifier le nombre d'échanges
  const { count: exchangeCount } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("conversation_id", conversationId);

  if (exchangeCount >= MAX_EXCHANGES) {
    return await handleMaxExchangesReached({
      supabase,
      supabasePublic,
      token,
      SUPPORT_PHONE,
      senderPhone,
      senderName,
      content,
      conversationId,
      userId
    });
  }

  // Stocker le message
  const { data: insertedMessage } = await supabase
    .from("messages")
    .insert([{
      conversation_id: conversationId,
      user_id: userId,
      content: content,
      response: DEFAULT_BOT_RESPONSE,
    }])
    .select()
    .single();

  // Générer la réponse IA avec tools
  const aiResult = await generateAIResponse({
    content,
    agent,
    conversationId,
    insertedMessage,
    supabase,
    openai,
    tools,
    userId,
    token,
    SUPPORT_PHONE,
    senderPhone,
    senderName
  });

  // Si l'agent a demandé un transfert
  if (aiResult.delegated) {
    await terminateAndDecrementLimit(supabase, supabasePublic, conversationId, userId);
    return {
      phone: senderPhone,
      status: "delegated",
      reason: aiResult.reason,
      tool_call: aiResult.tool_call
    };
  }

  // Envoyer la réponse au client
  const response = await sendWhatsAppMessage(token, senderPhone, aiResult.response);

  return {
    phone: senderPhone,
    status: response.sent ? "sent" : "failed",
    aiResponse: aiResult.response !== DEFAULT_BOT_RESPONSE,
    language: aiResult.language,
    fromCache: aiResult.fromCache,
    tool_call: aiResult.tool_call
  };
}

async function generateAIResponse(params) {
  const {
    content,
    agent,
    conversationId,
    insertedMessage,
    supabase,
    openai,
    tools,
    userId,
    token,
    SUPPORT_PHONE,
    senderPhone,
    senderName
  } = params;

  let response = "Nous vous répondrons dans un instant";
  let language = "fr";
  let fromCache = false;
  let tool_call = null;
  let delegated = false;
  let reason = null;

  try {
    // Recherche adaptative
    let searchResult = searchCache.get(content, agent.id);
    if (!searchResult) {
      searchResult = await adaptiveSearch(content, agent.id, openai, supabase);
      searchCache.set(content, agent.id, searchResult);
    } else {
      fromCache = true;
    }

    const { chunks, analysis } = searchResult;
    language = analysis.language || "fr";

    // Générer le prompt
    const systemPrompt = generateOptimizedPrompt(
      agent.name,
      agent.personality,
      agent.goal,
      chunks
    );

    const finalPrompt = systemPrompt + 
      (analysis.language !== "fr" 
        ? `\n\nIMPORTANT: L'utilisateur a posé sa question en ${analysis.language}. Réponds dans la même langue.`
        : "");

    // Récupérer l'historique
    const { data: recentMessages } = await supabase
      .from("messages")
      .select("content, response, created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: false })
      .limit(10);

    const conversationHistory = recentMessages
      ?.reverse()
      .slice(0, -1)
      .map((msg) => ({
        role: msg.response ? "assistant" : "user",
        content: msg.response || msg.content,
      })) || [];

    // Appeler GPT avec tools
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: finalPrompt },
        ...conversationHistory,
        { role: "user", content: content },
      ],
      max_tokens: 400,
      temperature: 0.3,
      tools,
      tool_choice: "auto",
    });

    // Vérifier si un tool a été appelé
    if (completion.choices[0].message.tool_calls) {
      const toolCall = completion.choices[0].message.tool_calls[0];
      tool_call = toolCall.function.name;

      const toolResult = await handleToolCall(toolCall, {
        token,
        supabase,
        senderPhone,
        senderName,
        conversationId,
        userId,
        insertedMessageId: insertedMessage.id,
        SUPPORT_PHONE
      });

      response = toolResult.response;
      delegated = toolResult.delegated || false;
      reason = toolResult.reason;
    } else {
      // Réponse normale sans tool
      response = completion.choices[0]?.message?.content || 
        getDefaultResponse(language);
    }

    // Mettre à jour le message
    await supabase
      .from("messages")
      .update({
        response,
        metadata: {
          language,
          cached: fromCache,
          chunks_found: chunks.length,
          tool_call: tool_call,
          delegated,
          reason
        }
      })
      .eq("id", insertedMessage.id);

  } catch (error) {
    console.error("Erreur génération IA:", error);
    response = "Un conseiller va vous répondre rapidement.";
    
    // Notifier le support en cas d'erreur
    await sendWhatsAppMessage(
      token,
      SUPPORT_PHONE,
      `Erreur IA: ${error.message} pour ${senderName} (${senderPhone})`
    );
  }

  return {
    response,
    language,
    fromCache,
    tool_call,
    delegated,
    reason
  };
}

// Autres fonctions utilitaires...

async function handleConversation(supabase, agentId, userId, phone, name, timeoutMinutes) {
  // Implémentation existante...
}

async function handleMaxExchangesReached(params) {
  // Implémentation existante...
}

async function terminateAndDecrementLimit(supabase, supabasePublic, conversationId, userId) {
  // Implémentation existante...
}

async function sendWhatsAppMessage(token, to, message) {
  try {
    const response = await fetch("https://gate.whapi.cloud/messages/text", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        typing_time: 0,
        to,
        body: message,
      }),
    });

    return await response.json();
  } catch (error) {
    throw new Error(`Échec d'envoi du message WhatsApp: ${error.message}`);
  }
}

function getDefaultResponse(language) {
  switch(language) {
    case "en": return "Sorry, I couldn't generate a response.";
    case "es": return "Lo siento, no pude generar una respuesta.";
    default: return "Désolé, je n'ai pas pu générer de réponse.";
  }
}