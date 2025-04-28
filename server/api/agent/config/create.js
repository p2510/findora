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
  const validPersonalities = ["Professionnel", "Concise", "Amical"];
  const validGoals = ["Support Client", "Ventes & Closing", "Interne"];

  const requestBody = await readBody(event);
  const { name, personality, goal, user_id } = JSON.parse(requestBody);

  if (!user_id) {
    return {
      success: false,
      message: "Aucun utilisateur trouvé",
    };
  }

  if (!validPersonalities.includes(personality)) {
    return {
      success: false,
      message: `Personnalité invalide. Choisissez parmi : ${validPersonalities.join(
        ", "
      )}`,
    };
  }

  if (!validGoals.includes(goal)) {
    return {
      success: false,
      message: `Objectif invalide. Choisissez parmi : ${validGoals.join(", ")}`,
    };
  }

  try {
    const supabaseAgent = createClient(supabaseUrl, supabaseKey, {
      db: {
        schema: "agent_ia",
      },
    });
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Vérifier si l'utilisateur a déjà un agent config
    const { data: existingAgent, error: fetchError } = await supabaseAgent
      .from("agent_configs")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw new Error(fetchError.message);
    }

    // Si un agent existe déjà, mettre à jour ses informations
    if (existingAgent) {
      // Récupérer la knowledge_base associée à cet utilisateur
      const { data: knowledgeBase, error: knowledgeError } = await supabaseAgent
        .from("knowledge_base")
        .select("metadata")
        .eq("agent_id", existingAgent.id)
        .single();

      if (knowledgeError && knowledgeError.code !== "PGRST116") {
        throw new Error("Erreur lors de la récupération de la knowledge_base.");
      }

      const metadata = knowledgeBase?.metadata || [];

      const myAssistant = await client.beta.assistants.update(
        existingAgent.assistant_id,
        {
          instructions: generatePrompt(name, personality, goal, metadata),
        }
      );
      const assistantId = myAssistant.id;
      if (!assistantId) {
        throw new Error(
          "Erreur : impossible de récupérer l'ID de l'assistant."
        );
      }
      const { data, error } = await supabaseAgent
        .from("agent_configs")
        .update([
          {
            name,
            personality,
            goal,
            status: true,
          },
        ])
        .eq("user_id", user_id)
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return {
        success: true,
        message:
          "Les informations de l'agent ont été mises à jour avec succès !",
        data,
      };
    } else {
      // Pour un nouvel agent, récupérer d'abord les données WhatsApp
      const { data: whatsappData, error: whatsappError } = await supabase
        .from("whatsapp_backlogs")
        .select("token")
        .eq("user_id", user_id)
        .single();
      if (whatsappError) {
        throw new Error("Erreur lors de la récupération des données WhatsApp.");
      }

      // Créer un nouvel assistant OpenAI
      const myAssistant = await client.beta.assistants.create({
        name: name,
        instructions: generatePrompt(name, personality, goal, []),
        model: "gpt-4o",
        temperature: 0.4,
      });

      const assistantId = myAssistant.id;
      if (!assistantId) {
        throw new Error("Erreur : impossible de créer l'assistant OpenAI.");
      }

      // Configurer Whatsapp Webhooks
      const url = "https://gate.whapi.cloud/settings";
      const token = whatsappData.token;
      const optionsWhatsapp = {
        method: "PATCH",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          offline_mode: false,
          full_history: false,
          webhooks: [
            {
              mode: "body",
              events: [{ type: "messages", method: "post" }],
              url: `${useRuntimeConfig().public.api_base}/api/webhook/agents`,
            },
          ],
        }),
      };

      try {
        const responseWhatsapp = await fetch(url, optionsWhatsapp);
        const jsonWhatsapp = await responseWhatsapp.json();
        if (!responseWhatsapp.ok) {
          throw new Error("Erreur lors de la configuration WhatsApp");
        }
      } catch (err) {
        throw new Error(`Erreur WhatsApp: ${err.message}`);
      }

      // Insérer la nouvelle configuration d'agent avec l'ID de l'assistant
      const { data, error } = await supabaseAgent
        .from("agent_configs")
        .insert([
          {
            name,
            personality,
            user_id,
            goal,
            status: true,
            assistant_id: assistantId,
          },
        ])
        .select("*")
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Créer une entrée vide dans knowledge_base pour le nouvel agent
      const { error: knowledgeError } = await supabaseAgent
        .from("knowledge_base")
        .insert([
          {
            agent_id: data.id,
            metadata: [],
          },
        ]);

      if (knowledgeError) {
        throw new Error(
          "Erreur lors de la création de la base de connaissances."
        );
      }

      return {
        success: true,
        message:
          "Les informations de l'agent ont été enregistrées avec succès !",
        data,
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
  // Dictionnaire des personnalités
  const personalityDescriptions = {
    Professionnel:
      "Un ton formel et structuré, idéal pour les interactions B2B et les communications d'entreprise.",
    Concise:
      "Des réponses courtes et directes, parfaites pour les utilisateurs qui recherchent des informations rapides et efficaces.",
    Amical:
      "Un ton chaleureux et engageant, adapté aux interactions informelles et aux relations clients.",
  };

  // Dictionnaire des objectifs
  const goalDescriptions = {
    "Support Client":
      "Répond aux questions des clients et fournit une assistance efficace.",
    "Ventes & Closing":
      "Aide à la conversion des prospects en clients et optimise les ventes.",
    Interne:
      "Soutient les équipes internes avec des réponses adaptées et des ressources.",
  };

  let instruction = `Tu es ${agentName}, un assistant virtuel conçu pour aider les utilisateurs.`;

  // Ajouter la personnalité
  if (personality) {
    const personalityDesc =
      personalityDescriptions[personality] ||
      "Une personnalité adaptable selon le contexte.";
    instruction += `\n\n### Personnalité :\n${personality} - ${personalityDesc}`;
  }

  // Ajouter l'objectif
  if (goal) {
    const goalDesc =
      goalDescriptions[goal] ||
      "Un objectif spécifique en fonction des besoins de l'utilisateur.";
    instruction += `\n\n### Objectif :\n${goal} - ${goalDesc}`;
  }

  // Ajouter les connaissances sur l'entreprise
  if (knowledgeBase && knowledgeBase.length > 0) {
    instruction += `\n\n### Connaissances sur l'entreprise :\n`;

    knowledgeBase.forEach((item) => {
      instruction += `\n**${item.type}** : ${item.content}`;
    });
  }

  instruction += `\n\nRéponds toujours en respectant ces informations pour offrir une expérience cohérente et utile aux utilisateurs.`;

  return instruction;
}
