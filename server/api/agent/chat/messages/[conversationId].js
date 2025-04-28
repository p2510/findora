// API pour récupérer les messages d'une conversation spécifique
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = useRuntimeConfig().public.supabase_url;
const supabaseKey = useRuntimeConfig().supabase_secret_key

export default defineEventHandler(async (event) => {
  const conversationId = event.context.params.conversationId; // Récupérer l'ID
  const supabase = createClient(supabaseUrl, supabaseKey, {
    db: {
      schema: "agent_ia",
    },
  });
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      error: "Erreur lors de la récupération des messages: " + error.message,
    };
  }

  return data;
});
