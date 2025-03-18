import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useParams = defineStore(
  "params",
  () => {
    const paramsCustomer = ref({
      created_at: {
        condition: null,
        value: null,
      },
      is_entreprise: {
        condition: null,
        value: null,
      },
      is_particular: {
        condition: null,
        value: null,
      },
    });

    // getter

    // action
    const updateParamsCustomer = (payload) => {
      paramsCustomer.value = { ...paramsCustomer.value, ...payload };
    };

    // data

    // params

    const $reset = () => {
      paramsCustomer.value = {
        created_at: {
          condition: null,
          value: null,
        },
        is_entreprise: {
          condition: null,
          value: null,
        },
        is_particular: {
          condition: null,
          value: null,
        },
      };
    };

    return {
      updateParamsCustomer,
      paramsCustomer,
      $reset,
    };
  },
  {
    persist: true,
  }
);
