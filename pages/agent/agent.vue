<template>
  <section class="mt-14">
    <AgentNav />
    <div class="space-y-8 flex justify-center pt-10">
      <div class="2xl:max-w-7xl basis-2/3">
        <h3 class="text-start text-xl pt-3 pb-6 dark:text-white">
          payez à l'utilisation
        </h3>
        <p class="text-sm text-start text-slate-700 dark:text-slate-300">
          Crédit actuel
        </p>
        <p class="text-3xl text-slate-800 dark:text-white pb-4">
          {{ userStore.subscription.max_limit }}
        </p>
        <p class="mb-6">
          <a
            target="_blank"
            href="https://wa.me/2250160485654"
            class="text-slate-800 dark:text-white bg-slate-200 dark:bg-slate-700 rounded-lg py-2 px-4 text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition duration-300 ease-in-out"
          >
            Acheter plus de crédit
          </a>
        </p>
        <div
          class="border-[1.3px] border-slate-200 dark:border-slate-600 rounded-lg p-3"
        >
          <UAlert
            color="warning"
            variant="soft"
            title="Facturation par conversation"
            description="Chaque conversation est facturée par un crédit, quel que soit le nombre de messages échangés. Le coût d'un crédit est de 200 F CFA environ 0,35 $. Veuillez confirmer que l'adresse email utilisée pour l'achat est la même que celle associée à votre compte Findora."
            icon="i-lucide:credit-card"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useUser } from "@/stores/user";
const userStore = useUser();
definePageMeta({
  middleware: ["auth", "is-entreprise"],
  alias: "/agent",
});
useHead({
  title:
    "Déléguez vos conversations WhatsApp à l'IA et gagnez du temps pour votre équipe.",
});
</script>
