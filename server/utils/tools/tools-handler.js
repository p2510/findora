
/**
 * Définition enrichie des tools pour le système multi-agents
 */
export const getAgentTools = () => {
  return [
    {
      type: "function",
      function: {
        name: "send_document",
        description: "Envoie un ou plusieurs documents au client. Peut gérer des demandes multiples.",
        parameters: {
          type: "object",
          properties: {
            documents: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  query: { type: "string", description: "Document recherché" },
                  category: { 
                    type: "string",
                    enum: ["brochure", "catalogue", "tarif", "certificat", "photo", "video", "autre"] 
                  },
                  priority: { type: "number", description: "Ordre d'envoi (1 = premier)" }
                }
              },
              description: "Liste des documents à envoyer"
            },
            message: {
              type: "string",
              description: "Message personnalisé à inclure avec les documents"
            }
          },
          required: ["documents"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "contact_support",
        description: "Transfère la conversation à un conseiller humain avec contexte complet",
        parameters: {
          type: "object",
          properties: {
            reason: {
              type: "string",
              enum: ["client_request", "complex_issue", "complaint", "technical_error"],
              description: "Raison du transfert"
            },
            urgency: {
              type: "number",
              description: "Niveau d'urgence (1-5)"
            },
            context: {
              type: "object",
              properties: {
                summary: { type: "string", description: "Résumé de la situation" },
                customerMood: { type: "string", description: "État émotionnel du client" },
                attemptedActions: { type: "array", items: { type: "string" } }
              }
            }
          },
          required: ["reason", "urgency", "context"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "check_information",
        description: "Vérifie des informations spécifiques dans la base de données ou les systèmes externes",
        parameters: {
          type: "object",
          properties: {
            infoType: {
              type: "string",
              enum: ["order_status", "account_info", "product_availability", "general_info"],
              description: "Type d'information à vérifier"
            },
            query: {
              type: "string",
              description: "Détails de la recherche"
            },
            customerId: {
              type: "string",
              description: "Identifiant client si applicable"
            }
          },
          required: ["infoType", "query"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "schedule_callback",
        description: "Programme un rappel ou un suivi",
        parameters: {
          type: "object",
          properties: {
            type: {
              type: "string",
              enum: ["callback", "follow_up", "appointment"],
              description: "Type de planification"
            },
            preferredTime: {
              type: "string",
              description: "Moment préféré pour le contact"
            },
            notes: {
              type: "string",
              description: "Notes pour le conseiller"
            }
          },
          required: ["type", "preferredTime"]
        }
      }
    }
  ];
};

/**
 * Gestionnaire de tools amélioré avec support multi-actions
 */
export const handleToolCall = async (toolCall, context) => {
  const {
    token,
    supabase,
    senderPhone,
    senderName,
    conversationId,
    userId,
    insertedMessageId,
    SUPPORT_PHONE,
    agentId,
    openai,
    messageContent
  } = context;

  console.log(`🔧 Exécution du tool: ${toolCall.function.name}`);
  
  let args;
  try {
    args = JSON.parse(toolCall.function.arguments);
    console.log("📝 Arguments parsés:", args);
  } catch (error) {
    console.error("❌ Erreur parsing arguments:", error);
    return {
      success: false,
      response: "Erreur dans le traitement de la demande",
      error: "Invalid arguments"
    };
  }

  switch (toolCall.function.name) {
    case "send_document":
      // Adapter au format attendu par l'ancienne fonction
      if (args.documents && Array.isArray(args.documents)) {
        // Nouveau format avec array de documents
        return await handleMultipleDocuments(args, context);
      } else {
        // Ancien format simple
        console.log("📄 Format simple détecté, conversion...");
        
        // Extraire query depuis différentes sources possibles
        const query = args.query || args.document || args.type || "document";
        const category = args.category || detectCategoryFromQuery(query);
        
        console.log(`🔍 Recherche: query="${query}", category="${category}"`);
        
        // Utiliser directement l'ancienne logique
        try {
          let documents = null;
          
          // Essayer la fonction RPC
          try {
            const { data, error } = await supabase.rpc("search_documents", {
              p_agent_id: agentId,
              p_query: query,
              p_category: category,
              p_file_type: args.file_type || "document",
              p_limit: 1,
            });

            if (error) throw error;
            documents = data;
            console.log("✅ Documents trouvés via RPC:", documents);
          } catch (rpcError) {
            console.log("⚠️ RPC échoué, requête directe...");
            
            // Requête directe
            let dbQuery = supabase
              .from("documents")
              .select("*")
              .eq("agent_id", agentId);

            if (category) {
              dbQuery = dbQuery.eq("category", category);
            }

            // Recherche flexible
            const searchTerms = query.toLowerCase();
            dbQuery = dbQuery.or(
              `title.ilike.%${searchTerms}%,` +
              `description.ilike.%${searchTerms}%,` +
              `file_name.ilike.%${searchTerms}%`
            );

            const { data, error } = await dbQuery.limit(1);
            if (error) throw error;
            documents = data;
          }

          if (!documents || documents.length === 0) {
            console.log("❌ Aucun document trouvé");
            
            await sendWhatsAppMessage(
              token,
              SUPPORT_PHONE,
              `Client ${senderName} (${senderPhone}) demande: "${query}". Document non trouvé.`
            );

            return {
              success: false,
              response: `Je n'ai pas trouvé de document correspondant à "${query}". L'équipe va vous l'envoyer directement.`,
              error: "Document not found",
            };
          }

          // Document trouvé
          let document;
          if (documents[0].document_id) {
            // Format RPC
            const { data: doc } = await supabase
              .from("documents")
              .select("*")
              .eq("id", documents[0].document_id)
              .single();
            document = doc;
          } else {
            document = documents[0];
          }

          console.log("📄 Document à envoyer:", document.title);

          // Préparer et envoyer
          let caption = document.title || document.file_name;
          if (document.description) {
            caption += `\n\n${document.description}`;
          }

          const mediaType = getMediaEndpoint(document.file_type);
          let sendResult;

          if (document.media_id) {
            sendResult = await sendWhatsAppMedia(
              token, senderPhone, document.media_id,
              caption, mediaType, "media_id"
            );
          } else if (document.file_url) {
            sendResult = await sendWhatsAppMedia(
              token, senderPhone, document.file_url,
              caption, mediaType, "url"
            );
          } else if (document.file_data) {
            sendResult = await sendWhatsAppMedia(
              token, senderPhone, document.file_data,
              caption, mediaType, "base64"
            );
          } else {
            throw new Error("Aucune source de fichier disponible");
          }

          // Mise à jour stats
          await supabase
            .from("documents")
            .update({ 
              usage_count: (document.usage_count || 0) + 1,
              last_used_at: new Date().toISOString()
            })
            .eq("id", document.id);

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
                    type: document.file_type,
                  },
                },
              },
            })
            .eq("id", insertedMessageId);

          return {
            success: true,
            response: successMessage,
            document_sent: true,
          };
          
        } catch (error) {
          console.error("❌ Erreur envoi document:", error);
          
          await sendWhatsAppMessage(
            token,
            SUPPORT_PHONE,
            `Erreur envoi document pour ${senderPhone}:\nErreur: ${error.message}\nDemande: "${query}"`
          );

          return {
            success: false,
            response: "Je n'ai pas pu envoyer le document. Un conseiller va vous l'envoyer directement.",
            error: error.message,
          };
        }
      }
      
    case "contact_support":
      // Code existant pour contact_support
      return await handleContactSupport(args, context);
      
    default:
      return {
        success: false,
        response: "Fonction non reconnue",
        error: "Unknown tool"
      };
  }
};

// Fonction helper pour détecter la catégorie
function detectCategoryFromQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('tarif') || lowerQuery.includes('prix') || lowerQuery.includes('coût')) {
    return 'tarif';
  }
  if (lowerQuery.includes('brochure')) {
    return 'brochure';
  }
  if (lowerQuery.includes('catalogue')) {
    return 'catalogue';
  }
  if (lowerQuery.includes('photo')) {
    return 'photo';
  }
  if (lowerQuery.includes('video') || lowerQuery.includes('vidéo')) {
    return 'video';
  }
  
  return null;
}

/**
 * Gestion améliorée de l'envoi de documents multiples
 */
async function handleMultipleDocuments(args, context) {
  const { documents, message } = args;
  const responses = [];
  let allSuccess = true;

  // Trier par priorité
  const sortedDocs = documents.sort((a, b) => (a.priority || 999) - (b.priority || 999));

  for (const doc of sortedDocs) {
    try {
      // Rechercher le document
      const { data: foundDocs } = await context.supabase
        .rpc('search_documents', {
          p_agent_id: context.agentId,
          p_query: doc.query,
          p_category: doc.category,
          p_limit: 1
        });

      if (foundDocs && foundDocs.length > 0) {
        // Envoyer le document
        const document = foundDocs[0];
        const caption = `${document.title}\n${document.description || ''}${message ? '\n\n' + message : ''}`;
        
        const sendResult = await sendWhatsAppMedia(
          context.token,
          context.senderPhone,
          document.file_url || document.media_id,
          caption,
          getMediaEndpoint(document.file_type),
          document.media_id ? "media_id" : "url"
        );

        responses.push(`✅ ${document.title} envoyé`);
      } else {
        responses.push(`❌ ${doc.query} non trouvé`);
        allSuccess = false;
      }

      // Pause entre envois
      if (sortedDocs.indexOf(doc) < sortedDocs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Erreur envoi ${doc.query}:`, error);
      responses.push(`❌ Erreur envoi ${doc.query}`);
      allSuccess = false;
    }
  }

  return {
    success: allSuccess,
    response: responses.join('\n'),
    documentsProcessed: documents.length
  };
}

/**
 * Gestion améliorée du contact support avec contexte riche
 */
async function handleEnhancedSupport(args, context) {
  const { reason, urgency, context: supportContext } = args;
  
  // Message enrichi pour le support
  const supportMessage = `
🚨 DEMANDE DE SUPPORT - Urgence: ${urgency}/5
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Client: ${context.senderName || 'Inconnu'} (${context.senderPhone})
📱 Raison: ${reason}
💬 Résumé: ${supportContext.summary}
😊 Humeur client: ${supportContext.customerMood}
🔧 Actions tentées: ${supportContext.attemptedActions?.join(', ') || 'Aucune'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Message original: "${context.messageContent}"
`;

  await sendWhatsAppMessage(context.token, context.SUPPORT_PHONE, supportMessage);
  
  // Message au client selon l'urgence
  const clientMessage = urgency >= 4 
    ? "🚨 Votre demande est prioritaire. Un conseiller vous contacte immédiatement."
    : "Votre demande a été transmise à un conseiller qui vous répondra rapidement.";
  
  await sendWhatsAppMessage(context.token, context.senderPhone, clientMessage);

  return {
    success: true,
    response: clientMessage,
    delegated: true,
    reason: reason,
    urgencyLevel: urgency
  };
}

/**
 * Vérification d'informations
 */
async function handleInformationCheck(args, context) {
  const { infoType, query, customerId } = args;
  
  console.log(`🔍 Vérification: ${infoType} - ${query}`);
  
  // Simuler une recherche (à adapter selon vos besoins)
  try {
    let result = "";
    
    switch (infoType) {
      case "order_status":
        // Chercher dans la base de commandes
        result = "Commande en cours de traitement";
        break;
      case "product_availability":
        // Vérifier la disponibilité
        result = "Produit disponible";
        break;
      default:
        // Recherche générale dans la knowledge base
        const searchResult = await context.supabase
          .from('knowledge_embeddings')
          .select('content')
          .textSearch('content', query)
          .limit(1);
        
        result = searchResult.data?.[0]?.content || "Information non trouvée";
    }
    
    return {
      success: true,
      response: result,
      infoType: infoType,
      query: query
    };
  } catch (error) {
    return {
      success: false,
      response: "Impossible de vérifier cette information pour le moment.",
      error: error.message
    };
  }
}

/**
 * Planification de rappels
 */
async function handleScheduling(args, context) {
  const { type, preferredTime, notes } = args;
  
  try {
    // Enregistrer la demande de rappel
    await context.supabase
      .from('callback_requests')
      .insert({
        customer_phone: context.senderPhone,
        customer_name: context.senderName,
        type: type,
        preferred_time: preferredTime,
        notes: notes,
        conversation_id: context.conversationId,
        status: 'pending'
      });
    
    // Notifier le support
    await sendWhatsAppMessage(
      context.token,
      context.SUPPORT_PHONE,
      `📅 Nouveau ${type} programmé:\n` +
      `Client: ${context.senderName} (${context.senderPhone})\n` +
      `Moment souhaité: ${preferredTime}\n` +
      `Notes: ${notes || 'Aucune'}`
    );
    
    return {
      success: true,
      response: `Parfait ! Un conseiller vous contactera ${preferredTime}. ${notes ? 'Vos notes ont été enregistrées.' : ''}`,
      scheduled: true
    };
  } catch (error) {
    return {
      success: false,
      response: "Je n'ai pas pu programmer le rappel. Un conseiller va vous contacter.",
      error: error.message
    };
  }
}


// Fonctions utilitaires existantes
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

async function sendWhatsAppMedia(
  token,
  to,
  media,
  caption,
  mediaType,
  mediaFormat
) {
  try {
    const endpoint = `https://gate.whapi.cloud/messages/${mediaType}`;

    const body = {
      to,
      caption,
    };

    if (mediaFormat === "media_id") {
      body.media_id = media;
    } else if (mediaFormat === "base64") {
      body.media = media;
    } else {
      body.media = media;
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
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

function getMediaEndpoint(fileType) {
  const mapping = {
    image: "image",
    document: "document",
    video: "video",
    audio: "audio",
  };

  return mapping[fileType] || "document";
}