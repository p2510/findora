import { defineStore } from "pinia";
import { ref } from "vue";

export const useCustomer = defineStore(
  "customer",
  () => {
    const supabase = useSupabaseClient();
    const customerParticular = ref(null);
    const groups = ref(null);
    const groupCount = ref(null);
    const customer = ref(null);

    // getter

    // action
    const updateGroup = async () => {
      const { data, error } = await supabase.from("groups").select("*");
      if (data) {
        groups.value = data;
        groupCount.value = data.length;
      }
    };
    const updatecustomers = async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });
      if (data) {
        customer.value = data;
      }
    };
    const decrementcustomerParticular = (payload) => {
      if (customerParticular.value > 0 && payload == "Particulier") {
        customerParticular.value--;
      }
    };
    const incrementcustomerParticular = (payload) => {
      if (!payload) {
        customerParticular.value++;
      }
    };
    const mixcustomerParticular = (payload) => {
      if (!payload) {
        customerParticular.value++;
      } else {
        customerParticular.value--;
      }
    };

    // fetching data
    const fetchCustomers = async () => {
      if (customerParticular.value == null) {
        const { data: particulierData, error: particulierError } =
          await supabase
            .from("customers")
            .select("*", { count: "exact" })
            .eq("customer_type", "Particulier");
        if (particulierData) {
          customerParticular.value = particulierData.length;
        }
      }
    };
    const fetchGroups = async () => {
      if (groups.value == null) {
        const { data, error } = await supabase.from("groups").select("*");
        if (data) {
          groups.value = data;
          groupCount.value = data.length;
        }
      }
    };
    // reset
    const $reset = () => {
      customerParticular.value = null;
      groups.value = null;
      groupCount.value = null;
      customer.value = null;
    };

    return {
      customerParticular,
      groups,
      customer,
      groupCount,
      fetchCustomers,
      fetchGroups,
      decrementcustomerParticular,
      incrementcustomerParticular,
      mixcustomerParticular,
      updateGroup,
      updatecustomers,
      $reset,
    };
  },
  {
    persist: true,
  }
);
