// server/utils/tools/index.js
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";

/**
 * Gestionnaire de Tools pour l'Agent IA WhatsApp
 * Utilise la nouvelle API responses d'OpenAI avec function calling
 */
export class ToolsManager {
  constructor(config) {
    this.openai = config.openai;
    this.supabase = config.supabase;
    this.supabasePublic = config.supabasePublic;
    this.token = config.token;
    this.supportPhone = config.supportPhone;
    this.agentId = config.agentId;
    this.userId = config.userId;
    
    // Registre des fonctions disponibles
    this.functions = {
      check_advisor_request: this.checkAdvisorRequest.bind(this),
      notify_support: this.notifySupport.bind(this),
      schedule_callback: this.scheduleCallback.bind(this),
      search_knowledge_base: this.searchKnowledgeBase.bind(this),
      handle_complex_query: this.handleComplexQuery.bind(this),
      manage_conversation_state: this.manageConversationState.bind(this),
      transfer_to_human: this.transferToHuman.bind(this),
      check_business_hours: this.checkBusinessHours.bind(this),
      get_customer_info: this.getCustomerInfo.bind(this)
    };
  }

  /**
   * Obtient les définitions de tools pour OpenAI
   */
  getToolDefinitions() {
    return [
      {
        type: "function",
        name: "check_advisor_request",
        description: "Analyse si le message contient une demande explicite de parler à un conseiller, responsable ou humain",
        parameters: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Le message du client à analyser"
            },
            conversation_context: {
              type: ["string", "null"],
              description: "Contexte de la conversation pour mieux évaluer"
            }
          },
          required: ["message", "conversation_context"],
          additionalProperties: false
        },
        strict: true
      },
      {
        type: "function",
        name: "notify_support",
        description: "Envoie une notification au support/responsable via WhatsApp",
        parameters: {
          type: "object",
          properties: {
            customer_phone: {
              type: "string",
              description: "Numéro WhatsApp du client"
            },
            customer_name: {
              type: ["string", "null"],
              description: "Nom du client si disponible"
            },
            reason: {
              type: "string",
              description: "Raison détaillée de la notification"
            },
            priority: {
              type: "string",
              enum: ["low", "medium", "high", "urgent"],
              description: "Niveau de priorité de la notification"
            },
            conversation_summary: {
              type: ["string", "null"],
              description: "Résumé de la conversation jusqu'à présent"
            }
          },
          required: ["customer_phone", "reason", "priority"],
          additionalProperties: false
        },
        strict: true
      },
      {
        type: "function",
        name: "schedule_callback",
        description: "Programme un rappel client à un moment ultérieur",
        parameters: {
          type: "object",
          properties: {
            customer_phone: {
              type: "string",
              description: "Numéro du client pour le rappel"
            },
            preferred_time: {
              type: ["string", "null"],
              description: "Moment préféré pour le rappel (ex: 'demain matin', '15h')"
            },
            reason: {
              type: "string",
              description: "Raison du rappel demandé"
            },
            urgency: {
              type: "string",
              enum: ["normal", "urgent"],
              description: "Urgence du rappel"
            }
          },
          required: ["customer_phone", "reason", "urgency"],
          additionalProperties: false
        },
        strict: true
      },
      {
        type: "function",
        name: "search_knowledge_base",
        description: "Recherche des informations spécifiques dans la base de connaissances de l'entreprise",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "La question ou recherche à effectuer"
            },
            options: {
              type: "object",
              properties: {
                num_results: {
                  type: "number",
                  description: "Nombre de résultats à retourner (1-10)"
                },
                category: {
                  type: ["string", "null"],
                  enum: ["pricing", "services", "hours", "location", "contact", "policies", "general", null],
                  description: "Catégorie pour filtrer la recherche"
                },
                language: {
                  type: ["string", "null"],
                  description: "Langue de la recherche (fr, en, es, etc.)"
                }
              },
              required: ["num_results"],
              additionalProperties: false
            }
          },
          required: ["query", "options"],
          additionalProperties: false
        },
        strict: true
      },
      {
        type: "function",
        name: "handle_complex_query",
        description: "Gère les questions complexes nécessitant une analyse approfondie ou une escalade",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "La question complexe du client"
            },
            attempted_solutions: {
              type: "array",
              items: { type: "string" },
              description: "Solutions déjà tentées"
            },
            requires_human: {
              type: "boolean",
              description: "Si true, nécessite absolument une intervention humaine"
            }
          },
          required: ["query", "attempted_solutions", "requires_human"],
          additionalProperties: false
        },
        strict: true
      },
      {
        type: "function",
        name: "manage_conversation_state",
        description: "Gère l'état de la conversation (pause, reprise, transfert, clôture)",
        parameters: {
          type: "object",
          properties: {
            action: {
              type: "string",
              enum: ["pause", "resume", "transfer", "close", "flag", "escalate"],
              description: "Action à effectuer sur la conversation"
            },
            reason: {
              type: "string",
              description: "Raison de l'action"
            },
            metadata: {
              type: ["object", "null"],
              properties: {
                transfer_to: {
                  type: ["string", "null"],
                  description: "Vers qui transférer (si action=transfer)"
                },
                flag_type: {
                  type: ["string", "null"],
                  description: "Type de flag (si action=flag)"
                },
                notes: {
                  type: ["string", "null"],
                  description: "Notes additionnelles"
                }
              },
              required: ["transfer_to", "flag_type", "notes"],
              additionalProperties: false
            }
          },
          required: ["action", "reason", "metadata"],
          additionalProperties: false
        },
        strict: true
      },
      {
        type: "function",
        name: "transfer_to_human",
        description: "Transfère immédiatement la conversation à un humain avec contexte complet",
        parameters: {
          type: "object",
          properties: {
            urgency: {
              type: "string",
              enum: ["normal", "high", "critical"],
              description: "Niveau d'urgence du transfert"
            },
            reason: {
              type: "string",
              description: "Raison détaillée du transfert"
            },
            key_points: {
              type: "array",
              items: { type: "string" },
              description: "Points clés de la conversation à transmettre"
            }
          },
          required: ["urgency", "reason", "key_points"],
          additionalProperties: false
        },
        strict: true
      },
      {
        type: "function",
        name: "check_business_hours",
        description: "Vérifie si nous sommes dans les heures d'ouverture du support",
        parameters: {
          type: "object",
          properties: {
            timezone: {
              type: ["string", "null"],
              description: "Fuseau horaire du client (par défaut: UTC)"
            }
          },
          required: ["timezone"],
          additionalProperties: false
        },
        strict: true
      },
      {
        type: "function",
        name: "get_customer_info",
        description: "Récupère les informations du client depuis l'historique",
        parameters: {
          type: "object",
          properties: {
            phone: {
              type: "string",
              description: "Numéro de téléphone du client"
            },
            info_type: {
              type: "array",
              items: {
                type: "string",
                enum: ["history", "preferences", "issues", "all"]
              },
              description: "Types d'informations à récupérer"
            }
          },
          required: ["phone", "info_type"],
          additionalProperties: false
        },
        strict: true
      }
    ];
  }

  /**
   * Traite un message avec le système de tools
   */
  async processWithTools(messageContent, conversationHistory, customerInfo) {
    try {
      // Préparer les messages pour l'API
      const messages = [
        {
          role: "system",
          content: this.getSystemPrompt()
        },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        {
          role: "user",
          content: messageContent
        }
      ];

      // Appel initial avec les tools
      console.log("🤖 Appel OpenAI avec tools...");
      const response = await this.openai.responses.create({
        model: "gpt-4.1-nano",
        input: messages,
        tools: this.getToolDefinitions(),
        tool_choice: "auto",
        store: true
      });

      // Si pas d'appels de fonctions, retourner la réponse directe
      if (!response.output || response.output.length === 0) {
        return {
          content: response.output_text || "Je suis désolé, je n'ai pas pu générer de réponse.",
          toolsUsed: [],
          toolResults: []
        };
      }

      // Traiter les appels de fonctions
      const toolResults = [];
      const toolsUsed = [];
      
      for (const output of response.output) {
        if (output.type === "function_call") {
          console.log(`🔧 Appel de fonction: ${output.name}`);
          toolsUsed.push(output.name);
          
          try {
            const args = JSON.parse(output.arguments);
            const result = await this.functions[output.name](args);
            
            toolResults.push({
              type: "function_call_output",
              call_id: output.call_id,
              output: JSON.stringify(result)
            });

            // Logger l'exécution
            await this.logToolExecution(output.name, args, result, true);
          } catch (error) {
            console.error(`❌ Erreur fonction ${output.name}:`, error);
            
            toolResults.push({
              type: "function_call_output",
              call_id: output.call_id,
              output: JSON.stringify({
                success: false,
                error: error.message
              })
            });

            await this.logToolExecution(output.name, args, { error: error.message }, false);
          }
        }
      }

      // Si des fonctions ont été appelées, obtenir la réponse finale
      if (toolResults.length > 0) {
        console.log("🔄 Obtention de la réponse finale avec résultats des tools...");
        
        // Ajouter les appels de fonctions et résultats aux messages
        const updatedMessages = [
          ...messages,
          ...response.output.filter(o => o.type === "function_call"),
          ...toolResults
        ];

        const finalResponse = await this.openai.responses.create({
          model: "gpt-4.1-nano",
          input: updatedMessages,
          tools: this.getToolDefinitions(),
          store: true
        });

        return {
          content: finalResponse.output_text || "Votre demande a été traitée.",
          toolsUsed,
          toolResults
        };
      }

      return {
        content: response.output_text,
        toolsUsed: [],
        toolResults: []
      };

    } catch (error) {
      console.error("❌ Erreur processWithTools:", error);
      throw error;
    }
  }

  /**
   * Implémentation des fonctions
   */
  async checkAdvisorRequest({ message, conversation_context }) {
    const advisorPatterns = [
      /\b(conseill?e?r|responsable|manager|superviseur|humain|personne)\b/i,
      /\b(parler|discuter|contact|chat)\s+(avec|à)\s+(quelqu['']un|une personne|un humain)\b/i,
      /\b(service\s+client|support|assistance|SAV)\b/i,
      /\b(pas|plus)\s+(un|d[''])\s+(robot|ia|bot|machine)\b/i,
      /\b(vrais?|vrai)\s+(personne|humain|conseiller)\b/i,
      /\b(mettre|mise?)\s+en\s+(relation|contact)\b/i
    ];

    const urgencyPatterns = [
      /\b(urgent|urgence|immédiat|maintenant|tout\s+de\s+suite)\b/i,
      /\b(problème|souci|bug|erreur|bloqué|grave)\b/i,
      /\b(important|critique|vital)\b/i
    ];

    const isAdvisorRequest = advisorPatterns.some(pattern => pattern.test(message));
    const isUrgent = urgencyPatterns.some(pattern => pattern.test(message));

    // Analyser le contexte si fourni
    let contextIndicatesNeed = false;
    if (conversation_context) {
      contextIndicatesNeed = conversation_context.includes("échec") || 
                            conversation_context.includes("pas trouvé") ||
                            conversation_context.includes("erreur");
    }

    return {
      is_advisor_request: isAdvisorRequest,
      is_urgent: isUrgent,
      confidence: isAdvisorRequest ? 0.95 : 0.1,
      suggested_action: isUrgent ? "immediate_transfer" : "schedule_callback",
      context_indicates_need: contextIndicatesNeed
    };
  }

  async notifySupport({ customer_phone, customer_name, reason, priority, conversation_summary }) {
    try {
      let message = `🔔 NOTIFICATION ${priority.toUpperCase()}\n\n`;
      message += `📱 Client: ${customer_name || "Non renseigné"} (${customer_phone})\n`;
      message += `📋 Raison: ${reason}\n`;
      message += `⏰ Heure: ${new Date().toLocaleString('fr-FR')}\n`;
      
      if (conversation_summary) {
        message += `\n💬 Résumé conversation:\n${conversation_summary}`;
      }

      // Emoji selon priorité
      if (priority === "urgent") {
        message = `🚨 URGENT 🚨\n${message}`;
      } else if (priority === "high") {
        message = `⚠️ PRIORITÉ HAUTE\n${message}`;
      }

      // Envoyer au support
      const whatsappResult = await this.sendWhatsAppMessage(this.supportPhone, message);
      
      // Enregistrer dans la base
      const { data, error } = await this.supabase
        .from("support_notifications")
        .insert({
          agent_id: this.agentId,
          customer_phone: customer_phone,
          customer_name: customer_name,
          reason: reason,
          priority: priority,
          conversation_summary: conversation_summary,
          status: "sent",
          whatsapp_message_id: whatsappResult.sent ? whatsappResult.id : null
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        notification_id: data.id,
        message: "Support notifié avec succès",
        priority: priority
      };
    } catch (error) {
      console.error("Erreur notification support:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async scheduleCallback({ customer_phone, preferred_time, reason, urgency }) {
    try {
      // Parser le temps préféré
      let scheduledFor = null;
      if (preferred_time) {
        // Logique simple de parsing
        const now = new Date();
        if (preferred_time.includes("demain")) {
          scheduledFor = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        } else if (preferred_time.includes("heure")) {
          const hours = parseInt(preferred_time.match(/(\d+)/)?.[1] || "1");
          scheduledFor = new Date(now.getTime() + hours * 60 * 60 * 1000);
        }
      }

      const { data, error } = await this.supabase
        .from("scheduled_callbacks")
        .insert({
          agent_id: this.agentId,
          customer_phone: customer_phone,
          preferred_time: preferred_time || "Dès que possible",
          scheduled_for: scheduledFor,
          reason: reason,
          urgency: urgency,
          status: "pending"
        })
        .select()
        .single();

      if (error) throw error;

      // Notifier le support si urgent
      if (urgency === "urgent") {
        await this.notifySupport({
          customer_phone: customer_phone,
          reason: `Rappel URGENT demandé: ${reason}`,
          priority: "high",
          conversation_summary: `Rappel souhaité: ${preferred_time || "ASAP"}`
        });
      }

      return {
        success: true,
        callback_id: data.id,
        scheduled_time: preferred_time || "Dans les plus brefs délais",
        message: "Rappel programmé avec succès"
      };
    } catch (error) {
      console.error("Erreur programmation rappel:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async searchKnowledgeBase({ query, options }) {
    try {
      const { adaptiveSearch } = await import("../adaptive-search.js");
      
      // Recherche avec embeddings
      const searchResult = await adaptiveSearch(
        query,
        this.agentId,
        this.openai,
        this.supabase
      );

      // Filtrer par catégorie si spécifiée
      let chunks = searchResult.chunks;
      if (options.category && options.category !== "general") {
        chunks = chunks.filter(chunk => 
          chunk.metadata?.type === options.category ||
          chunk.content.toLowerCase().includes(options.category)
        );
      }

      // Limiter le nombre de résultats
      chunks = chunks.slice(0, options.num_results || 5);

      if (chunks.length === 0) {
        return {
          found: false,
          message: "Aucune information trouvée pour cette requête",
          suggest_human_help: true
        };
      }

      return {
        found: true,
        results: chunks.map(chunk => ({
          content: chunk.content,
          relevance_score: chunk.adaptiveScore || chunk.similarity,
          category: chunk.metadata?.type || "general"
        })),
        total_found: chunks.length,
        language: searchResult.analysis?.language || "fr"
      };
    } catch (error) {
      console.error("Erreur recherche knowledge base:", error);
      return {
        found: false,
        error: error.message
      };
    }
  }

  async handleComplexQuery({ query, attempted_solutions, requires_human }) {
    try {
      // Si intervention humaine requise, transférer directement
      if (requires_human) {
        const transferResult = await this.transferToHuman({
          urgency: "high",
          reason: "Question complexe nécessitant expertise humaine",
          key_points: [query, ...attempted_solutions]
        });
        
        return {
          handled: false,
          action_taken: "transferred_to_human",
          transfer_result: transferResult
        };
      }

      // Sinon, essayer de décomposer la question
      const decompositionPrompt = `Décompose cette question complexe en sous-questions simples et identifie les points clés à rechercher: "${query}"`;
      
      const decomposition = await this.openai.responses.create({
        model: "gpt-4.1-nano",
        input: decompositionPrompt,
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(decomposition.output_text || "{}");

      // Rechercher des informations pour chaque sous-question
      const subResults = [];
      if (analysis.sub_questions) {
        for (const subQuestion of analysis.sub_questions) {
          const result = await this.searchKnowledgeBase({
            query: subQuestion,
            options: { num_results: 3 }
          });
          subResults.push(result);
        }
      }

      return {
        handled: true,
        approach: "decomposition",
        original_query: query,
        sub_questions: analysis.sub_questions || [],
        sub_results: subResults,
        needs_follow_up: subResults.some(r => !r.found)
      };
    } catch (error) {
      console.error("Erreur gestion requête complexe:", error);
      return {
        handled: false,
        error: error.message,
        fallback_action: "notify_support"
      };
    }
  }

  async manageConversationState({ action, reason, metadata }) {
    try {
      const conversationId = this.conversationId; // Doit être passé dans le constructeur
      
      const updates = {
        last_action: action,
        last_action_at: new Date().toISOString(),
        action_reason: reason
      };

      switch (action) {
        case "pause":
          updates.status = "paused";
          break;
        case "transfer":
          updates.status = "transferred";
          updates.transferred_to = metadata?.transfer_to || "support";
          break;
        case "close":
          updates.status = "closed";
          break;
        case "flag":
          updates.flagged = true;
          updates.flag_reason = metadata?.flag_type || reason;
          break;
        case "escalate":
          updates.status = "escalated";
          updates.escalated_at = new Date().toISOString();
          break;
      }

      const { data, error } = await this.supabase
        .from("conversations")
        .update(updates)
        .eq("id", conversationId)
        .select()
        .single();

      if (error) throw error;

      // Si escalade ou transfert, notifier
      if (["transfer", "escalate"].includes(action)) {
        await this.notifySupport({
          customer_phone: this.customerPhone,
          reason: `Conversation ${action}: ${reason}`,
          priority: "high",
          conversation_summary: metadata?.notes
        });
      }

      return {
        success: true,
        action: action,
        new_status: data.status,
        conversation_id: conversationId
      };
    } catch (error) {
      console.error("Erreur gestion état conversation:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async transferToHuman({ urgency, reason, key_points }) {
    try {
      // Préparer le message de transfert
      let transferMessage = `🔄 TRANSFERT DE CONVERSATION\n`;
      transferMessage += `⚡ Urgence: ${urgency.toUpperCase()}\n`;
      transferMessage += `📋 Raison: ${reason}\n\n`;
      transferMessage += `🎯 Points clés:\n`;
      key_points.forEach((point, i) => {
        transferMessage += `${i + 1}. ${point}\n`;
      });

      // Notifier le support
      const notifyResult = await this.notifySupport({
        customer_phone: this.customerPhone,
        customer_name: this.customerName,
        reason: "Transfert immédiat requis",
        priority: urgency === "critical" ? "urgent" : "high",
        conversation_summary: transferMessage
      });

      // Mettre à jour l'état de la conversation
      await this.manageConversationState({
        action: "transfer",
        reason: reason,
        metadata: {
          transfer_to: "human_agent",
          notes: key_points.join("; ")
        }
      });

      return {
        success: true,
        transfer_initiated: true,
        notification_sent: notifyResult.success,
        message: "Transfert vers un conseiller initié"
      };
    } catch (error) {
      console.error("Erreur transfert humain:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async checkBusinessHours({ timezone = "Europe/Paris" }) {
    try {
      const now = new Date();
      const formatter = new Intl.DateTimeFormat('fr-FR', {
        timeZone: timezone,
        hour: 'numeric',
        minute: 'numeric',
        weekday: 'long'
      });
      
      const parts = formatter.formatToParts(now);
      const hour = parseInt(parts.find(p => p.type === 'hour').value);
      const weekday = parts.find(p => p.type === 'weekday').value;
      
      // Heures d'ouverture standard (à personnaliser)
      const isWeekend = ['samedi', 'dimanche'].includes(weekday);
      const isOpen = !isWeekend && hour >= 9 && hour < 18;
      
      return {
        is_open: isOpen,
        current_time: formatter.format(now),
        business_hours: isWeekend ? "Fermé le week-end" : "9h00 - 18h00",
        next_opening: isOpen ? null : (isWeekend ? "Lundi 9h00" : "Demain 9h00")
      };
    } catch (error) {
      return {
        is_open: true, // Par défaut, considérer ouvert
        error: error.message
      };
    }
  }

  async getCustomerInfo({ phone, info_type }) {
    try {
      const results = {
        phone: phone,
        info_found: {}
      };

      // Historique des conversations
      if (info_type.includes("history") || info_type.includes("all")) {
        const { data: conversations } = await this.supabase
          .from("conversations")
          .select("id, created_at, status, metadata")
          .eq("phone", phone)
          .order("created_at", { ascending: false })
          .limit(5);
        
        results.info_found.conversation_history = {
          total_conversations: conversations?.length || 0,
          recent_conversations: conversations || []
        };
      }

      // Messages récents
      if (info_type.includes("issues") || info_type.includes("all")) {
        const { data: messages } = await this.supabase
          .from("messages")
          .select("content, response, created_at")
          .eq("conversation_id", this.conversationId)
          .order("created_at", { ascending: false })
          .limit(10);
        
        results.info_found.recent_issues = messages || [];
      }

      return results;
    } catch (error) {
      console.error("Erreur récupération info client:", error);
      return {
        phone: phone,
        error: error.message
      };
    }
  }

  /**
   * Utilitaires
   */
  async sendWhatsAppMessage(to, message) {
    const response = await fetch("https://gate.whapi.cloud/messages/text", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({
        typing_time: 0,
        to,
        body: message,
      }),
    });

    return await response.json();
  }

  async logToolExecution(toolName, parameters, result, success) {
    try {
      await this.supabase.from("tool_execution_logs").insert({
        conversation_id: this.conversationId,
        message_id: this.messageId,
        tool_name: toolName,
        parameters: parameters,
        result: result,
        success: success,
        execution_time_ms: Date.now() - (this.startTime || Date.now())
      });
    } catch (error) {
      console.error("Erreur log tool execution:", error);
    }
  }

  getSystemPrompt() {
    return `Tu es un assistant intelligent pour le service client WhatsApp.
    
Tu as accès à plusieurs outils pour t'aider à gérer les conversations :

1. **check_advisor_request** : Utilise-le pour détecter si le client demande explicitement un conseiller
2. **notify_support** : Pour alerter le support humain avec différents niveaux de priorité
3. **schedule_callback** : Pour programmer un rappel à la demande du client
4. **search_knowledge_base** : Pour chercher des informations dans la base de connaissances
5. **handle_complex_query** : Pour les questions complexes nécessitant une analyse approfondie
6. **manage_conversation_state** : Pour gérer l'état de la conversation
7. **transfer_to_human** : Pour transférer immédiatement à un humain
8. **check_business_hours** : Pour vérifier les heures d'ouverture
9. **get_customer_info** : Pour obtenir l'historique du client

RÈGLES D'UTILISATION DES TOOLS :

1. Si le client demande EXPLICITEMENT un conseiller → utilise check_advisor_request puis notify_support
2. Si tu ne trouves pas l'information → utilise search_knowledge_base d'abord
3. Si la question est trop complexe → utilise handle_complex_query
4. Si c'est urgent → utilise transfer_to_human avec urgency="critical"
5. Toujours proposer un rappel (schedule_callback) si le support n'est pas disponible

IMPORTANT :
- Sois concis dans tes réponses (max 3-4 phrases)
- Utilise les tools de manière intelligente et proactive
- Si tu utilises un tool et qu'il échoue, propose une alternative
- Garde un ton professionnel mais empathique`;
  }
}

/**
 * Fonction helper pour intégrer dans le webhook
 */
export const processMessageWithTools = async (config) => {
  const toolsManager = new ToolsManager({
    ...config,
    conversationId: config.conversationId,
    messageId: config.messageId,
    customerPhone: config.customerInfo.phone,
    customerName: config.customerInfo.name,
    startTime: Date.now()
  });
  
  try {
    const result = await toolsManager.processWithTools(
      config.message,
      config.conversationHistory,
      config.customerInfo
    );
    
    return result;
  } catch (error) {
    console.error("Erreur processMessageWithTools:", error);
    throw error;
  }
};