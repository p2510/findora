import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const supabaseUrl = "https://puxvccwmxfpgyocglioe.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";
  
  // Récupérer la méthode HTTP utilisée
  const method = event.node.req.method;

  let user_id;

  if (method === "GET") {
    // Récupérer user_id depuis les paramètres de l'URL
    const query = getQuery(event);
    user_id = query.user_id;
  } else if (method === "POST") {
    // Lire le body en JSON pour POST
    const requestBody = await readBody(event);
    user_id = requestBody.user_id;
  }

  if (!user_id) {
    return {
      success: false,
      message: "Aucun utilisateur trouvé",
    };
  }


  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: { schema: "agent_ia" },
    });

    // 🔍 Étape 1 : Récupérer agent_id depuis agent_configs
    const { data: agentConfig, error: agentError } = await supabase
      .from("agent_configs")
      .select("id")
      .eq("user_id", user_id)
      .single();

    if (agentError || !agentConfig) {
      throw new Error("Impossible de récupérer l'agent_id");
    }

    const agent_id = agentConfig.id;

    // 🔍 Étape 2 : Utiliser agent_id pour récupérer les données dans knowledge_base
    const { data: knowledgeBase, error: knowledgeError } = await supabase
      .from("knowledge_base")
      .select("*")
      .eq("agent_id", agent_id).single();

    if (knowledgeError) {
      throw new Error("Erreur lors de la récupération de la knowledge_base");
    }

    return {
      success: true,
      agent_id: agent_id,
      data: knowledgeBase,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
});
