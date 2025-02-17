export default defineEventHandler(async (event) => {
  // Récupérer les données de la requête
  const requestBody = await readBody(event);
  const { instanceId, apiToken, customers, content } = requestBody;

  const url = `https://7105.api.greenapi.com/waInstance${instanceId}/sendMessage/${apiToken}`;

  // Fonction pour diviser le tableau en lots de taille donnée
  function chunkArray(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  // Diviser les clients en lots de 5
  const customerBatches = chunkArray(customers, 7);

  for (const batch of customerBatches) {
    // Envoyer chaque lot de 5 clients
    const sendPromises = batch.map(async (customer) => {
      const data = {
        chatId: customer.chatId, // ChatId spécifique au client
        message: content || "", // Message à envoyer
        linkPreview: false, // Prévisualisation du lien
      };

      const options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      };

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
    });

    // Attendre que tous les messages du lot soient envoyés avant de continuer
    await Promise.all(sendPromises);

    // Attendre 2 secondes avant d'envoyer le prochain lot
    console.log("Pause de 2 secondes avant le prochain lot...");
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return { success: true, message: "Messages envoyés à tous les clients" };
});
