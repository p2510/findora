import { serverSupabaseClient } from "#supabase/server";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  // Initialisation du client Supabase
  const apiKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";

  const supabase = createClient(
    "https://puxvccwmxfpgyocglioe.supabase.co",
    apiKey
  );

  // Récupérer la date actuelle sans l'heure (format YYYY-MM-DD)
  const today = new Date();
  const todayDate = today.toISOString().split("T")[0];
  // Étape 1 : Récupérer tous les reminders
  const { data: reminders, error: remindersError } = await supabase
    .from("reminders")
    .select(
      `
      id, message, send_date,created_by,
      customers (
        id,  phone
      )
      `
    )
    .eq("send_date", todayDate)
    .eq("is_sent", false)
    .limit(7);

  if (remindersError) {
    console.error(
      "Erreur lors de la récupération des reminders:",
      remindersError
    );
    return {
      success: false,
      message: "Erreur lors de la récupération des reminders.",
      error: remindersError,
    };
  }

  if (!reminders || reminders.length === 0) {
    console.log("Aucun reminder trouvé.");
    return { success: true, message: "Aucun reminder trouvé." };
  }

  // Étape 2 : Récupérer les IDs des created_by depuis les reminders
  const userIds = reminders
    .map((reminder) => reminder.created_by)
    .filter(Boolean); // Récupère uniquement les IDs non nuls

  // Étape 3 : Récupérer les sms_backlogs où user_id est dans les IDs des created_by
  const { data: smsBacklogs, error: smsBacklogsError } = await supabase
    .from("sms_backlogs")
    .select(
      `
      id, application_id,client_id,client_secret,sender_name,valide_date,user_id,count
      `
    )
    .in("user_id", userIds); // Filtrer par les IDs des created_by

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

  // Étape 4 : Merger les reminders avec leurs SMS backlogs
  const mergedData = reminders.map((reminder) => {
    const relatedSms = smsBacklogs.filter(
      (sms) => sms.user_id === reminder.created_by
    ); // Associer les SMS dont user_id correspond à created_by
    return { ...reminder, sms_backlogs: relatedSms };
  });

  // Boucle sur les reminders
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // Fonction pour ajouter une pause
  const batchSize = 5; // Taille du lot (5 SMS par seconde)

  for (const reminder of mergedData) {
    const { message, customers, sms_backlogs, id } = reminder;

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

      if (reminder.send_date.slice(0, 10) == todayDate) {
        try {
          // Envoi du SMS
          sendSMS(
            customers.phone,
            message,
            client_id,
            client_secret,
            sender_name
          );
          // Mise à jour des données dans Supabase
          await supabase
            .from("reminders")
            .update({ is_sent: true })
            .eq("id", id);
        } catch (error) {
          console.error(
            `Erreur lors de l'envoi du SMS pour le reminder ${reminder.id}:`,
            error
          );
        }
      } else {
        console.log(
          `La date valide ${valide_date} est passée pour le reminder ${reminder.id}`
        );
      }

      counter++; // Incrémenter le compteur de SMS envoyés

      // Pause après chaque lot de 5 SMS
      if (counter % batchSize === 0) {
        await delay(2000); // Pause de 1 seconde
      }
    }
  }

  // Étape 5 : Retourner les données combinées
  return {
    success: true,
    message: "Processus terminé.",
    data: mergedData,
  };
});

async function sendSMS(phone, message, client_id, client_secret, sender_name) {
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
        client_id: client_id, // Remplacez par votre client_id
        client_secret: client_secret, // Remplacez par votre client_secret
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

    // Corps de la requête pour envoyer le SMS
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

    // Envoi de la requête pour envoyer le SMS avec l'access_token dans les en-têtes
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
      throw new Error("Erreur lors de l'envoi du SMS");
    }

    return postDataResponse;
  } catch (error) {}
}
