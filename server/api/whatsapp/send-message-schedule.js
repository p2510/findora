// server/api/whatsapp/schedule-campaign.post.js
import { createClient } from "@supabase/supabase-js";
import formidable from "formidable";
import fs from "fs/promises";

export default defineEventHandler(async (event) => {
  const apiKey = useRuntimeConfig().supabase_secret_key;
  const supabase = createClient(useRuntimeConfig().public.supabase_url, apiKey);
  
  // Parser le FormData
  const form = formidable({
    maxFileSize: 100 * 1024 * 1024, // 100MB max
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
  const scheduleDate = fields.scheduleDate[0];
  const mediaType = fields.mediaType ? fields.mediaType[0] : null;
  const mediaFile = files.media ? files.media[0] : null;

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

  let mediaUrl = null;

  // Si un média est présent, l'uploader vers Supabase Storage
  if (mediaFile) {
    try {
      const fileBuffer = await fs.readFile(mediaFile.filepath);
      const fileName = `campaigns/${Date.now()}-${mediaFile.originalFilename}`;
      
      // Upload avec la clé service (pas de problème RLS)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('whatsapp-media')
        .upload(fileName, fileBuffer, {
          contentType: mediaFile.mimetype,
          upsert: false
        });
        
      if (uploadError) {
        console.error("Erreur upload Supabase:", uploadError);
        throw new Error("Erreur lors de l'upload du fichier: " + uploadError.message);
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
    } finally {
      // Toujours nettoyer le fichier temporaire
      if (mediaFile?.filepath) {
        await fs.unlink(mediaFile.filepath).catch(console.error);
      }
    }
  }

  // Sauvegarder la campagne programmée
  try {
    const { data, error } = await supabase
      .from("whatsapp_campaigns_schedule")
      .insert({
        customers: customers,
        content: content,
        user_id: user_id,
        token: token,
        send_date: scheduleDate,
        is_sent: false,
        media_url: mediaUrl,
        media_type: mediaType,
      });

    if (error) {
      console.error("Erreur insertion campagne:", error);
      return {
        success: false,
        message: "Erreur lors de la sauvegarde de la campagne: " + error.message,
      };
    }

    // Mettre à jour le quota
    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({ max_campaigns: maxCampaigns - customers.length })
      .eq("id", subscriptionId);

    if (updateError) {
      console.error("Erreur mise à jour quota:", updateError);
    }

    return {
      success: true,
      message: "Campagne programmée avec succès pour le " + scheduleDate,
    };
  } catch (error) {
    return {
      success: false,
      message: "Erreur lors de la programmation de la campagne",
      error: error.message,
    };
  }
});