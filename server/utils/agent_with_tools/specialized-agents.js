// server/utils/agent_with_tools/specialized-agents.js

/**
 * AGENT DE TRIAGE - Analyse et catégorise la demande
 * Utilise GPT-4o-mini pour une analyse rapide
 */
export const TriageAgent = async (openai, params) => {
  const { message, conversationHistory, customerInfo } = params;

  console.log("🔍 Agent de Triage activé");

  const triagePrompt = `Tu es un agent de triage expert. Analyse cette demande client.

MESSAGE CLIENT: "${message}"

HISTORIQUE: ${conversationHistory?.length || 0} messages précédents

Tu dois retourner un JSON avec cette structure EXACTE:
{
  "intention_principale": "information_request" ou "document_request" ou "human_request" ou "complaint" ou "action_request" ou "conversation",
  "urgence": 1 à 5 (5 = très urgent),
  "complexite": "simple" ou "medium" ou "complex",
  "elements_cles": {
    "documents_mentionnes": [],
    "actions_requises": [],
    "emotions_detectees": []
  }
}

Pour ce message sur la fibre, c'est clairement une "information_request" simple.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es un agent de triage. Réponds UNIQUEMENT en JSON valide avec tous les champs requis.",
        },
        { role: "user", content: triagePrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 200,
      temperature: 0.3,
    });

    const result = JSON.parse(completion.choices[0].message.content);

    // S'assurer que tous les champs sont présents
    return {
      intention_principale:
        result.intention_principale || "information_request",
      urgence: result.urgence || 3,
      complexite: result.complexite || "simple",
      elements_cles: result.elements_cles || {
        documents_mentionnes: [],
        actions_requises: [],
        emotions_detectees: [],
      },
    };
  } catch (error) {
    console.error("Erreur Agent Triage:", error);
    return {
      intention_principale: "conversation",
      urgence: 3,
      complexite: "simple",
      elements_cles: {
        documents_mentionnes: [],
        actions_requises: [],
        emotions_detectees: [],
      },
    };
  }
};

/**
 * AGENT D'EXÉCUTION DE POLITIQUE - Décide des actions à prendre
 * Utilise GPT-4o pour une décision complexe
 */
export const PolicyExecutionAgent = async (openai, params) => {
  const { triageResult, message, agentConfig, knowledgeBase, tools, context } =
    params;

  console.log("📜 Agent d'Exécution de Politique activé");

  // Instructions spécifiques selon l'intention
  let specificInstructions = "";

  if (
    triageResult.intention_principale === "document_request" ||
    message.toLowerCase().includes("tarif") ||
    message.toLowerCase().includes("grille") ||
    message.toLowerCase().includes("document") ||
    message.toLowerCase().includes("brochure")
  ) {
    specificInstructions = `
IMPORTANT: Le client demande un DOCUMENT. Tu DOIS utiliser "use_tools" avec send_document.
Structure EXACTE pour send_document:
{
  "type": "tool_call",
  "toolCall": {
    "type": "function",
    "function": {
      "name": "send_document",
      "arguments": "{\"query\":\"tarif\",\"category\":\"tarif\"}"
    }
  }
}`;
  } else if (triageResult.intention_principale === "human_request") {
    specificInstructions = `
IMPORTANT: Le client veut parler à un humain. Tu DOIS utiliser "use_tools" avec contact_support.
Structure EXACTE pour contact_support:
{
  "type": "tool_call",  
  "toolCall": {
    "type": "function",
    "function": {
      "name": "contact_support",
      "arguments": "{\"reason\":\"client_request\",\"urgency\":3,\"context\":{\"summary\":\"Client demande à parler au directeur\",\"customerMood\":\"neutre\",\"attemptedActions\":[]}}"
    }
  }
}`;
  }

  const policyPrompt = `Tu es un agent décisionnel expert pour ${
    agentConfig.name
  }.

ANALYSE DU TRIAGE:
${JSON.stringify(triageResult, null, 2)}

MESSAGE CLIENT: "${message}"

KNOWLEDGE BASE:
${knowledgeBase
  .slice(0, 3)
  .map((k) => k.content.substring(0, 200) + "...")
  .join("\n\n")}

${specificInstructions}

Tu dois TOUJOURS retourner un JSON avec cette structure:
{
  "strategie_reponse": "direct_answer" ou "use_tools" ou "escalate",
  "actions_specifiques": [
    // Si direct_answer:
    {
      "type": "message",
      "content": "La réponse à envoyer"
    }
    // Si use_tools ou escalate:
    {
      "type": "tool_call",
      "toolCall": {
        "type": "function",
        "function": {
          "name": "nom_du_tool",
          "arguments": "arguments en JSON string"
        }
      }
    }
  ],
  "reponse_suggeree": "Message à envoyer au client",
  "justification": "Pourquoi cette approche"
}

RÈGLES CRITIQUES:
1. Pour "tarif", "grille tarifaire", "document" → use_tools avec send_document
2. Pour "parler à", "directeur", "responsable", "humain" → use_tools avec contact_support
3. Les arguments DOIVENT être un JSON string valide
4. La structure toolCall DOIT être exactement comme montrée`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es un agent décisionnel. Retourne TOUJOURS un JSON valide avec la structure exacte demandée.",
        },
        { role: "user", content: policyPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 800,
      temperature: 0.3,
    });

    const decision = JSON.parse(completion.choices[0].message.content);

    // Valider et corriger la structure si nécessaire
    if (decision.actions_specifiques) {
      decision.actions_specifiques = decision.actions_specifiques.map(
        (action) => {
          if (action.type === "tool_call" && action.toolCall) {
            // S'assurer que la structure est correcte
            if (!action.toolCall.type) {
              action.toolCall.type = "function";
            }
            if (!action.toolCall.function && action.toolCall.name) {
              action.toolCall.function = {
                name: action.toolCall.name,
                arguments: action.toolCall.arguments || "{}",
              };
            }
            // S'assurer que arguments est une string JSON
            if (typeof action.toolCall.function?.arguments === "object") {
              action.toolCall.function.arguments = JSON.stringify(
                action.toolCall.function.arguments
              );
            }
          }
          return action;
        }
      );
    }

    return {
      decision,
      reasoning: decision.justification || "Décision basée sur l'analyse",
      confidence: triageResult.urgence >= 4 ? "high" : "normal",
    };
  } catch (error) {
    console.error("Erreur Agent Policy:", error);

    // Fallback intelligent selon l'intention
    let fallbackAction;
    if (triageResult.intention_principale === "document_request") {
      fallbackAction = {
        type: "tool_call",
        toolCall: {
          type: "function",
          function: {
            name: "send_document",
            arguments: JSON.stringify({ query: "document", category: "tarif" }),
          },
        },
      };
    } else if (triageResult.intention_principale === "human_request") {
      fallbackAction = {
        type: "tool_call",
        toolCall: {
          type: "function",
          function: {
            name: "contact_support",
            arguments: JSON.stringify({
              reason: "client_request",
              urgency: 3,
              context: {
                summary: "Client demande assistance humaine",
                customerMood: "neutre",
                attemptedActions: [],
              },
            }),
          },
        },
      };
    } else {
      fallbackAction = {
        type: "message",
        content:
          "Je suis là pour vous aider. Pouvez-vous préciser votre demande ?",
      };
    }

    return {
      decision: {
        strategie_reponse:
          fallbackAction.type === "tool_call" ? "use_tools" : "direct_answer",
        actions_specifiques: [fallbackAction],
        reponse_suggeree: "Je traite votre demande...",
        justification: "Fallback suite à erreur",
      },
      reasoning: "Fallback due to error",
      confidence: "low",
    };
  }
};

/**
 * AGENT DE VALIDATION - Vérifie et optimise la réponse finale
 * Utilise gpt-4o-mini pour une validation rapide et précise
 */
export const ActionValidationAgent = async (openai, params) => {
  const { originalMessage, triageResult, policyResult, conversationContext } =
    params;

  console.log("✅ Agent de Validation activé");

  const validationPrompt = `Tu es un agent de validation qualité. Vérifie et optimise la réponse.

MESSAGE CLIENT: "${originalMessage}"

DÉCISION PRISE:
${JSON.stringify(policyResult.decision, null, 2)}

CONTEXTE:
- Urgence: ${triageResult.urgence}/5
- Intention: ${triageResult.intention_principale}

Tu dois retourner un JSON avec cette structure EXACTE:
{
  "approved": true/false,
  "actions": [array des actions approuvées],
  "optimizedResponse": "La réponse finale optimisée à envoyer au client",
  "suggestions": ["liste des améliorations suggérées"],
  "risks": "niveau de risque identifié"
}

IMPORTANT: 
- Si la stratégie est "direct_answer", crée une action de type "message" avec le contenu
- La réponse doit être naturelle et utile
- Optimise toujours la réponse pour qu'elle soit plus engageante
- Répond dans la langue du message du client peu importe sa langue , tu dois répondre dans sa langue.

`;


  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Tu es un validateur expert. Retourne TOUJOURS un JSON valide avec tous les champs requis.",
        },
        { role: "user", content: validationPrompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 400,
      temperature: 0.3,
    });

    const validation = JSON.parse(completion.choices[0].message.content);

    // S'assurer que les actions sont correctement formatées
    let approvedActions = validation.actions || [];

    // Si pas d'actions mais une réponse suggérée, créer une action message
    if (
      approvedActions.length === 0 &&
      policyResult.decision.reponse_suggeree
    ) {
      approvedActions = [
        {
          type: "message",
          content:
            validation.optimizedResponse ||
            policyResult.decision.reponse_suggeree,
        },
      ];
    }

    return {
      status: validation.approved ? "approved" : "modified",
      approvedActions: approvedActions,
      synthesisMessage:
        validation.optimizedResponse ||
        policyResult.decision.reponse_suggeree ||
        "Je suis là pour vous aider avec votre demande.",
      improvements: validation.suggestions || [],
      riskAssessment: validation.risks || "none",
    };
  } catch (error) {
    console.error("Erreur Agent Validation:", error);
    // En cas d'erreur, utiliser la réponse de policy
    return {
      status: "approved",
      approvedActions: [
        {
          type: "message",
          content:
            policyResult.decision.reponse_suggeree ||
            "Je suis là pour vous aider avec votre demande.",
        },
      ],
      synthesisMessage:
        policyResult.decision.reponse_suggeree ||
        "Je suis là pour vous aider avec votre demande.",
      improvements: [],
      riskAssessment: "validation_error",
    };
  }
};
