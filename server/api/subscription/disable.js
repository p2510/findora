import { serverSupabaseClient } from "#supabase/server";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const supabaseUrl = "https://puxvccwmxfpgyocglioe.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";

  const supabase = createClient(supabaseUrl, supabaseKey);
  const requestBody = await readBody(event);

  const { user_id } = JSON.parse(requestBody);

  if (!user_id) {
    return {
      success: false,
      message: "L'identifiant utilisateur est vide .",
    };
  }

  const tokenPaystack =
    "Bearer sk_live_abf1627587617059ddebc19fc1ee61bf52ea0a3f";
  const url = "https://api.paystack.co/subscription/disable";
  let data = {
    token: "",
    code: "",
  };
  const { data: subscriptionData } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user_id)
    .limit(1)
    .single();

  if (subscriptionData) {
    data.code = subscriptionData.subscription_code;
    data.token = subscriptionData.token;
  }

  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: tokenPaystack,
    },
    body: JSON.stringify(data),
  };

  try {
    // Attente de la réponse de la fetch
    const response = await fetch(url, options);
    const jsonResponse = await response.json();
    // Retourne la réponse de la fetch
    if (jsonResponse.status) {
      const { data, error } = await supabase
        .from("subscriptions")
        .update({ status: "cancel" })
        .eq("user_id", user_id)
        .select();
    }
    return {
      success: true,
      message: "Processus terminé.",
      fetchResponse: jsonResponse,
    };
  } catch (err) {
    return {
      success: false,
      message: "Erreur lors de la requête fetch",
      error: err,
    };
  }
});
