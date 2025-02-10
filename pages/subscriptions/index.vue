<template>
  <div>
    <div v-if="subscriptions?.is_partner" class="mt-14 space-y-4 pr-4">
      <h3 class="text-5xl text-center">
        <span> Vous êtes </span> <br />
        partenaire
        <span
          class="bg-clip-text text-transparent bg-gradient-to-r from-[#f3c775] to-[#5e4414]"
        >
          Findora
        </span>
      </h3>
      <p class="text-center text-sm text-slate-600 pt-6">
        Les partenaires Findora sont exemptés des abonnements pour l'utilisation
        de l'application.
      </p>
    </div>
    <div v-else class="mt-14 space-y-4 pr-4">
      <div v-if="subscriptions?.subscription_type == 'free'">
        <PurchaseSubscriptionFree />
      </div>
      <div v-else>
        <UCard
          class="w-full"
          :ui="{
            base: '',
            ring: '',
            divide: 'divide-y divide-gray-200 dark:divide-gray-700',
            header: { padding: 'px-4 py-5' },
            body: {
              padding: '',
              base: 'divide-y divide-gray-200 dark:divide-gray-700',
            },
            footer: { padding: 'p-4' },
          }"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <h2
                class="font-semibold text-xl text-gray-900 dark:text-white leading-tight"
              >
                Mon abonnement
              </h2>
              <PrimaryButton
                @click="paid"
                v-if="
                  (subscriptions?.subscription_type === 'premium' || 'ultra') &&
                  new Date(subscriptions?.start_at).setMonth(
                    new Date(subscriptions?.start_at).getMonth() + 1
                  ) < new Date()
                "
                >Renouveller mon abonnement</PrimaryButton
              >
            </div>
          </template>

          <!-- Filters -->
          <div class="flex items-center justify-between gap-3 px-4 py-3">
            <div class="flex items-center justify-between gap-3 basis-1/2">
              <UInput
                v-model="search"
                icon="i-heroicons-magnifying-glass-20-solid"
                placeholder="Recherche par nom, téléphone, ou email..."
                class="border-[#f3c775] border-[1px] rounded-lg basis-1/2"
                variant="none"
              />
            </div>
          </div>
          <!-- Header and Action buttons -->
          <div class="flex justify-between items-center w-full px-4 py-3">
            <div class="flex items-center gap-1.5">
              <span class="text-sm leading-5">Ligne par page :</span>

              <USelect
                v-model="pageCount"
                :options="[3, 5, 10, 20, 30, 40]"
                class="me-2 w-20"
                size="xs"
              />
            </div>
          </div>

          <!-- Table -->

          <UTable
            v-model="selectedRows"
            :rows="paginatedPurchases"
            :columns="columnsTable"
            :loading="status === 'pending'"
            sort-asc-icon="i-heroicons-arrow-up"
            sort-desc-icon="i-heroicons-arrow-down"
            class="w-full h-80 overflow-y-scroll"
            :ui="{
              td: { base: 'max-w-[0] truncate' },
              default: { checkbox: { color: 'gray' } },
            }"
            @select="select"
            :empty-state="{
              icon: 'i-heroicons-circle-stack-20-solid',
              label: 'Oups , Aucun abonnement trouvé',
            }"
          >
            <template #created_at-data="{ row }">
              {{
                new Date(row.created_at).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              }}
            </template>
            <template #status-data="{ row }">
              <UBadge
                v-if="row.status == 'pending'"
                size="sm"
                label="En cours"
                color="yellow"
                variant="solid"
              />
              <UBadge
                v-else-if="row.status == 'completed'"
                size="sm"
                label="Payer"
                color="emerald"
                variant="solid"
              />
              <UBadge
                v-else
                size="sm"
                label="Échouer"
                color="red"
                variant="solid"
              />
            </template>
            <template #actions-data="{ row }">
              <UDropdown :items="items(row)">
                <UButton
                  color="gray"
                  variant="ghost"
                  icon="i-heroicons-ellipsis-horizontal-20-solid"
                />
              </UDropdown>
            </template>
          </UTable>

          <!-- Number of rows & Pagination -->
          <template #footer>
            <div class="flex flex-wrap justify-between items-center">
              <div>
                <span class="text-sm leading-5">
                  Affichage
                  <span class="font-medium">{{ pageFrom }}</span>
                  à
                  <span class="font-medium">{{ pageTo }}</span>
                  sur
                  <span class="font-medium">{{
                    filteredPurchases.length
                  }}</span>
                  résultats
                </span>
              </div>
              <UPagination
                v-model="page"
                :page-count="pageCount"
                :total="filteredPurchases.length"
                :ui="{
                  wrapper: 'flex items-center gap-1',
                  rounded: '!rounded-full min-w-[32px] justify-center',
                  default: {
                    activeButton: {
                      variant: 'outline',
                    },
                  },
                }"
              />
            </div>
          </template>
        </UCard>
      </div>
    </div>
    <UModal v-model="isOpen" prevent-close>
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-gray-800 text-md">
                Renouveller votre abonnement
              </h3>
              <span class="text-sm text-slate-600">
                Scannez pour effectuer le paiement directement.
              </span>
            </div>
            <div>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark-20-solid"
                class="-my-1"
                @click="close"
              />
            </div>
          </div>
        </template>

        <section class="space-y-3" v-if="!check">
          <div class="flex gap-3 items-center">
            <span v-if="subscriptions.subscription_type == 'premium'"
              >Premium</span
            >
            <span v-else-if="subscriptions.subscription_type == 'ultra'"
              >Ultra</span
            >
            <UBadge
              color="primary"
              variant="soft"
              size="lg"
              v-if="subscriptions.subscription_type == 'premium'"
              >6.500 F</UBadge
            ><UBadge
              color="primary"
              variant="soft"
              size="lg"
              v-else-if="subscriptions.subscription_type == 'ultra'"
              >19.900 F</UBadge
            >
          </div>
          <div class="py-3 flex justify-center">
            <PrimaryButton @click="validePaid"
              >Cliquez pour effectuer le paiement</PrimaryButton
            >
          </div>
        </section>
        <section class="space-y-3" v-else>
          <div class="flex gap-3 items-center">
            <span>{{subscriptions.subscription_type}}</span>
            <UBadge color="primary" variant="soft" size="lg"  v-if="subscriptions.subscription_type == 'premium'">6.500 F</UBadge>
            <UBadge color="primary" variant="soft" size="lg"  v-else-if="subscriptions.subscription_type == 'ultra'">19.900 F</UBadge>
          </div>
          <div class="bg-[#1DC8FF] py-3">
            <div class="flex justify-center">
              <img
                src="~/assets/img/wave/payez-avec-wave-stacked.svg"
                alt="icone wave"
              />
            </div>
            <div class="flex justify-center">
              <div class="rounded-xl p-4 bg-white shadow-md">
                <img
                  v-if="subscriptions.subscription_type == 'premium'"
                  src="~/assets/img/wave/subscription_premium.png"
                  alt="Abonnement premium"
                />
                <img
                  v-else-if="subscriptions.subscription_type == 'ultra'"
                  src="~/assets/img/wave/subscription_ultra.png"
                  alt="Abonnement ultra"
                />
              </div>
            </div>
          </div>
        </section>

        <template #footer>
          <div class="flex gap-2 items-center">
            <UIcon
              name="i-heroicons-information-circle"
              class="w-5 h-5 text-emerald-600"
            />
            <span class="text-sm text-slate-600 w-full">
              Une fois votre paiement effectué, il sera traité dans un délai
              maximal d'une (1) heure.
            </span>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
definePageMeta({
  middleware: "auth",
  alias: "/abonnement",
});
useHead({
  title: "Findora - Abonnement",
});
const supabase = useSupabaseClient();
const user = useSupabaseUser();
let subscriptions = ref(null);

onMounted(async () => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .single();

  if (data) {
    subscriptions.value = data;
  }
  fetchPurchases();
});
const search = ref("");

// Table Columns
const columns = [
  { key: "id", label: "ID" },
  { key: "created_at", label: "Date", sortable: true },
  { key: "type", label: "Type d'abonnement" },
  { key: "status", label: "Statut" },
];
const selectedColumns = ref(columns);
const columnsTable = computed(() =>
  columns.filter((column) => selectedColumns.value.includes(column))
);
// Filtered and Paginated Data
const filteredPurchases = computed(() =>
  purchases.value.filter(
    (purchase) =>
      search.value === "" ||
      [purchase.type, purchase.status]
        .join(" ")
        .toLowerCase()
        .includes(search.value.toLowerCase())
  )
);
const paginatedPurchases = computed(() =>
  filteredPurchases.value.slice(
    (page.value - 1) * pageCount.value,
    page.value * pageCount.value
  )
);
// Pagination
const page = ref(1);
const pageCount = ref(10);
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageTo = computed(() => {
  if (!filteredPurchases.value || filteredPurchases.value.length === 0) {
    return 0;
  }
  return Math.min(page.value * pageCount.value, filteredPurchases.value.length);
});
const purchases = ref([]);
const status = ref("idle");

const fetchPurchases = async () => {
  status.value = "pending";
  const { data, error } = await supabase
    .from("subscriptions_purchase")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    status.value = "error";
  } else {
    purchases.value = data || [];
    status.value = "success";
  }
};

let isOpen = ref(false);
const check = ref(false);
const close = () => {
  isOpen.value = false;
  check.value = false;
};
let paid = async () => {
  isOpen.value = true;
};
let validePaid = async () => {
  check.value = true;
  const { data, error } = await supabase
    .from("subscriptions_purchase")
    .insert([
      {
        type: subscriptions.value.subscription_type,
        status: "pending",
        user_id: user.value.id,
      },
    ])
    .select();
};
</script>
