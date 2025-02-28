import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  // Initialisation du client Supabase avec une variable d'environnement
  const supabaseUrl = "https://puxvccwmxfpgyocglioe.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fonction pour envoyer un message via l'API externe
  const sendMessageToCustomer = async (phone, message, token) => {
    const url = "https://gate.whapi.cloud/messages/text";
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        typing_time: 0,
        to: formatPhoneNumber(phone),
        body: message,
      }),
    };

    try {
      const response = await fetch(url, options);
      const jsonResponse = await response.json();
      console.log(`Message envoyé à ${phone}:`, jsonResponse);
    } catch (err) {
      console.error(`Erreur lors de l'envoi du message à ${phone}:`, err);
    }
  };

  // Fonction pour formater les numéros de téléphone
  const formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber.startsWith("+")) return phoneNumber;
    const countryCode = phoneNumber.slice(1, 4);
    const remainingNumber = phoneNumber.slice(4);
    return countryCode === "225"
      ? countryCode + remainingNumber.slice(2)
      : phoneNumber.slice(1);
  };

  // Récupération des campagnes non envoyées pour aujourd'hui
  const today = new Date().toISOString().split("T")[0];
  const { data: reminders, error } = await supabase
    .from("reminders")
    .select("*")
    .eq("is_sent", false)
    .eq("send_date", today)
    .limit(15);
  if (error) {
    console.error("Erreur lors de la récupération des campagnes:", error);
    return {
      success: false,
      message: "Erreur lors de la récupération des campagnes",
    };
  }

  if (!reminders || reminders.length === 0) {
    return {
      success: false,
      message: "Aucune campagne à envoyer aujourd'hui.",
    };
  }

  // Envoi des messages sans pause
  await Promise.all(
    reminders.map((reminder) =>
      sendMessageToCustomer(reminder.phone, reminder.message, reminder.token)
    )
  );

  // Mise à jour des campagnes envoyées
  const ids = reminders.map((r) => r.id);
  const { error: updateError } = await supabase
    .from("reminders")
    .update({ is_sent: true })
    .in("id", ids);

  if (updateError) {
    console.error("Erreur lors de la mise à jour des campagnes:", updateError);
    return {
      success: false,
      message: "Erreur lors de la mise à jour des campagnes",
    };
  }

  return { success: true, message: "Campagnes envoyées avec succès." };
});
