import { defineStore } from "pinia";
import { ref } from "vue";

export const useStat = defineStore(
  "stat",
  () => {
    const supabase = useSupabaseClient();
    const count = ref({
      customerCount: null,
      currentMonthCount: null,
    });
    // getter

    // action
    const incrementCustomer = (incrementValue = 1) => {
      count.value.customerCount += incrementValue;
      count.value.currentMonthCount += incrementValue;
    };
    const decrementCustomer = () => {
      if (count.value.customerCount > 0) {
        count.value.customerCount--;
      }
      if (count.value.currentMonthCount > 0) {
        count.value.currentMonthCount--;
      }
    };

    const updateCustomerCount = (val) => {
      count.value.customerCount = val;
    };
    const updatecurrentMonthCount = (val) => {
      count.value.currentMonthCount = val;
    };

    // fetching data
    const fetchCustomers = async () => {
      try {
        if (count.value.customerCount == null) {
          const { data, error, count } = await supabase
            .from("customers")
            .select("*", { count: "exact" });

          if (error) throw error;
          updateCustomerCount(count);
        }

        if (count.value.currentMonthCount == null) {
          const currentDate = new Date();
          const startOfCurrentMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth(),
            1
          ).toISOString();
          const startOfNextMonth = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            1
          ).toISOString();

          const { count: currentMonth, error: currentMonthError } =
            await supabase
              .from("customers")
              .select("*", { count: "exact" })
              .gte("created_at", startOfCurrentMonth)
              .lt("created_at", startOfNextMonth);

          if (currentMonthError) throw currentMonthError;

          updatecurrentMonthCount(currentMonth); // Mise à jour du store
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des contacts:", error);
      }
    };

    // reset
    const $reset = () => {
      count.value = {
        customerCount: null,
        currentMonthCount: null,
      };
    };

    return {
      count,
      updateCustomerCount,
      updatecurrentMonthCount,
      incrementCustomer,
      decrementCustomer,
      fetchCustomers,
      $reset,
    };
  },
  {
    persist: true,
  }
);
