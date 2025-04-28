import { createClient } from "@supabase/supabase-js";

const supabaseUrl = useRuntimeConfig().public.supabase_url;
const supabaseKey = useRuntimeConfig().supabase_secret_key
export default defineEventHandler(async (event) => {
  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: {
      schema: "agent_ia",
    },
  });
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
  const { data, error } = await supabase
    .from("conversations")
    .select(
      `
      id, user_id, phone, status, name,
      messages:messages!inner(created_at,content,response)
    `
    )
    .eq("user_id", user_id)
    .order("created_at", { foreignTable: "messages", ascending: false }) // Tri sur la date du dernier message
    .limit(1, { foreignTable: "messages" });

  if (error) {
    console.error("Erreur API Supabase :", error);
    return {
      error:
        "Erreur lors de la récupération des conversations : " + error.message,
    };
  }

  return data.map((convo) => ({
    id: convo.id,
    phone: convo.phone,
    status: convo.status,
    name: convo.name,
    last_message_at:
      convo.messages.length > 0 ? convo.messages[0].created_at : null,
    last_response: convo.messages[0].response || null,
    last_content: convo.messages[0].content,
  }));
});
