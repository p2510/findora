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
    "Bearer sk_test_e626c60330f6962effabd5ff195e583c6ede9904";
  const url = "https://api.paystack.co/transaction/initialize";
  let data = {
    email: email,
    plan: plan,
    amount: 6500000,
  };
  if (plan == "premium" && type == "month") {
    data.plan = "PLN_qqw2r92t6om9bkw";
  } else if (plan == "premium" && type == "year") {
    data.plan = "PLN_72gqeqp5vci6bdn";
  } else if (plan == "ultra" && type == "month") {
    data.plan = "PLN_711tatz9b7jfh8l";
  } else if (plan == "ultra" && type == "year") {
    data.plan = "PLN_wpg2zdfsoedtoit";
  } else if (plan == "entreprise" && type == "month") {
    data.plan = "PLN_eg0dv9p9fbhykmh";
  } else if (plan == "entreprise" && type == "year") {
    data.plan = "PLN_4jsz6eeelybzm3x";
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
