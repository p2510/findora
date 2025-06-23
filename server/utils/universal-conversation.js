// server/utils/conversation-intelligence.js

/**
 * Analyser et enrichir la requête en fonction du contexte
 */
export const enrichQueryWithContext = (currentMessage, recentMessages) => {
  let enrichedQuery = currentMessage;
  const lastMessages = recentMessages.slice(-3); // Les 3 derniers messages
  
  // Dictionnaire de références contextuelles
  const contextualReferences = {
    // Prix et coûts
    "ça coûte": "prix",
    "combien": "prix tarif coût",
    "la scolarité": "frais scolarité prix",
    
    // Références pronominales
    "ça": null, // À remplacer par le dernier sujet
    "cela": null,
    "ceci": null,
    "l'info": "informatique",
    "info": "informatique",
    
    // Abréviations courantes
    "rdv": "rendez-vous",
    "svp": "s'il vous plaît",
    "asap": "rapidement urgent"
  };
  
  // Identifier le dernier sujet mentionné
  let lastSubject = null;
  const subjectPatterns = [
    /(?:licence|master|formation) (?:en |de )?([\w\s]+)/i,
    /(informatique|marketing|gestion|droit|communication)/i,
    /(programme|filière|cursus) (?:en |de )?([\w\s]+)/i
  ];
  
  // Parcourir les messages récents pour trouver le dernier sujet
  for (let i = lastMessages.length - 1; i >= 0; i--) {
    const msg = lastMessages[i].content || lastMessages[i].response || '';
    
    for (const pattern of subjectPatterns) {
      const match = msg.match(pattern);
      if (match) {
        lastSubject = match[1] || match[0];
        break;
      }
    }
    
    if (lastSubject) break;
  }
  
  // Enrichir la requête actuelle
  let processedQuery = currentMessage.toLowerCase();
  
  // Remplacer les références contextuelles
  Object.entries(contextualReferences).forEach(([ref, replacement]) => {
    if (processedQuery.includes(ref)) {
      if (ref === "ça" || ref === "cela" || ref === "ceci") {
        // Remplacer par le dernier sujet si disponible
        if (lastSubject) {
          enrichedQuery = enrichedQuery.replace(new RegExp(ref, 'gi'), lastSubject);
        }
      } else if (replacement) {
        // Ajouter le contexte
        enrichedQuery += ` ${replacement}`;
      }
    }
  });
  
  // Si la requête parle de prix/coût et qu'on a un sujet récent
  if ((processedQuery.includes("combien") || processedQuery.includes("prix") || 
       processedQuery.includes("coût") || processedQuery.includes("scolarité")) && lastSubject) {
    enrichedQuery += ` ${lastSubject}`;
  }
  
  console.log(`🔍 Requête enrichie: "${currentMessage}" → "${enrichedQuery}"`);
  return enrichedQuery;
};

/**
 * Détecter l'intention précise de l'utilisateur
 */
export const detectPreciseIntent = (message, context) => {
  const intents = {
    PRICE_INQUIRY: {
      patterns: [/combien/i, /prix/i, /coût/i, /tarif/i, /scolarité/i, /frais/i],
      contextNeeded: true
    },
    ENROLLMENT: {
      patterns: [/inscrire/i, /inscription/i, /candidater/i, /postuler/i],
      contextNeeded: false
    },
    PROGRAM_INFO: {
      patterns: [/programme/i, /formation/i, /filière/i, /cursus/i, /informatique/i, /licence/i, /master/i],
      contextNeeded: false
    },
    CLARIFICATION: {
      patterns: [/donne.*moi/i, /dis.*moi/i, /explique/i, /précise/i],
      contextNeeded: true
    },
    FRUSTRATION: {
      patterns: [/j'ai demandé/i, /je parle de/i, /pas ça/i, /m'intéresse pas/i],
      contextNeeded: true
    }
  };
  
  let detectedIntents = [];
  
  Object.entries(intents).forEach(([intentName, config]) => {
    const matches = config.patterns.some(pattern => pattern.test(message));
    if (matches) {
      detectedIntents.push({
        name: intentName,
        needsContext: config.contextNeeded
      });
    }
  });
  
  return detectedIntents;
};

/**
 * Générer des instructions spécifiques selon l'intention
 */
export const generateIntentInstructions = (intents, lastSubject) => {
  let instructions = "";
  
  intents.forEach(intent => {
    switch(intent.name) {
      case 'PRICE_INQUIRY':
        instructions += `\nL'utilisateur demande un PRIX. Donne le montant EXACT sans tourner autour du pot.`;
        if (lastSubject) {
          instructions += ` Il parle de: ${lastSubject}.`;
        }
        break;
        
      case 'FRUSTRATION':
        instructions += `\n⚠️ L'utilisateur est FRUSTRÉ. Réponds DIRECTEMENT à sa demande sans répéter ce qui a déjà été dit.`;
        break;
        
      case 'CLARIFICATION':
        instructions += `\nL'utilisateur demande des PRÉCISIONS. Sois CONCRET et SPÉCIFIQUE.`;
        break;
    }
  });
  
  return instructions;
};

/**
 * Valider la cohérence de la réponse
 */
export const validateResponseCoherence = (response, query, context) => {
  const issues = [];
  
  // Vérifier si on répond bien à une demande de prix
  if (query.toLowerCase().includes("combien") || query.toLowerCase().includes("prix")) {
    if (!response.match(/\d+[\s.]?\d*\s*(fcfa|f|cfa)/i)) {
      issues.push("Prix non mentionné alors qu'il était demandé");
    }
  }
  
  // Vérifier qu'on ne répète pas ce qui a déjà été dit
  const lastResponses = context.recentHistory
    .filter(msg => msg.role === 'assistant')
    .slice(-2)
    .map(msg => msg.content);
    
  if (lastResponses.some(past => past && past.includes(response.substring(0, 50)))) {
    issues.push("Répétition détectée");
  }
  
  // Vérifier la longueur
  if (response.length > 400) {
    issues.push("Réponse trop longue");
  }
  
  return {
    isValid: issues.length === 0,
    issues: issues
  };
};