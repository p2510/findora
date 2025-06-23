// server/utils/embeddings.js

/**
 * Chunking intelligent du contenu
 */
export const chunkContent = (content, maxChunkSize = 500) => {
  const sentences = content.match(/[^.!?]+[.!?]+/g) || [content];
  const chunks = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else { 
      currentChunk += ' ' + sentence;
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
  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: text,
  });
  return response.data[0].embedding;
};

/**
 * Vectoriser la knowledge base
 */
export const vectorizeKnowledgeBase = async (agentId, knowledgeBase, openai, supabase) => {
  console.log(`🚀 Début de la vectorisation pour l'agent ${agentId}`);
  
  // Vérifier d'abord si la table existe et la créer si nécessaire
  const { error: checkError } = await supabase
    .from('knowledge_embeddings')
    .select('id')
    .limit(1);
    
  if (checkError && checkError.code === '42P01') {
    console.log("📦 La table knowledge_embeddings n'existe pas encore");
    // La table sera créée automatiquement avec la migration
  }
  
  const embeddings = [];
  let totalChunks = 0;
  
  for (const item of knowledgeBase) {
    // Découper le contenu en chunks
    const chunks = chunkContent(item.content);
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkId = `${item.type}_${Date.now()}_${i}`;
      
      console.log(`🔄 Génération embedding pour chunk ${i+1}/${chunks.length} de type "${item.type}"`);
      
      try {
        // Générer l'embedding
        const embedding = await generateEmbedding(chunk, openai);
        
        embeddings.push({
          agent_id: agentId,
          chunk_id: chunkId,
          content: chunk,
          metadata: {
            type: item.type,
            chunk_index: i,
            total_chunks: chunks.length,
            created_at: new Date().toISOString()
          },
          embedding: JSON.stringify(embedding)
        });
        
        totalChunks++;
      } catch (embedError) {
        console.error(`❌ Erreur génération embedding pour chunk ${i}:`, embedError);
        throw embedError;
      }
    }
  }
  
  // Sauvegarder tous les embeddings
  if (embeddings.length > 0) {
    console.log(`💾 Sauvegarde de ${embeddings.length} embeddings...`);
    
    const { error } = await supabase
      .from('knowledge_embeddings')
      .insert(embeddings);
      
    if (error) {
      console.error("❌ Erreur sauvegarde embeddings:", error);
      throw error;
    }
  }
  
  console.log(`✅ Vectorisation terminée : ${totalChunks} chunks créés`);
  return totalChunks;
};

/**
 * Génère un prompt optimisé pour WhatsApp
 */
export const generateOptimizedPrompt = (businessName, personality, goal, relevantChunks = []) => {
  const personalityDescriptions = {
    Professionnel: "professionnel mais accessible, jamais robotique",
    Concise: "direct et efficace, sans être froid",
    Amical: "chaleureux et engageant, comme un collègue sympathique"
  };
  
  const goalDescriptions = {
    "Support Client": "aider et accompagner les clients",
    "Ventes & Closing": "présenter les solutions et convertir les prospects",
    Interne: "supporter les équipes internes"
  };

  const contextSection = relevantChunks.length > 0 
    ? relevantChunks.map(chunk => chunk.content).join('\n\n---\n\n')
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