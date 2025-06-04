import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const apiKey = useRuntimeConfig().supabase_secret_key;
  const supabase = createClient(useRuntimeConfig().public.supabase_url, apiKey);

  // Fonction pour personnaliser le message avec les données du client
  const personalizeMessage = (content, customer) => {
    let personalizedContent = content;

    Object.keys(customer).forEach((key) => {
      const regex = new RegExp(`{${key}}`, "g");
      personalizedContent = personalizedContent.replace(
        regex,
        customer[key] || ""
      );
    });

    return personalizedContent;
  };

  // Fonction pour envoyer un message texte
  const sendTextMessage = async (customer, content, token) => {
    const personalizedContent = personalizeMessage(content, customer);
    
    const url = "https://gate.whapi.cloud/messages/text";
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        typing_time: 0,
        to: customer.phone,
        body: personalizedContent,
      }),
    };

    try {
      const response = await fetch(url, options);
      const jsonResponse = await response.json();
      console.log(`Message texte envoyé à ${customer.phone}:`, jsonResponse);
      return { success: true, response: jsonResponse };
    } catch (err) {
      console.error(`Erreur lors de l'envoi à ${customer.phone}:`, err);
      return { success: false, error: err.message };
    }
  };

  // Fonction pour envoyer un message avec média (version URL comme dans le premier code)
  const sendMediaMessage = async (customer, content, token, mediaUrl, mediaType) => {
    const personalizedContent = personalizeMessage(content, customer);
    
    console.log(`📸 Tentative d'envoi ${mediaType} à ${customer.phone}`);
    console.log(`   URL du média: ${mediaUrl}`);
    console.log(`   Type: ${mediaType}`);
    
    // Vérifier que l'URL est valide et accessible
    if (!mediaUrl || (!mediaUrl.startsWith('http://') && !mediaUrl.startsWith('https://'))) {
      console.error(`❌ URL invalide: ${mediaUrl}`);
      return { success: false, error: 'URL du média invalide' };
    }
    
    let endpoint;
    const body = {
      to: customer.phone,
      media: mediaUrl,
    };
    
    // Ajouter le caption si présent
    if (personalizedContent && personalizedContent.trim() !== '') {
      body.caption = personalizedContent;
    }
    
    // Déterminer l'endpoint selon le type
    switch(mediaType) {
      case 'image':
        endpoint = 'https://gate.whapi.cloud/messages/image';
        break;
      case 'video':
        endpoint = 'https://gate.whapi.cloud/messages/video';
        break;
      case 'document':
        endpoint = 'https://gate.whapi.cloud/messages/document';
        // Pour les documents, extraire le nom du fichier depuis l'URL
        const filename = mediaUrl.split('/').pop().split('-').slice(1).join('-');
        body.filename = filename;
        break;
      default:
        console.error(`Type de média non supporté: ${mediaType}`);
        return { success: false, error: 'Type de média non supporté' };
    }
    
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        authorization: "Bearer " + token,
      },
      body: JSON.stringify(body),
    };

    try {
      const response = await fetch(endpoint, options);
      const jsonResponse = await response.json();
      
      if (!response.ok) {
        console.error(`❌ Erreur API WhatsApp:`, jsonResponse);
        return { 
          success: false, 
          error: jsonResponse.error?.message || jsonResponse.message || 'Erreur API WhatsApp',
          details: jsonResponse
        };
      }
      
      console.log(`✅ Message ${mediaType} envoyé avec succès à ${customer.phone}`);
      return { success: true, response: jsonResponse };
    } catch (err) {
      console.error(`❌ Erreur lors de l'envoi du ${mediaType} à ${customer.phone}:`, err);
      return { success: false, error: err.message };
    }
  };

  // Fonction générique pour envoyer un message (texte ou média)
  const sendMessageToCustomer = async (customer, content, token, mediaUrl = null, mediaType = null) => {
    if (mediaUrl && mediaType) {
      return await sendMediaMessage(customer, content, token, mediaUrl, mediaType);
    } else {
      return await sendTextMessage(customer, content, token);
    }
  };

  // Fonction pour envoyer des messages avec pauses
  const sendMessagesWithPause = async (customers, content, token, mediaUrl, mediaType) => {
    const messagesPerInterval = 10;
    const intervalBetweenMessages = Math.floor(Math.random() * 3 + 1) * 1000;
    const intervalBetweenSeries = Math.floor(Math.random() * 4 + 3) * 1000;
    let i = 0;

    const results = [];
    
    for (const customer of customers) {
      const result = await sendMessageToCustomer(
        customer,
        content,
        token,
        mediaUrl,
        mediaType
      );
      results.push(result);
      i++;

      if (i % messagesPerInterval === 0) {
        console.log(
          `Pause de ${
            intervalBetweenSeries / 1000
          }s après ${messagesPerInterval} messages.`
        );
        await new Promise((resolve) =>
          setTimeout(resolve, intervalBetweenSeries)
        );
      }

      await new Promise((resolve) =>
        setTimeout(resolve, intervalBetweenMessages)
      );
    }
    
    return results;
  };

  // Récupération des campagnes planifiées à envoyer aujourd'hui
  const today = new Date().toISOString().split("T")[0];

  const { data: campaigns, error } = await supabase
    .from("whatsapp_campaigns_schedule")
    .select("*")
    .eq("is_sent", false)
    .eq("send_date", today)
    .limit(2);

  if (error) {
    console.error("Erreur lors de la récupération des campagnes:", error);
    return {
      success: false,
      message: "Erreur lors de la récupération des campagnes",
    };
  }

  if (!campaigns || campaigns.length === 0) {
    return {
      success: false,
      message: "Aucune campagne à envoyer aujourd'hui.",
    };
  }

  let successCount = 0;
  let failureCount = 0;

  for (const campaign of campaigns) {
    const { customers, content, token, media_url, media_type } = campaign;
    
    const results = await sendMessagesWithPause(
      customers,
      content,
      token,
      media_url,
      media_type
    );
    
    // Compter les succès et échecs
    successCount += results.filter(r => r.success).length;
    failureCount += results.filter(r => !r.success).length;

    const { error: updateError } = await supabase
      .from("whatsapp_campaigns_schedule")
      .update({ is_sent: true })
      .eq("id", campaign.id);

    if (updateError) {
      console.error(
        "Erreur lors de la mise à jour de la campagne:",
        updateError
      );
      return {
        success: false,
        message: "Erreur lors de la mise à jour de la campagne",
      };
    }
  }

  return {
    success: true,
    message: "Campagnes envoyées avec succès.",
    stats: {
      sent: successCount,
      failed: failureCount,
      total: successCount + failureCount
    }
  };
});