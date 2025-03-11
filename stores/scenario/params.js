import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useParams = defineStore(
  "params",
  () => {
    const paramsCustomer1 = ref({
      created_at: {
        condition: null,
        value: null,
      },
      phone_is: {
        condition: null,
        value: null,
      },
    });

    // getter

    // action
    const updateParamsCustomer1 = (payload) => {
      paramsCustomer1.value = { ...paramsCustomer1.value, ...payload };
    };

    // data

    // params

    const $reset = () => {
      paramsCustomer1.value = {
        created_at: {
          condition: null,
          value: null,
        },
        phone_is: {
          condition: null,
          value: null,
        },
      };
    };

    return {
      updateParamsCustomer1,
      paramsCustomer1,
      $reset,
    };
  },
  {
    persist: true,
  }
);
