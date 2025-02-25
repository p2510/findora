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

  // Fonction de vérification de l'abonnement
  const isSubscriptionValid = (subscription_type, start_at) => {
    const isValidSubscriptionType = subscription_type === "ultra";
    const expirationDate = new Date(
      new Date(start_at).setMonth(new Date(start_at).getMonth() + 1)
    );
    const isExpired = expirationDate.getTime() < new Date().getTime();
    return isValidSubscriptionType && !isExpired;
  };

  let isValid = false;

  // Vérification de l'abonnement dans la base de données
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .single();
    if (data) {
      if (isSubscriptionValid(data.subscription_type, data.start_at)) {
        isValid = true;
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error,
      data: data,
    };
  }

  if (isValid) {
    const { data, error } = await supabase
      .from("whatsapp_campaigns")
      .insert({
        customers: customers,
        content: content,
        user_id: user_id,
      })
      .select();
    const formatPhoneNumber = (phoneNumber) => {
      if (!phoneNumber.startsWith("+")) return phoneNumber;

      const countryCode = phoneNumber.slice(1, 4);
      const remainingNumber = phoneNumber.slice(4);

      if (countryCode === "225") {
        // Si Côte d'Ivoire, supprime les deux premiers chiffres du reste du numéro
        return countryCode + remainingNumber.slice(2);
      } else {
        // Pour les autres pays, supprime uniquement le "+"
        return phoneNumber.slice(1);
      }
    };
    // Requête pour créer un canal sur Whapi uniquement si isValid est vrai
    const url = "https://gate.whapi.cloud/messages/text";

    // Fonction pour envoyer un message à chaque client
    const sendMessageToCustomer = async (customer) => {
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
        // Attente de la réponse de la requête fetch
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

    // Fonction pour envoyer les messages avec une pause aléatoire
    const sendMessagesWithPause = async (customers) => {
      const messagesPerInterval = 10; // Envoi de 10 messages par intervalle
      const intervalBetweenMessages =
        Math.floor(Math.random() * (3 - 1 + 1) + 1) * 1000; // Délai aléatoire entre 1 et 3 secondes
      const intervalBetweenSeries =
        Math.floor(Math.random() * (6 - 3 + 1) + 3) * 1000; // Délai entre séries de messages de 3 à 6 secondes

      let i = 0;
      for (const customer of customers) {
        await sendMessageToCustomer(customer);

        i++;

        // Si le nombre de messages envoyés dans l'intervalle est atteint, faire une pause
        if (i % messagesPerInterval === 0) {
          console.log(
            `Pause de ${
              intervalBetweenSeries / 1000
            } secondes après une série de ${messagesPerInterval} messages.`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, intervalBetweenSeries)
          ); // Pause entre les séries de messages
        }

        // Pause aléatoire entre chaque message
        await new Promise((resolve) =>
          setTimeout(resolve, intervalBetweenMessages)
        );
      }
    };

    // Envoi des messages avec pauses aléatoires
    await sendMessagesWithPause(customers);

    return {
      data: isValid,
      success: true,
      message: "Processus terminé.",
    };
  } else {
    // Si l'abonnement n'est pas valide, retourne une erreur
    return {
      success: false,
      message: "Abonnement non valide",
    };
  }
});
