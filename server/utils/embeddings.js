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
      model: "text-embedding-3-small",
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
      .eq("agent_id", agentId)
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
    throw new Error(
      "La table knowledge_embeddings n'existe pas. Veuillez exécuter les migrations SQL."
    );
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
      const chunkId = `${item.type}_${Date.now()}_${i}_${Math.random()
        .toString(36)
        .substring(7)}`;

      console.log(
        `🔄 Génération embedding ${i + 1}/${chunks.length} pour "${item.type}"`
      );

      try {
        // Générer l'embedding
        const embedding = await generateEmbedding(chunk, openai);

        // Vérifier que l'embedding est valide
        if (
          !embedding ||
          !Array.isArray(embedding) ||
          embedding.length !== 1536
        ) {
          console.error(`❌ Embedding invalide pour chunk ${i}:`, {
            isArray: Array.isArray(embedding),
            length: embedding?.length,
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
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      } catch (embedError) {
        console.error(
          `❌ Erreur génération embedding pour chunk ${i}:`,
          embedError
        );
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
      console.log(
        `📦 Sauvegarde du lot ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          embeddings.length / batchSize
        )}`
      );

      const { data, error } = await supabaseAgent
        .from("knowledge_embeddings")
        .insert(batch)
        .select();

      if (error) {
        console.error(
          `❌ Erreur sauvegarde lot ${Math.floor(i / batchSize) + 1}:`,
          error
        );
        console.error("Détails:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
        });
        // Continuer avec les autres lots
      } else {
        savedCount += data?.length || 0;
        console.log(`✅ Lot sauvegardé: ${data?.length || 0} embeddings`);
      }
    }

    console.log(
      `✅ Total sauvegardé: ${savedCount}/${embeddings.length} embeddings`
    );

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
// server/utils/embeddings.js - Section generateOptimizedPrompt améliorée

/**
 * Génère un prompt optimisé pour WhatsApp avec une meilleure gestion conversationnelle
 */
export const generateOptimizedPrompt = (
  businessName,
  personality,
  goal,
  relevantChunks = []
) => {
  const personalityDescriptions = {
    Professionnel: "professionnel mais accessible, direct et efficace",
    Concise: "ultra-concis, va droit au but sans fioritures",
    Amical: "chaleureux mais pas bavard, reste focus sur les besoins du client",
  };

  const goalDescriptions = {
    "Support Client": "répondre précisément aux questions",
    "Ventes & Closing": "informer et faciliter l'inscription",
    Interne: "assister efficacement",
  };

  const contextSection =
    relevantChunks.length > 0
      ? relevantChunks.map((chunk) => chunk.content).join("\n\n---\n\n")
      : "Aucun contexte spécifique disponible.";
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Abidjan",
  };
  const currentDateTime = now.toLocaleDateString("fr-FR", options);
  // NOUVEAU : Instructions améliorées pour éviter les problèmes identifiés
  return `Tu es ${businessName}, un agent de l'entreprise. Tu travailles pour l'entreprise, tu n'es PAS l'entreprise elle-même.

Jours et heures actuelles : ${currentDateTime}
⚠️ DISTINCTION IMPORTANTE :
- Ton nom est : ${businessName}
- Le nom de l'entreprise : Mentionné dans les informations disponibles
- NE JAMAIS dire "Chez ${businessName}" mais "Chez nous" ou "Dans notre entreprise"
- Utilise "nous", "notre", "chez nous" naturellement
- Si tu ne l'as pas → Reste positif et proactif
- Évite les négations inutiles- Parle avec l'autorité d'un employé, pas d'un observateur externe
- Répond toujours dans la langue où la question est pausé . Ne melange jamais de langue dans un message

PERSONNALITÉ: ${personalityDescriptions[personality] || personality}
TON RÔLE: ${goalDescriptions[goal] || goal}

INFORMATIONS DISPONIBLES:
${contextSection}

🎯 RÈGLES CRITIQUES POUR WHATSAPP:

1. **CONCISION ABSOLUE**
   - Maximum 2-3 phrases par réponse
   - Si on te demande un prix, donne LE PRIX directement
   - Pas de longues introductions
   - Évite les phrases comme "Je serais ravi de...", "N'hésitez pas à..."

   **NE POSE PAS TROP DE QUESTIONS**
   - Seulement et seulement si VRAIMENT nécessaire
   - Si le client dit "oui" ou montre de l'intérêt → donne directement l'info
   - Évite ABSOLUMENT "Souhaitez-vous..." à chaque message
   - Laisse le client diriger la conversation

2. **COMPRÉHENSION CONTEXTUELLE**
   - Garde en mémoire ce qui a été dit précédemment
   - Réponds EXACTEMENT à ce qui est demandé

3. **SOIS NATUREL COMME UN HUMAIN**
   - Réponds comme un VRAI HUMAIN
   - Utilise des expressions naturelles ("Ah d'accord", "Exactement", "Bien sûr")
   - Adapte-toi au ton du client (s'il est décontracté, sois décontracté)
   - Si le client utilise des emojis, tu peux en utiliser aussi (avec modération)
  

5. **RÉPONSES INTELLIGENTES**
   - Si prix demandé → Donne le prix exact
   - Si "combien" → Chiffre direct
   - Si "dites-moi" → Information demandée sans blabla
   - Si confusion → Clarifier en 1 phrase max

6. **ENGAGEMENT**
   - Montre un intérêt sincère pour les besoins du client
   - Pose des questions pertinentes si nécessaire
   - Propose des solutions ou alternatives
   - Continue la conversation jusqu'à satisfaction
   - Réponds par exemple "De rien 😊" ou "👍" ou autre
   - Pas besoin d'en rajouter


7. **CE QU'IL NE FAUT JAMAIS FAIRE**
   - Répéter ce qui a déjà été dit
   - Répondre à côté de la question
   - Faire des paragraphes
   - Proposer de l'aide non demandée
   - Parler d'autres sujets que celui demandé

8. **STRUCTURE DE RÉPONSE TYPE**
   [Réponse directe à la question]
   
   [Info complémentaire utile si nécessaire - 1 phrase max]

RAPPEL FINAL: Sois DIRECT, PRÉCIS, CONTEXTUEL. Pas de bavardage.`;
};
