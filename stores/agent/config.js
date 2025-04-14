import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAgentConfig = defineStore(
  "agent-config",
  () => {
    const config = ref({
      name: null,
      personality: null,
      goal: null,
      status: null,
    });

    // getter

    // action

    // data
    const updateConfig = async (payload) => {
      config.value = payload;
    };
    const updateStatus = (newStatus) => {
      config.value.status = newStatus;
    };

    const $reset = () => {
      config.value = {
        name: null,
        personality: null,
        goal: null,
        status: null,
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