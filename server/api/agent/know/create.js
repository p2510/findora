// server/api/agent/know/create.js
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { vectorizeKnowledgeBase } from "~/server/utils/echo/embeddings";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const supabaseUrl = "https://puxvccwmxfpgyocglioe.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";
  
  try {
    console.log("🔍 Début de l'API know/create");
    
    const requestBody = await readBody(event);
    console.log("📥 Body reçu:", typeof requestBody, requestBody);
    
    // Vérifier si requestBody est déjà un objet ou une string
    let parsedData;
    if (typeof requestBody === 'string') {
      parsedData = JSON.parse(requestBody);
    } else {
      parsedData = requestBody;
    }
    
    const { metadata, user_id } = parsedData;
    console.log("📋 Données parsées:", { 
      metadata: metadata?.length || 0, 
      user_id,
      metadataPreview: metadata?.slice(0, 2) 
    });

    if (!metadata || !Array.isArray(metadata)) {
      return {
        success: false,
        message: "Les métadonnées sont manquantes ou invalides",
      };
    }

    if (!user_id) {
      return {
        success: false,
        message: "L'ID utilisateur est manquant",
      };
    }

    const validTypes = [
      "presentation",
      "produit", 
      "service",
      "site web",
      "faq",
      "réseaux sociaux",
    ];

    const invalidTypes = metadata.filter(
      (item) => !validTypes.includes(item.type)
    );

    if (invalidTypes.length > 0) {
      console.log("❌ Types invalides trouvés:", invalidTypes);
      return {
        success: false,
        message: `Les éléments suivants ont un type invalide : ${invalidTypes
          .map((item) => item.type)
          .join(", ")}`,
      };
    }

    console.log("✅ Validation des types OK");

    const supabaseAgent = createClient(supabaseUrl, supabaseKey, {
      db: { schema: "agent_ia" },
    });

    const { data: existingAgent, error: fetchError } = await supabaseAgent
      .from("agent_configs")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      console.log("❌ Erreur fetch agent:", fetchError);
      throw new Error(fetchError.message);
    }

    if (!existingAgent) {
      console.log("❌ Aucun agent trouvé pour user_id:", user_id);
      return {
        success: false,
        message: "Aucun agent n'existe pour cet utilisateur. Veuillez en créer un avant d'ajouter des connaissances.",
      };
    }

    console.log("✅ Agent trouvé:", existingAgent.id);

    const { data: existingKnowledge, error: knowledgeFetchError } =
      await supabaseAgent
        .from("knowledge_base")
        .select("id")
        .eq("agent_id", existingAgent.id)
        .single();

    if (knowledgeFetchError && knowledgeFetchError.code !== "PGRST116") {
      console.log("❌ Erreur fetch knowledge:", knowledgeFetchError);
      throw new Error(knowledgeFetchError.message);
    }

    console.log("📚 Knowledge existante:", existingKnowledge ? "OUI" : "NON");


    // Vérifier la clé OpenAI
    const apiKey = config.openai_api_key 
    console.log("🔑 OpenAI key présente:", apiKey ? "OUI" : "NON");
    
    const openai = new OpenAI({ apiKey });
 

    console.log("🧠 Début de la vectorisation de la knowledge base");
    console.log("📊 Métadonnées à vectoriser:", metadata.map(item => ({
      type: item.type,
      contentLength: item.content?.length || 0
    })));
    
    // Si mise à jour, supprimer les anciens embeddings AVANT la vectorisation
    if (existingKnowledge) {
      console.log("🗑️ Suppression des anciens embeddings...");
      
      const { error: deleteError, count: deletedCount } = await supabaseAgent
        .from("knowledge_embeddings")
        .delete()
        .eq('agent_id', existingAgent.id);
        
      if (deleteError) {
        console.error("❌ Erreur suppression anciens embeddings:", deleteError);
      } else {
        console.log(`✅ ${deletedCount || 0} anciens embeddings supprimés`);
      }
    }
    
    // Vectoriser la nouvelle knowledge base
    let totalChunks = 0;
    try {
      console.log("🚀 Appel de vectorizeKnowledgeBase...");
      totalChunks = await vectorizeKnowledgeBase(
        existingAgent.id,
        metadata,
        openai,
        supabaseAgent
      );
      
      console.log(`✅ ${totalChunks} nouveaux chunks créés et sauvegardés`);
      
      if (totalChunks === 0) {
        throw new Error("Aucun chunk n'a pu être créé. Vérifiez le contenu des métadonnées.");
      }
      
    } catch (vectorError) {
      console.error("❌ Erreur vectorisation détaillée:", vectorError);
      console.error("❌ Stack trace:", vectorError.stack);
      throw new Error("Erreur lors de la vectorisation: " + vectorError.message);
    }

    // Sauvegarder un prompt minimal
    const minimalPrompt = `Agent: ${existingAgent.name}, Personnalité: ${existingAgent.personality}, Objectif: ${existingAgent.goal}`;
    
    const knowledgeData = {
      agent_id: existingAgent.id,
      metadata: metadata,
      prompt: minimalPrompt,
      has_embeddings: true,
      total_chunks: totalChunks
    };

    if (existingKnowledge) {
      // Mettre à jour
      const { data, error } = await supabaseAgent
        .from("knowledge_base")
        .update(knowledgeData)
        .eq("agent_id", existingAgent.id)
        .select("*")
        .single();

      if (error) {
        console.log("❌ Erreur update knowledge:", error);
        throw new Error(error.message);
      }

      console.log("✅ Knowledge mise à jour avec succès");
      return {
        success: true,
        message: "Les connaissances de l'agent ont été mises à jour avec succès !",
        data: data,
        totalChunks: totalChunks
      };
    } else {
      // Créer
      const { data, error } = await supabaseAgent
        .from("knowledge_base")
        .insert([knowledgeData])
        .select("*")
        .single();

      if (error) {
        console.log("❌ Erreur insert knowledge:", error);
        throw new Error(error.message);
      }

      console.log("✅ Knowledge créée avec succès");
      return {
        success: true,
        message: "Les connaissances ont été ajoutées avec succès pour cet agent.",
        data: data,
        totalChunks: totalChunks
      };
    }
  } catch (err) {
    console.error("❌ Erreur dans l'API know/create:", err);
    console.error("❌ Stack trace complète:", err.stack);
    return {
      success: false,
      message: err.message,
    };
  }
});