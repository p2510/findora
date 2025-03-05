<template>
  <div>
    <SkeletonDashboardPayment v-if="paymentStore.paymentCustomer == null" />
    <section class="grid grid-cols-12 items-center gap-6" v-else>
      <div class="col-span-6 lg:col-span-8">
        <h2 class="flex justify-between items-center w-full pb-4">
          <p class="text-slate-800 text-md lg:text-xl">Paiements à venir</p>
          <NuxtLink
            to="/paiement"
            class="text-slate-800/60 hover:text-slate-800/80 transition duration-300 ease-in-out text-md lg:text-xl"
            >Mes paiements</NuxtLink
          >
        </h2>

        <ul class="space-y-2 px-4">
          <SkeletonNotFound
            v-if="lastThreePayments.length == 0"
            title="Aucun paiement détecté"
            subtitle="actuellement"
            label-btn=" Créer un nouveau paiement"
            to="/paiement"
            custom-css="text-2xl"
          />
          <li v-else>
            <div
              v-for="payment in lastThreePayments"
              :key="payment.id"
              class="flex justify-between p-2 rounded-md bg-white shadow-md hover:bg-white hover:shadow-md transition duration-300 ease-in-out"
            >
              <div class="flex gap-2 items-center">
                <img
                  :src="
                    'https://ui-avatars.com/api/?name=' +
                    payment.customers.name +
                    '&background=f1f5f9&color=1e293b'
                  "
                  class="w-8 h-8 lg:w-12 lg:h-12 rounded-lg"
                />
                <p class="flex flex-col">
                  <span class="text-sm lg:text-md">{{
                    payment.customers.name
                  }}</span>
                  <span class="text-xs lg:text-sm text-slate-800/60"
                    >+225 {{ payment.customers.phone }}</span
                  >
                </p>
              </div>
              <div class="flex items-center gap-2">
                <span
                  class="text-slate-950 px-3 py-2 rounded-md bg-slate-800/5 text-sm lg:text-md font-semibold"
                  >{{
                    payment.amount.toLocaleString("fr-FR", {
                      style: "currency",
                      currency: user.info.currency,
                    })
                  }}
                  </span
                >
                <NuxtLink
                  to="/paiement"
                  class="cursor-pointer text-white p-3 flex items-center justify-center rounded-md bg-[#f3c775] text-md font-semibold hover:bg-opacity-80 transition ease-in-out duration-300"
                  ><UIcon name="i-heroicons-arrow-up-right"
                /></NuxtLink>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <div class="col-span-6 lg:col-span-4">
        <div
          class="rounded-lg p-3 bg-gradient-to-br from-slate-800/5 to-slate-800/10 space-y-2"
        >
          <p class="text- lg:text-md text-slate-950 pb-3 font-semibold">
            Mon abonnement
          </p>
          <div>
            <div class="space-y-2">
              <div
                v-if="user.subscription.is_partner"
                class="flex items-center justify-between bg-white p-2 rounded-md"
              >
                <p class="flex flex-col">
                  <span class="text-slate-950">Partenaire Officiel </span>
                  <span class="text-slate-600 text-sm"
                    >Exempt des frais d'abonnement mensuel</span
                  >
                </p>
              </div>
              <div class="space-y-2" v-else>
                <div
                  class="flex items-center justify-between bg-white p-2 rounded-md"
                >
                  <p class="flex flex-col">
                    <span class="text-slate-950">Valide </span>
                    <span class="text-slate-600 text-sm"
                      >Jusqu'au
                      {{
                        calculateDatePlus30(user.subscription.start_at)
                      }}</span
                    >
                  </p>
                  <NuxtLink
                    v-if="subscriptionExpired(user.subscription.start_at)"
                    to="/abonnement"
                    class="text-white bg-slate-950/70 hover:bg-slate-950 hover:shadow-sm transition duration-300 ease-in-out p-2 rounded-md text-sm"
                    >Renouvellement</NuxtLink
                  >
                </div>
                <div
                  class="flex items-center justify-between bg-white p-2 rounded-md"
                >
                  <p class="flex flex-col">
                    <span class="text-slate-950">Abonnement</span>
                    <span class="text-slate-600 text-sm">{{
                      user.subscription.subscription_type
                    }}</span>
                  </p>
                  <NuxtLink
                    v-if="user.subscription.subscription_type == 'free'"
                    to="/abonnement"
                    class="text-slate-950 bg-[#f3c775]/70 hover:bg-[#f3c775] hover:shadow-sm transition duration-300 ease-in-out p-2 rounded-md text-sm"
                    >Passer à l'ultra</NuxtLink
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { formatDate } from "@/utils/shared/format";
import { useUser } from "@/stores/user";
import { usePayment } from "@/stores/payment";
const user = useUser();
const paymentStore = usePayment();
const lastThreePayments = computed(() => {
  const filteredPayments = Array.isArray(paymentStore.paymentCustomer)
    ? paymentStore.paymentCustomer.filter(
        (item) => new Date(item.payment_date) > new Date()
      )
    : [];

  return filteredPayments.slice(-3);
});

// stat subscription

function calculateDatePlus30(startDate) {
  // Convertir la date d'entrée en objet Date
  const date = new Date(startDate);

  // Ajouter 30 jours à la date
  date.setDate(date.getDate() + 30);

  // Retourner la date au format lisible (ex : "31 janvier 2025")
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function subscriptionExpired(startDate) {
  const date = new Date(startDate);
  date.setDate(date.getDate() + 30);
  return date <= new Date();
}

onMounted(async () => {
  if (paymentStore.paymentCustomer == null) {
    paymentStore.updatePaymentCustomer();
  }
});
</script>
