// API pour récupérer les messages d'une conversation spécifique
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://puxvccwmxfpgyocglioe.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";

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
