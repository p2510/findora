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

        <!-- Action/Message -->
        <ScenarioAction />
      </div>
      <div class="col-span-4 pt-20">
        <ScenarioParams />
      </div>
      <div class="col-span-full flex justify-center items-center">
        <button
          v-if="triggerStore.triggerSelected && messageStore.content.length > 0"
          @click="handle"
          class="text-white bg-blue-600 hover:bg-blue-600/70 rounded-md shadow-md text-md py-3 px-5 transition-all duration-300 ease-in-out"
        >
    
          Créer ce scénario
        </button>
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
import { useParams } from "@/stores/scenario/params";
import { useMessage } from "@/stores/scenario/message";
const triggerStore = useTrigger();
const paramsStore = useParams();
const messageStore = useMessage();
let handle=()=>{
  console.log(triggerStore.data.id)
  console.log(triggerStore.triggerSelected)
  console.log(messageStore.content)
  console.log(paramsStore.paramsCustomer)

}
</script>
<style scoped>
.bg-dotted-pattern {
  background-image: radial-gradient(circle, #0f111415 1px, transparent 1px);
  background-size: 16px 16px; /* Taille de la grille */
  background-position: center;
}
</style>
