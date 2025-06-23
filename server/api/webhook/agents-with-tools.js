// server/api/webhook/agents-tools-complete.js
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import axios from "axios";
import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";
import { processMessageWithTools } from "~/server/utils/tools";
import { adaptiveSearch } from "~/server/utils/adaptive-search";
import { searchCache } from "~/server/utils/cache";
import { generateOptimizedPrompt } from "~/server/utils/embeddings";
const config = useRuntimeConfig();
const supabaseUrl =
  config.public.supabase_url || "https://puxvccwmxfpgyocglioe.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";
const supabasePublic = createClient(supabaseUrl, supabaseKey);
export default defineEventHandler(async (event) => {
  console.log("🚀 Webhook Agent IA v2 avec Tools - Début");

  // Configuration

  const CONVERSATION_TIMEOUT_MINUTES = 25;
  const DEFAULT_BOT_RESPONSE = "Nous vous répondrons dans un instant";
  const MAX_EXCHANGES = 32;
  let SUPPORT_PHONE = "2250500145177";

  // Initialiser les clients
  const openai = new OpenAI({
    apiKey:
      config.openai_api_key ||
      "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",
  });

  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: "agent_ia" },
  });

  try {
    const requestBody = await readBody(event);
    const { messages, channel_id: channelId } = requestBody;

    if (!messages || !messages.length || !channelId) {
      return { success: false, message: "Données invalides" };
    }

    // Récupérer les informations du canal
    const { data: channel, error: channelError } = await supabasePublic
      .from("whatsapp_backlogs")
      .select("expire_date, chanel_id, token, user_id")
      .eq("chanel_id", channelId)
      .single();

    if (channelError) {
      console.error("Erreur canal:", channelError);
      return { success: false, message: "Canal introuvable" };
    }

    // Vérifier l'expiration
    if (new Date() > new Date(channel.expire_date)) {
      return { success: false, message: "Canal expiré" };
    }

    const token = channel.token;
    const userId = channel.user_id;

    // Vérifier l'abonnement
    const { data: subscription, error: subscriptionError } =
      await supabasePublic
        .from("subscriptions")
        .select("subscription_type, max_limit")
        .eq("user_id", userId)
        .single();

    if (subscriptionError || subscription.max_limit <= 0) {
      return { success: false, message: "Crédit insuffisant" };
    }

    // Récupérer l'agent
    const { data: agent, error: agentError } = await supabase
      .from("agent_configs")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (agentError || !agent.status) {
      return { success: false, message: "Agent non trouvé ou inactif" };
    }

    // Vérifier l'API WhatsApp
    const healthResponse = await fetch("https://gate.whapi.cloud/health", {
      method: "GET",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${token}`,
      },
    }).then((res) => res.json());

    if (healthResponse.status?.text !== "AUTH") {
      return { success: false, message: "Canal WhatsApp non autorisé" };
    }

    // Essayer de récupérer le numéro de support
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

      if (usersResponse?.phone) {
        SUPPORT_PHONE = usersResponse.phone;
      }
    } catch (err) {
      console.log(
        "Impossible de récupérer le numéro de support, utilisation du numéro par défaut"
      );
    }

    // Traiter chaque message
    const processedMessages = [];

    for (const message of messages) {
      if (message.from_me) continue;

      const senderPhone = message.from;
      const senderName = message?.from_name || "";
      let messageContent = null;

      // Traiter message texte ou vocal
      if (message.text) {
        messageContent = message.text?.body || "";
      } else if (message.voice) {
        try {
          const tempDir = "/tmp";
          const voiceUrl = message.voice.link;

          if (voiceUrl) {
            console.log(`Téléchargement audio: ${voiceUrl}`);

            const tempFilePath = path.join(
              tempDir,
              `voice_${Date.now()}_${Math.random()
                .toString(36)
                .substring(2, 15)}.oga`
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
            messageContent = transcription;
          }
        } catch (voiceError) {
          console.error("Erreur message vocal:", voiceError);
          messageContent =
            "Je n'ai pas pu comprendre votre message vocal. Pourriez-vous envoyer un message texte?";
        }
      }

      if (!messageContent) continue;

      const startTime = Date.now();

      try {
        // Créer ou récupérer la conversation
        const { conversationId, isNewConversation } = await handleConversation(
          supabase,
          agent.id,
          userId,
          senderPhone,
          senderName
        );

        // Vérifier le nombre d'échanges
        const { count: exchangeCount } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conversationId);

        if (exchangeCount >= MAX_EXCHANGES) {
          await handleMaxExchangesReached(
            supabase,
            token,
            SUPPORT_PHONE,
            senderPhone,
            senderName,
            messageContent,
            conversationId,
            userId
          );

          processedMessages.push({
            phone: senderPhone,
            status: "delegated",
            reason: "exchange_limit_reached",
          });
          continue;
        }

        // Stocker le message
        const { data: insertedMessage } = await supabase
          .from("messages")
          .insert([
            {
              conversation_id: conversationId,
              user_id: userId,
              content: messageContent,
              response: DEFAULT_BOT_RESPONSE,
            },
          ])
          .select()
          .single();

        // Récupérer l'historique
        const { data: recentMessages } = await supabase
          .from("messages")
          .select("content, response, created_at, tools_used")
          .eq("conversation_id", conversationId)
          .order("created_at", { ascending: false })
          .limit(10);

        const conversationHistory =
          recentMessages
            ?.reverse()
            .slice(0, -1)
            .map((msg) => ({
              role: msg.response ? "assistant" : "user",
              content: msg.response || msg.content,
            })) || [];

        // Configuration pour le traitement avec tools
        const toolsConfig = {
          message: messageContent,
          conversationHistory,
          customerInfo: {
            phone: senderPhone,
            name: senderName,
          },
          messageId: insertedMessage.id,
          conversationId,
          openai,
          supabase,
          supabasePublic,
          token,
          supportPhone: SUPPORT_PHONE,
          agentId: agent.id,
          userId,
        };

        let finalResponse = DEFAULT_BOT_RESPONSE;
        let toolsUsed = [];
        let metadata = {};

        try {
          // Traiter avec le système de tools
          console.log("🤖 Traitement du message avec tools intelligents");
          const result = await processMessageWithTools(toolsConfig);

          finalResponse = result.content;
          toolsUsed = result.toolsUsed || [];

          // Si aucun tool n'a trouvé de réponse satisfaisante, utiliser le système classique
          if (
            !result.toolsUsed.length ||
            result.content.includes("pas trouvé") ||
            result.content.includes("n'ai pas trouvé")
          ) {
            console.log("🔍 Fallback vers recherche adaptative");

            const searchResult =
              searchCache.get(messageContent, agent.id) ||
              (await adaptiveSearch(
                messageContent,
                agent.id,
                openai,
                supabase
              ));

            if (!searchCache.get(messageContent, agent.id)) {
              searchCache.set(messageContent, agent.id, searchResult);
            }

            if (searchResult.chunks.length > 0) {
              // Générer une réponse avec le contexte trouvé
              const systemPrompt = generateOptimizedPrompt(
                agent.name,
                agent.personality,
                agent.goal,
                searchResult.chunks
              );

              const isMultilingual = searchResult.analysis.language !== "fr";
              const finalSystemPrompt =
                systemPrompt +
                (isMultilingual
                  ? `\n\nIMPORTANT: Réponds en ${searchResult.analysis.language}.`
                  : "");

              const completion = await openai.chat.completions.create({
                model: "gpt-4.1-nano",
                messages: [
                  { role: "system", content: finalSystemPrompt },
                  ...conversationHistory,
                  { role: "user", content: messageContent },
                ],
                max_tokens: 400,
                temperature: 0.3,
              });

              finalResponse =
                completion.choices[0]?.message?.content || finalResponse;
              metadata.language = searchResult.analysis.language;
              metadata.chunks_found = searchResult.chunks.length;
            }
          }

          metadata.execution_time = Date.now() - startTime;
          metadata.tools_used = toolsUsed;
        } catch (aiError) {
          console.error("❌ Erreur traitement IA:", aiError);

          // En cas d'erreur, notifier le support
          await sendWhatsAppMessage(
            token,
            SUPPORT_PHONE,
            `⚠️ Erreur système pour ${senderPhone}:\n${aiError.message}\n\nMessage: "${messageContent}"`
          );

          finalResponse =
            "Je suis désolé, je rencontre des difficultés techniques. Un conseiller va vous répondre rapidement. 🔧";
        }

        // Mettre à jour le message avec la réponse finale
        await supabase
          .from("messages")
          .update({
            response: finalResponse,
            tools_used: toolsUsed,
            processed_with_tools: toolsUsed.length > 0,
            metadata: metadata,
          })
          .eq("id", insertedMessage.id);

        // Envoyer la réponse WhatsApp
        const sendResult = await sendWhatsAppMessage(
          token,
          senderPhone,
          finalResponse
        );

        processedMessages.push({
          phone: senderPhone,
          status: sendResult.sent ? "sent" : "failed",
          aiResponse: finalResponse !== DEFAULT_BOT_RESPONSE,
          toolsUsed: toolsUsed.length,
          executionTime: Date.now() - startTime,
        });
      } catch (error) {
        console.error(`❌ Erreur traitement message ${senderPhone}:`, error);
        processedMessages.push({
          phone: senderPhone,
          status: "error",
          error: error.message,
        });
      }
    }

    return {
      success: true,
      message: "Messages traités avec succès",
      processed: processedMessages,
    };
  } catch (error) {
    console.error("❌ Erreur globale:", error);
    return {
      success: false,
      error: error.message,
    };
  }
});

// Fonctions utilitaires
async function handleConversation(supabase, agentId, userId, phone, name) {
  const CONVERSATION_TIMEOUT_MINUTES = 25;

  const { data: conversation, error } = await supabase
    .from("conversations")
    .select("id, status")
    .eq("agent_id", agentId)
    .eq("phone", phone)
    .eq("status", "active")
    .single();

  let isNewConversation = false;

  if (!error && conversation) {
    const { data: lastMessage } = await supabase
      .from("messages")
      .select("created_at")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (lastMessage) {
      const lastMessageTime = new Date(lastMessage.created_at);
      const timeDifference = (new Date() - lastMessageTime) / 1000 / 60;

      if (timeDifference > CONVERSATION_TIMEOUT_MINUTES) {
        await terminateAndDecrementLimit(
          supabase,
          supabasePublic,
          conversation.id,
          userId
        );

        const { data: newConversation } = await supabase
          .from("conversations")
          .insert([
            {
              agent_id: agentId,
              phone,
              name,
              user_id: userId,
              status: "active",
            },
          ])
          .select()
          .single();

        isNewConversation = true;
        return { conversationId: newConversation.id, isNewConversation };
      }

      return { conversationId: conversation.id, isNewConversation };
    }
  }

  const { data: newConversation, error: insertError } = await supabase
    .from("conversations")
    .insert([
      {
        agent_id: agentId,
        phone,
        name,
        user_id: userId,
        status: "active",
      },
    ])
    .select()
    .single();

  if (insertError) {
    throw new Error(`Erreur création conversation: ${insertError.message}`);
  }

  isNewConversation = true;
  return { conversationId: newConversation.id, isNewConversation };
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
    throw new Error(`Échec envoi WhatsApp: ${error.message}`);
  }
}

async function terminateAndDecrementLimit(
  supabase,
  supabasePublic,
  conversationId,
  userId
) {
  const { error: updateError } = await supabase
    .from("conversations")
    .update({ status: "terminated" })
    .eq("id", conversationId);

  if (updateError) {
    console.error("Erreur terminaison conversation:", updateError);
    return { success: false };
  }

  const { data: subscription } = await supabasePublic
    .from("subscriptions")
    .select("max_limit")
    .eq("user_id", userId)
    .single();

  if (subscription) {
    const newLimit = Math.max(0, subscription.max_limit - 1);

    await supabasePublic
      .from("subscriptions")
      .update({ max_limit: newLimit })
      .eq("user_id", userId);
  }

  return { success: true };
}

async function handleMaxExchangesReached(
  supabase,
  token,
  supportPhone,
  senderPhone,
  senderName,
  messageContent,
  conversationId,
  userId
) {
  // Notifier le support
  const notificationMessage = `La conversation avec ${senderName} (${senderPhone}) a atteint la limite d'échanges. Intervention nécessaire.`;

  await sendWhatsAppMessage(token, supportPhone, notificationMessage);

  // Informer le client
  const clientMessage =
    "Votre demande a été transmise à un conseiller qui vous répondra dans les plus brefs délais. Merci de votre patience.";
  await sendWhatsAppMessage(token, senderPhone, clientMessage);

  // Enregistrer
  await supabase.from("messages").insert([
    {
      conversation_id: conversationId,
      user_id: userId,
      content: messageContent,
      response: clientMessage,
      metadata: {
        delegated: true,
        reason: "exchange_limit_reached",
      },
    },
  ]);

  await terminateAndDecrementLimit(
    supabase,
    supabasePublic,
    conversationId,
    userId
  );
}
