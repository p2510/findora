// server/utils/adaptive-search.js
import { generateEmbedding } from './embeddings';

/**
 * Système de recherche adaptatif qui fonctionne pour TOUS les domaines
 * Sans configuration spécifique au domaine
 */
export class AdaptiveSearchSystem {
  constructor() {
    // Patterns universels qui fonctionnent dans tous les domaines
    this.universalPatterns = {
      location: {
        // Patterns qui marchent pour restaurants, magasins, entreprises, etc.
        indicators: [
          /\b(où|where|ubicación|localisation|adresse|address|situé|located|trouve|find)\b/i,
          /\b(aller|go|ir|rendre|get to|comment arriver|how to reach)\b/i,
          /\b(route|rue|street|chemin|way|direction)\b/i
        ],
        boostTerms: ['adresse', 'situé', 'localisation', 'coordonnées', 'plan']
      },
      
      pricing: {
        indicators: [
          /\b(prix|price|coût|cost|tarif|rate|combien|how much|cuánto)\b/i,
          /\b(cher|expensive|cheap|abordable|affordable|budget)\b/i,
          /\b(\d+\s*[€$£¥₣]|euros?|dollars?|fcfa|devise)\b/i
        ],
        boostTerms: ['tarif', 'prix', 'coût', 'montant', 'frais']
      },
      
      contact: {
        indicators: [
          /\b(contact|téléphone|phone|email|appeler|call|joindre|reach)\b/i,
          /\b(numéro|number|whatsapp|message|écrire|write)\b/i
        ],
        boostTerms: ['téléphone', 'email', 'contact', 'joindre']
      },
      
      availability: {
        indicators: [
          /\b(horaire|hours|ouvert|open|fermé|closed|disponible|available)\b/i,
          /\b(quand|when|tiempo|schedule|planning)\b/i
        ],
        boostTerms: ['horaire', 'ouverture', 'disponibilité']
      },
      
      products_services: {
        indicators: [
          /\b(produit|product|service|offre|offer|propose|provide)\b/i,
          /\b(que faites|what do you|services? offered|catalogue)\b/i
        ],
        boostTerms: ['service', 'produit', 'offre', 'prestation']
      }
    };
  }
  
  /**
   * Analyse adaptative de la requête
   */
  analyzeQuery(query) {
    const analysis = {
      intents: [],
      keywords: [],
      language: this.detectLanguage(query),
      complexity: query.split(' ').length
    };
    
    // Détecter les intentions universelles
    Object.entries(this.universalPatterns).forEach(([intent, pattern]) => {
      const matches = pattern.indicators.some(regex => regex.test(query));
      if (matches) {
        analysis.intents.push({
          type: intent,
          confidence: 1.0,
          boostTerms: pattern.boostTerms
        });
      }
    });
    
    // Extraire les mots-clés importants (multi-langue)
    analysis.keywords = this.extractUniversalKeywords(query);
    
    return analysis;
  }
  
  /**
   * Extraction de mots-clés universelle
   */
  extractUniversalKeywords(query) {
    // Mots vides multi-langues
    const stopWords = new Set([
      // Français
      'le', 'la', 'les', 'un', 'une', 'de', 'du', 'je', 'tu', 'il', 'elle',
      // English
      'the', 'a', 'an', 'of', 'to', 'i', 'you', 'he', 'she', 'it',
      // Español
      'el', 'la', 'los', 'las', 'un', 'una', 'de', 'del', 'yo', 'tú',
      // Mots courts universels
      'est', 'is', 'es', 'et', 'and', 'y', 'ou', 'or', 'o'
    ]);
    
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 5);
  }
  
  /**
   * Détection de langue améliorée
   */
  detectLanguage(text) {
    const languages = {
      fr: /\b(le|la|les|de|du|des|un|une|est|sont|avec|pour|dans|sur)\b/gi,
      en: /\b(the|is|are|was|were|have|has|with|for|in|on|at)\b/gi,
      es: /\b(el|la|los|las|es|son|con|para|por|en)\b/gi,
      de: /\b(der|die|das|ist|sind|mit|für|in|auf)\b/gi,
      it: /\b(il|la|i|le|è|sono|con|per|in|su)\b/gi,
      pt: /\b(o|a|os|as|é|são|com|para|por|em)\b/gi
    };
    
    let maxScore = 0;
    let detectedLang = 'fr'; // Par défaut
    
    Object.entries(languages).forEach(([lang, pattern]) => {
      const matches = (text.match(pattern) || []).length;
      if (matches > maxScore) {
        maxScore = matches;
        detectedLang = lang;
      }
    });
    
    return detectedLang;
  }
}

/**
 * Recherche adaptative multi-domaine et multilingue
 */
export const adaptiveSearch = async (query, agentId, openai, supabase) => {
  const searcher = new AdaptiveSearchSystem();
  const analysis = searcher.analyzeQuery(query);
  
  console.log("🔍 Analyse adaptative:", analysis);
  
  // 1. Créer une requête enrichie basée sur l'analyse
  let enrichedQuery = query;
  
  // Ajouter les termes de boost détectés
  if (analysis.intents.length > 0) {
    const boostTerms = analysis.intents
      .flatMap(intent => intent.boostTerms)
      .slice(0, 3);
    
    enrichedQuery = `${query} ${boostTerms.join(' ')}`;
  }
  
  // 2. Générer l'embedding (ada-002 est multilingue)
  const embedding = await generateEmbedding(enrichedQuery, openai);
  
  // 3. Recherche vectorielle dans Supabase
  const { data: vectorResults, error } = await supabase.rpc('match_knowledge_chunks', {
    query_embedding: JSON.stringify(embedding),
    match_agent_id: agentId,
    match_count: 10
  });
  
  if (error) {
    console.error("❌ Erreur recherche vectorielle:", error);
    
    // Fallback : recherche textuelle simple
    const { data: fallbackData } = await supabase
      .from('knowledge_embeddings')
      .select('*')
      .eq('agent_id', agentId)
      .textSearch('content', query.split(' ').join(' | '))
      .limit(5);
      
    return {
      chunks: fallbackData || [],
      analysis: analysis
    };
  }
  
  // 4. Scoring adaptatif basé sur l'analyse
  const scoredResults = (vectorResults || []).map(result => {
    let score = result.similarity || 0;
    
    // Boost si le contenu correspond aux intentions détectées
    analysis.intents.forEach(intent => {
      intent.boostTerms.forEach(term => {
        if (result.content.toLowerCase().includes(term)) {
          score += 0.02;
        }
      });
    });
    
    // Boost si les mots-clés correspondent
    analysis.keywords.forEach(keyword => {
      if (result.content.toLowerCase().includes(keyword.toLowerCase())) {
        score += 0.01;
      }
    });
    
    return {
      ...result,
      adaptiveScore: Math.min(score, 1.0),
      matchedIntents: analysis.intents.map(i => i.type)
    };
  });
  
  // 5. Tri et sélection finale
  const finalResults = scoredResults
    .sort((a, b) => b.adaptiveScore - a.adaptiveScore)
    .slice(0, 5);
  
  console.log(`✅ ${finalResults.length} résultats pertinents trouvés`);
  
  return {
    chunks: finalResults,
    analysis: analysis
  };
};