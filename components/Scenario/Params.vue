<template>
  <div>
    <transition name="slide-fade" mode="out-in">
      <div
        v-if="triggerStore.triggerSelected && triggerStore.params.show"
        class="pb-4 rounded-lg space-y-2 bg-white border-2 border-solid border-blue-600 hover:border-blue-600 hover:shadow-md transition duration-300 ease-in-out cursor-pointer"
      >
        <div>
          <p
            class="flex justify-between items-center text-slate-800 text-md p-2 bg-blue-100 rounded-t-lg"
          >
            <span> {{ triggerStore.triggerName }}</span>

            <UIcon
              name="i-heroicons-x-mark"
              class="w-4 h-4 text-slate-800 hover:opacity-70 transition duration-300 ease-in-out"
              @click="triggerStore.closeParams"
            />
          </p>
        </div>
        <section class="px-3 space-y-8">
          <div>
            <span class="text-sm text-slate-950">Déclencheur</span>
            <p
              class="p-2 border-[1.5px] border-blue-600/70 rounded-md text-sm bg-blue-50 text-slate-700"
            >
              {{ triggerStore.triggerDescription }}
            </p>
          </div>
          <form>
            <p class="text-sm text-slate-950">
              Paramètre <span class="text-slate-500">Optionnel</span>
            </p>
            <section>
              <ScenarioTriggerCustomer1 v-if="triggerStore.data.id === 1" />
            </section>
          </form>
        </section>
      </div>
      <div
        v-else-if="triggerStore.triggerSelected && !triggerStore.params.show"
        class="flex justify-end"
      >
        <button
          class="focus:outline-none cursor-pointer flex items-center bg-blue-600 hover:bg-blue-600/70 transition duration-300 ease-in-out p-2 rounded-full"
        >
          <UIcon
            name="i-heroicons-arrow-down-left"
            class="w-4 h-4 text-white"
            @click="show"
          />
        </button>
      </div>
    </transition>
  </div>
</template>
<script setup>
import { useTrigger } from "@/stores/scenario/trigger";
const triggerStore = useTrigger();
const show = () => {
  triggerStore.showParams();
};
</script>
<style scoped>
/* Transition de slide et de fade */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: transform 0.5s ease-out, opacity 0.5s ease-out;
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(
    -100%
  ); /* L'élément glisse du haut lors de son entrée */
  opacity: 0;
}

.slide-fade-enter-to {
  transform: translateY(0); /* L'élément glisse en position finale */
  opacity: 1;
}

.slide-fade-leave {
  transform: translateY(
    100%
  ); /* L'élément glisse vers le bas lors de sa sortie */
}
</style>
