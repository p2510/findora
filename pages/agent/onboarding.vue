<template>
  <section class="mt-14">
    <AgentNav />
    <div class="space-y-8 flex justify-center pt-10">
      <div class="2xl:max-w-7xl basis-2/3">
        <h3 class="text-start text-xl pt-3 pb-6">
          Payez seulement pour ce que vous utilisez
        </h3>
        <p class="text-sm text-start text-slate-700">Crédit actuel</p>
        <p class="text-3xl text-slate-800 pb-4">300</p>
        <p class="mb-6">
          <a
            target="_blank"
            href="https://wa.me/2250160485654"
            class="text-slate-800 bg-slate-200 rounded-lg py-2 px-4 text-sm hover:bg-slate-100 transition duration-300 ease-in-out"
          >
            Acheter du crédit
          </a>
        </p>
        <div class="border-[1.3px] border-slate-200 rounded-lg p-3">
          <UAlert
            color="warning"
            variant="soft"
            title="Facturation par conversation"
            description="Chaque conversation est facturée à un crédit, indépendamment du nombre de messages échangés. Le coût d’un crédit est de 75 F CFA, soit environ 0,13 $. Merci de confirmer que l’adresse email utilisée pour l’achat est identique à celle de votre compte Findora. "
            icon="i-lucide:credit-card"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  middleware:  ["auth","is-entreprise"],
  alias: "/agent",
});
useHead({
  title:
    "Findora Agent IA Whatsapp - Économisez des heures avec notre agent IA intelligent.",
});
</script>
