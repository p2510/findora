// server/api/webhook/agents.js
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import axios from "axios";
import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";
import { simpleSearch } from "~/server/utils/agent/simple-search";
import { searchCache } from "~/server/utils/agent/cache";
import { generateOptimizedPrompt } from "~/server/utils/agent/embeddings";

export default defineEventHandler(async (event) => {
  console.log("🚀 Agent conversationnel - Démarrage");

  // Configuration
  const config = useRuntimeConfig();
  const supabaseUrl = config.public.supabase_url || "https://puxvccwmxfpgyocglioe.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";

  const CONVERSATION_TIMEOUT_MINUTES = 30;
  const MAX_EXCHANGES = 32;
  let SUPPORT_PHONE = "2250500145177";

  // Initialisation des clients
  const openai = new OpenAI({
    apiKey: config.openai_api_key || "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",
  });

  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: "agent_ia" },
  });
  const supabasePublic = createClient(supabaseUrl, supabaseKey);

  try {
    const requestBody = await readBody(event);
    const { messages, channel_id: channelId } = requestBody;

    if (!messages?.length || !channelId) {
      return { success: false, message: "Données invalides" };
    }

    // Récupération des informations système
    const systemInfo = await getSystemInfo(channelId, supabasePublic, supabase);
    if (!systemInfo.valid) {
      return { success: false, message: systemInfo.error };
    }

    const { channel, subscription, agent, token, userId } = systemInfo;
    SUPPORT_PHONE = await getSupportPhone(channelId) || SUPPORT_PHONE;

    // Traitement des messages
    const processedMessages = [];

    for (const message of messages) {
      if (message.from_me) continue;

      const result = await processMessage({
        message,
        agent,
        userId,
        token,
        openai,
        supabase,
        supabasePublic,
        SUPPORT_PHONE,
        MAX_EXCHANGES,
        CONVERSATION_TIMEOUT_MINUTES
      });

      if (result) {
        processedMessages.push(result);
      }
    }

    return {
      success: true,
      message: "Traitement terminé",
      processed: processedMessages,
    };
  } catch (error) {
    console.error("Erreur système:", error);
    return {
      success: false,
      message: "Erreur système",
      error: error.message,
    };
  }
});

// Traitement individuel des messages
async function processMessage(params) {
  const {
    message,
    agent,
    userId,
    token,
    openai,
    supabase,
    supabasePublic,
    SUPPORT_PHONE,
    MAX_EXCHANGES,
    CONVERSATION_TIMEOUT_MINUTES
  } = params;

  const senderPhone = message.from;
  const senderName = message?.from_name || "";

  try {
    // Extraction du contenu du message
    const messageContent = await extractMessageContent(message, openai);
    if (!messageContent) return null;

    // Gestion de la conversation
    const { conversationId, isNewConversation } = await handleConversation(
      supabase,
      agent.id,
      userId,
      senderPhone,
      senderName,
      CONVERSATION_TIMEOUT_MINUTES,
      supabasePublic
    );

    // Vérification du nombre d'échanges
    const exchangeCount = await getExchangeCount(supabase, conversationId);
    if (exchangeCount >= MAX_EXCHANGES) {
      return await handleExchangeLimitReached({
        messageContent,
        senderName,
        senderPhone,
        conversationId,
        userId,
        token,
        SUPPORT_PHONE,
        supabase,
        supabasePublic
      });
    }

    // Génération de la réponse IA avec détection du besoin de support
    const aiResponse = await generateAIResponseWithTools({
      messageContent,
      conversationId,
      agent,
      userId,
      openai,
      supabase,
      senderPhone,
      senderName,
      token,
      SUPPORT_PHONE,
      supabasePublic
    });

    // Si l'IA a détecté un besoin de support humain, c'est géré dans generateAIResponseWithTools
    // Sinon, on envoie la réponse normale
    if (!aiResponse.humanSupportRequested) {
      await sendWhatsAppMessage(token, senderPhone, aiResponse.response);
    }

    return {
      phone: senderPhone,
      status: aiResponse.humanSupportRequested ? "delegated" : "success",
      humanSupportRequested: aiResponse.humanSupportRequested
    };

  } catch (error) {
    console.error(`Erreur traitement message ${senderPhone}:`, error);
    
    // Réponse d'urgence simple
    const fallbackResponse = "Un instant s'il vous plaît...";
    await sendWhatsAppMessage(token, senderPhone, fallbackResponse);
    
    return {
      phone: senderPhone,
      status: "error",
      error: error.message
    };
  }
}

// Génération de la réponse IA avec détection de demande de support via tools
async function generateAIResponseWithTools(params) {
  const {
    messageContent,
    conversationId,
    agent,
    userId,
    openai,
    supabase,
    senderPhone,
    senderName,
    token,
    SUPPORT_PHONE,
    supabasePublic
  } = params;

  // Stockage temporaire du message
  const { data: insertedMessage } = await supabase
    .from("messages")
    .insert([{
      conversation_id: conversationId,
      user_id: userId,
      content: messageContent,
      response: "..." // Placeholder temporaire
    }])
    .select()
    .single();

  // Recherche simple dans le cache ou nouvelle recherche
  let searchResult = searchCache.get(messageContent, agent.id);
  
  if (!searchResult) {
    searchResult = await simpleSearch(messageContent, agent.id, openai, supabase);
    searchCache.set(messageContent, agent.id, searchResult);
  }

  const { chunks } = searchResult;

  // Génération du prompt
  const systemPrompt = generateOptimizedPrompt(
    agent.name,
    agent.personality,
    agent.goal,
    chunks
  );

  // Définition des tools
  const tools = [
    {
      type: "function",
      function: {
        name: "translate_to_french",
        description: "Translate user message to French when it's in another language. Use this BEFORE processing any non-French message.",
        parameters: {
          type: "object",
          properties: {
            original_text: {
              type: "string",
              description: "The original text to translate"
            },
            detected_language: {
              type: "string",
              description: "The detected language code (en, es, de, it, ar, etc.)"
            },
            french_translation: {
              type: "string",
              description: "The French translation of the text"
            }
          },
          required: ["original_text", "detected_language", "french_translation"],
          additionalProperties: false
        },
        strict: true
      }
    },
    {
      type: "function",
      function: {
        name: "request_human_support",
        description: "Transfer the conversation to a human support agent when the customer explicitly asks to speak with a human, advisor, or real person",
        parameters: {
          type: "object",
          properties: {
            reason: {
              type: "string",
              description: "Brief reason why human support is needed"
            }
          },
          required: ["reason"],
          additionalProperties: false
        },
        strict: true
      }
    }
  ];

  // Récupération de l'historique
  const conversationHistory = await getConversationHistory(supabase, conversationId);

  // Première génération avec tools
  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages: [
      { 
        role: "system", 
        content: systemPrompt + `\n\nIMPORTANT RULES:
1. If the user message is NOT in French, you MUST FIRST use the translate_to_french function before doing anything else.
2. If the client asks to speak with a human/advisor/real person, use request_human_support function.
3. Always respond in the same language as the user's original message.`
      },
      ...conversationHistory,
      { role: "user", content: messageContent }
    ],
    tools: tools,
    tool_choice: "auto",
    max_tokens: 400,
    temperature: 0.7
  });

  // Traiter les appels de fonction
  const toolCalls = completion.choices[0]?.message?.tool_calls;
  let detectedLanguage = 'fr'; // Par défaut français
  let translatedContent = messageContent;
  let needsTranslationBack = false;
  
  if (toolCalls && toolCalls.length > 0) {
    // Vérifier d'abord si traduction nécessaire
    const translationCall = toolCalls.find(call => call.function.name === "translate_to_french");
    
    if (translationCall) {
      const args = JSON.parse(translationCall.function.arguments);
      detectedLanguage = args.detected_language;
      translatedContent = args.french_translation;
      needsTranslationBack = true;
      
      console.log(`🌐 Traduction détectée: ${detectedLanguage} → fr`);
      console.log(`Original: "${args.original_text}"`);
      console.log(`Traduit: "${translatedContent}"`);
    }
    
    // Vérifier ensuite si support humain demandé
    const humanSupportCall = toolCalls.find(call => call.function.name === "request_human_support");
    
    if (humanSupportCall) {
      // Le client veut un humain
      const args = JSON.parse(humanSupportCall.function.arguments);
      
      // Notification au support (toujours en français)
      const notificationMessage = `${senderName} (${senderPhone}) demande un conseiller.\nRaison: ${args.reason}\nMessage original: "${messageContent}"${needsTranslationBack ? `\nLangue détectée: ${detectedLanguage}` : ''}`;
      await sendWhatsAppMessage(token, SUPPORT_PHONE, notificationMessage);
      
      // Générer une réponse personnalisée pour le transfert
      const transferMessages = [
        { 
          role: "system", 
          content: `Tu es ${agent.name}. Le client vient de demander à parler à un humain/conseiller. Tu dois répondre de manière naturelle et empathique pour confirmer que sa demande est prise en compte.
          
          ${needsTranslationBack ? `TRÈS IMPORTANT: Le client a écrit en ${detectedLanguage}. Tu DOIS répondre en ${detectedLanguage}, PAS en français!` : ''}
          
          Règles:
          - Sois bref (1-2 phrases max)
          - Sois naturel et empathique
          - Confirme que sa demande est comprise
          - Indique qu'un conseiller va le contacter rapidement`
        },
        { role: "user", content: messageContent }
      ];

      const transferResponse = await openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: transferMessages,
        max_tokens: 100,
        temperature: 0.8
      });

      const clientResponse = transferResponse.choices[0]?.message?.content || "I'll connect you with an advisor right away.";
      
      // Envoyer la réponse au client
      await sendWhatsAppMessage(token, senderPhone, clientResponse);

      // Enregistrement
      await supabase
        .from("messages")
        .update({
          response: clientResponse,
          metadata: { 
            delegated: true, 
            reason: "human_requested_via_ai",
            ai_detected_reason: args.reason,
            original_language: detectedLanguage
          }
        })
        .eq("id", insertedMessage.id);

      await terminateAndDecrementLimit(supabase, supabasePublic, conversationId, userId);

      return {
        response: clientResponse,
        humanSupportRequested: true
      };
    }
  }

  // Si pas de demande de support, continuer avec la génération normale
  // Mais utiliser le contenu traduit pour la recherche si nécessaire
  const searchQuery = needsTranslationBack ? translatedContent : messageContent;
  
  // Recherche avec le contenu (potentiellement traduit)
  let knowledgeSearchResult = searchCache.get(searchQuery, agent.id);
  
  if (!knowledgeSearchResult) {
    knowledgeSearchResult = await simpleSearch(searchQuery, agent.id, openai, supabase);
    searchCache.set(searchQuery, agent.id, knowledgeSearchResult);
  }

  const { chunks: knowledgeChunks } = knowledgeSearchResult;

  // Régénérer pour avoir la réponse finale
  const finalMessages = [
    { 
      role: "system", 
      content: generateOptimizedPrompt(agent.name, agent.personality, agent.goal, knowledgeChunks) + 
        (needsTranslationBack ? `\n\nTRÈS IMPORTANT: Le client a écrit en ${detectedLanguage}. Tu DOIS répondre en ${detectedLanguage}, PAS en français!` : '')
    },
    ...conversationHistory,
    { role: "user", content: messageContent }
  ];

  const finalCompletion = await openai.chat.completions.create({
    model: "gpt-4.1-nano",
    messages: finalMessages,
    max_tokens: 400,
    temperature: 0.7
  });

  const aiResponse = finalCompletion.choices[0]?.message?.content || "I'm here to help you.";

  // Mise à jour du message
  await supabase
    .from("messages")
    .update({
      response: aiResponse,
      metadata: {
        cached: !!searchCache.get(searchQuery, agent.id),
        chunks_found: knowledgeChunks.length,
        original_language: detectedLanguage,
        was_translated: needsTranslationBack
      }
    })
    .eq("id", insertedMessage.id);

  return {
    response: aiResponse,
    humanSupportRequested: false
  };
}

// Extraction du contenu (texte ou vocal)
async function extractMessageContent(message, openai) {
  if (message.text) {
    return message.text?.body || "";
  }
  
  if (message.voice) {
    try {
      const voiceUrl = message.voice.link;
      if (!voiceUrl) return null;

      const tempPath = `/tmp/voice_${Date.now()}.oga`;
      
      // Téléchargement
      const response = await axios({
        method: "GET",
        url: voiceUrl,
        responseType: "arraybuffer",
      });

      await fsPromises.writeFile(tempPath, response.data);
      
      // Transcription
      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempPath),
        model: "whisper-1",
        response_format: "text",
      });

      await fsPromises.unlink(tempPath);
      return transcription;
      
    } catch (error) {
      console.error("Erreur transcription:", error);
      return null;
    }
  }
  
  return null;
}

// Fonctions utilitaires (restent les mêmes)
async function getSystemInfo(channelId, supabasePublic, supabase) {
  try {
    // Canal
    const { data: channel, error: channelError } = await supabasePublic
      .from("whatsapp_backlogs")
      .select("*")
      .eq("chanel_id", channelId)
      .single();

    if (channelError || !channel) {
      return { valid: false, error: "Canal introuvable" };
    }

    if (new Date() > new Date(channel.expire_date)) {
      return { valid: false, error: "Canal expiré" };
    }

    // Abonnement
    const { data: subscription, error: subError } = await supabasePublic
      .from("subscriptions")
      .select("*")
      .eq("user_id", channel.user_id)
      .single();

    if (subError || !subscription || subscription.max_limit <= 0) {
      return { valid: false, error: "Crédit insuffisant" };
    }

    // Agent
    const { data: agent, error: agentError } = await supabase
      .from("agent_configs")
      .select("*")
      .eq("user_id", channel.user_id)
      .single();

    if (agentError || !agent || !agent.status) {
      return { valid: false, error: "Agent inactif" };
    }

    // Vérification WhatsApp
    const health = await checkWhatsAppHealth(channel.token);
    if (!health) {
      return { valid: false, error: "WhatsApp non autorisé" };
    }

    return {
      valid: true,
      channel,
      subscription,
      agent,
      token: channel.token,
      userId: channel.user_id
    };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}

async function checkWhatsAppHealth(token) {
  try {
    const response = await fetch("https://gate.whapi.cloud/health", {
      headers: { authorization: `Bearer ${token}` }
    });
    const data = await response.json();
    return data.status?.text === "AUTH";
  } catch {
    return false;
  }
}

async function getSupportPhone(channelId) {
  try {
    const response = await fetch(
      `https://manager.whapi.cloud/channels/${channelId}`,
      {
        headers: {
          authorization: `Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImExZDI2YWYyYmY4MjVmYjI5MzVjNWI3OTY3ZDA3YmYwZTMxZWIxYjcifQ.eyJwYXJ0bmVyIjp0cnVlLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vd2hhcGktYTcyMWYiLCJhdWQiOiJ3aGFwaS1hNzIxZiIsImF1dGhfdGltZSI6MTc0MDI0MjM1NCwidXNlcl9pZCI6IlQyTWlGanlkSnBlaGhIbWcyUWszTnFTMlFKOTIiLCJzdWIiOiJUMk1pRmp5ZEpwZWhoSG1nMlFrM05xUzJRSjkyIiwiaWF0IjoxNzQwMjQyMzU0LCJleHAiOjE4MDA3MjIzNTQsImVtYWlsIjoicG91cG9pbmFrYTAzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInBvdXBvaW5ha2EwM0BnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.SeY-wcxw9lYuKOsgUN4Yyq4mSLq5WR_6K5hHh8kwjjUxG022yh21OaUmX2v4fY8S2lMZ4ndASEvHh-LAgV4Z38JGlC-vjmjciaznvur-XSrj7Vp2bOGYuGVstze_2KdQYXozQnR0HhafIUkI-JFSjy3dl2KYbiLGiVBw52-por8BcleeNfe1Sa75PbDrYI79Y3_ey7aOl3BiyrEKC-w7cJf9tCvOE-4cj8cLfIn6IkapygX6kpIdi3FFIkmk_XSNtfbJZhSnKC6KWRNA6V7zvN9JpkI3_bU5IzOWpEGzFele3Yq5tauPruS1uq6og6Yi265DqO0ZmHFGfz3B60ovXw`
        }
      }
    );
    const data = await response.json();
    return data?.phone;
  } catch {
    return null;
  }
}

async function handleConversation(supabase, agentId, userId, phone, name, timeout, supabasePublic) {
  // Recherche conversation active
  const { data: existing } = await supabase
    .from("conversations")
    .select("*")
    .eq("agent_id", agentId)
    .eq("phone", phone)
    .eq("status", "active")
    .single();

  if (existing) {
    // Vérifier timeout
    const { data: lastMsg } = await supabase
      .from("messages")
      .select("created_at")
      .eq("conversation_id", existing.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lastMsg) {
      const timeDiff = (new Date() - new Date(lastMsg.created_at)) / 60000;
      if (timeDiff > timeout) {
        await terminateAndDecrementLimit(supabase, supabasePublic, existing.id, userId);
        // Créer nouvelle conversation
        const { data: newConv } = await supabase
          .from("conversations")
          .insert([{ agent_id: agentId, phone, name, user_id: userId, status: "active" }])
          .select()
          .single();
        return { conversationId: newConv.id, isNewConversation: true };
      }
    }
    return { conversationId: existing.id, isNewConversation: false };
  }

  // Nouvelle conversation
  const { data: newConv } = await supabase
    .from("conversations")
    .insert([{ agent_id: agentId, phone, name, user_id: userId, status: "active" }])
    .select()
    .single();
  return { conversationId: newConv.id, isNewConversation: true };
}

async function getExchangeCount(supabase, conversationId) {
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("conversation_id", conversationId);
  return count || 0;
}

async function getConversationHistory(supabase, conversationId) {
  const { data: messages } = await supabase
    .from("messages")
    .select("content, response")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(10);

  return (messages || [])
    .reverse()
    .slice(0, -1)
    .flatMap(msg => [
      { role: "user", content: msg.content },
      { role: "assistant", content: msg.response }
    ]);
}

async function handleExchangeLimitReached(params) {
  const { messageContent, senderName, senderPhone, conversationId, userId, token, SUPPORT_PHONE, supabase, supabasePublic } = params;
  
  const notificationMessage = `Conversation longue avec ${senderName} (${senderPhone}). Intervention recommandée.`;
  await sendWhatsAppMessage(token, SUPPORT_PHONE, notificationMessage);
  
  const clientMessage = "Je transmets votre demande à un conseiller pour un suivi personnalisé.";
  await sendWhatsAppMessage(token, senderPhone, clientMessage);

  await supabase.from("messages").insert([{
    conversation_id: conversationId,
    user_id: userId,
    content: messageContent,
    response: clientMessage,
    metadata: { delegated: true, reason: "limit_reached" }
  }]);

  await terminateAndDecrementLimit(supabase, supabasePublic, conversationId, userId);

  return {
    phone: senderPhone,
    status: "delegated",
    reason: "limit_reached"
  };
}

async function sendWhatsAppMessage(token, to, message) {
  try {
    const response = await fetch("https://gate.whapi.cloud/messages/text", {
      method: "POST",
      headers: {
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
    throw new Error(`WhatsApp error: ${error.message}`);
  }
}

async function terminateAndDecrementLimit(supabase, supabasePublic, conversationId, userId) {
  try {
    // Terminer conversation
    await supabase
      .from("conversations")
      .update({ status: "terminated" })
      .eq("id", conversationId);

    // Décrémenter crédit
    const { data: sub } = await supabasePublic
      .from("subscriptions")
      .select("max_limit")
      .eq("user_id", userId)
      .single();

    if (sub) {
      await supabasePublic
        .from("subscriptions")
        .update({ max_limit: Math.max(0, sub.max_limit - 1) })
        .eq("user_id", userId);
    }

    return { success: true };
  } catch (error) { 
    return { success: false, message: error.message };
  } 
} 