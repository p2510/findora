import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useTrigger = defineStore(
  "trigger",
  () => {
    const data = ref({
      id: null,
      on: null,
    });
    const params = ref({
      show: false,
    });

    // getter
    const triggerSelected = computed(() => {
      return data.value.id ? data.value.on : false;
    });
    const triggerName = computed(() => {
      switch (triggerSelected.value) {
        case "payment":
          return "Paiement";
          break;
        case "customer":
          return "Client";
          break;
        default:
          return "Autre";
      }
    });
    const triggerDescription = computed(() => {
      if (data.value.id == 1) return "Lorsqu'un nouveau client est ajouté";
      if (data.value.id == 2) return "Si le client ajouté est un particulier";
      if (data.value.id == 3) return " Si le client ajouté est une entreprise";
      if (data.value.id == 4) return " Lorsqu'un nouveau paiement est ajouté";
      if (data.value.id == 5)
        return "Si le montant du paiement est supérieur à ";
      if (data.value.id == 6)
        return "Si le montant du paiement est inférieur à ";
      if (data.value.id == null) return "";
    });
    // action
    // data
    const updateData = async (payload) => {
      data.value = { ...data.value, ...payload };
    };
    // params
    const showParams = () => {
      params.value.show = true;
    };
    const closeParams = () => {
      params.value.show = false;
    };

    const $reset = () => {
      data.value = {
        id: null,
        on: null,
      };
      params.value.show = false;
    };

    return {
      data,
      updateData,
      triggerSelected,
      triggerName,
      params,
      showParams,
      closeParams,
      triggerDescription,
      $reset,
    };
  },
  {
    persist: true,
  }
);
