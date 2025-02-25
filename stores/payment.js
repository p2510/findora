import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const usePayment = defineStore(
  "payment",
  () => {
    const supabase = useSupabaseClient();
    const payments = ref(null);
    const paymentCustomer = ref(null);

    // getter

    // action
    const updatePaymentCustomer = async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(
          `
        id,created_at,amount,payment_date,status,date_of_issue,
        customers(
          id,name,phone,email,customer_type
        )
      `
        )
        .order("created_at", { ascending: false });
      if (error) {
      } else {
        paymentCustomer.value = data;
      }
    };
    const updatePayments = async () => {
      const { data, error } = await supabase.from("payments").select("*");
      if (data) {
        payments.value = data;
      }
    };

    // fetching data
    const fetchPayments = async () => {
      if (payments.value == null) {
        const { data, error } = await supabase.from("payments").select("*");
        if (data) {
          payments.value = data;
        }
      }
    };

    // reset
    const $reset = () => {
      paymentCustomer.value = null;
      payments.value = null;
    };

    return {
      payments,
      paymentCustomer,
      fetchPayments,
      updatePayments,
      updatePaymentCustomer,
      $reset,
    };
  },
  {
    persist: true,
  }
);
