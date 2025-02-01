<template>
  <section
    class="flex justify-between items-center gap-3 w-full bg-slate-900 p-2 rounded-lg shadow-md"
  >
    <div class="hidden  2xl:block 2xl:basis-1/4 w-full">
      <h3 class="text-white text-3xl">Vos paiements</h3>
      <span class="text-slate-300 text-sm"
        >Suivez les paiements de vos différents clients</span
      >
    </div>
    <div class="2xl:basis-3/4 w-full flex justify-between gap-6 items-center">
      <div class="flex items-center gap-4">
        <span
          class="p-2 bg-white/20 rounded-full flex items-center justify-center"
        >
          <UIcon
            name="i-heroicons-square-3-stack-3d"
            class="w-6 h-6 text-white"
          />
        </span>
        <div class="flex flex-col justify-center">
          <p class="flex justify-between text-md">
            <SkeletonText v-if="payments ==null" />
            <span class="text-white" v-else>{{
              totalPayments.toLocaleString("fr-FR")
            }}</span>
            <span class="font-semibold text-slate-500">F</span>
          </p>
          <p class="flex justify-between gap-4 text-xs">
            <span class="text-white">Tous les paiements</span>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <span
          class="p-2 bg-white/20 rounded-full flex items-center justify-center"
        >
          <UIcon
            name="i-heroicons-cloud-arrow-down"
            class="w-6 h-6 text-white"
          />
        </span>
        <div class="flex flex-col justify-center">
          <p class="flex justify-between text-md">
            <SkeletonText v-if="payments ==null" />

            <span class="text-white" v-else>{{
              totalDue.toLocaleString("fr-FR")
            }}</span>
            <span class="font-semibold text-slate-500">F</span>
          </p>
          <p class="flex justify-between gap-4 text-xs">
            <span class="text-white">Paiement échu</span>
            <span
              :class="{
                'text-lime-500': (totalDue * 100) / totalPayments < 25,
                'text-yellow-500':
                  (totalDue * 100) / totalPayments < 70 &&
                  (totalDue * 100) / totalPayments >= 25,
                'text-red-500': (totalDue * 100) / totalPayments >= 70,
              }"
              >{{ ((totalDue * 100) / totalPayments).toFixed(2) }}%</span
            >
          </p>
        </div>
      </div>
      <div class="flex items-center gap-4">
        <span
          class="p-2 bg-white/20 rounded-full flex items-center justify-center"
        >
          <UIcon name="i-heroicons-cloud-arrow-up" class="w-6 h-6 text-white" />
        </span>
        <div class="flex flex-col justify-center">
          <p class="flex justify-between text-md">
            <SkeletonText v-if="payments ==null" />

            <span class="text-white" v-else>{{
              totalPaid.toLocaleString("fr-FR")
            }}</span>
            <span class="font-semibold text-slate-500">F</span>
          </p>
          <p class="flex justify-between gap-4 text-xs">
            <span class="text-white">Paiement non-échu</span>
            <span
              :class="{
                'text-red-500': (totalPaid * 100) / totalPayments < 25,
                'text-yellow-500':
                  (totalPaid * 100) / totalPayments < 70 &&
                  (totalPaid * 100) / totalPayments >= 25,
                'text-lime-500': (totalPaid * 100) / totalPayments >= 70,
              }"
              >{{ ((totalPaid * 100) / totalPayments).toFixed(2) }}%</span
            >
          </p>
        </div>
      </div>
      <div class="hidden xl:flex items-center gap-4">
        <span
          class="p-2 bg-white/20 rounded-full flex items-center justify-center"
        >
          <UIcon
            name="i-heroicons-currency-dollar"
            class="w-6 h-6 text-white"
          />
        </span>
        <div class="flex flex-col justify-center">
          <p class="flex justify-between text-md">
            <SkeletonText v-if="payments ==null" />

            <span class="text-white" v-else>{{
              totalValidated.toLocaleString("fr-FR")
            }}</span>
            <span class="font-semibold text-slate-500">F</span>
          </p>
          <p class="flex justify-between gap-4 text-xs">
            <span class="text-white">Paiement validé</span>
            <span
              :class="{
                'text-red-500': (totalValidated * 100) / totalPayments < 25,
                'text-yellow-500':
                  (totalValidated * 100) / totalPayments < 70 &&
                  (totalValidated * 100) / totalPayments >= 25,
                'text-lime-500': (totalValidated * 100) / totalPayments >= 70,
              }"
              >{{ ((totalValidated * 100) / totalPayments).toFixed(2) }}%</span
            >
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
const supabase = useSupabaseClient();

let totalPayments = ref(0);
let totalPaid = ref(0);
let PercentagetotalPaid = ref(0);
let totalDue = ref(0);
let totalValidated = ref(0);
let payments = ref(null);
const fetchPayments = async () => {
  const { data, error } = await supabase.from("payments").select("*");
  if (error) {
  } else {
    payments.value = data || [];
    totalPayments.value = payments.value.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );
    totalPaid.value = payments.value
      .filter((payment) => new Date(payment.payment_date) > new Date())
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    totalDue.value = payments.value
      .filter((payment) => new Date(payment.payment_date) <= new Date())
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    totalValidated.value = payments.value
      .filter((payment) => payment.status === "payé")
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
  }
};

onMounted(() => {
  fetchPayments();
});
</script>
