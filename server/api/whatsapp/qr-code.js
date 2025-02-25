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
  const { token } = JSON.parse(requestBody);

  // Requête pour créer un canal sur Whapi uniquement si isValid est vrai

  const url =
    "https://gate.whapi.cloud/users/login?wakeup=true&color_dark=%23f3c775";

  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: "Bearer " + token,
    },
  };

  try {
    // Attente de la réponse de la fetch
    const response = await fetch(url, options);
    const jsonResponse = await response.json();
    console.log(jsonResponse);

    // Retourne la réponse de la fetch
    return {
      success: true,
      message: "Processus terminé.",
      data: jsonResponse,
    };
  } catch (err) {
    console.error("Erreur lors de la requête fetch:", err);
    return {
      success: false,
      message: "Erreur lors de la requête fetch",
      error: err,
    };
  }
});
