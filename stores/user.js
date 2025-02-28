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

    // action
    const updateInfo = async (payload) => {
      info.value = { ...info.value, ...payload };
    };
    const updateSubscription = async (payload) => {
      subscription.value = { ...subscription.value, ...payload };
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
    };

    return {
      info,
      subscription,
      updateInfo,
      updateSubscription,
      $reset,
    };
  },
  {
    persist: true,
  }
);
