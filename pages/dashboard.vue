<template>
  <div class="mt-14 space-y-4 pr-4">
    <div class="space-y-5 pb-2">
      <h2 class="text-4xl text-slate-950/80 tracking-tight">
        Heureux de vous revoir ,
        <span
          class="font-semibold underline underline-offset-8 text-[#dfb058]"
          >{{ userInfo?.name }}</span
        >
        !
      </h2>
      <p class="text-md w-3/4 text-slate-700">
        En Côte d'Ivoire, moins de
        <span class="font-semibold"> 5 % des clients et prospects </span> lisent
        leurs e-mails. Les relances par SMS permettent d'aller plus rapidement.
      </p>
    </div>
    <section class="grid grid-cols-12 gap-2">
      <SkeletonCard
        class="col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-3"
        v-if="customerCount == null"
      />
      <div
        v-else
        class="col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-3 cursor-pointer rounded-3xl px-5 py-3 space-y-2 bg-slate-950"
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
          <span class="text-white text-5xl">{{ customerCount }}</span>
        </div>
        <div class="flex items-center text-white gap-2">
          <span class="text-md text-white font-semibold">Client</span>
          <span class="rounded-md w-2 h-2 bg-white"> </span>
          <span class="text-md text-white/70">
            {{ currentMonthCount }} client(s) ce mois</span
          >
        </div>
      </div>
      <SkeletonCard
        class="col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-3"
        v-if="totalPayments == null"
      />
      <div
        v-else
        class="col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-3 cursor-pointer rounded-3xl px-5 py-3 space-y-2 bg-gradient-to-br from-slate-800/5 to-slate-800/10"
      >
        <p class="flex justify-between items-center text-sm text-slate-950">
          <span>Chiffre d'affaire</span>

          <button
            class="flex items-center justify-center rounded-full p-2 text-slate-950 bg-slate-800/20"
          >
            <UIcon name="i-heroicons-arrow-up-right" />
          </button>
        </p>
        <div class="flex pt-3">
          <span class="text-slate-950 text-5xl"
            >{{ formatAmount(totalPayments) }}
          </span>
        </div>
        <div class="flex items-center text-slate-950 gap-2">
          <span class="text-md text-slate-950 font-semibold">Pay</span>
          <span class="rounded-md w-2 h-2 bg-slate-950"> </span>

          <span class="text-md text-slate-950/50" v-if="totalPayments != 0">
            {{ ((totalDue * 100) / totalPayments).toFixed(2) }}% paiement
            échu</span
          >
          <span class="text-md text-slate-950/50" v-else>
            0% paiement échu</span
          >
        </div>
      </div>
      <SkeletonCard
        class="col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-3"
        v-if="payments == null"
      />
      <div
        v-else
        class="col-span-full lg:col-span-4 xl:col-span-4 2xl:col-span-3 cursor-pointer rounded-3xl px-5 py-3 space-y-2 bg-gradient-to-br from-slate-800/5 to-slate-800/10"
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
          <span class="text-slate-950 text-5xl">{{ reminders.length }}</span>
        </div>
        <div class="flex items-center text-slate-950 gap-2">
          <span class="text-md text-slate-950 font-semibold">Tracking</span>
          <span class="rounded-md w-2 h-2 bg-slate-950"> </span>
          <span class="text-md text-slate-950/50">
            {{ isWaiting.length }} relance(s) en cours</span
          >
        </div>
      </div>
      <SkeletonCard
        class="col-span-6 lg:col-span-4 xl:col-span-4 2xl:col-span-3"
        v-if="averagePayment == null"
      />
      <div
        v-else
        class="hidden lg:col-span-4 2xl:block 2xl:col-span-3 cursor-pointer rounded-3xl px-5 py-3 space-y-2 bg-gradient-to-br from-slate-800/5 to-slate-800/10"
      >
        <p class="flex justify-between items-center text-sm text-slate-950">
          <span>Temps moyen de paiement</span>

          <button
            class="flex items-center justify-center rounded-full p-2 text-slate-950 bg-slate-800/20"
          >
            <UIcon name="i-heroicons-arrow-up-right" />
          </button>
        </p>
        <div class="flex pt-3">
          <span class="text-slate-950 text-5xl">{{ averagePayment }} J</span>
        </div>
        <div class="flex items-center text-slate-950 gap-2">
          <span class="text-md text-slate-950 font-semibold">Indice</span>
          <span class="rounded-md w-2 h-2 bg-slate-950"> </span>
          <span class="text-md text-slate-950/50"> 10 derniers paiements</span>
        </div>
      </div>
    </section>
    <SkeletonDashboardPayment v-if="nextPayments == null" />
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
            v-if="nextPayments.length == 0"
            title="Aucun paiement détecté"
            subtitle="actuellement"
            label-btn=" Créer votre premier paiement"
            to="/paiement"
            custom-css="text-2xl"
          />
          <li v-else>
            <div
              v-for="payment in nextPayments"
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
                  >{{ payment.amount.toLocaleString("fr-FR") }} F</span
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
            <div
              v-for="subscription in subscriptions"
              :key="subscription.id"
              class="space-y-2"
            >
              <div
                v-if="subscription.is_partner"
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
                      {{ calculateDatePlus30(subscription.start_at) }}</span
                    >
                  </p>
                  <NuxtLink
                    v-if="subscriptionExpired(subscription.start_at)"
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
                      subscription.subscription_type
                    }}</span>
                  </p>
                  <NuxtLink
                    v-if="subscription.subscription_type == 'free'"
                    to="/abonnement"
                    class="text-slate-950 bg-[#f3c775]/70 hover:bg-[#f3c775] hover:shadow-sm transition duration-300 ease-in-out p-2 rounded-md text-sm"
                    >Passer aux premium</NuxtLink
                  >
                </div>
              </div>
            </div>
          </div>
          <div
            class="flex items-center justify-between bg-white p-2 rounded-md"
            v-if="subscriptions[0]?.is_partner"
          >
            <div class="flex flex-col">
              <span class="text-slate-950">SMS restant(s)</span>
              <span
                class="bg-slate-950/5 text-sm h-2 w-4 rounded-full animate-pulse"
                v-if="sms == null"
              ></span>

              <p class="text-slate-600 text-sm">
                <i class="not-italic">{{ sms }}</i>
                <span v-if="valideSms != null" class="not-italic text-xs">
                  <i v-if="new Date(valideSms) > new Date()" class="not-italic">
                    Valide jusqu'au {{ formatDate(valideSms) }}
                  </i>
                  <i v-else class="not-italic"> SMS gelé </i>
                </span>
              </p>
            </div>
            <NuxtLink
              v-if="sms == 0"
              to="/parametre#plus-de-sms"
              class="text-slate-950 bg-[#f3c775]/70 hover:bg-[#f3c775] hover:shadow-sm transition duration-300 ease-in-out p-2 rounded-md text-sm"
              >Acheter plus de SMS</NuxtLink
            >
            <NuxtLink
              v-else-if="new Date(valideSms) < new Date()"
              to="/parametre#plus-de-sms"
              class="text-slate-950 bg-[#f3c775]/70 hover:bg-[#f3c775] hover:shadow-sm transition duration-300 ease-in-out p-2 rounded-md text-sm"
              >Dégeler en achetant un pack</NuxtLink
            >
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
definePageMeta({
  middleware: "auth",
});
useHead({
  title: "Findora - Dashboard",
});

const supabase = useSupabaseClient();
const user = useSupabaseUser();
let userInfo = ref(null);
let customerCount = ref(null);
let currentMonthCount = ref(null);
let payments = ref(null);
let totalPayments = ref(null);
let totalDue = ref(0);
const reminders = ref([]);
let isWaiting = computed(() => {
  return reminders.value.filter((reminder) => {
    return !reminder?.is_sent;
  });
});
let averagePayment = ref(null);
let nextPayments = ref(null);
let subscriptions = ref([]);
let sms = ref(null);
let valideSms = ref(null);

// customer metric
const fetchCustomers = async () => {
  const { data, error, count } = await supabase
    .from("customers")
    .select("*", { count: "exact" });
  customerCount.value = count.toLocaleString("fr-FR");
  const currentDate = new Date();
  const startOfCurrentMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).toISOString();
  const startOfNextMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1
  ).toISOString();
  const { count: currentMonth, error: currentMonthError } = await supabase
    .from("customers")
    .select("*", { count: "exact" })
    .gte("created_at", startOfCurrentMonth)
    .lt("created_at", startOfNextMonth);
  currentMonthCount.value = currentMonth;
};
// payment metrics
const fetchPayments = async () => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .order("payment_date", { ascending: false });
  if (error) {
  } else {
    payments.value = data || [];
    totalPayments.value = payments.value.reduce(
      (sum, payment) => sum + (payment.amount || 0),
      0
    );
    totalDue.value = payments.value
      .filter((payment) => new Date(payment.payment_date) <= new Date())
      .reduce((sum, payment) => sum + (payment.amount || 0), 0);
    calculateAveragePaymentDelay(data);
  }
};
const formatAmount = (amount) => {
  if (amount < 500000) {
    return amount.toLocaleString("fr-FR"); // Afficher le montant exact
  } else if (amount >= 500000 && amount <= 999999) {
    return `${(amount / 1000).toFixed(0)}k`; // Afficher en "k"
  } else if (amount >= 1000000 && amount <= 999999999) {
    return `${(amount / 1000000).toFixed(2)}M`; // Afficher en "M"
  } else {
    return `${(amount / 1000000000).toFixed(2)}Md`; // Afficher en "Md"
  }
};
// reminders metrics
let fetchReminders = async () => {
  const { data, error, count } = await supabase.from("reminders").select("*");
  if (data) {
    reminders.value = data;
  }
};
// Average payment delay
const calculateAveragePaymentDelay = (data) => {
  if (!data || data.length === 0) {
    return null;
  }

  // Limiter aux 10 derniers paiements
  const last10Payments = data.slice(0, 10);

  // Calculer le délai de paiement pour chaque entrée valide
  const paymentDelays = last10Payments
    .filter((payment) => payment.payment_date && payment.date_of_issue) // Vérifier que les deux dates existent
    .map((payment) => {
      const paymentDate = new Date(payment.payment_date);
      const issueDate = new Date(payment.date_of_issue);

      // Calculer la différence en jours
      const delayInMilliseconds = paymentDate - issueDate;
      const delayInDays = delayInMilliseconds / (1000 * 60 * 60 * 24);
      return delayInDays;
    });

  if (paymentDelays.length === 0) {
    return null;
  }

  // Calculer la moyenne des délais
  const totalDelay = paymentDelays.reduce((sum, delay) => sum + delay, 0);
  const averagePaymentDelay = totalDelay / paymentDelays.length;

  averagePayment.value = averagePaymentDelay;
  return averagePaymentDelay;
};
// next payment
const fetchNextPayments = async () => {
  const { data, error } = await supabase
    .from("payments")
    .select(
      `
    id, created_at, amount, payment_date, status, date_of_issue,
    customers(
      id, name, phone, email, customer_type
    )
  `
    )
    .gt("payment_date", new Date().toISOString())
    .order("payment_date", { ascending: true })
    .limit(3);

  if (error) {
  } else {
    nextPayments.value = data;
  }
};
// stat subscription
const fetchSubscriptions = async () => {
  let { data, error } = await supabase.from("subscriptions").select("*");
  if (error) {
  } else {
    subscriptions.value = data;
  }
};
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
function formatDate(currentDate) {
  // Convertir la date d'entrée en objet Date
  const date = new Date(currentDate);
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

async function checkSms() {
  let { data, error } = await supabase
    .from("sms_backlogs")
    .select("client_id,client_secret,valide_date");
  if (error) {
  } else {
    valideSms.value = data[0]?.valide_date;
    const url = "https://app.myfindora.com/api/info-purchase";
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          client_id: data[0]?.client_id,
          client_secret: data[0]?.client_secret,
        }),
      });
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      if (json) {
        sms.value = json.data?.availableUnits;
      }
    } catch (error) {
    }
  }
}

// fetch
onMounted(async () => {
  let { data: users, error } = await supabase.from("users").select("*");
  if (users) {
    userInfo.value = users[0];
  }
  fetchCustomers();
  fetchPayments();
  fetchReminders();
  fetchNextPayments();
  fetchSubscriptions();
  checkSms();
});
</script>
