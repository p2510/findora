import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";
import fs from "fs/promises";

export default defineEventHandler(async (event) => {
  const apiKey = useRuntimeConfig().supabase_secret_key;
  const supabase = createClient(useRuntimeConfig().public.supabase_url, apiKey);
  
  // Parser le FormData avec les bonnes limites selon le type
  const form = formidable({
    maxFileSize: 100 * 1024 * 1024, // 100MB max (pour les documents)
  });

  let fields, files;
  try {
    [fields, files] = await form.parse(event.node.req);
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors du parsing des données",
      error: error.message,
    };
  }

  // Extraire les données
  const customers = JSON.parse(fields.customers[0]);
  const content = fields.content[0];
  const token = fields.token[0];
  const user_id = fields.user_id[0];
  const mediaType = fields.mediaType ? fields.mediaType[0] : null;
  const mediaFile = files.media ? files.media[0] : null;

  // Vérifier les limites de taille spécifiques
  if (mediaFile) {
    const limits = {
      image: 5 * 1024 * 1024,      // 5MB
      video: 16 * 1024 * 1024,     // 16MB
      document: 100 * 1024 * 1024  // 100MB
    };
    
    if (mediaFile.size > limits[mediaType]) {
      return {
        success: false,
        message: `Le fichier ${mediaType} dépasse la limite autorisée`,
      };
    }
  }

  // Vérification de l'abonnement
  let isValid = false;
  let maxCampaigns = 0;
  let subscriptionId = null;
  
  try {
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("subscription_type, start_at, max_campaigns, id")
      .eq("user_id", user_id)
      .order("start_at", { ascending: false })
      .limit(1)
      .single();
      
    if (error) throw error;
    
    if (subscription) {
      const expirationDate = new Date(subscription.start_at);
      expirationDate.setMonth(expirationDate.getMonth() + 1);
      const isExpired = expirationDate < new Date();
      
      if (!isExpired && subscription.max_campaigns >= customers.length) {
        isValid = true;
      }
      maxCampaigns = subscription.max_campaigns;
      subscriptionId = subscription.id;
    }
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de la vérification de l'abonnement.",
      error,
    };
  }

  if (!isValid) {
    return {
      success: false,
      message: "Abonnement expiré ou volume insuffisant.",
    };
  }

  // Fonction pour personnaliser le message
  const personalizeMessage = (content, customer) => {
    let personalizedContent = content;
    Object.keys(customer).forEach((key) => {
      const regex = new RegExp(`{${key}}`, "g");
      personalizedContent = personalizedContent.replace(regex, customer[key] || "");
    });
    return personalizedContent;
  };

  // Upload du fichier vers Supabase Storage si présent
  let mediaUrl = null;
  if (mediaFile) {
    try {
      const fileBuffer = await fs.readFile(mediaFile.filepath);
      const fileName = `campaigns/${Date.now()}-${mediaFile.originalFilename}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('whatsapp-media')
        .upload(fileName, fileBuffer, {
          contentType: mediaFile.mimetype,
          upsert: false
        });
        
      if (uploadError) {
        console.error("Erreur upload Supabase:", uploadError);
        throw new Error("Erreur lors de l'upload du fichier");
      }
      
      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('whatsapp-media')
        .getPublicUrl(fileName);
        
      mediaUrl = publicUrl;
      console.log("Fichier uploadé sur Supabase:", mediaUrl);
      
    } catch (error) {
      // Nettoyer le fichier temporaire
      await fs.unlink(mediaFile.filepath).catch(console.error);
      return {
        success: false,
        message: "Erreur lors de l'upload du média",
        error: error.message,
      };
    }
  }

  // Fonction pour envoyer un message avec média via URL
  const sendMessageWithMedia = async (customer, content, token, mediaUrl, mediaType) => {
    const personalizedContent = personalizeMessage(content, customer);
    
    let url;
    let body = {
      to: customer.phone,
    };
    
    switch(mediaType) {
      case 'image':
        url = 'https://gate.whapi.cloud/messages/image';
        body.media = mediaUrl;
        if (personalizedContent) {
          body.caption = personalizedContent;
        }
        break;
        
      case 'video':
        url = 'https://gate.whapi.cloud/messages/video';
        body.media = mediaUrl;
        if (personalizedContent) {
          body.caption = personalizedContent;
        }
        break;
        
      case 'document':
        url = 'https://gate.whapi.cloud/messages/document';
        body.media = mediaUrl;
        body.filename = mediaFile.originalFilename;
        if (personalizedContent) {
          body.caption = personalizedContent;
        }
        break;
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
      const response = await fetch(url, options);
      const jsonResponse = await response.json();
      
      if (!response.ok) {
        throw new Error(jsonResponse.error?.message || jsonResponse.message || 'Erreur API WhatsApp');
      }
      
      console.log(`Message ${mediaType} envoyé à ${customer.phone}:`, jsonResponse);
      return { success: true, response: jsonResponse };
    } catch (err) {
      console.error(`Erreur lors de l'envoi à ${customer.phone}:`, err);
      return { success: false, error: err.message };
    }
  };

  // Fonction pour envoyer un message texte simple
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
      
      if (!response.ok) {
        throw new Error(jsonResponse.error?.message || jsonResponse.message || 'Erreur API WhatsApp');
      }
      
      console.log(`Message texte envoyé à ${customer.phone}:`, jsonResponse);
      return { success: true, response: jsonResponse };
    } catch (err) {
      console.error(`Erreur lors de l'envoi à ${customer.phone}:`, err);
      return { success: false, error: err.message };
    }
  };

  // Enregistrer la campagne pour envoi différé (comme pour les campagnes programmées)
  try {
    // Enregistrer la campagne dans whatsapp_campaigns avec is_sent: false
    const chunkArray = (array, size) => {
      return Array.from(
        { length: Math.ceil(array.length / size) },
        (_, index) => array.slice(index * size, index * size + size)
      );
    };
    
    const customerChunks = chunkArray(customers, 15);
    const insertPromises = customerChunks.map(async (chunk) => {
      return supabase.from("whatsapp_campaigns").insert({
        customers: chunk,
        content: content,
        user_id: user_id,
        token: token,
        is_sent: false, // Sera traité par le cron job
        media_url: mediaUrl,
        media_type: mediaType,
      });
    });
    
    const insertResults = await Promise.all(insertPromises);
    console.log("Campagne enregistrée dans whatsapp_campaigns pour envoi différé");
    
    // Mettre à jour le quota immédiatement
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({ max_campaigns: maxCampaigns - customers.length })
      .eq("id", subscriptionId);
    
    // Nettoyer le fichier temporaire
    if (mediaFile) {
      await fs.unlink(mediaFile.filepath).catch(console.error);
    }
    
    return {
      success: true,
      message: "Campagne programmée avec succès. Elle sera envoyée dans quelques instants.",
    };
  } catch (error) {
    // Nettoyer le fichier temporaire en cas d'erreur
    if (mediaFile) {
      await fs.unlink(mediaFile.filepath).catch(console.error);
    }
    
    return {
      success: false,
      message: "Erreur lors de la programmation de la campagne",
      error: error.message,
    };
  }
});