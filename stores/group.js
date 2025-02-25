import { defineStore } from "pinia";
import { ref } from "vue";

export const useGroup = defineStore(
  "reminder",
  () => {
    const supabase = useSupabaseClient();
    const list_group = ref(null);

    // getter

    // action

    // fetching data
    const fetchGroups = async () => {};

    // reset
    const $reset = () => {
      list_group.value = null;
    };

    return {
      list_group,
      fetchGroups,
      $reset,
    };
  },
  {
    persist: true,
  }
);
