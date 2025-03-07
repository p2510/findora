<template>
  <section class="mt-14">
    <ScenarioNav />
    <section class="bg-dotted-pattern h-[75vh] grid grid-cols-12 relative">
      <div class="col-span-12 flex flex-col items-center absolute w-full pt-10">
        <!-- Déclencheur -->
        <div
          @click="openTrigger = true"
          class="rounded-2xl bg-slate-100 p-3 border-[1.7px] border-solid border-blue-600/20 hover:border-blue-600 hover:shadow-md transition duration-300 ease-in-out cursor-pointer"
        >
          <div class="rounded-2xl bg-white">
            <p class="text-slate-800 text-md p-2 bg-slate-200 rounded-t-2xl">
              Déclencheur
            </p>
            <p
              class="text-slate-800/80 text-sm px-2 py-4 bg-white rounded-b-2xl"
            >
              L'action qui déclenche le scénario. <br />
              Clique pour choisir
            </p>
          </div>
        </div>

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
    </section>
    <!--Add declencheur -->
    <UModal v-model="openTrigger" :ui="{ width: 'sm:max-w-3xl' }">
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
                class="text-sm text-left w-full gap-2 rounded-lg transition-all duration-200 ease-in-out py-3 pl-4 pr-10 text-slate-800 bg-blue-600/20 hover:bg-blue-600/40"
              >
                Lorsqu'un nouveau client est ajouté
              </button>
            </li>
            <li>
              <button
                class="text-sm text-left w-full gap-2 rounded-lg transition-all duration-200 ease-in-out py-3 pl-4 pr-10 text-slate-800 bg-blue-600/20 hover:bg-blue-600/40"
              >
                Si le client ajouté est un particulier
              </button>
            </li>
            <li>
              <button
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
                class="text-sm text-left w-full gap-2 rounded-lg transition-all duration-200 ease-in-out py-3 pl-4 pr-10 text-slate-800 bg-blue-600/20 hover:bg-blue-600/40"
              >
                Lorsqu'un nouveau paiement est ajouté
              </button>
            </li>
            <li>
              <button
                class="text-sm text-left w-full gap-2 rounded-lg transition-all duration-200 ease-in-out py-3 pl-4 pr-10 text-slate-800 bg-blue-600/20 hover:bg-blue-600/40"
              >
                Si le montant du paiement est supérieur à X
              </button>
            </li>
            <li>
              <button
                class="text-sm text-left w-full gap-2 rounded-lg transition-all duration-200 ease-in-out py-3 pl-4 pr-10 text-slate-800 bg-blue-600/20 hover:bg-blue-600/40"
              >
                Si le montant du paiement est inférieur à X
              </button>
            </li>
          </ul>
        </div>
      </UCard>
    </UModal>
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
const openTrigger = ref(false);
</script>
<style scoped>
.bg-dotted-pattern {
  background-image: radial-gradient(circle, #0f111415 1px, transparent 1px);
  background-size: 16px 16px; /* Taille de la grille */
  background-position: center;
}
</style>
