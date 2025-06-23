// server/utils/embeddings.js
import { createClient } from "@supabase/supabase-js";

/**
 * Chunking intelligent du contenu
 */
export const chunkContent = (content, maxChunkSize = 500) => {
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
  const chunks = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += " " + sentence;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
};

/**
 * Générer un embedding
 */
export const generateEmbedding = async (text, openai) => {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("❌ Erreur génération embedding:", error);
    throw error;
  }
};

/**
 * Supprimer les anciens embeddings
 */
export const deleteOldEmbeddings = async (agentId, supabaseAgent) => {
  try {
    console.log(`🗑️ Suppression des embeddings pour l'agent ${agentId}...`);
    
    const { data, error, count } = await supabaseAgent
      .from("knowledge_embeddings")
      .delete()
      .eq('agent_id', agentId)
      .select();
      
    if (error) {
      console.error("❌ Erreur lors de la suppression:", error);
      return false;
    }
    
    console.log(`✅ ${data?.length || 0} embeddings supprimés`);
    return true;
  } catch (error) {
    console.error("❌ Erreur inattendue lors de la suppression:", error);
    return false;
  }
};

/**
 * Vectoriser la knowledge base
 */
export const vectorizeKnowledgeBase = async (
  agentId,
  knowledgeBase,
  openai,
  supabaseAgent
) => {
  console.log(`🚀 Début de la vectorisation pour l'agent ${agentId}`);
  
  // Vérifier d'abord si la table existe
  const { error: checkError } = await supabaseAgent
    .from("knowledge_embeddings")
    .select("id")
    .limit(1);

  if (checkError && checkError.code === "42P01") {
    console.log("📦 La table knowledge_embeddings n'existe pas encore");
    throw new Error("La table knowledge_embeddings n'existe pas. Veuillez exécuter les migrations SQL.");
  }

  const embeddings = [];
  let totalChunks = 0;
  let failedChunks = 0;

  for (const item of knowledgeBase) {
    // Vérifier que le contenu n'est pas vide
    if (!item.content || item.content.trim().length === 0) {
      console.warn(`⚠️ Contenu vide pour le type "${item.type}", ignoré`);
      continue;
    }

    // Découper le contenu en chunks
    const chunks = chunkContent(item.content);
    console.log(`📄 Type "${item.type}" : ${chunks.length} chunks à traiter`);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = `${item.type}_${Date.now()}_${i}_${Math.random().toString(36).substring(7)}`;

      console.log(`🔄 Génération embedding ${i + 1}/${chunks.length} pour "${item.type}"`);

      try {
        // Générer l'embedding
        const embedding = await generateEmbedding(chunk, openai);

        // Vérifier que l'embedding est valide
        if (!embedding || !Array.isArray(embedding) || embedding.length !== 1536) {
          console.error(`❌ Embedding invalide pour chunk ${i}:`, {
            isArray: Array.isArray(embedding),
            length: embedding?.length
          });
          failedChunks++;
          continue;
        }

        embeddings.push({
          agent_id: agentId,
          chunk_id: chunkId,
          content: chunk,
          metadata: {
            type: item.type,
            chunk_index: i,
            total_chunks: chunks.length,
            created_at: new Date().toISOString(),
          },
          embedding: JSON.stringify(embedding),
        });

        totalChunks++;
        
        // Pause courte pour éviter la surcharge de l'API
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
      } catch (embedError) {
        console.error(`❌ Erreur génération embedding pour chunk ${i}:`, embedError);
        failedChunks++;
        // Continuer avec les autres chunks au lieu de tout arrêter
      }
    }
  }

  // Sauvegarder tous les embeddings en lots
  if (embeddings.length > 0) {
    console.log(`💾 Sauvegarde de ${embeddings.length} embeddings...`);
    
    // Sauvegarder par lots de 100 pour éviter les timeouts
    const batchSize = 100;
    let savedCount = 0;
    
    for (let i = 0; i < embeddings.length; i += batchSize) {
      const batch = embeddings.slice(i, i + batchSize);
      console.log(`📦 Sauvegarde du lot ${Math.floor(i/batchSize) + 1}/${Math.ceil(embeddings.length/batchSize)}`);
      
      const { data, error } = await supabaseAgent
        .from("knowledge_embeddings")
        .insert(batch)
        .select();

      if (error) {
        console.error(`❌ Erreur sauvegarde lot ${Math.floor(i/batchSize) + 1}:`, error);
        console.error("Détails:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        // Continuer avec les autres lots
      } else {
        savedCount += data?.length || 0;
        console.log(`✅ Lot sauvegardé: ${data?.length || 0} embeddings`);
      }
    }
    
    console.log(`✅ Total sauvegardé: ${savedCount}/${embeddings.length} embeddings`);
    
    if (savedCount === 0) {
      throw new Error("Aucun embedding n'a pu être sauvegardé");
    }
  } else {
    console.warn("⚠️ Aucun embedding à sauvegarder");
  }

  console.log(`📊 Résumé: ${totalChunks} chunks créés, ${failedChunks} échecs`);
  
  if (totalChunks === 0) {
    throw new Error("Aucun chunk n'a pu être créé");
  }
  
  return totalChunks;
};

/**
 * Génère un prompt optimisé pour WhatsApp
 */
export const generateOptimizedPrompt = (
  businessName,
  personality,
  goal,
  relevantChunks = []
) => {
  const personalityDescriptions = {
    Professionnel: "professionnel mais accessible, jamais robotique",
    Concise: "direct et efficace, sans être froid",
    Amical: "chaleureux et engageant, comme un collègue sympathique",
  };

  const goalDescriptions = {
    "Support Client": "aider et accompagner les clients",
    "Ventes & Closing": "présenter les solutions et convertir les prospects",
    Interne: "supporter les équipes internes",
  };

  const contextSection =
    relevantChunks.length > 0
      ? relevantChunks.map((chunk) => chunk.content).join("\n\n---\n\n")
      : "Aucun contexte spécifique disponible.";

  return `Tu es un membre de l'équipe ${businessName}. Tu travailles directement pour ${businessName}.

PERSONNALITÉ: Sois ${personalityDescriptions[personality] || personality}
TON RÔLE: ${goalDescriptions[goal] || goal}

INFORMATIONS DISPONIBLES:
${contextSection}

DIRECTIVES POUR WHATSAPP:

1. **IDENTITÉ**
   - Tu fais partie de l'équipe ${businessName}
   - Utilise "nous", "notre", "chez nous" naturellement
   - Parle avec l'autorité d'un employé, pas d'un observateur externe
   - Ne mentionne JAMAIS que tu es une IA

2. **FORMAT WHATSAPP**
   - Messages courts et concis (max 800 caractères)
   - Utilise des emojis avec parcimonie mais naturellement
   - Structure en paragraphes courts
   - Évite les longs blocs de texte

3. **STYLE DE COMMUNICATION**
   - Adapte-toi au ton du client (formel/informel)
   - Reste naturel et conversationnel
   - Évite les formulations robotiques ou scriptées
   - Réponds rapidement aux questions

4. **GESTION DES INFORMATIONS**
   - Si tu as l'information → Partage-la avec confiance
   - Si tu ne l'as pas → Reste positif et propose des alternatives
   - Évite les négations inutiles
   - Base-toi uniquement sur les informations fournies

5. **ENGAGEMENT**
   - Montre un intérêt sincère pour les besoins du client
   - Pose des questions pertinentes si nécessaire
   - Continue la conversation naturellement
   - Ne coupe jamais la conversation prématurément

6. **LANGAGE**
   - Parle comme un humain, pas comme un manuel
   - Utilise des expressions naturelles
   - Évite le jargon sauf si pertinent
   - Réponds dans la langue du client

RAPPEL: Tu ES ${businessName}. Incarne l'entreprise avec authenticité et professionnalisme.`;
};