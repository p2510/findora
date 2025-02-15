import { serverSupabaseClient } from "#supabase/server";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const apiKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";

  const supabase = createClient(
    "https://puxvccwmxfpgyocglioe.supabase.co",
    apiKey
  );
  const requestBody = await readBody(event);
  const { customers, smsbacklogs, content, user_id } = JSON.parse(requestBody);
  const { client_id, client_secret, sender_name } = smsbacklogs || {};

  try {
    // URL de l'API d'authentification
    const authUrl = "https://api.orange.com/oauth/v3/token";

    // Authentification pour obtenir l'access_token
    const authResponse = await fetch(authUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: client_id,
        client_secret: client_secret,
      }),
    });

    const authData = await authResponse.json();

    if (!authResponse.ok) {
      throw new Error("Erreur lors de l'authentification");
    }

    // Récupérer l'access_token
    const accessToken = authData.access_token;

    // URL pour envoyer le SMS
    const postUrl =
      "https://api.orange.com/smsmessaging/v1/outbound/tel:+2250160485654/requests";

    // Fonction utilitaire pour attendre un certain temps
    const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    // Envoi des SMS avec un intervalle d'1 seconde après chaque lot de 5 messages
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];

      // Préparation de la requête pour envoyer le SMS
      const postData = {
        outboundSMSMessageRequest: {
          address: `tel:${customer.phone}`,
          senderAddress: "tel:+2250160485654",
          outboundSMSTextMessage: {
            message: content,
          },
          senderName: sender_name,
        },
      };

      // Envoi de la requête pour envoyer le SMS
      const postResponse = await fetch(postUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(postData),
      });

      const postDataResponse = await postResponse.json();

      if (!postResponse.ok) {
        continue; // Passer au suivant en cas d'échec
      }

      console.log(
        `SMS envoyé avec succès à ${customer.phone}:`,
        postDataResponse
      );

      // Pause d'1 seconde après chaque lot de 5 messages
      if ((i + 1) % 5 === 0) {
        await sleep(1000); // Attendre 1 seconde
      }
    }
    const { data: smsData, error: fetchError } = await supabase
      .from("sms_backlogs")
      .select("count")
      .eq("user_id", user_id)
      .single();
    const currentCount = smsData.count;
    await supabase
      .from("sms_backlogs")
      .update({ count: currentCount - customers.length })
      .eq("user_id", user_id);
    return {
      success: "Campagne envoyée",
    };
  } catch (error) {
    return {
      error: "Erreur lors de l'envoi des SMS",
    };
  }
});
