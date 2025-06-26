// server/api/webhook/agents-with-tools.js - SYSTÈME COMPLET

import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import axios from "axios";
import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";
import { adaptiveSearch } from "~/server/utils/agent_with_tools/adaptive-search";
import { searchCache } from "~/server/utils/agent_with_tools/cache";
import {
  TriageAgent,
  PolicyExecutionAgent,
  ActionValidationAgent,
} from "~/server/utils/agent_with_tools/specialized-agents";
import {
  getAgentTools,
  handleToolCall,
} from "~/server/utils/tools/tools-handler";

export default defineEventHandler(async (event) => {
  console.log("🚀 Système Multi-Agents IA - Début");

  // Configuration
  const config = useRuntimeConfig();
  const supabaseUrl = "https://puxvccwmxfpgyocglioe.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";

  const CONVERSATION_TIMEOUT_MINUTES = 30;
  const DEFAULT_BOT_RESPONSE = "Nous vous répondrons dans un instant";
  const MAX_EXCHANGES = 32;
  let SUPPORT_PHONE = "2250500145177";

  // Initialiser OpenAI
  const openai = new OpenAI({
    apiKey:
      config.openai_api_key ||
      "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",
  });

  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: "agent_ia" },
  });
  const supabasePublic = createClient(supabaseUrl, supabaseKey);

  // Obtenir les tools
  const tools = getAgentTools();

  try {
    const requestBody = await readBody(event);
    const { messages, channel_id: channelId } = requestBody;

    console.log("📨 Messages reçus:", messages?.length || 0);
    console.log("🔑 Channel ID:", channelId);

    if (!messages || !messages.length || !channelId) {
      return { success: false, message: "Données de webhook invalides" };
    }

    // Récupérer les informations du canal
    console.log("🔍 Récupération des infos du canal...");
    const { data: channel, error: channelError } = await supabasePublic
      .from("whatsapp_backlogs")
      .select("expire_date, chanel_id, token, user_id")
      .eq("chanel_id", channelId)
      .single();

    if (channelError) {
      console.error("❌ Erreur canal:", channelError);
      return { success: false, message: "Canal introuvable" };
    }

    // Vérification de la date d'expiration
    if (new Date() > new Date(channel.expire_date)) {
      return { success: false, message: "Canal expiré" };
    }

    const token = channel.token;
    const userId = channel.user_id;
    console.log("👤 User ID:", userId);

    // Récupérer les informations de l'abonnement
    console.log("💳 Vérification de l'abonnement...");
    const { data: subscription, error: subscriptionError } =
      await supabasePublic
        .from("subscriptions")
        .select("subscription_type, max_limit")
        .eq("user_id", userId)
        .single();

    if (subscriptionError) {
      console.error("❌ Erreur abonnement:", subscriptionError);
      return { success: false, message: "Abonnement introuvable" };
    }

    if (subscription.max_limit <= 0) {
      return { success: false, message: "Crédit insuffisant" };
    }

    // Récupérer les informations de l'agent
    console.log("🤖 Récupération de l'agent...");
    const { data: agent, error: agentError } = await supabase
      .from("agent_configs")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (agentError) {
      console.error("❌ Erreur agent:", agentError);
      return { success: false, message: "Agent non trouvé" };
    }

    if (!agent.status) {
      return { success: false, message: "Agent inactif" };
    }

    console.log("✅ Agent trouvé:", agent.name);

    // Vérifier l'état de l'API WhatsApp
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

    // Récupérer le numéro de support
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
      console.log("⚠️ Utilisation du numéro de support par défaut");
    }

    // Traiter les messages reçus
    console.log("📬 Traitement des messages...");
    const processedMessages = [];

    await Promise.all(
      messages.map(async (message) => {
        if (message.from_me) return;

        const senderPhone = message.from;
        const senderName = message?.from_name || "";
        let messageContent = null;

        console.log(`📱 Message de: ${senderPhone}`);

        // Traitement du message texte ou vocal
        if (message.text) {
          messageContent = message.text?.body || "";
        } else if (message.voice) {
          try {
            const tempDir = "/tmp";
            const voiceUrl = message.voice.link;

            if (voiceUrl) {
              console.log("🎤 Traitement du message vocal...");
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

              console.log("📝 Transcription:", transcription);
              await fsPromises.unlink(tempFilePath);

              messageContent = transcription;
            }
          } catch (voiceError) {
            console.error("❌ Erreur vocal:", voiceError);
            messageContent =
              "Je n'ai pas pu comprendre votre message vocal. Pourriez-vous envoyer un message texte ?";
          }
        }

        if (!messageContent) return;

        console.log("💬 Message reçu:", messageContent);

        try {
          // Gérer la conversation
          const { conversationId, isNewConversation } =
            await handleConversation(
              supabase,
              agent.id,
              userId,
              senderPhone,
              senderName
            );

          console.log("🗨️ Conversation ID:", conversationId);

          // Compter le nombre d'échanges
          const { count: exchangeCount } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conversationId);

          if (exchangeCount >= MAX_EXCHANGES) {
            console.log("⚠️ Limite d'échanges atteinte");
            // Gérer la limite d'échanges
            const notificationMessage = `La conversation avec ${senderName} (${senderPhone}) nécessite une intervention humaine.`;
            await sendWhatsAppMessage(
              token,
              SUPPORT_PHONE,
              notificationMessage
            );

            const clientMessage =
              "Votre demande a été transmise à un conseiller qui vous répondra dans les plus brefs délais.";
            await sendWhatsAppMessage(token, senderPhone, clientMessage);

            processedMessages.push({
              phone: senderPhone,
              status: "delegated",
              reason: "exchange_limit_reached",
            });

            return;
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

          // Recherche dans la knowledge base
          console.log("🔍 Recherche dans la knowledge base...");
          let searchResult = searchCache.get(messageContent, agent.id);

          if (!searchResult) {
            searchResult = await adaptiveSearch(
              messageContent,
              agent.id,
              openai,
              supabase
            );
            searchCache.set(messageContent, agent.id, searchResult);
          }

          const chunks = searchResult.chunks || [];
          console.log(`📚 ${chunks.length} chunks trouvés`);

          // Récupérer l'historique
          const { data: recentMessages } = await supabase
            .from("messages")
            .select("content, response, created_at")
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

          // 🎯 ORCHESTRATION MULTI-AGENTS
          console.log("🤖 Démarrage de l'orchestration multi-agents");

          // ÉTAPE 1: TRIAGE
          const triageResult = await TriageAgent(openai, {
            message: messageContent,
            conversationHistory,
            customerInfo: {
              name: senderName,
              phone: senderPhone,
              previousInteractions: recentMessages?.length || 0,
            },
          });

          console.log("📋 Triage:", triageResult);

          // ÉTAPE 2: POLICY EXECUTION
          const policyResult = await PolicyExecutionAgent(openai, {
            triageResult,
            message: messageContent,
            agentConfig: agent,
            knowledgeBase: chunks,
            tools,
            context: {
              supabase,
              token,
              senderPhone,
              senderName,
              conversationId,
              userId,
              insertedMessageId: insertedMessage.id,
              SUPPORT_PHONE,
              agentId: agent.id,
            },
          });

          console.log("📜 Policy:", policyResult);

          // ÉTAPE 3: VALIDATION
          const validationResult = await ActionValidationAgent(openai, {
            originalMessage: messageContent,
            triageResult,
            policyResult,
            conversationContext: conversationHistory,
          });

          console.log("✅ Validation:", validationResult);

          // Exécuter les actions approuvées
          let finalResponse = "";
          const executedActions = [];

          for (const action of validationResult.approvedActions || []) {
            console.log("🎬 Exécution action:", action.type);

            if (action.type === "tool_call" && action.toolCall) {
              console.log(
                "🔧 Tool call détails:",
                JSON.stringify(action.toolCall, null, 2)
              );

              // Vérifier la structure du toolCall
              let toolCallToExecute = action.toolCall;

              // Si la structure n'est pas correcte, essayer de la reconstruire
              if (
                !toolCallToExecute.function ||
                !toolCallToExecute.function.name
              ) {
                console.error(
                  "❌ Structure tool call invalide:",
                  toolCallToExecute
                );

                // Essayer de récupérer depuis policyResult si disponible
                if (
                  policyResult.decision.actions_specifiques &&
                  policyResult.decision.actions_specifiques[0]?.toolCall
                ) {
                  toolCallToExecute =
                    policyResult.decision.actions_specifiques[0].toolCall;
                  console.log(
                    "🔄 Récupération depuis policy:",
                    JSON.stringify(toolCallToExecute, null, 2)
                  );
                } else {
                  finalResponse +=
                    "Je n'ai pas pu traiter votre demande correctement. ";
                  continue;
                }
              }

              // S'assurer que nous avons une fonction valide
              if (
                !toolCallToExecute.function ||
                !toolCallToExecute.function.name
              ) {
                console.error(
                  "❌ Impossible de récupérer une structure valide"
                );
                finalResponse +=
                  "Une erreur s'est produite. Un conseiller va vous aider. ";
                continue;
              }

              try {
                const toolResult = await handleToolCall(toolCallToExecute, {
                  token,
                  supabase,
                  senderPhone,
                  senderName,
                  conversationId,
                  userId,
                  insertedMessageId: insertedMessage.id,
                  SUPPORT_PHONE,
                  agentId: agent.id,
                  openai,
                  messageContent,
                });

                executedActions.push({
                  tool: toolCallToExecute.function.name,
                  result: toolResult,
                });

                // Utiliser la réponse du tool
                if (toolResult.response) {
                  finalResponse = toolResult.response;
                }

                // Si c'est une délégation, arrêter ici
                if (toolResult.delegated) {
                  console.log("🚪 Conversation déléguée");

                  // Mettre à jour le message
                  await supabase
                    .from("messages")
                    .update({
                      response: finalResponse,
                      metadata: {
                        orchestration: {
                          triage: triageResult,
                          policy: policyResult.decision,
                          validation: validationResult.status,
                          executedActions,
                        },
                        delegated: true,
                        reason: toolResult.reason,
                      },
                    })
                    .eq("id", insertedMessage.id);

                  // Terminer la conversation si nécessaire
                  if (toolResult.reason === "requested_advisor") {
                    const terminationResult = await terminateAndDecrementLimit(
                      supabase,
                      supabasePublic,
                      conversationId,
                      userId
                    );

                    if (!terminationResult.success) {
                      console.error(terminationResult.message);
                    }
                  }

                  processedMessages.push({
                    phone: senderPhone,
                    status: "delegated",
                    reason: toolResult.reason,
                    tool_call: toolCallToExecute.function.name,
                  });

                  // Ne pas continuer avec d'autres actions
                  return;
                }
              } catch (toolError) {
                console.error("❌ Erreur exécution tool:", toolError);
                finalResponse +=
                  "Je n'ai pas pu traiter votre demande. Un conseiller va vous aider. ";

                // Notifier le support en cas d'erreur
                await sendWhatsAppMessage(
                  token,
                  SUPPORT_PHONE,
                  `Erreur tool ${toolCallToExecute.function.name} pour ${senderPhone}: ${toolError.message}`
                );
              }
            } else if (action.type === "message" && action.content) {
              finalResponse += (finalResponse ? "\n" : "") + action.content;
            }
          }

          // Si pas de réponse générée par les tools, utiliser le message de synthèse
          if (!finalResponse && policyResult.decision?.reponse_suggeree) {
            finalResponse = policyResult.decision.reponse_suggeree;
          }

          // Si toujours pas de réponse, utiliser le fallback
          if (!finalResponse) {
            finalResponse =
              "Je suis là pour vous aider. Comment puis-je vous assister ?";
          }

          console.log("💬 Réponse finale:", finalResponse);

          // Mettre à jour le message
          await supabase
            .from("messages")
            .update({
              response: finalResponse,
              metadata: {
                orchestration: {
                  triage: triageResult,
                  policy: policyResult.decision,
                  validation: validationResult.status,
                  executedActions,
                },
              },
            })
            .eq("id", insertedMessage.id);

          // Envoyer la réponse
          const response = await sendWhatsAppMessage(
            token,
            senderPhone,
            finalResponse
          );

          processedMessages.push({
            phone: senderPhone,
            status: response.sent ? "sent" : "failed",
            orchestrationComplete: true,
            actionsExecuted: executedActions.length,
          });
        } catch (err) {
          console.error("❌ Erreur traitement:", err);

          const fallbackResponse =
            "Je rencontre un problème technique. Un conseiller va vous contacter.";
          await sendWhatsAppMessage(token, senderPhone, fallbackResponse);

          processedMessages.push({
            phone: senderPhone,
            status: "error",
            message: err.message,
          });
        }
      })
    );

    return {
      success: true,
      message: "Messages traités avec orchestration multi-agents",
      processed: processedMessages,
    };
  } catch (error) {
    console.error("❌ Erreur globale:", error);
    return {
      success: false,
      message: "Erreur lors du traitement de la webhook",
      error: error.message,
    };
  }

  // Fonction pour gérer la conversation
  async function handleConversation(supabase, agentId, userId, phone, name) {
    const { data: conversation } = await supabase
      .from("conversations")
      .select("id, status")
      .eq("agent_id", agentId)
      .eq("phone", phone)
      .eq("status", "active")
      .single();

    if (conversation) {
      return { conversationId: conversation.id, isNewConversation: false };
    }

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

    return { conversationId: newConversation.id, isNewConversation: true };
  }

  // Fonction pour envoyer un message WhatsApp
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
      throw new Error(`Échec d'envoi WhatsApp: ${error.message}`);
    }
  }
});

async function terminateAndDecrementLimit(
  supabase,
  supabasePublic,
  conversationId,
  userId
) {
  try {
    await supabase
      .from("conversations")
      .update({ status: "terminated" })
      .eq("id", conversationId);

    const { data: subscription } = await supabasePublic
      .from("subscriptions")
      .select("max_limit")
      .eq("user_id", userId)
      .single();

    if (subscription && subscription.max_limit > 0) {
      await supabasePublic
        .from("subscriptions")
        .update({ max_limit: subscription.max_limit - 1 })
        .eq("user_id", userId);
    }

    return { success: true };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
