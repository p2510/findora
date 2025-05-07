import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

export default defineEventHandler(async (event) => {
  const supabaseUrl = "https://puxvccwmxfpgyocglioe.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";
  const client = new OpenAI({
    apiKey:
      "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",
  });
  const requestBody = await readBody(event);
  const { metadata, user_id } = JSON.parse(requestBody);

  const validTypes = [
    "presentation",
    "produit",
    "service",
    "site web",
    "faq",
    "réseaux sociaux",
  ];

  const invalidTypes = metadata.filter(
    (item) => !validTypes.includes(item.type)
  );

  if (invalidTypes.length > 0) {
    return {
      success: false,
      message: `Les éléments suivants ont un type invalide : ${invalidTypes
        .map((item) => item.type)
        .join(", ")}`,
    };
  }

  try {
    const supabaseAgent = createClient(supabaseUrl, supabaseKey, {
      db: { schema: "agent_ia" },
    });

    const { data: existingAgent, error: fetchError } = await supabaseAgent
      .from("agent_configs")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw new Error(fetchError.message);
    }

    if (!existingAgent) {
      return {
        success: false,
        message:
          "Aucun agent n'existe pour cet utilisateur. Veuillez en créer un avant d'ajouter des connaissances.",
      };
    }

    const { data: existingKnowledge, error: knowledgeFetchError } =
      await supabaseAgent
        .from("knowledge_base")
        .select("id")
        .eq("agent_id", existingAgent.id)
        .single();

    if (knowledgeFetchError && knowledgeFetchError.code !== "PGRST116") {
      throw new Error(knowledgeFetchError.message);
    }

    if (existingKnowledge) {
      const myAssistant = await client.beta.assistants.update(
        existingAgent.assistant_id,
        {
          instructions: generatePrompt(
            existingAgent.name,
            existingAgent.personality,
            existingAgent.goal,
            metadata
          ),
        }
      );
      const assistantId = myAssistant.id;
      if (!assistantId) {
        throw new Error(
          "Erreur : impossible de récupérer l'ID de l'assistant."
        );
      }
      const { data: knowledgeData, error: knowledgeError } = await supabaseAgent
        .from("knowledge_base")
        .update([
          {
            agent_id: existingAgent.id,
            metadata: metadata,
            prompt: generatePrompt(
              existingAgent.name,
              existingAgent.personality,
              existingAgent.goal,
              metadata
            ),
          },
        ])
        .eq("agent_id", existingAgent.id)
        .select("*")
        .single();

      if (knowledgeError) {
        throw new Error(knowledgeError.message);
      }

      return {
        success: true,
        message:
          "Les connaissances de l'agent ont été mises à jour avec succès !",
        data: knowledgeData,
      };
    } else {
      const myAssistant = await client.beta.assistants.create({
        instructions: generatePrompt(
          existingAgent.name,
          existingAgent.personality,
          existingAgent.goal,
          metadata
        ),
        name: user_id,
        temperature: 0.7,
        model: "gpt-4o",
      });
      const assistantId = myAssistant.id;

      if (!assistantId) {
        throw new Error(
          "Erreur : impossible de récupérer l'ID de l'assistant."
        );
      }
      const { data: updatedAgentConfig, error: agentConfigUpdateError } =
        await supabaseAgent
          .from("agent_configs")
          .update({ assistant_id: assistantId }) // Met à jour assistant_id
          .eq("id", existingAgent.id) // Filtre par agent_id
          .select("*")
          .single();

      const { data: newKnowledgeData, error: knowledgeCreateError } =
        await supabaseAgent
          .from("knowledge_base")
          .insert([
            {
              agent_id: existingAgent.id,
              metadata: metadata,
              prompt: generatePrompt(
                existingAgent.name,
                existingAgent.personality,
                existingAgent.goal,
                metadata
              ),
            },
          ])
          .select("*")
          .single();

      if (knowledgeCreateError) {
        throw new Error(knowledgeCreateError.message);
      }
      return {
        success: true,
        message:
          "Les connaissances ont été ajoutées avec succès pour cet agent.",
        data: newKnowledgeData,
      };
    }
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
});

function generatePrompt(agentName, personality, goal, knowledgeBase) {
  // Dictionnaire des personnalités avec descriptions en français uniquement
  const personalityDescriptions = {
    Professionnel:
      "Un ton formel et structuré, idéal pour les interactions B2B et les communications d'entreprise.",
    Concise:
      "Des réponses courtes et directes, parfaites pour les utilisateurs qui recherchent des informations rapides et efficaces.",
    Amical:
      "Un ton chaleureux et engageant, adapté aux interactions informelles et aux relations clients.",
  };

  // Dictionnaire des objectifs en français uniquement
  const goalDescriptions = {
    "Support Client":
      "Répond aux questions des clients et fournit une assistance efficace.",
    "Ventes & Closing":
      "Aide à la conversion des prospects en clients et optimise les ventes.",
    Interne:
      "Soutient les équipes internes avec des réponses adaptées et des ressources.",
  };

  // Instruction de base qui reste dans le contexte
  const baseInstruction = `
Tu es ${agentName}, un assistant virtuel conçu pour aider les utilisateurs. Tu dois toujours rester dans ton rôle et suivre les directives ci-dessous.

### DIRECTIVES IMPORTANTES :
0. Parle comme si tu étais un membre de n'équipe en utilisant le je ou parfois le nous
1. Réponds toujours dans la langue de l'utilisateur
2. Ne sors JAMAIS de ton contexte ou de ton rôle défini
3. Ne mentionne jamais que tu es un assistant IA
4. N'utilise jamais de formules comme "en tant qu'assistant" ou "je ne peux pas"
5. Ne pas inventer d'informations qui ne figurent pas dans la base de connaissances
6. Tu ne dois jamais insulter ou injurier un client
7. Limite tes réponses à 800 caractères maximum, sauf si l'utilisateur demande explicitement plus de détails
8. Fais des réponses courtes et précises 
`;

  // Ajouter la personnalité
  let personalitySection = "";
  if (personality) {
    const personalityDesc =
      personalityDescriptions[personality] ||
      "Une personnalité adaptable selon le contexte.";
    personalitySection = `
### PERSONNALITÉ :
${personality} - ${personalityDesc}
`;
  }

  // Ajouter l'objectif
  let goalSection = "";
  if (goal) {
    const goalDesc =
      goalDescriptions[goal] ||
      "Un objectif spécifique en fonction des besoins de l'utilisateur.";
    goalSection = `
### OBJECTIF :
${goal} - ${goalDesc}
`;
  }

  // Ajouter les connaissances sur l'entreprise
  let knowledgeSection = "";
  if (knowledgeBase && knowledgeBase.length > 0) {
    knowledgeSection = `
### CONNAISSANCES SUR L'ENTREPRISE :
${knowledgeBase.map((item) => `**${item.type}** : ${item.content}`).join("\n")}
`;
  }

  // Ajouter les instructions finales
  const finalInstructions = `
### INSTRUCTIONS FINALES :
- Limite tes réponses à maximum 800 caractères
- Répond exactement dans la langue où tu recois le message.
- Utilise un format concis et direct dans tes réponses
- Tu peux te servir des informations liées à l'entreprise disponibles en ligne à condition qu'elles soient vérifiées
- Tu ne dois JAMAIS répondre à des questions générales de culture, d'actualité, de politique, d'histoire, etc.
- Ne pas inventer d'informations absentes de la base de connaissances
- Ne pas fournir de détails sur les prix s'ils ne sont pas explicitement mentionnés
- Ne pas faire de promesses sur des garanties non définies
- Reste cohérent avec les valeurs de l'entreprise
- Si tu ne connais pas une réponse à partir des informations fournies, indique-le poliment
`;

  // Assembler le prompt complet
  const completePrompt = [
    baseInstruction,
    personalitySection,
    goalSection,
    knowledgeSection,
    finalInstructions,
  ].join("");

  return completePrompt;
}
