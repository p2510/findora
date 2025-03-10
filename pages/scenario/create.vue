<template>
  <section class="mt-14">
    <ScenarioNav />
    <section class="bg-dotted-pattern h-[75vh] grid grid-cols-12 relative px-4">
      <div class="col-span-8 flex flex-col items-center w-full pt-20">
        <!-- Déclencheur -->
        <ScenarioTrigger />

        <!-- Ligne verticale entre Déclencheur et Action -->
        <svg class="h-32 w-1 relative" xmlns="http://www.w3.org/2000/svg">
          <!-- Ligne verticale -->
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke="#2563eb"
            stroke-width="2"
          />
          <!-- Cercle début -->
          <circle cx="50%" cy="0" r="4" fill="#2563eb" />
          <!-- Cercle fin -->
          <circle cx="50%" cy="100%" r="4" fill="#2563eb" />
        </svg>

        <!-- Action -->
        <div
          class="rounded-2xl bg-slate-100 p-3 border-[1.7px] border-solid border-blue-600/20 hover:border-blue-600 hover:shadow-md transition duration-300 ease-in-out cursor-pointer"
        >
          <div class="rounded-2xl bg-white">
            <p class="text-slate-800 text-md p-2 bg-slate-200 rounded-t-2xl">
              Action
            </p>
            <p
              class="text-slate-800/80 text-sm px-2 py-4 bg-white rounded-b-2xl"
            >
              Le résultat après déclenchement. <br />
              Clique pour choisir
            </p>
          </div>
        </div>
      </div>
      <div class="col-span-4 pt-20">
        <ScenarioParams />
      </div>
    </section>
  </section>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
  alias: "/scenario/creer-scenario",
});
useHead({
  title:
    "Findora scenario -  Créez vos scénarios de relance et laissez l'automatisation faire le reste ! ✨",
});
import { useTrigger } from "@/stores/scenario/trigger";
const triggerStore = useTrigger();
</script>
<style scoped>
.bg-dotted-pattern {
  background-image: radial-gradient(circle, #0f111415 1px, transparent 1px);
  background-size: 16px 16px; /* Taille de la grille */
  background-position: center;
}
</style>
