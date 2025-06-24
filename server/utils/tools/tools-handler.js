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
  ];
};

/**
 * Traite les appels de tools
 */
export const handleToolCall = async (
  toolCall,
  context
) => {
  const { token, supabase, senderPhone, senderName, conversationId, userId, insertedMessageId, SUPPORT_PHONE } = context;
  
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