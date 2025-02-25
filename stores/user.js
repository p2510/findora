import { defineStore } from "pinia";
import { ref } from "vue";

export const useUser = defineStore(
  "user",
  () => {
    const info = ref({
      phone: null,
      name: null,
      email: null,
      domain: null,
      uuid: null,
    });

    const subscription = ref({
      subscription_type: null,
      start_at: null,
      is_partner: null,
    });

    const sms_backlogs = ref({
      count: null,
      application_id: null,
      client_id: null,
      client_secret: null,
      sender_name: null,
      valide_date: null,
      is_active: null,
    });

    // action
    const updateInfo = async (payload) => {
      info.value = { ...info.value, ...payload };
    };
    const updateSubscription = async (payload) => {
      subscription.value = { ...subscription.value, ...payload };
    };
    const updateSmsBacklogs = async (payload) => {
      sms_backlogs.value = { ...sms_backlogs.value, ...payload };
    };

    const $reset = () => {
      info.value = {
        phone: null,
        name: null,
        email: null,
        domain: null,
        uuid: null,
      };
      subscription.value = {
        subscription_type: null,
        start_at: null,
        is_partner: null,
      };
      sms_backlogs.value = {
        count: null,
        application_id: null,
        client_id: null,
        client_secret: null,
        sender_name: null,
        valide_date: null,
        is_active: null,
      };
    };

    return {
      info,
      subscription,
      sms_backlogs,
      updateInfo,
      updateSubscription,
      updateSmsBacklogs,
      $reset,
    };
  },
  {
    persist: true,
  }
);
