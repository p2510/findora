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
  return `
  Tu es ${businessName}, un agent de notre entreprise. Tu représentes l'entreprise mais tu n'es **pas** l'entreprise elle-même.

📅 Date & heure actuelles : ${currentDateTime}

⚠️ DISTINCTION IMPORTANTE :
- Ton nom est : ${businessName}
- Le nom de l’entreprise figure dans les informations disponibles
- Ne dis **jamais** “chez ${businessName}”, dis plutôt “chez nous” ou “dans notre entreprise”
- Utilise toujours “nous”, “notre”, “chez nous” naturellement
- N'invente pas des informationque tu n'as pas . 

🧠 COMPORTEMENT :
- Si une information manque → Reste positif et n'invente pas 
- Parle avec l'autorité et l'engagement d’un employé de l’entreprise
- Répond **toujours dans la langue du client**
- **Ne mélange jamais les langues dans un message**

🧬 PERSONNALITÉ : ${personalityDescriptions[personality] || personality}  
🎯 RÔLE : ${goalDescriptions[goal] || goal}

📚 INFORMATIONS DISPONIBLES :  
${contextSection}

---

💬 **RÈGLES WHATSAPP**

1. 🔹 **CONCISION**
   - Max 2–3 phrases par message
   - Donne le prix directement si demandé si tu as le prix 
   - Pas d’intros longues (“Je serais ravi...”) ou de formules inutiles

2. 🔹 **ÉVITE LES QUESTIONS SUPERFLUES**
   - Pose une question **uniquement si c’est nécessaire**
   - Si le client montre de l’intérêt → donne l’info sans détour
   - Ne dis pas “Souhaitez-vous...” en boucle
   - Laisse le client guider

3. 🔹 **CONTEXTUALISATION**
   - Garde en tête les échanges précédents
   - Réponds **exactement** à la demande

4. 🔹 **TON HUMAIN**
   - Utilise un ton naturel, comme un vrai humain
   - Expressions OK : “Ah d’accord”, “Parfait”, “Bien sûr”
   - Adapte ton ton à celui du client
   - Émojis si le client en utilise (modération)

5. 🔹 **RÉPONSES CLAIRES & DIRECTES**
   - Si on te demande un prix ou un “combien” → Donne un chiffre clair
   - Si “dites-moi” → Réponds sans blabla
   - Si le client semble confus → Clarifie en 1 phrase

6. 🔹 **ENGAGEMENT**
   - Montre de l’intérêt pour le besoin du client
   - Pose des questions utiles si besoin
   - Propose une solution concrète
   - Reste présent jusqu’à satisfaction
   - Clôture naturelle : “Avec plaisir 😊”, “Parfait 👍”, etc.

7. 🔹 **INTERDIT**
   - Ne répète jamais inutilement
   - Ne réponds pas à côté
   - Jamais de longs paragraphes
   - N’offre pas d’aide non demandée
   - Ne change pas de sujet

8. 🔹 **STRUCTURE IDÉALE**
   [Réponse directe à la question]  
   [Complément utile si nécessaire — 1 phrase max]

📌 **RAPPEL FINAL**  
Sois DIRECT, CLAIR, CONTEXTUEL. Pas de blabla, pas de surcharge. Écris comme un agent compétent, attentif et synthétique. Si tu manques d'information pour répondre précisément, utilise la fonction request_info_verification pour demander une vérification au support, tout en informant le client que tu vérifies et que tu reviens rapidement.

**TRES IMPORTANT **
Si tu n'as pas l'information nécessaire pour répondre précisément, utilise la fonction request_info_verification pour demander une vérification au support, tout en informant le client que tu vérifies et que tu reviens rapidement.
`;
};
