import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  // Initialisation du client Supabase
  const apiKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";

  const supabase = createClient(
    "https://puxvccwmxfpgyocglioe.supabase.co",
    apiKey
  );

  const requestBody = await readBody(event);
  const { customers, content, token, user_id } = JSON.parse(requestBody);

  // Vérification de l'abonnement de l'utilisateur
  let isValid = false;

  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("subscription_type, start_at, is_partner")
      .eq("user_id", user_id)
      .order("start_at", { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;

    if (subscription) {
      // Si l'utilisateur est un partenaire, il peut envoyer la campagne
      if (subscription.is_partner) {
        isValid = true;
      } else {
        // Vérification du type d'abonnement
        const validTypes = ["ultra", "entreprise"];
        if (validTypes.includes(subscription.subscription_type)) {
          // Vérification de la date d'expiration
          const expirationDate = new Date(subscription.start_at);
          expirationDate.setMonth(expirationDate.getMonth() + 1);
          const isExpired = expirationDate < new Date();

          if (!isExpired) {
            isValid = true;
          }
        }
      }
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
      message: "Abonnement non valide ou expiré.",
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
    return {
      success: true,
      message: "Processus terminé avec succès.",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de l'envoi de la campagne.",
      errur: error,
    };
  }
});
