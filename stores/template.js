import { defineStore } from "pinia";
import { ref } from "vue";

export const useTemplate = defineStore(
  "template",
  () => {
    const supabase = useSupabaseClient();
    const template_predicated = ref(null);
    const template = ref(null);

    // getter

    // action

    // fetching data
    const fetchTemplate= async () => {
      const { data, error } = await supabase.from("templates").select("*");
      if (data) {
        template.value = data;
      }
    };

    // reset
    const $reset = () => {
      template_predicated.value = null;
      template.value = null;
    };

    return {
      template_predicated,
      template,
      fetchTemplate,
      $reset,
    };
  },
  {
    persist: true,
  }
);
