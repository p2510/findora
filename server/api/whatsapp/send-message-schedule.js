import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  // Initialisation du client Supabase
  const apiKey =useRuntimeConfig().supabase_secret_key
  const supabase = createClient(
    useRuntimeConfig().public.supabase_url,
    apiKey
  );

  // Fonction pour envoyer un message à un client
  const sendMessageToCustomer = async (customer, content, token) => {
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

  // Fonction pour envoyer des messages avec pauses
  const sendMessagesWithPause = async (customers, content, token) => {
    const messagesPerInterval = 10; // Envoi de 10 messages par intervalle
    const intervalBetweenMessages =
      Math.floor(Math.random() * (3 - 1 + 1) + 1) * 1000; // Délai aléatoire entre 1 et 3 secondes
    const intervalBetweenSeries =
      Math.floor(Math.random() * (6 - 3 + 1) + 3) * 1000; // Délai entre séries de messages de 3 à 6 secondes

    let i = 0;
    for (const customer of customers) {
      await sendMessageToCustomer(customer, content, token);

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

  // Récupération des campagnes planifiées à envoyer aujourd'hui
  const today = new Date().toISOString().split("T")[0]; // Formater la date actuelle (YYYY-MM-DD)

  const { data: campaigns, error } = await supabase
    .from("whatsapp_campaigns_schedule")
    .select("*")
    .eq("is_sent", false)
    .eq("send_date", today)
    .limit(2);

  if (error) {
    console.error("Erreur lors de la récupération des campagnes:", error);
    return {
      success: false,
      message: "Erreur lors de la récupération des campagnes",
    };
  }

  if (!campaigns || campaigns.length === 0) {
    return {
      success: false,
      message: "Aucune campagne à envoyer aujourd'hui.",
    };
  }

  // Envoi des messages pour chaque campagne avec pauses
  for (const campaign of campaigns) {
    const { customers, content, token, user_id } = campaign;

    // Envoi des messages avec pauses pour chaque campagne
    await sendMessagesWithPause(customers, content, token);

    // Mise à jour de la campagne pour marquer "is_sent" comme true
    const { error: updateError } = await supabase
      .from("whatsapp_campaigns_schedule")
      .update({ is_sent: true })
      .eq("id", campaign.id);

    if (updateError) {
      console.error(
        "Erreur lors de la mise à jour de la campagne:",
        updateError
      );
      return {
        success: false,
        message: "Erreur lors de la mise à jour de la campagne",
      };
    }
  }

  return {
    success: true,
    message: "Campagnes envoyées avec succès.",
  };
});
