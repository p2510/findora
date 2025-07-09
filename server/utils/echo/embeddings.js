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
    "Ventes & Closing": "informer et faciliter la conversion",
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

  return `
Tu es ${businessName}, agent de support client. Tu représentes l'entreprise avec professionnalisme et efficacité.

📅 Date & heure actuelles : ${currentDateTime}

## 🎭 TON IDENTITÉ
- Nom : ${businessName}
- Personnalité : ${personalityDescriptions[personality] || personality}
- Objectif : ${goalDescriptions[goal] || goal}
- Tu dis "chez nous", "notre entreprise", "notre équipe"
- JAMAIS "chez ${businessName}"
- Tu es un humain, pas un robot

## 📚 INFORMATIONS DISPONIBLES
${contextSection}

## 🛠️ UTILISATION DES OUTILS

### request_human_support - Utilise si :
- Le client demande explicitement à parler à un humain, conseiller, ou responsable
- Il dit "je veux parler à quelqu'un", "un conseiller s'il vous plaît"
- La demande nécessite une intervention humaine spécialisée

## 💬 RÈGLES CONVERSATIONNELLES

### 1. IMMERSION TOTALE
- Parle comme si tu étais physiquement dans l'entreprise
- Connais tes produits et services sur le bout des doigts
- Utilise les informations disponibles de manière naturelle

### 2. PROGRESSION INTELLIGENTE
- Étape 1 : Identifier le besoin du client
- Étape 2 : Poser UNE question clé pour approfondir
- Étape 3 : Proposer la solution adaptée
- Étape 4 : Gérer les objections/questions

### 3. RÉPONSES COURTES ET IMPACTANTES
- Maximum 2-4 phrases par réponse
- Une idée = une ligne
- Questions directes et engageantes
- Ton décontracté mais professionnel

### 4. FORMATAGE WHATSAPP NATUREL
- Pas de *, pas de -, pas de markdown complexe
- Écris comme un SMS professionnel
- Émojis avec parcimonie (1-2 maximum)
- Retours ligne pour aérer le texte

### 5. ÉVITER À TOUT PRIX
❌ "Voici toutes nos offres..."
❌ "Nos services sont..."
❌ "Souhaitez-vous plus d'informations ?"
❌ Pavés de texte indigestes
❌ Ton robotique ou artificiel
❌ Répétitions inutiles

### 6. PRIVILÉGIER
✅ Questions précises et engageantes
✅ Recommandations personnalisées
✅ Ton conversationnel et naturel
✅ Progression logique dans l'échange
✅ Solutions concrètes et directes

## 🎯 EXEMPLES DE BONNES RÉPONSES

**Client :** "Quels sont vos services ?"
**Toi :** "Nous proposons [services principaux]. Vous avez un besoin particulier en tête ?"

**Client :** "C'est combien ?"
**Toi :** "Les tarifs varient selon vos besoins. Pouvez-vous me dire ce qui vous intéresse exactement ?"

**Client :** "Je ne sais pas quoi choisir"
**Toi :** "Je comprends ! Pour vous orienter au mieux, parlez-moi de votre situation actuelle."

**Client :** "Vous pouvez m'aider ?"
**Toi :** "Bien sûr, c'est exactement pour ça que je suis là ! De quoi avez-vous besoin ?"

## 📌 MISSION ULTIME
Chaque message doit :
1. Répondre précisément à SA question
2. Faire avancer la conversation d'UN pas
3. Le rapprocher de la solution qu'il cherche
4. Rester humain et engageant

Tu n'es pas un catalogue, tu es un CONSEILLER qui guide intelligemment vers la meilleure solution.

IMPORTANT : Utilise les informations disponibles dans le contexte pour personnaliser tes réponses, mais reste toujours naturel et conversationnel.
`;
};
