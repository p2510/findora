<template>
  <div>
    <div v-if="users.subscription.is_partner" class="mt-14 space-y-4 pr-4">
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
    <div v-else class="mt-4 space-y-4 pr-4">
      <div
        v-if="
          users.subscription.subscription_type == 'free' ||
          (users.subscription.status == 'cancel' &&
            new Date(users.subscription.start_at).setMonth(
              new Date(users.subscription.start_at).getMonth() + 1
            ) > new Date())
        "
      > 
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

              <div
                v-if="users.subscription.status == 'active'"
                class="flex gap-2 items-center"
              >
                <button
                  @click="disableSubscription"
                  class="text-xs text-slate-700 underline hover:text-slate-600 transition duration-200 ease-in-out"
                >
                  Suspendre mon abonnement
                </button>
              </div>
            </div>
          </template>

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

          <UTable
            v-model="selectedRows"
            :rows="paginatedPurchases"
            :columns="columnsTable"
            :loading="status === 'pending'"
            sort-asc-icon="i-heroicons-arrow-up"
            sort-desc-icon="i-heroicons-arrow-down"
            class="w-full sm:h-36 md:h-40 lg:h-44 xl:h-80 overflow-y-scroll"
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
                v-if="row.status == 'success'"
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

    <div v-if="isSuccessOpen">
      <AlertModal
        title="Abonnement"
        type="success"
        @close-alert="closeSuccessAlert"
      >
        <template #message>
          <p>
            {{ successMessage }}
          </p>
        </template>
      </AlertModal>
    </div>
    <div v-if="isAlertOpen">
      <AlertModal title="Erreur" type="error" @close-alert="closeErrorAlert">
        <template #message>
          <p>
            {{ errorMessage }}
          </p>
        </template>
      </AlertModal>
    </div>
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
  script: [
    {
      src: "https://js.paystack.co/v2/inline.js",
    },
  ],
});

import { useUser } from "@/stores/user";
const users = useUser();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

onMounted(async () => {
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

const errorMessage = ref("");
const successMessage = ref("");
const isAlertOpen = ref(false);
let closeErrorAlert = () => {
  isAlertOpen.value = false;
};
const isSuccessOpen = ref(false);
let closeSuccessAlert = () => {
  isSuccessOpen.value = false;
};

let disableSubscription = async () => {
  const url = `${useRuntimeConfig().public.url_base}/api/subscription/disable`;
 

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        user_id: users.info.uuid,
      }),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    if (json.fetchResponse) {
      isSuccessOpen.value = true;
      successMessage.value =
        " Votre abonnement a été résilié et vous ne serez pas facturé à la prochaine échéance.";
      users.updateSubscription({ status: "cancel" });
    } else {
      
      errorMessage.value =
        "Nous sommes actuellement en maintenance. Veuillez réessayer plus tard";
      isAlertOpen.value = true;
    }
  } catch (err) {
    errorMessage.value = err.message;
    isAlertOpen.value = true;
  }
};
</script>
