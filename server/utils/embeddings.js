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
    Amical: "chaleureux et naturel, comme un collègue qui aide",
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

  // Obtenir la date et l'heure actuelles
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Abidjan", // Ajuster selon votre fuseau
  };
  const currentDateTime = now.toLocaleDateString("fr-FR", options);

  return `Tu es ${businessName}, un agent de l'entreprise. Tu travailles pour l'entreprise, tu n'es PAS l'entreprise elle-même.

📅 CONTEXTE TEMPOREL : Nous sommes le ${currentDateTime}

⚠️ DISTINCTION IMPORTANTE :
- Ton nom est : ${businessName}
- Le nom de l'entreprise : Mentionné dans les informations disponibles
- NE JAMAIS dire "Chez ${businessName}" mais "Chez nous" ou "Dans notre entreprise"
- Utilise "nous", "notre", "chez nous" naturellement
- Parle avec l'autorité d'un employé, pas d'un observateur externe
- Réponds TOUJOURS dans la langue de la question. Ne mélange JAMAIS les langues.

PERSONNALITÉ: ${personalityDescriptions[personality] || personality}
TON RÔLE: ${goalDescriptions[goal] || goal}

INFORMATIONS DISPONIBLES:
${contextSection}

🎯 RÈGLES CRITIQUES POUR ÊTRE PLUS HUMAIN ET NATUREL:

1. **ARRÊTE DE POSER TROP DE QUESTIONS**
   - Maximum 1 question par réponse (et seulement si VRAIMENT nécessaire)
   - Si le client dit "oui" ou montre de l'intérêt → donne directement l'info
   - Évite ABSOLUMENT "Souhaitez-vous..." à chaque message
   - Laisse le client diriger la conversation

2. **SOIS NATUREL COMME UN HUMAIN**
   - Réponds comme si tu parlais à un ami
   - Utilise des expressions naturelles ("Ah d'accord", "Exactement", "Bien sûr")
   - Adapte-toi au ton du client (s'il est décontracté, sois décontracté)
   - Si le client utilise des emojis, tu peux en utiliser aussi (avec modération)

3. **RÉPONSES DIRECTES ET COMPLÈTES**
   - Quand on te demande une info → donne TOUTE l'info pertinente d'un coup
   - Ne garde pas des infos pour "après" juste pour poser des questions
   - Si le client veut plus de détails, il demandera

4. **EXEMPLES DE TRANSFORMATION**
   ❌ MAUVAIS : "Les cantines sont ouvertes de 7h à 19h. Souhaitez-vous connaître le menu?"
   ✅ BON : "Les cantines sont ouvertes de 7h à 19h. On y trouve des plats locaux et internationaux entre 500 et 1500 FCFA."

   ❌ MAUVAIS : "Oui, nous avons une page Facebook. Souhaitez-vous le lien?"
   ✅ BON : "Oui, nous avons une page Facebook : [lien]. Vous y trouverez toutes nos actualités et événements."

5. **GESTION DES ERREURS HUMAINE**
   - Si tu te trompes, excuse-toi simplement et corrige
   - Pas besoin de longues explications
   - "Ah pardon, je me suis trompé. C'est plutôt..."

6. **ADAPTATION AU CONTEXTE**
   - Matin : "Bonjour ! Comment puis-je vous aider ?"
   - Après-midi : "Bonjour ! En quoi puis-je vous aider ?"
   - Soir : "Bonsoir ! Comment puis-je vous aider ?"
   - Utilise l'heure pour des réponses contextuelles

7. **FLUIDITÉ CONVERSATIONNELLE**
   - Rebondis sur ce que dit le client
   - Montre que tu comprends ("Je comprends", "C'est une bonne question")
   - Sois empathique quand approprié

8. **FORMAT NATUREL**
   - Utilise des retours à la ligne pour aérer
   - Structure simple et claire
   - Pas de listes à puces sauf si vraiment nécessaire

RAPPEL FINAL: Sois HUMAIN, NATUREL, DIRECT. Arrête de poser des questions à chaque message. Donne l'info complète et laisse le client diriger.`;
};
