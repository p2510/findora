// server/api/agent/config/create.js
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const supabaseUrl = "https://puxvccwmxfpgyocglioe.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";

  const validPersonalities = ["Professionnel", "Concise", "Amical"];
  const validGoals = ["Support Client", "Ventes & Closing", "Interne"];

  const requestBody = await readBody(event);
  const { name, personality, goal, user_id } = JSON.parse(requestBody);
  console.log(name);

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
      db: { schema: "agent_ia" },
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

    if (existingAgent) {
      // Mise à jour de l'agent existant
      const { data, error } = await supabaseAgent
        .from("agent_configs")
        .update({
          name,
          personality,
          goal,
          status: true,
        })
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
      // Création d'un nouvel agent

      // Récupérer d'abord les données WhatsApp
      const { data: whatsappData, error: whatsappError } = await supabase
        .from("whatsapp_backlogs")
        .select("token")
        .eq("user_id", user_id)
        .single();

      if (whatsappError) {
        throw new Error("Erreur lors de la récupération des données WhatsApp.");
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
              url: `${useRuntimeConfig().public.url_base}/api/webhook/agents`,
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

      // Insérer la nouvelle configuration d'agent
      const { data, error } = await supabaseAgent
        .from("agent_configs")
        .insert([
          {
            name,
            personality,
            user_id,
            goal,
            status: true,
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
            has_embeddings: false,
            total_chunks: 0,
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
