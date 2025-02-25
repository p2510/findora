import { defineStore } from "pinia";
import { ref } from "vue";

export const useTemplate = defineStore(
  "template",
  () => {
    const supabase = useSupabaseClient();
    const template_predicated = ref(null);
    const template_sms = ref(null);

    // getter

    // action

    // fetching data
    const fetchTemplateSms = async () => {
      const { data, error } = await supabase.from("templates").select("*");
      if (data) {
        template_sms.value = data;
      }
    };

    // reset
    const $reset = () => {
      template_predicated.value = null;
      template_sms.value = null;
    };

    return {
      template_predicated,
      template_sms,
      fetchTemplateSms,
      $reset,
    };
  },
  {
    persist: true,
  }
);
