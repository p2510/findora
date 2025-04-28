import { createClient } from "@supabase/supabase-js";
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
  // Initialiser les clients OpenAI et Supabase
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

    // Récupérer les informations de l'agent
    const { data: agent, error: agentError } = await supabase
      .from("agent_configs")
      .select("status, assistant_id, id, user_id")
      .eq("user_id", userId)
      .single();

    if (agentError) {
      console.error("Erreur lors de la récupération de l'agent:", agentError);
      return { success: false, message: "Agent non trouvé" };
    }

    if (!agent.status) {
      return { success: false, message: "Agent inactif" };
    }

    // Définir les limites de tokens avec des valeurs par défaut
    const maxCompletionTokens = 3000;
    const maxPromptTokens = 5000;

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

    // Vérifier l'état de l'API WhatsApp
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
        const messageContent = message.text?.body || "";

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

              // Mettre à jour le statut de la conversation pour indiquer qu'elle nécessite un humain

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

              return; // Sortir de cette itération de la boucle
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

              return; // Sortir de cette itération de la boucle
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

          // Gérer le thread OpenAI existant ou en créer un nouveau
          const { data: threadData, error: threadError } = await supabase
            .from("openai_threads")
            .select("thread_id")
            .eq("conversation_id", conversationId)
            .single();

          let threadId;

          if (threadError || !threadData) {
            // Créer un nouveau thread OpenAI
            const thread = await openai.beta.threads.create({
              messages: [
                {
                  role: "user",
                  content: messageContent,
                },
              ],
            });

            threadId = thread.id;

            // Sauvegarder l'ID du thread
            await supabase.from("openai_threads").insert([
              {
                thread_id: threadId,
                conversation_id: conversationId,
                user_id: userId,
              },
            ]);
          } else {
            threadId = threadData.thread_id;

            // Ajouter le message au thread existant
            await openai.beta.threads.messages.create(threadId, {
              role: "user",
              content: messageContent,
            });
          }

          // Exécuter le thread avec l'assistant OpenAI
          const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: agent.assistant_id,
            max_completion_tokens: maxCompletionTokens,
            max_prompt_tokens: maxPromptTokens,
          });

          // Attendre que l'exécution soit terminée
          const finalRun = await waitForRunCompletion(openai, threadId, run.id);

          // Récupérer la réponse du modèle
          let aiResponse = DEFAULT_BOT_RESPONSE;

          console.log("debut de lunch");
          console.log(finalRun);
          if (finalRun.status === "completed") {
            console.log("vlose");
            const messages = await openai.beta.threads.messages.list(threadId);
            // Obtenir le message le plus récent de l'assistant
            const assistantMessages = messages.data.filter(
              (msg) => msg.role === "assistant"
            );

            if (assistantMessages.length > 0) {
              const latestMessage = assistantMessages[0];
              aiResponse = latestMessage.content[0].text.value;
              console.log(latestMessage.content[0]);
            }
          } else if (finalRun.status === "incomplete") {
            console.warn("Run incomplet:", finalRun.incomplete_details);
            aiResponse =
              "Désolé, je n'ai pas pu traiter complètement votre demande en raison de limitations techniques.";

            // Envoyer une notification au propriétaire
            const notificationMessage = `Alerte: Une conversation avec ${senderName} (${senderPhone}) a atteint la limite . Veuillez intervenir pour poursuivre l'échange.`;

            try {
              await sendWhatsAppMessage(
                token,
                SUPPORT_PHONE,
                notificationMessage
              );
              console.log(
                "Notification envoyée au propriétaire concernant la limite de tokens"
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

  // Fonction pour attendre la fin de l'exécution d'un run
  async function waitForRunCompletion(openai, threadId, runId) {
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);

    // Attendre que le run soit terminé
    while (
      runStatus.status === "in_progress" ||
      runStatus.status === "queued"
    ) {
      // Attendre 1 seconde avant de vérifier à nouveau
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    }

    return runStatus;
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
