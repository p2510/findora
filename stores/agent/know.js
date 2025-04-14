import { defineStore } from "pinia";
import { ref } from "vue";

export const useAgentKnow = defineStore(
  "agent-know",
  () => {
    const knowledge = ref({
      metadata: [],
    });

    // Action pour mettre à jour les connaissances
    const updateKnowledge = (payload) => {
      knowledge.value.metadata = payload;
    };

    // Réinitialisation des connaissances
    const $reset = () => {
      knowledge.value = {
        metadata: [],
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