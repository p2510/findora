// server/utils/cache.js

/**
 * Cache en mémoire pour les embeddings et résultats
 * Réduit drastiquement les appels API
 */
class SearchCache {
  constructor(maxSize = 1000, ttl = 3600000) { // 1 heure par défaut
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
  }
  
  // Générer une clé de cache normalisée
  generateKey(query, configId) {
    // Normaliser la requête pour maximiser les hits
    const normalized = query
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[?!.,;:]/g, '');
    
    return `${configId}:${normalized}`;
  }
  
  // Obtenir depuis le cache
  get(query, configId) {
    const key = this.generateKey(query, configId);
    const cached = this.cache.get(key);
    
    if (cached) {
      // Vérifier l'expiration
      if (Date.now() - cached.timestamp < this.ttl) {
        console.log("✅ Cache hit pour:", query);
        cached.hits++;
        return cached.data;
      } else {
        // Expiré, supprimer
        this.cache.delete(key);
      }
    }
    
    console.log("❌ Cache miss pour:", query);
    return null;
  }
  
  // Ajouter au cache
  set(query, configId, data) {
    const key = this.generateKey(query, configId);
    
    // Vérifier la taille limite
    if (this.cache.size >= this.maxSize) {
      // Supprimer les entrées les moins utilisées
      this.evictLRU();
    }
    
    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
      hits: 0
    });
  }
  
  // Éviction LRU (Least Recently Used)
  evictLRU() {
    let leastUsed = null;
    let minHits = Infinity;
    
    for (const [key, value] of this.cache.entries()) {
      if (value.hits < minHits) {
        minHits = value.hits;
        leastUsed = key;
      }
    }
    
    if (leastUsed) {
      this.cache.delete(leastUsed);
    }
  }
  
  // Statistiques du cache
  getStats() {
    const total = Array.from(this.cache.values()).reduce((sum, item) => sum + item.hits, 0);
    return {
      size: this.cache.size,
      totalHits: total,
      keys: Array.from(this.cache.keys())
    };
  }
  
  // Nettoyer le cache
  clear() {
    this.cache.clear();
  }
}

// Instance globale du cache
export const searchCache = new SearchCache();

/**
 * Cache pour les embeddings de questions fréquentes
 */
const embeddingCache = new Map();

export const getCachedEmbedding = async (text, openai) => {
  const cacheKey = text.toLowerCase().trim();
  
  if (embeddingCache.has(cacheKey)) {
    console.log("✅ Embedding cache hit");
    return embeddingCache.get(cacheKey);
  }
  
  // Si pas en cache, générer l'embedding
  const { generateEmbedding } = await import('./embeddings.js');
  const embedding = await generateEmbedding(text, openai);
  
  // Limiter la taille du cache
  if (embeddingCache.size > 500) {
    const firstKey = embeddingCache.keys().next().value;
    embeddingCache.delete(firstKey);
  }
  
  embeddingCache.set(cacheKey, embedding);
  return embedding;
};