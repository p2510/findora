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

    return {
      success: true,
      data: existingAgent,
    };
  } catch (err) {
    return {
      success: false,
      message: err.message,
    };
  }
});
