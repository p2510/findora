<template>
  <section class="flex justify-between items-center gap-3 w-full p-2">
    <div class="basis-1/2 flex gap-4 items-center">
      <NuxtLink
        to="/paiement"
        class=" text-xs lg:text-sm 2xl:text-md flex justify-around gap-2 py-3 pl-4 pr-10 text-white hover:bg-slate-800 rounded-full bg-slate-950 transition duration-300 ease-in-out hover:shadow-md"
      >
        <UIcon name="i-heroicons-credit-card" class="w-3 h-3  lg:w-5 lg:h-5" />
        <span>Vos paiements</span></NuxtLink
      >
      <NuxtLink
        to="/client"
        class="text-xs lg:text-sm 2xl:text-md flex justify-around gap-2 py-3 pl-4 pr-10 text-white hover:bg-[#5e4414] rounded-full bg-[#a37520] transition duration-300 ease-in-out hover:shadow-md"
      >
        <UIcon name="i-heroicons-user" class="w-3 h-3  lg:w-5 lg:h-5" />
        <span>Vos clients</span></NuxtLink
      >
    </div>
    <div class="basis-1/2 items-center grid grid-cols-12 gap-4"  v-if="stat.count.reminders !== null">
      <div class="col-span-4 text-black"></div>
      <div class="col-span-4 border-b-2 border-yellow-700">
        <p class="text-xs lg:text-sm   text-slate-600">Relance en cours</p>
        <p class="text-xl xl:text-3xl">{{ isWaiting.length }}</p>
      </div>
      <div class="col-span-4 border-b-2 border-emerald-700">
        <p class="text-xs lg:text-sm  text-slate-600">Relance terminée</p>
        <p class="text-xl xl:text-3xl">
          {{ stat.count.reminders?.length - isWaiting.length }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import {  computed } from "vue";
import { useStat } from "@/stores/stat";
const stat = useStat();
let isWaiting = computed(() => {
  return Array.isArray(stat.count?.reminders) // Vérifie si c'est un tableau
    ? stat.count.reminders.filter((reminder) => !reminder?.is_sent)
    : []; // Retourne un tableau vide si null ou undefined
});
</script>

<style scoped></style>
