<template>
  <section class="flex justify-between items-center gap-3 w-full p-2">
    <div class="basis-1/2 flex gap-4 items-center">
      <NuxtLink
        to="/paiement"
        class="flex justify-around gap-2 py-3 pl-4 pr-10 text-white hover:bg-slate-800 rounded-full bg-slate-950 transition duration-300 ease-in-out hover:shadow-md"
      >
        <UIcon name="i-heroicons-credit-card" class="w-5 h-5" />
        <span>Vos paiements</span></NuxtLink
      >
      <NuxtLink
        to="/client"
        class="flex justify-around gap-2 py-3 pl-4 pr-10 text-white hover:bg-[#5e4414] rounded-full bg-[#a37520] transition duration-300 ease-in-out hover:shadow-md"
      >
        <UIcon name="i-heroicons-user" class="w-5 h-5" />
        <span>Vos clients</span></NuxtLink
      >
    </div>
    <div class="basis-1/2 items-center grid grid-cols-12 gap-4">
      <div class="col-span-4 text-black"></div>
      <div class="col-span-4 border-b-2 border-yellow-700">
        <p class="text-sm text-slate-600">Relance en cours</p>
        <p class="text-3xl">{{ total - isPaste.length }}</p>
      </div>
      <div class="col-span-4 border-b-2 border-emerald-700">
        <p class="text-sm text-slate-600">Relance terminée</p>
        <p class="text-3xl">{{ isPaste.length }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
const supabase = useSupabaseClient();
const reminders = ref([]);
const total = ref(0);
let isPaste = computed(() => {
  return reminders.value.filter((reminder) => {
    return reminder?.send_date && new Date(reminder.send_date) < new Date();
  });
});
onMounted(async () => {
  const { data, error, count } = await supabase
    .from("reminders")
    .select("*", { count: "exact" });
  reminders.value = data;
  total.value = count;
});
</script>

<style scoped></style>
