import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  // Initialisation du client Supabase
  const apiKey =useRuntimeConfig().supabase_secret_key

  const supabase = createClient(
    useRuntimeConfig().public.supabase_url,
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
