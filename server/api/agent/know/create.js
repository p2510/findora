// server/api/agent/know/create.js
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { vectorizeKnowledgeBase } from "~/server/utils/embeddings";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig();
  const supabaseUrl = "https://puxvccwmxfpgyocglioe.supabase.co";
  const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB1eHZjY3dteGZwZ3lvY2dsaW9lIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjcyNzA4NCwiZXhwIjoyMDQ4MzAzMDg0fQ.amjPfsZkysKczrI29qJmgabu-NQjyj-Sza3sWmcm4iA";
  
  const requestBody = await readBody(event);
  const { metadata, user_id } = JSON.parse(requestBody);

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
    return {
      success: false,
      message: `Les éléments suivants ont un type invalide : ${invalidTypes
        .map((item) => item.type)
        .join(", ")}`,
    };
  }

  try {
    const supabaseAgent = createClient(supabaseUrl, supabaseKey, {
      db: { schema: "agent_ia" },
    });

    const { data: existingAgent, error: fetchError } = await supabaseAgent
      .from("agent_configs")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      throw new Error(fetchError.message);
    }

    if (!existingAgent) {
      return {
        success: false,
        message: "Aucun agent n'existe pour cet utilisateur. Veuillez en créer un avant d'ajouter des connaissances.",
      };
    }

    const { data: existingKnowledge, error: knowledgeFetchError } =
      await supabaseAgent
        .from("knowledge_base")
        .select("id")
        .eq("agent_id", existingAgent.id)
        .single();

    if (knowledgeFetchError && knowledgeFetchError.code !== "PGRST116") {
      throw new Error(knowledgeFetchError.message);
    }

    // Initialiser OpenAI
    const openai = new OpenAI({ 
      apiKey: config.openai_api_key || "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"
    });

    console.log("🧠 Début de la vectorisation de la knowledge base");
    
    // Si mise à jour, supprimer les anciens embeddings AVANT la vectorisation
    if (existingKnowledge) {
      console.log("🗑️ Suppression des anciens embeddings...");
      
      const { error: deleteError, count: deletedCount } = await supabaseAgent
        .from("knowledge_embeddings")
        .delete()
        .eq('agent_id', existingAgent.id);
        
      if (deleteError) {
        console.error("❌ Erreur suppression anciens embeddings:", deleteError);
        // Ne pas bloquer le processus, continuer avec la nouvelle vectorisation
      } else {
        console.log(`✅ ${deletedCount || 0} anciens embeddings supprimés`);
      }
    }
    
    // Vectoriser la nouvelle knowledge base
    let totalChunks = 0;
    try {
      totalChunks = await vectorizeKnowledgeBase(
        existingAgent.id,
        metadata,
        openai,
        supabaseAgent
      );
      
      console.log(`✅ ${totalChunks} nouveaux chunks créés et sauvegardés`);
    } catch (vectorError) {
      console.error("❌ Erreur vectorisation:", vectorError);
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
        throw new Error(error.message);
      }

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
        throw new Error(error.message);
      }

      return {
        success: true,
        message: "Les connaissances ont été ajoutées avec succès pour cet agent.",
        data: data,
        totalChunks: totalChunks
      };
    }
  } catch (err) {
    console.error("❌ Erreur dans l'API know/create:", err);
    return {
      success: false,
      message: err.message,
    };
  }
});