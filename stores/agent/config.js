// stores/agent/config.js
import { defineStore } from "pinia";
import { ref } from "vue";

export const useAgentConfig = defineStore(
  "agent-config",
  () => {
    const config = ref({
      id: null,
      name: null,
      personality: null,
      goal: null,
      status: null,
      user_id: null,
      created_at: null,
      updated_at: null
    });

    // Action pour mettre à jour la configuration
    // Filtrer les données pour ne garder que les champs nécessaires
    const updateConfig = async (payload) => {
      if (!payload) {
        config.value = {
          id: null,
          name: null,
          personality: null,
          goal: null,
          status: null,
          user_id: null,
          created_at: null,
          updated_at: null
        };
        return;
      }

      // Extraire uniquement les champs nécessaires
      config.value = {
        id: payload.id || null,
        name: payload.name || null,
        personality: payload.personality || null,
        goal: payload.goal || null,
        status: payload.status !== undefined ? payload.status : null,
        user_id: payload.user_id || null,
        created_at: payload.created_at || null,
        updated_at: payload.updated_at || null
      };
    };

    // Action pour mettre à jour le statut
    const updateStatus = (newStatus) => {
      if (config.value) {
        config.value.status = newStatus;
      }
    };

    // Réinitialisation
    const $reset = () => {
      config.value = {
        id: null,
        name: null,
        personality: null,
        goal: null,
        status: null,
        user_id: null,
        created_at: null,
        updated_at: null
      };
    };

    return {
      config,
      updateConfig,
      updateStatus,
      $reset,
    };
  },
  {
    persist: true,
  }
);