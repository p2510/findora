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

  const { data, error } = await supabase
    .from("test_tables")
    .insert([
      {
        name: "Jule" + Math.random(),
      },
    ])
    .select();
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
    .eq("send_date", todayDate);

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
      id, application_id,client_id,client_secret,sender_name,valide_date,user_id
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

  // Étape 5 : Retourner les données combinées
  return {
    success: true,
    message: "Processus terminé.",
    data: mergedData,
  };
});
