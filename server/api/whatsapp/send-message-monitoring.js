import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const apiKey = useRuntimeConfig().supabase_secret_key;
  const supabase = createClient(
    useRuntimeConfig().public.supabase_url,

    apiKey
  );


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
        to: customer.phone,
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
