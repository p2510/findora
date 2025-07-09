import { generateEmbedding } from './embeddings';

/**
 * Recherche simple et directe par embedding
 */
export const simpleSearch = async (query, agentId, openai, supabase) => {
  
  try {
    // 1. Générer l'embedding directement sans modification
    const embedding = await generateEmbedding(query, openai);
    
    // 2. Recherche vectorielle dans Supabase
    const { data: results, error } = await supabase.rpc('match_knowledge_chunks', {
      query_embedding: JSON.stringify(embedding),
      match_agent_id: agentId,
      match_count: 5 // Top 5 résultats
    });
    
    if (error) {
      console.error("❌ Erreur recherche:", error);
      // Fallback : retourner vide plutôt que d'échouer
      return { chunks: [] };
    }
    
    // 3. Retourner directement les résultats triés par similarité
    return {
      chunks: results || []
    };
    
  } catch (error) {
    console.error("❌ Erreur générale:", error);
    return { chunks: [] };
  }
};