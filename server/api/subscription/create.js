import { serverSupabaseClient } from "#supabase/server";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const requestBody = await readBody(event);

  const { email, plan, type } = JSON.parse(requestBody);
  if (!email || !plan || !type) {
    return {
      success: false,
      message: "Les champs email ou le  plan ou type sont vides.",
    };
  }

  const tokenPaystack =
    "Bearer sk_live_abf1627587617059ddebc19fc1ee61bf52ea0a3f";
  const url = "https://api.paystack.co/transaction/initialize";
  let data = {
    email: email,
    plan: plan,
    amount: 6500000,
  };
  if (plan == "premium" && type == "month") {
    data.plan = "PLN_n32s635by7a2lly";
  } else if (plan == "premium" && type == "year") {
    data.plan = "PLN_5v0p9di0tl2maw7";
  } else if (plan == "ultra" && type == "month") {
    data.plan = "PLN_0irtzap489vwh1r";
  } else if (plan == "ultra" && type == "year") {
    data.plan = "PLN_hzcq7b85c58x53d";
  } else if (plan == "entreprise" && type == "month") {
    data.plan = "PLN_ioz7ntf6kjjrb28";
  } else if (plan == "entreprise" && type == "year") {
    data.plan = "PLN_lcqstax96zw76iz";
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
