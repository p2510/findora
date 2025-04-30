import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  // Initialisation du client Supabase
  const apiKey = useRuntimeConfig().supabase_secret_key;

  const supabase = createClient(useRuntimeConfig().public.supabase_url, apiKey);

  const requestBody = await readBody(event);
  const { customers, content, token, user_id } = JSON.parse(requestBody);

  // Vérification de l'abonnement de l'utilisateur
  let isValid = false;
  let maxCampaigns = 0;
  let subscriptionId = null;

  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("subscription_type, start_at, max_campaigns,id")
      .eq("user_id", user_id)
      .order("start_at", { ascending: false })
      .limit(1)
      .single(); 

    if (error) throw error;

    if (subscription) {
      // Vérification du type d'abonnement
      const expirationDate = new Date(subscription.start_at);
      expirationDate.setMonth(expirationDate.getMonth() + 1);
      const isExpired = expirationDate < new Date();
      if (!isExpired && subscription.max_campaigns >= customers.length) {
        isValid = true;
      } 
      maxCampaigns = subscription.max_campaigns;
      subscriptionId = subscription.id;
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de la vérification de l'abonnement.",
      error,
    };
  }

  if (!isValid) {
    return {
      success: false,
      message: "Abonnement expiré ou volume insuffisant.",
    };
  }

  // ✅ Si l'abonnement est valide, on enregistre la campagne
  try {
    const chunkArray = (array, size) => {
      return Array.from(
        { length: Math.ceil(array.length / size) },
        (_, index) => array.slice(index * size, index * size + size)
      );
    };
    const customerChunks = chunkArray(customers, 15);
    const insertPromises = customerChunks.map(async (chunk) => {
      return supabase.from("whatsapp_campaigns").insert({
        customers: chunk,
        content: content,
        user_id: user_id,
        token: token,
        is_sent: false,
      });
    });

    const results = await Promise.all(insertPromises);
    const errors = results.filter((result) => result.status === "rejected");

    if (errors.length > 0) {
      return {
        success: false,
        message: "Certaines insertions ont échoué.",
        errors,
      };
    }

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({ max_campaigns: maxCampaigns - customers.length })
      .eq("id", subscriptionId)
      .select();

    return {
      success: true,
      message: "Processus terminé avec succès.",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de l'envoi de la campagne.",
      erreur: error,
    };
  }
});
