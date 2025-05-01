import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const apiKey = useRuntimeConfig().supabase_secret_key;
  const supabase = createClient(
    useRuntimeConfig().public.supabase_url,
    apiKey
  );

  // Fonction pour personnaliser le message avec les données du client
  const personalizeMessage = (content, customer) => {
    let personalizedContent = content;
    
    Object.keys(customer).forEach((key) => {
      const regex = new RegExp(`{${key}}`, "g");
      personalizedContent = personalizedContent.replace(regex, customer[key] || "");
    });

    return personalizedContent;
  };

  // Fonction pour envoyer un message à un client avec personnalisation
  const sendMessageToCustomer = async (customer, content, token) => {
    const personalizedContent = personalizeMessage(content, customer);

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
        to: customer.phone,
        body: personalizedContent,
      }),
    };

    try {
      const response = await fetch(url, options);
      const jsonResponse = await response.json();
      console.log(`Message envoyé à ${customer.name} (${customer.phone}):`, jsonResponse);
    } catch (err) {
      console.error(`Erreur lors de l'envoi du message à ${customer.name}:`, err);
    }
  };

  // Fonction pour envoyer des messages avec pauses
  const sendMessagesWithPause = async (customers, content, token) => {
    const messagesPerInterval = 10;
    const intervalBetweenMessages = Math.floor(Math.random() * 3 + 1) * 1000;
    const intervalBetweenSeries = Math.floor(Math.random() * 4 + 3) * 1000;

    let i = 0;
    for (const customer of customers) {
      await sendMessageToCustomer(customer, content, token);
      i++;

      if (i % messagesPerInterval === 0) {
        console.log(`Pause de ${intervalBetweenSeries / 1000}s après ${messagesPerInterval} messages.`);
        await new Promise((resolve) => setTimeout(resolve, intervalBetweenSeries));
      }

      await new Promise((resolve) => setTimeout(resolve, intervalBetweenMessages));
    }
  };

  // Récupération des campagnes planifiées à envoyer aujourd'hui
  const today = new Date().toISOString().split("T")[0];

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

  for (const campaign of campaigns) {
    const { customers, content, token } = campaign;
    await sendMessagesWithPause(customers, content, token);

    const { error: updateError } = await supabase
      .from("whatsapp_campaigns_schedule")
      .update({ is_sent: true })
      .eq("id", campaign.id);

    if (updateError) {
      console.error("Erreur lors de la mise à jour de la campagne:", updateError);
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
