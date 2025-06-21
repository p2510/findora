<template>
  <div>
    <div class="mt-4 space-y-4 pr-4">
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
      <div v-else class="mt-14 sm:mt-0">
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
                {{ $t("subscription.my_subscription") }}
              </h2>
            </div>
          </template>

          <div class="flex items-center justify-between gap-3 px-4 py-3">
            <div class="flex items-center justify-between gap-3 basis-1/2">
              <UInput
                v-model="search"
                icon="i-heroicons-magnifying-glass-20-solid"
                :placeholder="$t('subscription.search_placeholder')"
                class="border-[#f3c775] border-[1px] rounded-lg basis-1/2"
                variant="none"
              />
            </div>
          </div>

          <div class="flex justify-between items-center w-full px-4 py-3">
            <div class="flex items-center gap-1.5">
              <span class="text-sm leading-5"
                >{{ $t("subscription.rows_per_page") }} :</span
              >

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
              label: $t('subscription.no_subscription_found'),
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
                :label="$t('subscription.paid')"
                color="emerald"
                variant="solid"
              />
              <UBadge
                v-else
                size="sm"
                :label="$t('subscription.failed')"
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
                  {{ $t("subscription.showing") }}
                  <span class="font-medium">{{ pageFrom }}</span>
                  {{ $t("subscription.to") }}
                  <span class="font-medium">{{ pageTo }}</span>
                  {{ $t("subscription.of") }}
                  <span class="font-medium">{{
                    filteredPurchases.length
                  }}</span>
                  {{ $t("subscription.results") }}
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
        :title="$t('subscription.subscription_title')"
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
      <AlertModal
        :title="$t('subscription.error_title')"
        type="error"
        @close-alert="closeErrorAlert"
      >
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
import { useI18n } from "vue-i18n";
import { useUser } from "@/stores/user";
const { t } = useI18n();

definePageMeta({
  middleware: "auth",
  alias: "/abonnement",
});
useHead({
  title: t("subscription.findora_subscription"),
});

const users = useUser();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

onMounted(async () => {
  fetchPurchases();
});
const search = ref("");

// Table Columns
const columns = [
  { key: "id", label: t("subscription.id") },
  { key: "created_at", label: t("subscription.date"), sortable: true },
  { key: "type", label: t("subscription.subscription_type") },
  { key: "status", label: t("subscription.status") },
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
</script>
