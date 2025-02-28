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
    const { data, error } = await supabase
      .from("whatsapp_campaigns")
      .insert({
        customers: customers,
        content: content,
        user_id: user_id,
      })
      .select();

    if (error) throw error;

    // Fonction pour formater le numéro de téléphone
    const formatPhoneNumber = (phoneNumber) => {
      if (!phoneNumber.startsWith("+")) return phoneNumber;

      const countryCode = phoneNumber.slice(1, 4);
      const remainingNumber = phoneNumber.slice(4);

      if (countryCode === "225") {
        return countryCode + remainingNumber.slice(2);
      } else {
        return phoneNumber.slice(1);
      }
    };

    // Fonction pour envoyer un message à chaque client
    const sendMessageToCustomer = async (customer) => {
      const url = "https://gate.whapi.cloud/messages/text";
      const options = {
        method: "POST",
        headers: {
          accept: "application/json",
          "content-type": "application/json",
          authorization: "Bearer " + token,
        },
        body: JSON.stringify({
          typing_time: 0,
          to: formatPhoneNumber(customer.phone),
          body: content,
        }),
      };

      try {
        const response = await fetch(url, options);
        const jsonResponse = await response.json();
        console.log(
          `Message envoyé à ${customer.name} (${customer.phone}):`,
          jsonResponse
        );
      } catch (err) {
        console.error(
          `Erreur lors de l'envoi du message à ${customer.name}:`,
          err
        );
      }
    };

    // Envoi des messages avec une pause aléatoire
    const sendMessagesWithPause = async (customers) => {
      const messagesPerInterval = 10;
      const intervalBetweenMessages =
        Math.floor(Math.random() * 3 + 1) * 1000;
      const intervalBetweenSeries =
        Math.floor(Math.random() * 4 + 3) * 1000;

      let i = 0;
      for (const customer of customers) {
        await sendMessageToCustomer(customer);

        i++;

        if (i % messagesPerInterval === 0) {
          console.log(
            `Pause de ${intervalBetweenSeries / 1000} secondes après ${messagesPerInterval} messages.`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, intervalBetweenSeries)
          );
        }

        await new Promise((resolve) =>
          setTimeout(resolve, intervalBetweenMessages)
        );
      }
    };

    await sendMessagesWithPause(customers);

    return {
      
      success: true,
      message: "Processus terminé avec succès.",
    };
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de l'envoi de la campagne.",
      error,
    };
  }
});
