export default defineEventHandler(async (event) => {
  // Récupérer les données de la requête
  const requestBody = await readBody(event);

  const { customers, content } = requestBody;

  // Vérifiez si le channel est sélectionné

  const url =
    "https://7105.api.greenapi.com/waInstance7105187833/sendMessage/4156ea50e38f4441b1219a9c849d0221ac85c2933b3543ea97";

  // Boucle à travers chaque client dans le tableau customers
  for (const customer of customers) {
    // Données à envoyer pour chaque client
    const data = {
      chatId: customer.chatId, // ChatId spécifique au client
      message: content || "test message", // Message à envoyer
      linkPreview: false, // Prévisualisation du lien
    };

    // Configurer les options pour la requête POST
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json", // Spécifier que les données sont en JSON
      },
      body: JSON.stringify(data), // Convertir les données en JSON
    };

    // Effectuer la requête pour chaque client
    try {
      const response = await fetch(url, options);
      const result = await response.json();

      if (!response.ok) {
        console.error(`Erreur pour ${customer.chatId}: ${result.error}`);
      } else {
        console.log(`Message envoyé à ${customer.chatId}:`, result);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi:", error);
    }
  }

  return { success: true, message: "Messages envoyés à tous les clients" };
});
