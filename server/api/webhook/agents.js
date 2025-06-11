// server/api/webhook/agents.js
import { createClient } from "@supabase/supabase-js";
import { ModelService } from "~/server/utils/modelService";
import axios from "axios";
import path from "path";
import fs from "fs";
import { promises as fsPromises } from "fs";
import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  // Configuration constants
  const supabaseUrl = "https://puxvccwmxfpgyocglioe.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";
  const CONVERSATION_TIMEOUT_MINUTES = 30;
  const DEFAULT_BOT_RESPONSE = "Nous vous repondrons dans un instant";
  const MAX_EXCHANGES = 15; // Limite maximale d'échanges
  let SUPPORT_PHONE = "2250500145177"; // Numéro pour les notifications
  
  // Expressions régulières pour détecter les demandes de conseiller
  const ADVISOR_REQUEST_PATTERNS = [
    // Demandes explicites d'un conseiller
    /(?<!\w)conseill?e?r(?!\w)/i,

    // Demandes d'un agent humain (évite de capturer "agent pathogène" etc.)
    /(?<!\w)agent(?!\w)( humain)?/i,
    /(?<!\w)agent(?!\w)( de support| commercial| client)(?!\w)/i,

    // Demandes de parler à quelqu'un
    /parler (avec|à) (quelqu['']un|une personne)/i,
    /mettre en (contact|relation)/i,
    /(?<!\w)chat(?!\w) (avec|à) (quelqu['']un|une personne)/i,

    // Services spécifiques
    /service (client|commercial|après[-\s]vente)/i,
    /(?<!\w)SAV(?!\w)/i,

    // Demandes d'une personne réelle (avec contexte)
    /personne (humaine|réelle|du service)/i,
    /vraie personne/i,

    // Support technique (avec contexte pour éviter les faux positifs médicaux)
    /support (technique|client|commercial)/i,
    /assistance (téléphonique|technique|client)/i,

    // Demandes d'aide spécifique
    /aide (d['']un|d['']une) (conseiller|personne|agent|expert)/i,

    // Transfert explicite
    /(?<!\w)(transf[ée]rer|basculer|passer)(?!\w) (vers|à) (un|une)/i,
    /être (mis|mise) en relation/i,

    // Mécontentement explicite avec l'IA
    /(?<!\w)je (veux|souhaite|aimerais) (parler|discuter) (avec|à) (un|une) (humain|personne|conseiller)/i,
    /(?<!\w)(pas|plus) (un|une|d['']) (robot|chatbot|ia|intelligence artificielle)/i,
    /stop (ia|robot|chatbot)/i,

    // Contact humain contenant des mots de contexte
    /(?<!\w)humain(?!\w).{0,20}(contact|parler|discuter|aider|question)/i,
    /(?<!\w)(contact|parler|discuter|aider|question).{0,20}humain(?!\w)/i,

    // Numéro de téléphone
    /(?<!\w)numéro(?!\w).{0,15}(téléphone|appeler)/i,
    /(?<!\w)(téléphone|appeler).{0,15}numéro(?!\w)/i,
  ];

  // Initialiser OpenAI pour la transcription audio (nécessaire même avec HF)
  const openai = new OpenAI({
    apiKey:
      "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",
  });

  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: { schema: "agent_ia" },
  });
  const supabasePublic = createClient(supabaseUrl, supabaseKey);

  try {
    // Récupérer les données de la requête webhook
    const requestBody = await readBody(event);
    const { messages, channel_id: channelId } = requestBody;

    if (!messages || !messages.length || !channelId) {
      return { success: false, message: "Données de webhook invalides" };
    }

    // Récupérer les informations du canal
    const { data: channel, error: channelError } = await supabasePublic
      .from("whatsapp_backlogs")
      .select("expire_date, chanel_id, token, user_id")
      .eq("chanel_id", channelId)
      .single();

    if (channelError) {
      console.error("Erreur lors de la récupération du canal:", channelError);
      return { success: false, message: "Canal introuvable" };
    }

    // Vérification de la date d'expiration
    if (new Date() > new Date(channel.expire_date)) {
      return { success: false, message: "Canal expiré" };
    }

    const token = channel.token;
    const userId = channel.user_id;

    // Récupérer les informations de l'abonnement
    const { data: subscription, error: subscriptionError } =
      await supabasePublic
        .from("subscriptions")
        .select("subscription_type,max_limit")
        .eq("user_id", userId)
        .single();

    if (subscriptionError) {
      console.error(
        "Erreur lors de la récupération de l'abonnement:",
        subscriptionError
      );
      return { success: false, message: "Abonnement introuvable" };
    }
    if (subscription.max_limit <= 0) {
      return { success: false, message: "Crédit insuffisant" };
    }

    // Récupérer les informations de l'agent (avec model_provider)
    const { data: agent, error: agentError } = await supabase
      .from("agent_configs")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (agentError) {
      console.error("Erreur lors de la récupération de l'agent:", agentError);
      return { success: false, message: "Agent non trouvé" };
    }

    if (!agent.status) {
      return { success: false, message: "Agent inactif" };
    }

    // Initialiser ModelService avec la configuration de l'agent
    const modelService = new ModelService(agent);

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

    // Récupérer les informations utilisateur
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

    if (usersResponse) {
      SUPPORT_PHONE = usersResponse?.phone;
    }

    // Récupérer le prompt de la knowledge base
    const { data: knowledgeBase } = await supabase
      .from("knowledge_base")
      .select("prompt")
      .eq("agent_id", agent.id)
      .single();

    const prompt = knowledgeBase?.prompt || "";

    function isRequestingAdvisor(message) {
      return ADVISOR_REQUEST_PATTERNS.some((pattern) => pattern.test(message));
    }

    // Traiter les messages reçus
    const processedMessages = [];

    // Utiliser Promise.all pour traiter les messages en parallèle
    await Promise.all(
      messages.map(async (message) => {
        // Ignorer les messages envoyés par l'agent
        if (message.from_me) return;

        const senderPhone = message.from;
        const senderName = message?.from_name || "";

        let messageContent = null;
        if (message.text) {
          messageContent = message.text?.body || "";
        } else if (message.voice) {
          try {
            // Utiliser le répertoire temporaire du système
            const tempDir = "/tmp";

            // Récupérer le lien direct vers le fichier audio
            const voiceUrl = message.voice.link;

            if (voiceUrl) {
              console.log(
                `Téléchargement du fichier audio depuis: ${voiceUrl}`
              );

              // Définir le chemin où le fichier sera enregistré avec un nom unique
              const tempFilePath = path.join(
                tempDir,
                `voice_${Date.now()}_${Math.random()
                  .toString(36)
                  .substring(2, 15)}.oga`
              );

              // Télécharger le fichier sans token d'authentification supplémentaire
              const response = await axios({
                method: "GET",
                url: voiceUrl,
                responseType: "arraybuffer",
              });

              // Enregistrer le fichier localement
              await fsPromises.writeFile(tempFilePath, response.data);

              console.log(
                `Fichier audio téléchargé et enregistré à: ${tempFilePath}`
              );

              // Transcrire le fichier audio (toujours avec OpenAI même si on utilise HF pour le chat)
              const transcription = await openai.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: "whisper-1",
                response_format: "text",
              });

              console.log(`Transcription obtenue: ${transcription}`);

              // Supprimer le fichier temporaire après utilisation
              await fsPromises.unlink(tempFilePath);

              messageContent = transcription;
            }
          } catch (voiceError) {
            console.error(
              "Erreur lors du traitement du message vocal:",
              voiceError
            );
            console.error("Détails de l'erreur:", voiceError.stack);
            if (voiceError.response) {
              console.error("Réponse d'erreur:", voiceError.response.data);
            }

            messageContent =
              "Je n'ai pas pu comprendre votre message vocal. Pourriez-vous envoyer un message texte à la place?";
          }
        }

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

          if (isRequestingAdvisor(messageContent)) {
            // Envoyer une notification au propriétaire
            const notificationMessage = `Client demande un conseiller: ${senderName} (${senderPhone}) souhaite parler à un conseiller. Message: "${messageContent}"`;

            try {
              await sendWhatsAppMessage(
                token,
                SUPPORT_PHONE,
                notificationMessage
              );
              console.log(
                "Notification envoyée au propriétaire: demande de conseiller"
              );

              // Informer le client
              const clientMessage =
                "Votre demande a bien été prise en compte. Un conseiller va prendre en charge votre conversation dans les plus brefs délais. Merci de votre patience.";
              await sendWhatsAppMessage(token, senderPhone, clientMessage);

              // Stocker le message de l'utilisateur et la réponse
              await supabase.from("messages").insert([
                {
                  conversation_id: conversationId,
                  user_id: userId,
                  content: messageContent,
                  response: clientMessage,
                },
              ]);

              processedMessages.push({
                phone: senderPhone,
                status: "delegated",
                reason: "requested_advisor",
              });
              const terminationResult = await terminateAndDecrementLimit(
                supabase,
                supabasePublic,
                conversationId,
                userId
              );
              if (!terminationResult.success) {
                console.error(terminationResult.message);
              }

              return;
            } catch (notifError) {
              console.error(
                "Erreur lors de l'envoi de notification:",
                notifError
              );
            }
          }

          // Compter le nombre d'échanges dans cette conversation
          const { count: exchangeCount, error: countError } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", conversationId);

          if (countError) {
            console.error("Erreur lors du comptage des messages:", countError);
          }

          // Vérifier si la limite d'échanges est atteinte
          if (exchangeCount >= MAX_EXCHANGES) {
            // Envoyer une notification au propriétaire
            const notificationMessage = ` La conversation avec ${senderName} (${senderPhone}) nécessite une intervention humaine. Veuillez prendre le relais.`;

            try {
              await sendWhatsAppMessage(
                token,
                SUPPORT_PHONE,
                notificationMessage
              );
              console.log(
                "Notification envoyée au propriétaire concernant la limite d'échanges"
              );

              // Informer également le client
              const clientMessage =
                "Votre demande a été transmise à un conseiller client qui vous répondra dans les plus brefs délais. Merci de votre patience.";
              await sendWhatsAppMessage(token, senderPhone, clientMessage);

              // Stocker le message de l'utilisateur et la réponse
              await supabase.from("messages").insert([
                {
                  conversation_id: conversationId,
                  user_id: userId,
                  content: messageContent,
                  response: clientMessage,
                },
              ]);

              processedMessages.push({
                phone: senderPhone,
                status: "delegated",
                reason: "exchange_limit_reached",
              });
              const terminationResult = await terminateAndDecrementLimit(
                supabase,
                supabasePublic,
                conversationId,
                userId
              );
              if (!terminationResult.success) {
                console.error(terminationResult.message);
              }

              return;
            } catch (notifError) {
              console.error(
                "Erreur lors de l'envoi de notification:",
                notifError
              );
            }
          }

          // Stocker le message de l'utilisateur
          await supabase.from("messages").insert([
            {
              conversation_id: conversationId,
              user_id: userId,
              content: messageContent,
              response: DEFAULT_BOT_RESPONSE,
            },
          ]);

          let aiResponse = DEFAULT_BOT_RESPONSE;
          let threadId = null;

          try {
            if (agent.model_provider === 'openai') {
              // Logique OpenAI existante
              const { data: threadData, error: threadError } = await supabase
                .from("openai_threads")
                .select("thread_id")
                .eq("conversation_id", conversationId)
                .single();

              if (threadError || !threadData) {
                // Créer un nouveau thread via ModelService
                const result = await modelService.sendMessage(messageContent, {
                  threadId: null,
                  assistantId: agent.assistant_id
                });
                
                aiResponse = result.response;
                threadId = result.threadId;

                // Sauvegarder l'ID du thread
                if (threadId) {
                  await supabase.from("openai_threads").insert([
                    {
                      thread_id: threadId,
                      conversation_id: conversationId,
                      user_id: userId,
                    },
                  ]);
                }
              } else {
                threadId = threadData.thread_id;
                
                // Envoyer le message via ModelService
                const result = await modelService.sendMessage(messageContent, {
                  threadId,
                  assistantId: agent.assistant_id
                });
                
                aiResponse = result.response;
              }
            } else if (agent.model_provider === 'huggingface') {
              // Logique Hugging Face
              // Récupérer l'historique de la conversation
              const { data: conversationHistory } = await supabase
                .from("messages")
                .select("content, response")
                .eq("conversation_id", conversationId)
                .order("created_at", { ascending: true })
                .limit(10); // Limiter pour éviter de dépasser les limites de tokens

              const result = await modelService.sendMessage(messageContent, {
                prompt,
                conversationHistory: conversationHistory || []
              });
              
              aiResponse = result.response;
            }

            // Vérifier si la réponse est valide
            if (!aiResponse || aiResponse === DEFAULT_BOT_RESPONSE) {
              console.warn("Réponse IA vide ou par défaut, utilisation du message par défaut");
              aiResponse = "Je suis désolé, je n'ai pas pu traiter votre demande. Un conseiller va prendre le relais.";
              
              // Envoyer une notification au propriétaire
              const notificationMessage = `Alerte: Problème de réponse IA pour ${senderName} (${senderPhone}). Intervention nécessaire.`;
              
              try {
                await sendWhatsAppMessage(
                  token,
                  SUPPORT_PHONE,
                  notificationMessage
                );
              } catch (notifError) {
                console.error(
                  "Erreur lors de l'envoi de notification:",
                  notifError
                );
              }
            }

          } catch (aiError) {
            console.error("Erreur lors de l'obtention de la réponse IA:", aiError);
            aiResponse = "Je suis désolé, je rencontre des difficultés techniques. Un conseiller va vous répondre rapidement.";
            
            // Notifier le propriétaire
            const notificationMessage = `Erreur IA: ${aiError.message} pour ${senderName} (${senderPhone})`;
            
            try {
              await sendWhatsAppMessage(
                token,
                SUPPORT_PHONE,
                notificationMessage
              );
            } catch (notifError) {
              console.error(
                "Erreur lors de l'envoi de notification:",
                notifError
              );
            }
          }

          // Mettre à jour la base de données avec la réponse de l'IA
          await supabase
            .from("messages")
            .update({ response: aiResponse })
            .eq("conversation_id", conversationId)
            .eq("content", messageContent);

          // Envoyer la réponse de l'IA via WhatsApp
          const response = await sendWhatsAppMessage(
            token,
            senderPhone,
            aiResponse
          );

          processedMessages.push({
            phone: senderPhone,
            status: response.sent ? "sent" : "failed",
            aiResponse: aiResponse !== DEFAULT_BOT_RESPONSE,
            provider: agent.model_provider
          });
        } catch (err) {
          console.error(
            `Erreur lors du traitement du message pour ${senderPhone}:`,
            err
          );
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

  // Fonction pour gérer la création ou mise à jour des conversations
  async function handleConversation(supabase, agentId, userId, phone, name) {
    // Vérifier si une conversation active existe
    const { data: conversation, error } = await supabase
      .from("conversations")
      .select("id, status")
      .eq("agent_id", agentId)
      .eq("phone", phone)
      .eq("status", "active")
      .single();

    let isNewConversation = false;

    // Si une conversation active existe
    if (!error && conversation) {
      // Vérifier si la conversation est inactive (timeout)
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

        // Si le timeout est dépassé, terminer la conversation et en créer une nouvelle
        if (timeDifference > CONVERSATION_TIMEOUT_MINUTES) {
          const terminationResult = await terminateAndDecrementLimit(
            supabase,
            supabasePublic,
            conversation.id,
            userId
          );
          if (!terminationResult.success) {
            console.error(terminationResult.message);
          }

          // Créer une nouvelle conversation
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

        // Sinon, retourner l'ID de la conversation existante
        return { conversationId: conversation.id, isNewConversation };
      }
    }

    // Si aucune conversation active n'existe, en créer une nouvelle
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

    if (insertError)
      throw new Error(
        `Erreur lors de la création de conversation: ${insertError.message}`
      );

    isNewConversation = true;
    return { conversationId: newConversation.id, isNewConversation };
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
      throw new Error(`Échec d'envoi du message WhatsApp: ${error.message}`);
    }
  }

  async function terminateAndDecrementLimit(
    supabase,
    supabasePublic,
    conversationId,
    userId
  ) {
    // Mettre à jour le statut de la conversation en "terminated"
    const { error: updateError } = await supabase
      .from("conversations")
      .update({ status: "terminated" })
      .eq("id", conversationId);

    if (updateError) {
      console.error(
        "Erreur lors de la terminaison de la conversation:",
        updateError
      );
      return {
        success: false,
        message: "Erreur lors de la terminaison de la conversation",
      };
    }

    // Décrémenter la colonne max_limit dans subscriptions
    const { data: subscription, error: fetchError } = await supabasePublic
      .from("subscriptions")
      .select("max_limit")
      .eq("user_id", userId)
      .single();

    if (fetchError) {
      console.error(
        "Erreur lors de la récupération de l'abonnement:",
        fetchError
      );
      return {
        success: false,
        message: "Erreur lors de la récupération de l'abonnement",
      };
    }

    // Vérifier que la limite n'est pas déjà à 0
    const newLimit = Math.max(0, subscription.max_limit - 1);

    const { error: decrementError } = await supabasePublic
      .from("subscriptions")
      .update({ max_limit: newLimit })
      .eq("user_id", userId);

    if (decrementError) {
      console.error("Erreur lors du décrément de la limite:", decrementError);
      return {
        success: false,
        message: "Erreur lors du décrément de la limite",
      };
    }

    return {
      success: true,
      message: "Conversation terminée et limite décrémentée",
    };
  }
});