import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useMessage = defineStore(
  "message-scenario",
  () => {
    const content = ref("");

    // getter

    // action

    // data
    const updateContent = async (payload) => {
      content.value = payload;
    };

    const $reset = () => {
      content.value = "";
    };

    return {
      content,
      updateContent,
      $reset,
    };
  },
  {
    persist: true,
  }
);
