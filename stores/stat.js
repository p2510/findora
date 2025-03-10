import { defineStore } from "pinia";
import { ref } from "vue";

export const useStat = defineStore(
  "stat",
  () => {
    const supabase = useSupabaseClient();
    const count = ref({
      customerCount: null,
      currentMonthCount: null,
      payments: null,
      reminders: null,
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
    const decrementReminder = async () => {
      if (count.value.reminders.length > 0) {
        const { data, error } = await supabase.from("reminders").select("*");
        if (data) {
          updateReminders(data);
        }
      }
    };
    const updateCustomerCount = (val) => {
      count.value.customerCount = val;
    };
    const updatecurrentMonthCount = (val) => {
      count.value.currentMonthCount = val;
    };
    const updatePayments = (val) => {
      count.value.payments = val;
    };
    const updateReminders = (val) => {
      count.value.reminders = val;
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
        console.error("Erreur lors de la récupération des clients:", error);
      }
    };

    const fetchPayments = async () => {
      if (count.value.payments == null) {
        const { data, error } = await supabase
          .from("payments")
          .select("*")
          .order("payment_date", { ascending: false });
        if (error) {
        } else {
          updatePayments(data);
        }
      }
    };

    let fetchReminders = async () => {
      if (count.value.payments == null) {
        const { data, error } = await supabase.from("reminders").select("*");
        if (data) {
          updateReminders(data);
        }
      }
    };
    // reset
    const $reset = () => {
      count.value = {
        customerCount: null,
        currentMonthCount: null,
        payments: null,
        reminders: null,
      };
    };

    return {
      count,
      updateCustomerCount,
      updatecurrentMonthCount,
      updatePayments,
      updateReminders,
      incrementCustomer,
      decrementCustomer,
      decrementReminder,
      fetchCustomers,
      fetchPayments,
      fetchReminders,
      $reset,
    };
  },
  {
    persist: true,
  }
);
