<template>
  <section class="grid grid-cols-12 gap-2">
    <div v-if="stat.count" class="col-span-6 lg:col-span-4 xl:col-span-4">
      <SkeletonCard v-if="stat.count.customerCount == null" />
      <div
        v-if="stat.count.customerCount !== null"
        class="cursor-pointer rounded-3xl px-5 py-3 space-y-2 bg-slate-950"
      >
        <p class="flex justify-between items-center text-sm text-white">
          <span>Mes clients</span>

          <button
            class="flex items-center justify-center rounded-full p-2 text-slate-800 bg-white"
          >
            <UIcon name="i-heroicons-arrow-up-right" />
          </button>
        </p>
        <div class="flex pt-3">
          <span class="text-white text-5xl">{{
            stat.count.customerCount?.toLocaleString("fr-FR")
          }}</span>
        </div>
        <div class="flex items-center text-white gap-2">
          <span class="text-md text-white font-semibold">Client</span>
          <span class="rounded-md w-2 h-2 bg-white"> </span>
          <span class="text-md text-white/70">
            {{ stat.count.currentMonthCount }} client(s) ce mois</span
          >
        </div>
      </div>
    </div>
    <div v-if="stat.count" class="col-span-6 lg:col-span-4 xl:col-span-4">
      <SkeletonCard v-if="paymentStore.payments == null" />
      <div
        v-if="paymentStore.payments !== null"
        class="relative cursor-pointer rounded-3xl px-5 py-3 space-y-2 bg-gradient-to-br from-slate-800/5 to-slate-800/10 overflow-hidden"
      >
        <div class="shine-effect"></div>
        <p class="flex justify-between items-center text-sm text-slate-950">
          <span>Chiffre d'affaire</span>

          <button
            class="flex items-center justify-center rounded-full p-2 text-slate-950 bg-slate-800/20"
          >
            <UIcon name="i-heroicons-arrow-up-right" />
          </button>
        </p>
        <div class="flex pt-3">
          <span class="text-slate-950 text-5xl">{{
            totalPayments.toLocaleString("fr-FR", {
              style: "currency",
              currency: userStore.info.currency,
            })
          }}</span>
        </div>
        <div class="flex items-center text-slate-950 gap-2">
          <span class="text-md text-slate-950 font-semibold">Pay</span>
          <span class="rounded-md w-2 h-2 bg-slate-950"></span>

          <span class="text-md text-slate-950/50" v-if="totalPayments != 0">
            {{ ((totalDue * 100) / totalPayments).toFixed(2) }}% paiement échu
          </span>
          <span class="text-md text-slate-950/50" v-else>0% paiement échu</span>
        </div>
      </div>
    </div>

    <div v-if="stat.count" class="col-span-6 lg:col-span-4 xl:col-span-4">
      <SkeletonCard v-if="stat.count.reminders == null" />
      <div
        v-if="stat.count.reminders !== null"
        class="cursor-pointer rounded-3xl px-5 py-3 space-y-2 bg-gradient-to-br from-slate-800/5 to-slate-800/10"
      >
        <p class="flex justify-between items-center text-sm text-slate-950">
          <span>Relance automitisé</span>

          <button
            class="flex items-center justify-center rounded-full p-2 text-slate-950 bg-slate-800/20"
          >
            <UIcon name="i-heroicons-arrow-up-right" />
          </button>
        </p>
        <div class="flex pt-3">
          <span class="text-slate-950 text-5xl">{{
            stat.count.reminders?.length
          }}</span>
        </div>
        <div class="flex items-center text-slate-950 gap-2">
          <span class="text-md text-slate-950 font-semibold">Tracking</span>
          <span class="rounded-md w-2 h-2 bg-slate-950"> </span>
          <span class="text-md text-slate-950/50">
            {{ isWaiting.length }} relance(s) en cours</span
          >
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { useStat } from "@/stores/stat";
import { formatAmount } from "@/utils/shared/format";
import { useUser } from "@/stores/user";
const userStore = useUser();
const stat = useStat();
import { usePayment } from "@/stores/payment";
const paymentStore = usePayment();
const totalPayments = computed(() =>
  Array.isArray(paymentStore.payments)
    ? paymentStore.payments.reduce(
        (sum, payment) => sum + (payment.amount || 0),
        0
      )
    : 0
);
const totalDue = computed(() =>
  Array.isArray(paymentStore.payments)
    ? paymentStore.payments
        .filter((payment) => new Date(payment.payment_date) <= new Date())
        .reduce((sum, payment) => sum + (payment.amount || 0), 0)
    : 0
);
let isWaiting = computed(() => {
  return Array.isArray(stat.count?.reminders) // Vérifie si c'est un tableau
    ? stat.count.reminders.filter((reminder) => !reminder?.is_sent)
    : []; // Retourne un tableau vide si null ou undefined
});

// fetch
onMounted(() => {
  stat.fetchCustomers();
  paymentStore.fetchPayments();
  stat.fetchReminders();
});
</script>

<style scoped>
/* Effet de lumière */
.shine-effect {
  content: "";
  position: absolute;
  top: 0;
  left: -150%;
  width: 150%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.6),
    transparent
  );
  animation: shine 2.5s infinite;
  pointer-events: none; /* Empêche l'effet d'interférer avec les clics */
}

@keyframes shine {
  from {
    left: -150%;
  }
  to {
    left: 150%;
  }
}
</style>
