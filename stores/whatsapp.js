import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useWhatsapp = defineStore(
  "whatsapp",
  () => {
    const supabase = useSupabaseClient();
    const whatsapp_backlogs = ref({
      chanel_id: null,
      expire_date: null,
      token: null,
      status: null,
      mode: null,
      authorize: null,
    });

    // getter
    const updateWhatsappBacklogs = async (payload) => {
      whatsapp_backlogs.value = { ...whatsapp_backlogs.value, ...payload };
    };
    // action
    const updateAuthorize = async () => {
      whatsapp_backlogs.value.authorize = true;
    };

    // fetching data
    const fetchWhatsapp = async () => {
      let { data: whatsappData, error: whatsappError } = await supabase
        .from("whatsapp_backlogs")
        .select("*")
        .single();
      if (whatsappData) {
        updateWhatsappBacklogs(whatsappData);
      }
    };

    // reset
    const $reset = () => {
      whatsapp_backlogs.value = null;
    };

    return {
      whatsapp_backlogs,
      updateWhatsappBacklogs,
      updateAuthorize,
      fetchWhatsapp,
      $reset,
    };
  },
  {
    persist: true,
  }
);
