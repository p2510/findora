  import { createClient } from "@supabase/supabase-js";


  export default defineEventHandler(async (event) => {
    const apiKey = useRuntimeConfig().supabase_secret_key;
    const supabase = createClient(
      useRuntimeConfig().public.supabase_url,
      apiKey
    );

    // Fonction pour personnaliser le message avec les données du client
    const personalizeMessage = (content, customer) => {
      let personalizedContent = content;
      
      // Remplacer toutes les variables {name}, {email}, {phone} par les valeurs du client
      Object.keys(customer).forEach(key => {
        const regex = new RegExp(`{${key}}`, 'g');
        personalizedContent = personalizedContent.replace(regex, customer[key] || '');
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

    // Fonction pour envoyer un message avec média
    const sendMediaMessage = async (customer, content, token, mediaUrl, mediaType) => {
      const personalizedContent = personalizeMessage(content, customer);
      
      console.log(`📸 Tentative d'envoi ${mediaType} à ${customer.phone}`);
      console.log(`   URL du média: ${mediaUrl}`);
      console.log(`   Type: ${mediaType}`);
      
      console.log("URL média reçue:", mediaUrl) 
      // Vérifier que l'URL est valide et accessible
      if (!mediaUrl || (!mediaUrl.startsWith('http://') && !mediaUrl.startsWith('https://'))) {
        console.error(`❌ URL invalide: ${mediaUrl}`);
        return { success: false, error: 'URL du média invalide' };
      }
      
      let url;
      let body = {
        to: customer.phone,
        media: mediaUrl, // URL du média depuis Supabase Storage
      };
      
      // Ajouter le caption si présent
      if (personalizedContent && personalizedContent.trim() !== '') {
        body.caption = personalizedContent;
      }
      
      // Déterminer l'endpoint selon le type
      switch(mediaType) {
        case 'image':
          url = 'https://gate.whapi.cloud/messages/image';
          break;
        case 'video':
          url = 'https://gate.whapi.cloud/messages/video';
          break;
        case 'document':
          url = 'https://gate.whapi.cloud/messages/document';
          // Pour les documents, extraire le nom du fichier depuis l'URL
          const filename = mediaUrl.split('/').pop().split('-').slice(1).join('-');
          body.filename = filename;
          break;
        default:
          console.error(`Type de média non supporté: ${mediaType}`);
          return { success: false, error: 'Type de média non supporté' };
      }
      
      console.log(`   Endpoint: ${url}`);
      console.log(`   Body:`, JSON.stringify(body, null, 2));
      
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
        const response = await fetch(url, options);
        const jsonResponse = await response.json();
        
        if (!response.ok) {
          console.error(`❌ Erreur API WhatsApp:`, jsonResponse);
          throw new Error(jsonResponse.error?.message || jsonResponse.message || 'Erreur API WhatsApp');
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

    // Fonction pour envoyer des messages par batch avec pause
    const sendMessagesWithPause = async (batch, token) => {
      const results = [];
      for (const { customer, content, mediaUrl, mediaType } of batch) {
        const result = await sendMessageToCustomer(customer, content, token, mediaUrl, mediaType);
        results.push(result);
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Pause de 2 secondes
      }
      return results;
    };

    // Récupérer les campagnes non envoyées
    const { data: campaigns, error } = await supabase
      .from("whatsapp_campaigns")
      .select("*")
      .eq("is_sent", false)
      .order("created_at", { ascending: true })
      .limit(1);
      
    if (error) {
      console.error("Erreur récupération campagnes:", error);
      return { success: false, message: "Erreur lors de la récupération." };
    }

    if (!campaigns || campaigns.length === 0) {
      return { success: false, message: "Aucune campagne à envoyer." };
    }

    let batch = [];
    let batchToken = null;
    let campaignsToMarkSent = [];
    let totalCustomers = 0;
    let successCount = 0;
    let failureCount = 0;

    for (const campaign of campaigns) {
      if (batch.length === 0) {
        batchToken = campaign.token;
      }

      // Vérifier si c'est une campagne avec média
      const hasMedia = campaign.media_url && campaign.media_type;

      for (const customer of campaign.customers) {
        batch.push({ 
          customer, 
          content: campaign.content,
          mediaUrl: campaign.media_url,
          mediaType: campaign.media_type
        });
        
        if (!campaignsToMarkSent.includes(campaign.id)) {
          campaignsToMarkSent.push(campaign.id);
        }
        
        totalCustomers++;

        if (totalCustomers >= 15) {
          console.log(`📢 Envoi d'un groupe de ${totalCustomers} messages ${hasMedia ? 'avec média' : 'texte'}...`);
          const results = await sendMessagesWithPause(batch, batchToken);
          
          // Compter les succès et échecs
          successCount += results.filter(r => r.success).length;
          failureCount += results.filter(r => !r.success).length;

          await supabase
            .from("whatsapp_campaigns")
            .update({ is_sent: true })
            .in("id", campaignsToMarkSent);

          batch = [];
          campaignsToMarkSent = [];
          totalCustomers = 0;
        }
      }
    }

    if (batch.length > 0) {
      console.log(`📢 Envoi du dernier groupe de ${totalCustomers} messages...`);
      const results = await sendMessagesWithPause(batch, batchToken);
      
      // Compter les succès et échecs
      successCount += results.filter(r => r.success).length;
      failureCount += results.filter(r => !r.success).length;
      
      await supabase
        .from("whatsapp_campaigns")
        .update({ is_sent: true })
        .in("id", campaignsToMarkSent);
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