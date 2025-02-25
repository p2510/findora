import { defineStore } from "pinia";
import { ref } from "vue";

export const useReminder = defineStore(
  "reminder",
  () => {
    const supabase = useSupabaseClient();
    const reminders = ref(null);

    // getter

    // action
    const updateReminders = async () => {
      const { data, error } = await supabase
        .from("reminders")
        .select(
          `
          id,message,send_date,
          customers(
            id,name
          ),payments(
            amount
          )
        `
        )
        .eq("is_sent", false)
        .gt("send_date", new Date().toISOString())
        .order("send_date", { ascending: false });
      if (error) {
      } else {
        reminders.value = data;
      }
    };

    // fetching data
    const fetchReminders = async () => {
        
    };

    // reset
    const $reset = () => {
      reminders.value = null;
    };

    return {
      reminders,
      fetchReminders,
      updateReminders,
      $reset,
    };
  },
  {
    persist: true,
  }
);
