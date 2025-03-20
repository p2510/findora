import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const apiKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";

  const supabase = createClient(
    "https://puxvccwmxfpgyocglioe.supabase.co",
    apiKey
  );
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber.startsWith("+")) return phoneNumber;

    const countryCode = phoneNumber.slice(1, 4); // "225"
    const remainingNumber = phoneNumber.slice(4); // Numéro sans l'indicatif

    if (countryCode === "225") {
        // Vérifier si les deux premiers chiffres après 225 sont "01"
        if (remainingNumber.startsWith("01")) {
            return countryCode + remainingNumber; // On garde le numéro entier
        }
        // Vérifier si le troisième et le quatrième chiffre après 225 sont "00"
        if (remainingNumber.length >= 4 && remainingNumber[2] === "0" && remainingNumber[3] === "0") {
            return countryCode + remainingNumber; // On garde le numéro entier
        }

        return countryCode + remainingNumber.slice(2); // Sinon, on slice
    } else {
        return phoneNumber.slice(1); // On enlève juste le "+"
    }
};



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
      console.log(`Message envoyé à ${customer.phone}:`, jsonResponse);
    } catch (err) {
      console.error(`Erreur lors de l'envoi à ${customer.phone}:`, err);
    }
  };

  const sendMessagesWithPause = async (batch, token) => {
    for (const { customer, content } of batch) {
      await sendMessageToCustomer(customer, content, token);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Pause de 2 secondes
    }
  };

  const { data: campaigns, error } = await supabase
    .from("whatsapp_campaigns")
    .select("*")
    .eq("is_sent", false)
    .order("created_at", { ascending: true })
    .limit(1);
  if (error) {
    console.error("Erreur récupération campagnes:", error);
    return { success: false, message: "Erreur lors de la récupération." };
  }

  if (!campaigns || campaigns.length === 0) {
    return { success: false, message: "Aucune campagne à envoyer." };
  }

  let batch = [];
  let batchToken = null;
  let campaignsToMarkSent = [];
  let totalCustomers = 0;

  for (const campaign of campaigns) {
    if (batch.length === 0) {
      batchToken = campaign.token;
    }

    for (const customer of campaign.customers) {
      batch.push({ customer, content: campaign.content });
      campaignsToMarkSent.push(campaign.id);
      totalCustomers++;

      if (totalCustomers >= 15) {
        console.log(`📢 Envoi d'un groupe de ${totalCustomers} messages...`);
        await sendMessagesWithPause(batch, batchToken);

        await supabase
          .from("whatsapp_campaigns")
          .update({ is_sent: true })
          .in("id", campaignsToMarkSent);

        batch = [];
        campaignsToMarkSent = [];
        totalCustomers = 0;
      }
    }
  }

  if (batch.length > 0) {
    console.log(`📢 Envoi du dernier groupe de ${totalCustomers} messages...`);
    await sendMessagesWithPause(batch, batchToken);
    await supabase
      .from("whatsapp_campaigns")
      .update({ is_sent: true })
      .in("id", campaignsToMarkSent);
  }

  return { success: true, message: "Campagnes envoyées avec succès." };
});
