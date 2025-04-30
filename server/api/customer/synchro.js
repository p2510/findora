import { createClient } from "@supabase/supabase-js";
export default defineEventHandler(async (event) => {
  // Initialisation du client Supabase
  const apiKey = useRuntimeConfig().supabase_secret_key;

  const supabase = createClient(useRuntimeConfig().public.supabase_url, apiKey);

  const requestBody = await readBody(event);
  const { token, userId } = JSON.parse(requestBody);

  // Requête pour créer un canal sur Whapi uniquement si isValid est vrai

  const url = "https://gate.whapi.cloud/contacts?count=500";

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
    if (jsonResponse && jsonResponse.contacts) {
      const contacts = jsonResponse.contacts;

      const formattedContacts = contacts.map((contact) => ({
        phone: contact.id,
        name: contact.name || contact.pushname || "Aucun",
        email: "",
        address: "",
        customer_type: "Particulier",
        created_by: userId,
      }));

      const batchSize = 10;

      const chunkArray = (array, size) => {
        const result = [];
        for (let i = 0; i < array.length; i += size) {
          result.push(array.slice(i, i + size));
        }
        return result;
      };

      const batches = chunkArray(formattedContacts, batchSize);

      let totalInserted = 0;

      for (const batch of batches) {
        const phones = batch.map((entry) => entry.phone);

        // Vérifier les téléphones déjà présents
        const { data: existingCustomers, error: selectError } = await supabase
          .from("customers")
          .select("phone")
          .eq("created_by", userId)
          .in("phone", phones);

        if (selectError) {
          console.error(
            "Erreur lors de la vérification des doublons :",
            selectError
          );
          continue;
        }

        const existingPhones = existingCustomers.map((c) => c.phone);

        // Garder uniquement les nouveaux numéros
        const newBatch = batch.filter(
          (entry) => !existingPhones.includes(entry.phone)
        );

        if (newBatch.length > 0) {
          const { error: insertError } = await supabase
            .from("customers")
            .insert(newBatch);

          if (insertError) {
            console.error("Erreur d'insertion :", insertError);
            continue;
          }

          totalInserted += newBatch.length;
        }
      }
    }

    // Retourne la réponse de la fetch
    return {
      success: true,
      message: "Synchronisation terminée.",
      data: jsonResponse,
    };
  } catch (err) {
    console.log(err);
    return {
      success: false,
      message: "Erreur lors de la requête fetch",
      error: err,
    };
  }
});
