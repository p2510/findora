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
  const { user_id } = JSON.parse(requestBody);

  // Fonction de vérification de l'abonnement
  const isSubscriptionValid = (subscription_type, start_at) => {
    const isValidSubscriptionType = subscription_type === "ultra" || subscription_type === "entreprise";
    const expirationDate = new Date(
      new Date(start_at).setMonth(new Date(start_at).getMonth() + 1)
    );
    const isExpired = expirationDate.getTime() < new Date().getTime();
    return isValidSubscriptionType && !isExpired;
  };

  let isValid = false;

  // Vérification de l'abonnement dans la base de données
  try {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user_id)
      .single();
    if (data) {
      if (isSubscriptionValid(data.subscription_type, data.start_at)) {
        isValid = true;
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error,
      data: data,
    };
  }

  if (isValid) {
    // Requête pour créer un canal sur Whapi uniquement si isValid est vrai
    const tokenId =
      "Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImExZDI2YWYyYmY4MjVmYjI5MzVjNWI3OTY3ZDA3YmYwZTMxZWIxYjcifQ.eyJwYXJ0bmVyIjp0cnVlLCJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vd2hhcGktYTcyMWYiLCJhdWQiOiJ3aGFwaS1hNzIxZiIsImF1dGhfdGltZSI6MTc0MDI0MjM1NCwidXNlcl9pZCI6IlQyTWlGanlkSnBlaGhIbWcyUWszTnFTMlFKOTIiLCJzdWIiOiJUMk1pRmp5ZEpwZWhoSG1nMlFrM05xUzJRSjkyIiwiaWF0IjoxNzQwMjQyMzU0LCJleHAiOjE4MDA3MjIzNTQsImVtYWlsIjoicG91cG9pbmFrYTAzQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJmaXJlYmFzZSI6eyJpZGVudGl0aWVzIjp7ImVtYWlsIjpbInBvdXBvaW5ha2EwM0BnbWFpbC5jb20iXX0sInNpZ25faW5fcHJvdmlkZXIiOiJwYXNzd29yZCJ9fQ.SeY-wcxw9lYuKOsgUN4Yyq4mSLq5WR_6K5hHh8kwjjUxG022yh21OaUmX2v4fY8S2lMZ4ndASEvHh-LAgV4Z38JGlC-vjmjciaznvur-XSrj7Vp2bOGYuGVstze_2KdQYXozQnR0HhafIUkI-JFSjy3dl2KYbiLGiVBw52-por8BcleeNfe1Sa75PbDrYI79Y3_ey7aOl3BiyrEKC-w7cJf9tCvOE-4cj8cLfIn6IkapygX6kpIdi3FFIkmk_XSNtfbJZhSnKC6KWRNA6V7zvN9JpkI3_bU5IzOWpEGzFele3Yq5tauPruS1uq6og6Yi265DqO0ZmHFGfz3B60ovXw";
    const projectId = "ZPtUJ1HInzAiWGI6EOqs";
    const url = "https://manager.whapi.cloud/channels";

    const options = {
      method: "PUT",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: tokenId,
      },
      body: JSON.stringify({ name: user_id, projectId: projectId }),
    };

    try {
      // Attente de la réponse de la fetch
      const response = await fetch(url, options);
      const jsonResponse = await response.json();
      console.log(jsonResponse);

      // Retourne la réponse de la fetch
      return {
        data: isValid,
        success: true,
        message: "Processus terminé.",
        fetchResponse: jsonResponse,
      };
    } catch (err) {
      console.error("Erreur lors de la requête fetch:", err);
      return {
        success: false,
        message: "Erreur lors de la requête fetch",
        error: err,
      };
    }
  } else {
    // Si l'abonnement n'est pas valide, retourne une erreur
    return {
      success: false,
      message: "Abonnement non valide",
    };
  }
});
