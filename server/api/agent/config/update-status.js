import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const supabaseUrl = "https://puxvccwmxfpgyocglioe.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";

  try {
    // Récupérer les données du body de la requête
    const requestBody = await readBody(event);
    const { user_id, active } = JSON.parse(requestBody);

    // Valider les données d'entrée
    if (!user_id) {
      return {
        success: false,
        message: "Aucun utilisateur trouvé. Le paramètre user_id est requis.",
      };
    }

    if (active === undefined || active === null) {
      return {
        success: false,
        message: "Le paramètre status est requis.",
      };
    }

    // Convertir status en booléen si nécessaire
    const boolActive = typeof active === "boolean" ? active : Boolean(active);

    // Initialiser le client Supabase avec le schéma agent_ia
    const supabaseAgent = createClient(supabaseUrl, supabaseKey, {
      db: {
        schema: "agent_ia",
      },
    });

    // Vérifier si l'agent existe pour cet utilisateur
    const { data: existingAgent, error: fetchError } = await supabaseAgent
      .from("agent_configs")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (fetchError) {
      return {
        success: false,
        message: "Aucun agent trouvé pour cet utilisateur.",
      };
    }

    // Mettre à jour le statut de l'agent
    const { data, error } = await supabaseAgent
      .from("agent_configs")
      .update({ status: boolActive })
      .eq("user_id", user_id)
      .select("status")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: `Le statut de l'agent a été mis à jour avec succès : ${
        boolActive ? "activé" : "désactivé"
      }`,
      data,
    };
  } catch (err) {
    return {
      success: false,
      message: `Erreur lors de la mise à jour du statut: ${err.message}`,
    };
  }
});
