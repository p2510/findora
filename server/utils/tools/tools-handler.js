// server/utils/tools-handler.js

/**
 * Définition des tools disponibles pour l'agent
 */
export const getAgentTools = () => {
  return [
    {
      type: "function",
      function: {
        name: "contact_support",
        description:
          "Notifie l'équipe de support client lorsqu'un utilisateur demande à parler à un conseiller, un responsable ou un humain.",
        parameters: {
          type: "object",
          properties: {
            sender_name: {
              type: "string",
              description:
                "Nom de l'utilisateur demandant le support (peut être vide si inconnu).",
            },
            sender_phone: {
              type: "string",
              description:
                "Numéro de téléphone de l'utilisateur demandant le support.",
            },
            message_content: {
              type: "string",
              description:
                "Contenu du message de l'utilisateur exprimant la demande de support.",
            },
          },
          required: ["sender_name", "sender_phone", "message_content"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
    {
      type: "function",
      function: {
        name: "send_document",
        description:
          "Envoie un document, une image, une vidéo ou tout fichier pertinent au client. Utilise ce tool quand le client demande une brochure, des tarifs, des photos, un catalogue, ou tout autre document.",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "Ce que le client demande (ex: 'brochure', 'tarifs', 'photos ', 'catalogue ','vidéo')"
            },
            category: {
              type: ["string", "null"],
              enum: ["brochure", "catalogue", "tarif", "certificat", "photo", "video", "autre", null],
              description: "Catégorie du document recherché"
            },
            file_type: {
              type: ["string", "null"],
              enum: ["image", "document", "video", "audio", null],
              description: "Type de fichier souhaité"
            }
          },
          required: ["query"],
          additionalProperties: false
        },
        strict: true
      }
    }
  ];
};

/**
 * Traite les appels de tools
 */
export const handleToolCall = async (
  toolCall,
  context
) => {
  const { token, supabase, senderPhone, senderName, conversationId, userId, insertedMessageId, SUPPORT_PHONE, agentId } = context;
  
  if (toolCall.function.name === "contact_support") {
    const args = JSON.parse(toolCall.function.arguments);
    
    // Créer le message de notification
    const notificationMessage = `Client demande un conseiller: ${
      args.sender_name || "Inconnu"
    } (${args.sender_phone}) souhaite parler à un conseiller. Message: "${
      args.message_content
    }"`;

    try {
      // Envoyer la notification au support
      await sendWhatsAppMessage(
        token,
        SUPPORT_PHONE,
        notificationMessage
      );
      
      console.log("Notification envoyée au propriétaire: demande de conseiller");

      // Message de confirmation pour le client
      const clientMessage =
        "Votre demande a bien été prise en compte. Un autre conseiller va prendre en charge votre conversation dans les plus brefs délais. Merci de votre patience.";
      
      await sendWhatsAppMessage(token, senderPhone, clientMessage);

      // Mettre à jour le message dans la base de données
      await supabase
        .from("messages")
        .update({
          response: clientMessage,
          metadata: {
            tool_call: {
              name: "contact_support",
              arguments: args,
              status: "success",
            },
            delegated: true,
            reason: "requested_advisor",
          },
        })
        .eq("id", insertedMessageId);

      return {
        success: true,
        response: clientMessage,
        delegated: true,
        reason: "requested_advisor"
      };
      
    } catch (error) {
      console.error("Erreur lors de l'envoi de notification:", error);
      
      const errorMessage = "Une erreur s'est produite lors de la tentative de contacter le support. Veuillez réessayer.";
      
      await supabase
        .from("messages")
        .update({
          response: errorMessage,
          metadata: {
            tool_call: {
              name: "contact_support",
              arguments: args,
              status: "failed",
              error: error.message
            },
          },
        })
        .eq("id", insertedMessageId);
      
      return {
        success: false,
        response: errorMessage,
        error: error.message
      };
    }
  }
  
  if (toolCall.function.name === "send_document") {
    const args = JSON.parse(toolCall.function.arguments);
    
    try {
      // Rechercher le document dans la base de données
      const { data: documents, error: searchError } = await supabase
        .rpc('search_documents', {
          p_agent_id: agentId,
          p_query: args.query,
          p_category: args.category,
          p_file_type: args.file_type,
          p_limit: 1
        });

      if (searchError || !documents || documents.length === 0) {
        // Aucun document trouvé
        const notFoundMessage = `Je n'ai pas trouvé de document correspondant à "${args.query}". Je vais demander à l'équipe de vous l'envoyer.`;
        
        // Notifier le support
        await sendWhatsAppMessage(
          token,
          SUPPORT_PHONE,
          `Client ${senderName} (${senderPhone}) demande: "${args.query}" - Document non trouvé après recherche.`
        );

        return {
          success: false,
          response: notFoundMessage,
          error: "Document not found"
        };
      }

      // Récupérer les détails complets du document
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documents[0].document_id)
        .single();

      if (docError || !document) {
        throw new Error("Erreur lors de la récupération du document");
      }

      // Préparer le message avec le document
      let caption = document.title || document.file_name;
      if (document.description) {
        caption += `\n\n${document.description}`;
      }

      // Envoyer le document selon son type
      const mediaType = getMediaEndpoint(document.file_type);
      let sendResult;

      if (document.media_id) {
        // Utiliser l'ID média existant (plus rapide)
        sendResult = await sendWhatsAppMedia(
          token,
          senderPhone,
          document.media_id,
          caption,
          mediaType,
          'media_id'
        );
      } else if (document.file_url) {
        // Envoyer par URL
        sendResult = await sendWhatsAppMedia(
          token,
          senderPhone,
          document.file_url,
          caption,
          mediaType,
          'url'
        );
      } else if (document.file_data) {
        // Envoyer par base64
        sendResult = await sendWhatsAppMedia(
          token,
          senderPhone,
          document.file_data,
          caption,
          mediaType,
          'base64'
        );
      } else {
        throw new Error("Aucune source de fichier disponible");
      }

      // Mettre à jour les statistiques d'utilisation
      await supabase
        .from('documents')
        .update({ 
          usage_count: document.usage_count + 1,
          last_used_at: new Date().toISOString()
        })
        .eq('id', document.id);

      // Logger l'utilisation
      await supabase
        .from('document_usage_logs')
        .insert({
          document_id: document.id,
          conversation_id: conversationId,
          sent_to: senderPhone,
          status: sendResult.sent ? 'sent' : 'failed',
          metadata: { media_id: sendResult.media?.id }
        });

      // Si on a récupéré un nouveau media_id, le sauvegarder
      if (sendResult.media?.id && !document.media_id) {
        await supabase
          .from('documents')
          .update({ media_id: sendResult.media.id })
          .eq('id', document.id);
      }

      const successMessage = `Voici ${document.title || "le document demandé"} 📎`;

      await supabase
        .from("messages")
        .update({
          response: successMessage,
          metadata: {
            tool_call: {
              name: "send_document",
              arguments: args,
              status: "success",
              document_sent: {
                id: document.id,
                title: document.title,
                type: document.file_type
              }
            }
          }
        })
        .eq("id", insertedMessageId);

      return {
        success: true,
        response: successMessage,
        document_sent: true
      };

    } catch (error) {
      console.error("Erreur envoi document:", error);
      
      const errorMessage = "Je n'ai pas pu envoyer le document. Un conseiller va vous l'envoyer directement.";
      
      // Notifier le support
      await sendWhatsAppMessage(
        token,
        SUPPORT_PHONE,
        `Erreur envoi document pour ${senderPhone}: ${error.message}\nDemande: "${args.query}"`
      );

      await supabase
        .from("messages")
        .update({
          response: errorMessage,
          metadata: {
            tool_call: {
              name: "send_document",
              arguments: args,
              status: "failed",
              error: error.message
            }
          }
        })
        .eq("id", insertedMessageId);

      return {
        success: false,
        response: errorMessage,
        error: error.message
      };
    }
  }
  
  return {
    success: false,
    response: "Tool non reconnu",
    error: "Unknown tool"
  };
};



// Fonction utilitaire pour envoyer des messages WhatsApp
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

// Fonction pour envoyer des médias WhatsApp
async function sendWhatsAppMedia(token, to, media, caption, mediaType, mediaFormat) {
  try {
    const endpoint = `https://gate.whapi.cloud/messages/${mediaType}`;
    
    const body = {
      to,
      caption
    };

    // Ajouter le média selon le format
    if (mediaFormat === 'media_id') {
      body.media_id = media;
    } else if (mediaFormat === 'base64') {
      body.media = media; // Doit déjà inclure le préfixe data:
    } else {
      body.media = media; // URL
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body)
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || "Erreur envoi média");
    }

    return result;
  } catch (error) {
    throw new Error(`Échec d'envoi du média WhatsApp: ${error.message}`);
  }
}

// Fonction pour déterminer l'endpoint selon le type de fichier
function getMediaEndpoint(fileType) {
  const mapping = {
    'image': 'image',
    'document': 'document',
    'video': 'video',
    'audio': 'audio'
  };
  
  return mapping[fileType] || 'document';
}