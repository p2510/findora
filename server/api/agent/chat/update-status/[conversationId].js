// /server/api/agent/chat/update-status/[conversationId].js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://puxvccwmxfpgyocglioe.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";

export default defineEventHandler(async (event) => {
  try {
    const conversationId = event.context.params.conversationId;
    const body = await readBody(event);
    
    if (!body || !body.status) {
      return {
        statusCode: 400,
        body: { error: "Le statut est requis" }
      };
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      db: {
        schema: "agent_ia",
      },
    });

    // Mise à jour du statut de la conversation
    const { data, error } = await supabase
      .from("conversations")
      .update({ status: body.status })
      .eq("id", conversationId)
      .select();

    if (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
      return {
        statusCode: 500,
        body: { error: "Erreur lors de la mise à jour du statut" }
      };
    }

    return {
      statusCode: 200,
      body: { success: true, data }
    };
  } catch (error) {
    console.error("Erreur serveur :", error);
    return {
      statusCode: 500,
      body: { error: "Erreur serveur" }
    };
  }
});