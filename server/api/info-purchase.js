import { serverSupabaseClient } from "#supabase/server";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const requestBody = await readBody(event);

  const { client_id, client_secret } = JSON.parse(requestBody);
  if (!client_id || !client_secret) {
    return {
      success: false,
      message:
        "Les champs client_id, client_secret et sender_name sont requis.",
    };
  }
  const response = await getData(client_id, client_secret);

  // Vérifier si la réponse est correcte
  if (response.error) {
    return {
      success: false,
      message: response.error.message,
    };
  }
  // Étape 5 : Retourner les données combinées

  return {
    success: true,
    message: "Processus terminé.",
    data: response,
  };
});

async function getData(client_id, client_secret) {
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
    const apiUrl = "https://api.orange.com/sms/admin/v1/contracts";

    const apiResponse = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const apiResult = await apiResponse.json();

    if (!apiResponse.ok) {
      throw new Error("Erreur lors de l'envoi du SMS");
    }

    return apiResult[0];
  } catch (error) {
  }
}
