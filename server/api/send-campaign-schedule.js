import { serverSupabaseClient } from "#supabase/server";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const apiKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";

  const supabase = createClient(
    "https://puxvccwmxfpgyocglioe.supabase.co",
    apiKey
  );
  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];

  try {
    // Récupérer toutes les campagnes avec la date d'envoi aujourd'hui
    const { data: campaigns, error: campaignsError } = await supabase
      .from("campaigns")
      .select(
        `
        id, message, send_date, created_by,
        phone
      `
      )
      .eq("is_sent", false)
      .eq("send_date", todayDate) // Vérifier que la date d'envoi est aujourd'hui
      .limit(20);

    if (campaignsError) {
      console.error(
        "Erreur lors de la récupération des campagnes:",
        campaignsError
      );
      return {
        success: false,
        message: "Erreur lors de la récupération des campagnes.",
        error: campaignsError,
      };
    }

    if (!campaigns || campaigns.length === 0) {
      console.log("Aucune campagne à envoyer.");
      return { success: true, message: "Aucune campagne trouvée." };
    }

    // Récupérer les IDs des créateurs de campagnes
    const userIds = campaigns
      .map((campaign) => campaign.created_by)
      .filter(Boolean); // Filtrer les IDs non nuls

    // Récupérer les SMS backlogs associés à ces créateurs
    const { data: smsBacklogs, error: smsBacklogsError } = await supabase
      .from("sms_backlogs")
      .select(
        `
        id, application_id, client_id, client_secret, sender_name, valide_date, user_id, count
      `
      )
      .in("user_id", userIds); // Filtrer par les IDs des créateurs

    if (smsBacklogsError) {
      console.error(
        "Erreur lors de la récupération des SMS backlogs:",
        smsBacklogsError
      );
      return {
        success: false,
        message: "Erreur lors de la récupération des SMS backlogs.",
        error: smsBacklogsError,
      };
    }

    // Merger les campagnes avec leurs SMS backlogs associés
    const mergedData = campaigns.map((campaign) => {
      const relatedSms = smsBacklogs.filter(
        (sms) => sms.user_id === campaign.created_by
      );
      return { ...campaign, sms_backlogs: relatedSms };
    });

    // Boucle pour envoyer les SMS
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    const batchSize = 5; // Taille du lot (5 SMS par seconde)

    for (const campaign of mergedData) {
      const { message, phone, sms_backlogs, id } = campaign;

      if (!sms_backlogs || sms_backlogs.length === 0) {
        continue;
      }

      let counter = 0; // Compteur pour les SMS envoyés
      for (const sms of sms_backlogs) {
        const {
          valide_date,
          client_id,
          client_secret,
          sender_name,
          user_id,
          count,
        } = sms;

        if (campaign.send_date.slice(0, 10) === todayDate) {
          try {
            // Envoi du SMS
            await sendSMS(
              phone,
              message,
              client_id,
              client_secret,
              sender_name
            );
            await supabase
              .from("campaigns")
              .update({ is_sent: true })
              .eq("id", id);
          } catch (error) {
            console.error(
              `Erreur lors de l'envoi du SMS pour la campagne ${campaign.id}:`,
              error
            );
          }
        } else {
          console.log(
            `La date valide ${valide_date} est passée pour la campagne ${campaign.id}`
          );
        }

        counter++; // Incrémenter le compteur de SMS envoyés

        // Pause après chaque lot de 5 SMS
        if (counter % batchSize === 0) {
          await delay(1000); // Pause de 2 secondes
        }
      }
    }

    // Retourner les résultats
    return {
      success: true,
      message: "Processus terminé.",
      data: mergedData,
    };
  } catch (error) {
    console.error("Erreur générale:", error);
    return {
      success: false,
      message: "Erreur lors de l'exécution du processus.",
      error,
    };
  }
});
async function sendSMS(phone, message, client_id, client_secret, sender_name) {
  try {
    const authUrl = "https://api.orange.com/oauth/v3/token";
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
    if (!authResponse.ok) throw new Error("Erreur d'authentification");

    const accessToken = authData.access_token;

    const postUrl =
      "https://api.orange.com/smsmessaging/v1/outbound/tel:+2250160485654/requests";
    const postData = {
      outboundSMSMessageRequest: {
        address: `tel:${phone}`,
        senderAddress: "tel:+2250160485654",
        outboundSMSTextMessage: {
          message: message,
        },
        senderName: sender_name,
      },
    };

    const postResponse = await fetch(postUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(postData),
    });

    if (!postResponse.ok) {
      throw new Error("Erreur lors de l'envoi du SMS");
    }

    return postResponse.json();
  } catch (error) {
    console.error("Erreur lors de l'envoi du SMS:", error);
    throw error;
  }
}
