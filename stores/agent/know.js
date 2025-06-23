// stores/agent/know.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAgentKnow = defineStore(
  "agent-know",
  () => {
    const knowledge = ref({
      metadata: [],
      has_embeddings: false,
      total_chunks: 0
    });

    // Action pour mettre à jour les connaissances
    const updateKnowledge = (payload) => {
      if (Array.isArray(payload)) {
        // Si c'est un tableau, c'est juste les metadata
        knowledge.value.metadata = payload;
      } else if (payload && typeof payload === 'object') {
        // Si c'est un objet, extraire les champs
        knowledge.value = {
          metadata: payload.metadata || [],
          has_embeddings: payload.has_embeddings || false,
          total_chunks: payload.total_chunks || 0
        };
      }
    };

    // Réinitialisation des connaissances
    const $reset = () => {
      knowledge.value = {
        metadata: [],
        has_embeddings: false,
        total_chunks: 0
      };
    };

    return {
      knowledge,
      updateKnowledge,
      $reset,
    };
  },
  {
    persist: true,
  }
);