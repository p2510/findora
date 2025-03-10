<template>
  <div>
    <div
      @click="isOpen = true"
      class="rounded-2xl bg-slate-100 p-3 border-[1.7px] border-solid border-blue-600/20 hover:border-blue-600 hover:shadow-md transition duration-300 ease-in-out cursor-pointer"
    >
      <div class="rounded-2xl bg-white">
        <p class="text-slate-800 text-md p-2 bg-slate-200 rounded-t-2xl">
          Déclencheur
        </p>
        <div
          class="flex justify-center flex-col items-center text-slate-800/80 text-sm px-2 py-4 bg-white rounded-b-2xl space-y-2"
          v-if="triggerStore.triggerSelected"
        >
          <p>Vous avez choisi un déclencheur.</p>
          <p clas="flex justify-center text-center bg-red-500 w-full">
            <span class="bg-blue-100 rounded-xl py-2 px-3">{{
              triggerStore.triggerName
            }}</span>
          </p>
        </div>
        <p
          class="text-slate-800/80 text-sm px-2 py-4 bg-white rounded-b-2xl"
          v-else
        >
          L'action qui déclenche le scénario. <br />
          Clique pour choisir
        </p>
      </div>
    </div>
    <!--Add declencheur -->
    <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-3xl' }">
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800  ',
        }"
      >
        <template #header>
          <div class="space-y-[1px]">
            <h5>
              <UBadge color="gray" variant="soft" size="lg">Déclencheur</UBadge>
            </h5>
            <span class="text-gray-500 text-sm">
              Sélectionnez l'événement qui déclenchera le scénario.
            </span>
          </div>
        </template>

        <div class="grid grid-cols-12 gap-4">
          <ul class="col-span-6 space-y-2">
            <li class="text-sm text-neutral-700/70 flex gap-2 items-center">
              <UIcon name="i-heroicons-users" class="h-5 w-5" />
              <span class="font-semibold">Client</span>
            </li>

            <li>
              <button
                @click="newTrigger(1, 'customer')"
                class="text-sm text-left w-full gap-2 rounded-lg transition-all duration-200 ease-in-out py-3 pl-4 pr-10 text-slate-800 bg-blue-600/20 hover:bg-blue-600/40"
              >
                Lorsqu'un nouveau client est ajouté
              </button>
            </li>
            <li>
              <button
                @click="newTrigger(2, 'customer')"
                class="text-sm text-left w-full gap-2 rounded-lg transition-all duration-200 ease-in-out py-3 pl-4 pr-10 text-slate-800 bg-blue-600/20 hover:bg-blue-600/40"
              >
                Si le client ajouté est un particulier
              </button>
            </li>
            <li>
              <button
                @click="newTrigger(3, 'customer')"
                class="text-sm text-left w-full gap-2 rounded-lg transition-all duration-200 ease-in-out py-3 pl-4 pr-10 text-slate-800 bg-blue-600/20 hover:bg-blue-600/40"
              >
                Si le client ajouté est une entreprise
              </button>
            </li>
          </ul>
          <ul class="col-span-6 space-y-2">
            <li class="text-sm text-neutral-700/70 flex gap-2 items-center">
              <UIcon name="i-heroicons-credit-card" class="h-5 w-5" />
              <span class="font-semibold">Paiement</span>
            </li>

            <li>
              <button
                @click="newTrigger(4, 'payment')"
                class="text-sm text-left w-full gap-2 rounded-lg transition-all duration-200 ease-in-out py-3 pl-4 pr-10 text-slate-800 bg-blue-600/20 hover:bg-blue-600/40"
              >
                Lorsqu'un nouveau paiement est ajouté
              </button>
            </li>
            <li>
              <button
                @click="newTrigger(5, 'payment')"
                class="text-sm text-left w-full gap-2 rounded-lg transition-all duration-200 ease-in-out py-3 pl-4 pr-10 text-slate-800 bg-blue-600/20 hover:bg-blue-600/40"
              >
                Si le montant du paiement est supérieur à X
              </button>
            </li>
            <li>
              <button
                @click="newTrigger(6, 'payment')"
                class="text-sm text-left w-full gap-2 rounded-lg transition-all duration-200 ease-in-out py-3 pl-4 pr-10 text-slate-800 bg-blue-600/20 hover:bg-blue-600/40"
              >
                Si le montant du paiement est inférieur à X
              </button>
            </li>
          </ul>
        </div>
      </UCard>
    </UModal>
  </div>
</template>
<script setup>
import { useTrigger } from "@/stores/scenario/trigger";
const triggerStore = useTrigger();
const isOpen = ref(false);
const newTrigger = (id, on) => {
  triggerStore.updateData({ id: id, on: on });
  triggerStore.showParams();
  isOpen.value = false;
};
</script>
