<template>
  <div class="mt-14 space-y-4 pr-4">
    <PaymentMetrics />
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
            Suivre les paiements
          </h2>
          <AddPayment @submit="fetchPayments" />
        </div>
      </template>

      <!-- Filters -->
      <div class="flex items-center justify-between gap-3 px-4 py-3">
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass-20-solid"
          placeholder="Recherche par client, montant, ou id..."
          class="border-[#f3c775] border-[1px] rounded-lg"
          variant="none"
        />

        <USelectMenu
          v-model="selectedType"
          :options="paymentTypes"
          multiple
          placeholder="État de paiement"
          variant="none"
          class="w-40 border-[#f3c775] border-[1px] rounded-lg"
        />
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

        <UButton
          icon="i-heroicons-funnel"
          color="gray"
          size="xs"
          :disabled="search === '' && selectedType.length === 0"
          @click="resetFilters"
        >
          Réinitialiser
        </UButton>
      </div>

      <!-- Table -->
      <UTable
        v-model="selectedRows"
        :rows="paginatedPayments"
        :columns="columnsTable"
        :loading="status === 'pending'"
        sort-asc-icon="i-heroicons-arrow-up"
        sort-desc-icon="i-heroicons-arrow-down"
        class="w-full h-80 overflow-y-scroll"
        :ui="{
          td: { base: 'max-w-[0] truncate' },
          tr: { base: 'max-w-[0] truncate' },
          default: { checkbox: { color: 'gray' } },
        }"
        @select="select"
        :empty-state="{
          icon: 'i-heroicons-circle-stack-20-solid',
          label: 'Oups , Aucun paiment trouvé',
        }"
      >
        <template #customers-data="{ row }">
          <h4 class="flex gap-2 items-center tracking-tight">
            <img
              :src="
                'https://ui-avatars.com/api/?name=' +
                row.customers?.name +
                '&background=0f172a&color=ffffff'
              "
              alt=""
              class="w-8 h-8 rounded-full"
            />

            <p class="flex flex-col justify-center">
              <span class="text-sm text-black font-semibold">{{
                row.customers?.name
              }}</span>
              <span class="text-xs text-black/70">
                {{ row.customers?.phone }}
              </span>
            </p>
          </h4>
        </template>

        <template #date_of_issue-data="{ row }">
          <span
            >{{
              new Date(row.date_of_issue).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            }}
          </span>
        </template>
        <template #amount-data="{ row }">
          <span
            >{{
              row.amount.toLocaleString("fr-FR", {
                style: "currency",
                currency: "XOF",
              })
            }}
          </span>
        </template>
        <template #payment_date-data="{ row }">
          <span
            >{{
              new Date(row.payment_date).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            }}
          </span>
        </template>
        <template #delay-data="{ row }">
          <UBadge
            v-if="calculateDateDifference(row.payment_date) + 1 > 0"
            color="orange"
            variant="soft"
            class="w-full flex justify-center"
            >{{ calculateDateDifference(row.payment_date) + 1 }} Jours</UBadge
          >
          <UBadge
            v-else-if="calculateDateDifference(row.payment_date) + 1 == 0"
            color="lime"
            variant="soft"
            class="w-full flex justify-center"
            >Aujourd'hui</UBadge
          >
          <UBadge
            v-else
            color="gray"
            variant="soft"
            class="w-full flex justify-center"
            >Dépassé
          </UBadge>
        </template>
        <template #status-data="{ row }">
          <UBadge
            v-if="row.status == 'payé'"
            color="green"
            variant="subtle"
            class="w-full flex justify-center"
            >Payé</UBadge
          >
          <UBadge
            v-else-if="row.status == 'en-attente'"
            color="amber"
            variant="subtle"
            class="w-full flex justify-center"
            >En attente</UBadge
          >
          <UBadge
            v-else
            color="red"
            variant="subtle"
            class="w-full flex justify-center"
            >Non payé</UBadge
          >
        </template>
        <template #reminder-data="{ row }">
          <AddReminder
            :payment-id="row.id"
            :customer-id="row.customers?.id"
            :customer-phone="row.customers?.phone"
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
              <span class="font-medium">{{ filteredPayments.length }}</span>
              résultats
            </span>
          </div>
          <UPagination
            v-model="page"
            :page-count="pageCount"
            :total="filteredPayments.length"
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

    <!--Show payment-->
    <UModal v-model="isOpenShow">
      <div class="p-4 space-y-5">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-semibold text-gray-700 text-xl">
              {{ selectedPayment.name }}
            </h3>
            <h5 class="font-semibold text-gray-500 text-md">
              {{ selectedPayment.email }}
            </h5>
          </div>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-phone-arrow-up-right"
              class="text-gray-700 w-5 h-5"
            />
            <span class="font-semibold text-gray-700 text-md">
              {{ selectedPayment.phone }}</span
            >
          </div>
          <UBadge
            color="amber"
            variant="soft"
            class="text-md"
            :icon="
              selectedPayment.customer_type == 'Particulier'
                ? 'i-heroicons-users'
                : 'i-heroicons-building-office-2'
            "
            >{{ selectedPayment.customer_type }}</UBadge
          >
        </div>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-map-pin" class="text-gray-800 w-5 h-5" />
          <span class="text-gray-800 text-md">
            {{ selectedPayment?.address }}</span
          >
        </div>
      </div>
    </UModal>
    <!--Add reminders-->

    <!--Edit payment-->
    <USlideover v-model="isOpenEdit">
      <UCard
        class="flex flex-col flex-1"
        :ui="{
          body: { base: 'flex-1' },
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <UButton
            color="gray"
            variant="ghost"
            size="sm"
            icon="i-heroicons-x-mark-20-solid"
            class="flex sm:hidden absolute end-5 top-5 z-10"
            square
            padded
            @click="isOpenEdit = false"
          />

          <div class="space-y-[1px]">
            <h5>
              <UBadge color="gray" variant="soft" size="lg"
                >Modification</UBadge
              >
            </h5>
            <span class="text-gray-500 text-sm"
              >Vous êtes sur le point de modifier les informations de ce
              paiement.</span
            >
          </div>
        </template>

        <form class="grid grid-cols-12 gap-4" @submit.prevent="editPayment">
          <div class="col-span-full space-y-[1px]">
            <label for="payment_date" class="text-gray-500 font-semibold"
              >Date d'émission</label
            >

            <InputFiled
              type="date"
              custom-class="hover:shadow-sm p-2 rounded-lg"
              v-model="formData.date_of_issue"
              name="payment_date"
            />
            <div v-if="errors.date_of_issue.length" class="error">
              <ul>
                <li v-for="error in errors.date_of_issue" :key="error">
                  {{ error }}
                </li>
              </ul>
            </div>
          </div>
          <div class="col-span-full space-y-[1px]">
            <label for="payment_date" class="text-gray-500 font-semibold"
              >Date d'échéance</label
            >

            <InputFiled
              type="date"
              custom-class="hover:shadow-sm p-2 rounded-lg"
              v-model="formData.payment_date"
            />
            <div v-if="errors.payment_date.length" class="error">
              <ul>
                <li v-for="error in errors.payment_date" :key="error">
                  {{ error }}
                </li>
              </ul>
            </div>
          </div>

          <div class="col-span-6 space-y-[1px]">
            <label for="customers_id" class="text-gray-500 font-semibold"
              >Client</label
            >
            <USelectMenu
              searchable
              searchable-placeholder="Trouver un client..."
              class="w-full lg:w-48"
              v-model="formData.customers_id"
              placeholder="Choisir un client"
              :options="customers"
              option-attribute="name"
              size="lg"
              color="black"
              variant="none"
              :ui="{
                base: 'hover:shadow-sm rounded-lg hover:shadow-sm  rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-[#f3c775]',
              }"
            >
            </USelectMenu>
            <div v-if="errors.customers_id.length" class="error">
              {{ errors.customers_id[0] }}
            </div>
          </div>

          <div class="col-span-6 space-y-[1px]">
            <label for="amount" class="text-gray-500 font-semibold"
              >Montant en F CFA</label
            >
            <InputFiled
              type="number"
              custom-class="hover:shadow-sm p-2 rounded-lg"
              v-model="formData.amount"
            />
            <div v-if="errors.amount.length" class="error">
              <ul>
                <li v-for="error in errors.amount" :key="error">{{ error }}</li>
              </ul>
            </div>
          </div>

          <div class="col-span-full space-y-[1px]">
            <label for="status" class="text-gray-500 font-semibold"
              >Status</label
            >
            <select
              v-model="formData.status"
              class="hover:shadow-sm p-2 rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-[#f3c775]"
            >
              <option value="en-attente">En attente</option>
              <option value="payé">Payé</option>
              <option value="non-payé">Non payé</option>
            </select>
            <div v-if="errors.status.length" class="error">
              <ul>
                <li v-for="error in errors.status" :key="error">{{ error }}</li>
              </ul>
            </div>
          </div>
          <div class="col-span-full space-y-[1px]">
            <UButton
              :loading="isRequestInProgress"
              type="submit"
              size="lg"
              variant="solid"
              color="yellow"
              >Mettre à jour ce paiement</UButton
            >
          </div>
        </form>
      </UCard>
    </USlideover>

    <!--Alert message-->
    <div v-if="isAlertDeleteOpen">
      <AlertModal
        title="Paiment supprimé"
        type="success"
        @close-alert="closeDeleteAlert"
      >
        <template #message>
          <p>
            La suppression du paiement a été effectuée avec
            <span class="font-semibold">succès</span>.
          </p>
        </template>
      </AlertModal>
    </div>

    <div v-if="isAlertEditOpen">
      <AlertModal
        title="Informations incorrectes"
        type="error"
        @close-alert="closeEditAlert"
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
definePageMeta({
  middleware: "auth",
  alias: "/paiement",
});
const supabase = useSupabaseClient();
const { errors, validateForm, handleServerErrors } = useFormValidationPayment();
let customers = ref([]);
const isRequestInProgress = ref(false);

// Table Columns
const columns = [
  { key: "id", label: "ID", sortable: true },
  { key: "customers", label: "Client", sortable: true },
  { key: "date_of_issue", label: "Émise le", sortable: true },
  { key: "payment_date", label: "Date d'échéance", sortable: true },
  { key: "amount", label: "Montant", sortable: true },
  { key: "delay", label: "Délai", sortable: true },
  { key: "status", label: "Statut", sortable: true },
  { key: "reminder", label: "Relance", sortable: false },
  { key: "actions", label: "Actions", sortable: false },
];
const selectedColumns = ref(columns);
const columnsTable = computed(() =>
  columns.filter((column) => selectedColumns.value.includes(column))
);

// Filters and Search
const search = ref("");
const selectedType = ref([]);
const paymentTypes = [
  { key: "paid", label: "Payé", value: "payé" },
  { key: "unpaid", label: "Non payé", value: "non-payé" },
  { key: "waiting", label: "En attente", value: "en-attente" },
];
const resetFilters = () => {
  search.value = "";
  selectedType.value = [];
};

// Pagination
const page = ref(1);
const pageCount = ref(10);
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageTo = computed(() => {
  if (!filteredPayments.value || filteredPayments.value.length === 0) {
    return 0;
  }
  return Math.min(page.value * pageCount.value, filteredPayments.value.length);
});

// payments
const payments = ref([]);
const status = ref("idle");
const fetchPayments = async () => {
  status.value = "pending";
  const { data, error } = await supabase.from("payments").select(`
    id,created_at,amount,payment_date,status,date_of_issue,
    customers(
      id,name,phone,email,customer_type
    )
  `);
  if (error) {
    console.error("Error fetching payments:", error);
    status.value = "error";
  } else {
    payments.value = data || [];
    status.value = "success";
  }
};
onMounted(async () => {
  fetchPayments();
  const { data, error } = await supabase.from("customers").select("name,id");
  if (error) {
  } else {
    customers.value = data || [];
  }
});

// Filtered and Paginated Data
const filteredPayments = computed(() =>
  payments.value.filter(
    (payment) =>
      (search.value === "" ||
        [
          payment.customers?.name,
          payment.amount,
          payment.id,
          payment.customers?.email,
        ]
          .join(" ")
          .toLowerCase()
          .includes(search.value.toLowerCase())) &&
      (selectedType.value.length === 0 ||
        selectedType.value.some((obj) => obj.value === payment.status))
  )
);

const paginatedPayments = computed(() =>
  filteredPayments.value.slice(
    (page.value - 1) * pageCount.value,
    page.value * pageCount.value
  )
);
const isOpenShow = ref(false);
const selectedPayment = ref([]);
const items = (row) => [
  [
    {
      label: "Modifier",
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => {
        isOpenEdit.value = true;
        paymentId.value = row.id;
        const selectedPayment = filteredPayments.value.find(
          (payment) => payment.id === row.id
        );
        formData.value.payment_date = selectedPayment.payment_date;
        formData.value.date_of_issue = selectedPayment.date_of_issue;
        formData.value.customers_id = selectedPayment.customers;
        formData.value.amount = selectedPayment.amount;
        formData.value.status = selectedPayment.status;
        isOpen.value = false;
      },
    },
    {
      label: "Supprimer",
      icon: "i-heroicons-trash-20-solid",
      click: () => deletePayment(row.id),
    },
  ],
];

// edit payment
const isOpenEdit = ref(false);
const customerId = ref(null);
let paymentId = ref(null);
const isAlertEditOpen = ref(false);
const errorMessage = ref("");

const formData = ref({
  payment_date: null,
  date_of_issue: null,
  customers_id: null,
  amount: null,
  status: "en-attente",
});
let closeEditAlert = () => {
  isAlertEditOpen.value = false;
};
const editPayment = async () => {
  isRequestInProgress.value = true;
  const validationErrors = validateForm({
    payment_date: formData.value.payment_date,
    date_of_issue: formData.value.date_of_issue,
    customers_id: formData.value.customers_id,
    amount: formData.value.amount,
    status: formData.value.status,
  });
  if (validationErrors.global.length > 0) {
    isRequestInProgress.value = false;
    return;
  }
  try {
    formData.value.customers_id = formData.value.customers_id?.id;
    const { data, error } = await supabase
      .from("payments")
      .update({
        payment_date: formData.value.payment_date,
        date_of_issue: formData.value.date_of_issue,
        customers_id: formData.value.customers_id,
        amount: formData.value.amount,
        status: formData.value.status,
      })
      .eq("id", paymentId.value)
      .select();

    if (error) {
      if (error.code === "23505") {
        errorMessage.value = "Ce client existe déjà avec cet adresse E-mail.";
      } else {
        handleServerErrors(error);
        errorMessage.value = error.message;
      }
      isRequestInProgress.value = false;
      isAlertEditOpen.value = true;
    } else {
      formData.value.payment_date = null;
      formData.value.date_of_issue = null;
      formData.value.customers_id = null;
      formData.value.amount = null;
      formData.value.status = "en-attente";
      isRequestInProgress.value = false;
      fetchPayments();
      isOpenEdit.value = false;
    }
  } catch (err) {
    handleServerErrors({ code: "23514", message: "Erreur serveur" });
    isRequestInProgress.value = false;
  }
};

// delete payment
const isAlertDeleteOpen = ref(false);
let closeDeleteAlert = () => {
  isAlertDeleteOpen.value = false;
};
const deletePayment = async (payment) => {
  const { error } = await supabase.from("payments").delete().eq("id", payment);
  if (!error) {
    isAlertDeleteOpen.value = true;
    fetchPayments();
  }
};

let calculateDateDifference = (paymentDate) => {
  const today = new Date();

  const payment = new Date(paymentDate);
  const timeDifference = payment - today;

  // Convertir la différence en jours et arrondir à l'entier inférieur
  const dayDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

  return dayDifference;
};
</script>
<style scoped>
.error {
  color: red;
}
</style>
