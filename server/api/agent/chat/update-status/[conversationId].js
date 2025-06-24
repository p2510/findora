// /server/api/agent/chat/update-status/[conversationId].js
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = useRuntimeConfig().public.supabase_url;
const supabaseKey = useRuntimeConfig().supabase_secret_key;

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
    
    const supabasePublic = createClient(supabaseUrl, supabaseKey);

    // Récupérer les informations de la conversation avant la mise à jour
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id, user_id, status, phone, name, agent_id")
      .eq("id", conversationId)
      .single();

    if (convError || !conversation) {
      console.error("Erreur lors de la récupération de la conversation:", convError);
      return {
        statusCode: 404,
        body: { error: "Conversation non trouvée" }
      };
    }

    // Variables pour le tracking
    let creditDecremented = false;
    let newBalance = null;

    // Si on passe au statut "terminated" et que la conversation était active (prise de relais manuelle)
    if (body.status === "terminated" && conversation.status === "active") {
      console.log("👤 Prise de relais manuelle détectée pour la conversation:", conversationId);

      // Vérifier et décrémenter le crédit
      const { data: subscription, error: subError } = await supabasePublic
        .from("subscriptions")
        .select("max_limit")
        .eq("user_id", conversation.user_id)
        .single();

      if (!subError && subscription && subscription.max_limit > 0) {
        // Décrémenter le crédit
        newBalance = subscription.max_limit - 1;

        const { error: creditError } = await supabasePublic
          .from("subscriptions")
          .update({ max_limit: newBalance })
          .eq("user_id", conversation.user_id);

        if (!creditError) {
          creditDecremented = true;
          console.log(`📉 Crédit décrémenté pour l'utilisateur ${conversation.user_id}. Nouveau solde: ${newBalance}`);
        } else {
          console.error("Erreur lors de la décrémentation du crédit:", creditError);
        }
      } else {
        console.log("⚠️ Crédit insuffisant ou abonnement non trouvé");
        newBalance = 0;
      }
    }

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

    // Si c'était une prise de relais, créer un message système
    if (body.status === "terminated" && conversation.status === "active") {
      try {
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          user_id: conversation.user_id,
          content: "[SYSTÈME] Prise de relais manuelle",
          response: `La conversation a été prise en charge manuellement. ${creditDecremented ? `Crédit débité. Solde: ${newBalance}` : 'Aucun crédit débité.'}`,
          metadata: {
            system_message: true,
            action: "manual_takeover",
            credit_decremented: creditDecremented
          },
        });
      } catch (msgError) {
        console.log("Erreur création message système:", msgError);
      }
    }

    // Préparer la réponse
    const responseBody = {
      success: true,
      data,
      creditDecremented,
      message: creditDecremented 
        ? `Prise de relais effectuée. Nouveau solde: ${newBalance}`
        : "Prise de relais effectuée"
    };

    if (newBalance !== null) {
      responseBody.newBalance = newBalance;
    }

    return {
      statusCode: 200,
      body: responseBody
    };
  } catch (error) {
    console.error("Erreur serveur :", error);
    return {
      statusCode: 500,
      body: { error: "Erreur serveur", details: error.message }
    };
  }
});