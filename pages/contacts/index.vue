<template>
  <div class="min-h-screen  dark:bg-slate-900">
    <!-- Desktop Version  -->
    <div class="hidden sm:block  space-y-4">
      <CustomerMetrics />
      <div class="">
        <UCard
          class="w-full sm:h-full lg:h-[50vh] 2xl:h-[60vh] overflow-y-scroll"
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
              <h2 class="flex flex-col gap-[2px]">
                <span
                  class="font-semibold text-lg text-neutral-800 dark:text-white leading-tight"
                  >{{ $t("customer.manage_contacts") }}</span
                >
                <span v-if="customerStore?.customer" class="text-gray-500 text-xs"
                  >{{ customerStore?.customer.length }}
                  {{ $t("customer.contact(s)") }}</span
                >
              </h2>
              <div class="flex gap-2">
                <CustomerAdd @submit="fetchCustomers" />
              </div>
            </div>
          </template>

          <!-- Filtres -->
          <div class="flex items-center justify-between gap-3 px-4 py-3">
            <div class="flex items-center justify-between gap-3 basis-1/2">
              <UInput
                v-model="search"
                icon="i-heroicons-magnifying-glass-20-solid"
                :placeholder="$t('customer.search_by_name_phone_email')"
                class="border-[#ffbd59] border-[1px] rounded-lg basis-1/2"
                variant="none"
              />
              <USelectMenu
                v-model="selectedType"
                :options="customerTypes"
                multiple
                :placeholder="$t('customer.contact_type')"
                variant="none"
                class="w-40 border-[#ffbd59] border-[1px] rounded-lg basis-1/2"
              >
                <template #label>
                  <span v-if="selectedType.length" class="truncate"
                    >{{ selectedType.length }} {{ $t("customer.selected") }}</span
                  >
                  <span v-else>{{ $t("customer.contact_type") }}</span>
                </template>
              </USelectMenu>
            </div>

            <AssignGroup class="basis-1/2" :customers="selectedRows" />
          </div>
          <!-- En-tête et boutons d'action -->
          <div class="flex justify-between items-center w-full px-4 py-3">
            <div class="flex items-center gap-1.5">
              <span class="text-sm leading-5"
                >{{ $t("customer.rows_per_page") }} :</span
              >

              <USelect
                v-model="pageCount"
                :options="[3, 5, 10, 20, 30, 40, 100]"
                class="me-2 w-20"
                size="sm"
              />

              <button
                @click="deleteMultiple"
                v-show="selectedRows.length > 0"
                class="p-2 text-white bg-red-600 hover:bg-red-700 transition duration-300 ease-in-out rounded-md flex items-center gap-2"
              >
                <span class="text-xs">{{ $t("customer.delete") }}</span>
                <UIcon name="i-heroicons-archive-box-x-mark" class="w-4 h-4" />
              </button>
            </div>

            <UButton
              icon="i-heroicons-funnel"
              color="gray"
              size="xs"
              :disabled="search === '' && selectedType.length === 0"
              @click="resetFilters"
            >
              {{ $t("customer.reset") }}
            </UButton>
          </div>

          <!-- Table -->
          <UTable
            v-model="selectedRows"
            :rows="paginatedCustomers"
            :columns="columnsTable"
            :loading="status === 'pending'"
            sort-asc-icon="i-heroicons-arrow-up"
            sort-desc-icon="i-heroicons-arrow-down"
            class="w-full h-full overflow-y-hidden"
            :ui="{
              td: { base: 'max-w-[0] truncate ' },
              default: { checkbox: { color: 'gray' } },
            }"
            @select="select"
            :empty-state="{
              icon: 'i-heroicons-circle-stack-20-solid',
              label: $t('customer.no_contact_found'),
            }"
          >
            <template #phone-data="{ row }">
              <span>{{ row.phone }}</span>
            </template>
            <template #customer_type-data="{ row }">
              <UBadge
                v-if="row.customer_type == 'Entreprise'"
                size="xs"
                :label="$t('customer.company')"
                color="emerald"
                variant="subtle"
              />
              <UBadge
                v-else
                size="xs"
                :label="$t('customer.individual')"
                color="orange"
                variant="subtle"
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

          <!-- Nombre de lignes et pagination -->
          <template #footer>
            <div class="flex flex-wrap justify-between items-center">
              <div>
                <span class="text-sm leading-5">
                  {{ $t("customer.showing") }}
                  <span class="font-medium">{{ pageFrom }}</span>
                  {{ $t("customer.to") }}
                  <span class="font-medium">{{ pageTo }}</span>
                  {{ $t("customer.of") }}
                  <span class="font-medium">{{ filteredCustomers.length }}</span>
                  {{ $t("customer.results") }}
                </span>
              </div>
              <UPagination
                v-model="page"
                :page-count="pageCount"
                :total="filteredCustomers.length"
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
      <!--Show customer-->
      <UModal v-model="isOpenShow">
        <div class="p-4 space-y-5">
          <div class="flex justify-between items-center">
            <div>
              <h3 class="font-semibold text-slate-800 text-md">
                {{ selectedCustomer.name }}
              </h3>
              <h5 class="text-slate-800/80 text-sm">
                {{ selectedCustomer?.email }}
              </h5>
            </div>
            <div class="flex items-center gap-2">
              <UIcon
                name="i-heroicons-phone-arrow-up-right"
                class="text-gray-700 w-4 h-4"
              />
              <span class="text-slate-800 text-sm">
                {{ selectedCustomer.phone }}</span
              >
            </div>
            <UBadge
              color="amber"
              variant="outline"
              class="text-sm"
              :icon="
                selectedCustomer.customer_type == 'Particulier'
                  ? 'i-heroicons-users'
                  : 'i-heroicons-building-office-2'
              "
            >
              {{
                selectedCustomer.customer_type == "Particulier"
                  ? $t("customer.individual")
                  : $t("customer.company")
              }}
            </UBadge>
          </div>
          <div class="flex justify-between items-center">
            <div class="flex gap-3 items-center">
              <UBadge
                color="emerald"
                variant="solid"
                v-for="item in selectedCustomer.groups"
                :key="item.id"
                class="text-sm flex items-center justify-between"
              >
                <span>{{ item }}</span>
                <UIcon
                  @click="deleteGroups(selectedCustomer.id, item)"
                  name="i-heroicons-x-mark"
                  class="cursor-pointer text-white w-3 h-3 hover:opacity-80 transition ease-in-out duration-300"
                />
              </UBadge>
            </div>

            <div v-if="selectedCustomer?.address" class="flex items-center gap-2">
              <UIcon name="i-heroicons-map-pin" class="text-gray-800 w-4 h-4" />
              <span class="text-slate-800/80 text-sm">
                {{ selectedCustomer?.address }}</span
              >
            </div>
          </div>
        </div>
      </UModal>
      <!--edit customer-->
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
                <UBadge
                  color="gray"
                  variant="soft"
                  size="lg"
                  v-if="!isEntreprise"
                >
                  {{ $t("customer.individual") }}
                </UBadge>
                <UBadge color="amber" variant="soft" size="lg" v-else>
                  {{ $t("customer.company") }}
                </UBadge>
              </h5>
              <span class="text-gray-500 text-sm" v-if="!isEntreprise">
                {{ $t("customer.edit_individual_contact") }}
              </span>
              <span class="text-gray-500 text-sm" v-else>
                {{ $t("customer.edit_company_contact") }}
              </span>
            </div>
          </template>

          <form class="grid grid-cols-12 gap-4" @submit.prevent="editCustomer">
            <div class="col-span-full flex items-center justify-center gap-4">
              <p>
                <span class="text-gray-500 text-sm" v-if="!isEntreprise">
                  {{ $t("customer.switch_to_company_contact") }}
                </span>
                <span class="text-gray-500 text-sm" v-else>
                  {{ $t("customer.switch_to_individual_contact") }}
                </span>
              </p>
              <UToggle
                v-model="isEntreprise"
                size="2xl"
                on-icon="i-heroicons-check-20-solid"
                off-icon="i-heroicons-x-mark-20-solid"
                color="amber"
              />
            </div>
            <div class="col-span-full space-y-[1px]">
              <label
                for="name"
                class="text-gray-500 text-sm"
                v-if="!isEntreprise"
              >
                {{ $t("customer.full_name") }}
              </label>
              <label for="name" class="text-gray-500 text-sm" v-else>
                {{ $t("customer.company_name") }}
              </label>
              <InputFieldSimple
                type="text"
                autofocus
                custom-class="hover:shadow-sm p-2 rounded-lg"
                v-model="formData.name"
              />
              <div v-if="errors.name.length" class="error">
                {{ errors.name[0] }}
              </div>
            </div>

            <div class="col-span-full space-y-[1px]">
              <label for="email" class="text-gray-500 text-sm">{{
                $t("customer.email")
              }}</label>
              <InputFieldSimple
                type="email"
                custom-class="hover:shadow-sm p-2 rounded-lg"
                v-model="formData.email"
              />
              <div v-if="errors.email.length" class="error">
                {{ errors.email[0] }}
              </div>
            </div>
            <div class="col-span-full space-y-[1px]">
              <label for="phone" class="text-gray-500 text-sm">
                {{ $t("customer.phone_number") }}
              </label>
              <MazPhoneNumberInput
                block
                :translations="{
                  countrySelector: {
                    placeholder: $t('customer.country_code'),
                    error: $t('customer.select_country'),
                    searchPlaceholder: $t('customer.find_country'),
                  },
                  phoneInput: {
                    placeholder: $t('customer.phone_number'),
                    example: $t('customer.example'),
                  },
                }"
                countryCode="CI"
                orientation="responsive"
                v-model="formData.phone"
                color="Warning"
              />
              <div v-if="errors.phone.length" class="error">
                {{ errors.phone[0] }}
              </div>
            </div>
            <div class="col-span-full space-y-[1px]">
              <label for="address" class="text-gray-500 text-sm">{{
                $t("customer.address")
              }}</label>
              <InputFieldSimple
                type="text"
                custom-class="hover:shadow-sm p-2 rounded-lg"
                v-model="formData.address"
              />
            </div>
            <div class="col-span-full space-y-[1px]">
              <UButton
                :loading="isRequestInProgress"
                type="submit"
                size="lg"
                variant="solid"
                color="amber"
              >
                {{ $t("customer.update_contact") }}
              </UButton>
            </div>
          </form>
        </UCard>
      </USlideover>

      <!-- Message d'alerte -->
      <div v-if="isAlertDeleteOpen">
        <AlertModal
          title="Client supprimé"
          type="success"
          @close-alert="closeDeleteAlert"
        >
          <template #message>
            <p>
              Le contact a été <span class="font-semibold">supprimé</span> avec
              succès.
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

    <!-- Mobile Version  -->
    <MobileCustomerView
      v-if="isMobile"
      :customers="customerStore.customer"
      :groups="customerStore.groups"
      :grouped-customers="groupedCustomers"
      :loading="status === 'pending'"
      v-model:search="search"
      v-model:selected-type="selectedType"
      @refresh="fetchCustomers"
      @delete-customer="deleteCustomer"
      @edit-customer="handleMobileEdit"
      @delete-group="deleteGroups"
      @add-group="addGroup"
      @delete-group-by-id="deleteGroupById"
      class=" pt-3 pb-32"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { formatPhone, unformatPhone } from "@/utils/shared/format";
const { t } = useI18n();

definePageMeta({
  middleware: "auth",
  alias: "/contacts",  
});
useHead({
  title:t('contact.title'),
});
import { useCustomer } from "@/stores/customer";
const customerStore = useCustomer();
import { useStat } from "@/stores/stat";
const stat = useStat();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { errors, validateForm, handleServerErrors } = useFormValidation();

// Check if mobile
const isMobile = ref(false);
onMounted(() => {
  isMobile.value = window.innerWidth < 640;
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 640;
  });
});

let selectedRows = ref([]);
// Colonnes du tableau
const columns = [
  { key: "id", label: t('customer.id'), sortable: false },
  { key: "name", label: t('customer.name'), sortable: true },
  { key: "phone", label: t('customer.phone'), sortable: true },
  { key: "email", label: t('customer.email'), sortable: true },
  { key: "address", label: t('customer.address'), sortable: true },
  { key: "customer_type", label: t('customer.type'), sortable: true },
  { key: "actions", label: t('customer.actions'), sortable: false },
];
const selectedColumns = ref(columns);
const columnsTable = computed(() =>
  columns.filter((column) => selectedColumns.value.includes(column))
);

// Filtres et recherche
const search = ref("");
const selectedType = ref([]);
const customerTypes = [
  { key: "Entreprise", label: t('customer.company'), value: "Entreprise" },
  { key: "Particulier", label: t('customer.individual'), value: "Particulier" },
];
const resetFilters = () => {
  search.value = "";
  selectedType.value = [];
};

// Pagination
const page = ref(1);
const pageCount = ref(100);
const pageFrom = computed(() => (page.value - 1) * pageCount.value + 1);
const pageTo = computed(() => {
  if (!filteredCustomers.value || filteredCustomers.value.length === 0) {
    return 0;
  }
  return Math.min(page.value * pageCount.value, filteredCustomers.value.length);
});

// fonction de rappel
const status = ref("idle");
const fetchCustomers = async () => {
  status.value = "pending";
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    status.value = "error";
  } else {
    customerStore.customer = data;
    status.value = "success";
  }
};
// groupes
let groupedCustomers = ref([]);
const fetchCustomersWithGroupNames = async () => {
  try {
    // Requête avec jointure pour récupérer les noms des groupes associés à chaque contact
    const { data, error } = await supabase.from("groups_customers").select(`
        customers_id,
        groups(name)
      `);

    if (error) {
      return [];
    }

    // Grouper les résultats par `customers_id`
    const groupedData = data.reduce((acc, item) => {
      const customerId = item.customers_id;

      if (!acc[customerId]) {
        acc[customerId] = {
          customer_id: customerId,
          groups: [],
        };
      }

      // Ajouter le nom du groupe au contact
      acc[customerId].groups.push(item.groups.name);
      return acc;
    }, {});

    // Convertir en tableau
    const groupedArray = Object.values(groupedData);
    groupedCustomers.value = groupedArray;
  } catch (err) {
    return [];
  }
};
const getCustomerGroupsById = (customerId) => {
  const customer = groupedCustomers.value.find(
    (customer) => customer.customer_id === customerId
  );
  return customer ? customer.groups : [];
};
onMounted(() => {
  if (customerStore.customer == null) {
    customerStore.updatecustomers();
  }
  if (!customerStore.groups || customerStore.groups.length === 0) {
    customerStore.updateGroup();
  }
  fetchCustomersWithGroupNames();
});

// Données filtrées et paginées
const filteredCustomers = computed(
  () =>
    Array.isArray(customerStore.customer) // Vérifie que c'est un tableau
      ? customerStore.customer.filter(
          (customer) =>
            (search.value === "" ||
              [customer.name, customer.phone, customer.email]
                .join(" ")
                .toLowerCase()
                .includes(search.value.toLowerCase())) &&
            (selectedType.value.length === 0 ||
              selectedType.value.some(
                (obj) => obj.value === customer.customer_type
              ))
        )
      : [] // Retourne un tableau vide si `customer` est null ou non défini
);

const paginatedCustomers = computed(() =>
  filteredCustomers.value.slice(
    (page.value - 1) * pageCount.value,
    page.value * pageCount.value
  )
);
const isOpenShow = ref(false);
const selectedCustomer = ref([]);
const items = (row) => [
  [
    {
      label: t('customer.view'),
      icon: "i-heroicons-eye-20-solid",
      click: () => {
        isOpenShow.value = true;
        selectedCustomer.value = filteredCustomers.value.find(
          (customer) => customer.id === row.id
        );
        const customerGroups = getCustomerGroupsById(selectedCustomer.value.id);

        // Assigner les groupes du contact à selectedCustomer ou une autre variable si nécessaire
        selectedCustomer.value.groups = customerGroups;
      },
    },
    {
      label: t('customer.edit'),
      icon: "i-heroicons-pencil-square-20-solid",
      click: () => {
        isOpenEdit.value = true;
        customerId.value = row.id;
        const selectedCustomer = filteredCustomers.value.find(
          (customer) => customer.id === row.id
        );
        formData.value.name = selectedCustomer.name;
        formData.value.email = selectedCustomer.email;
        formData.value.phone = selectedCustomer.phone;
        formData.value.address = selectedCustomer.address;
        oldIsEntreprise.value =
          selectedCustomer.customer_type === "Particulier" ? false : true;
        isEntreprise.value =
          selectedCustomer.customer_type === "Particulier" ? false : true;
      },
    },
    {
      label: t('customer.delete'),
      icon: "i-heroicons-trash-20-solid",
      click: () => deleteCustomer(row.id),
    },
  ],
];

// afficher le contact

// modifier un contact
const isOpenEdit = ref(false);
let customerId = ref(null);
const isAlertEditOpen = ref(false);
const isEntreprise = ref(false);
const isRequestInProgress = ref(false);
const errorMessage = ref("");

const formData = ref({
  name: "",
  email: "",
  phone: "",
  address: "",
});
let closeEditAlert = () => {
  isAlertEditOpen.value = false;
};
let oldIsEntreprise = ref(false);
const editCustomer = async () => {
  isRequestInProgress.value = true;
  const validationErrors = validateForm({
    name: formData.value.name,
    email: formData.value.email,
    phone: formData.value.phone,
    address: formData.value.address,
  });
  if (validationErrors.global.length > 0) {
    isRequestInProgress.value = false;
    return;
  }
  try {
    const { data, error } = await supabase
      .from("customers")
      .update({
        name: formData.value.name,
        email: formData.value.email,
        phone: formatPhone(formData.value.phone),
        address: formData.value.address,
        customer_type: isEntreprise.value ? "Entreprise" : "Particulier",
      })
      .eq("id", customerId.value)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        errorMessage.value = "Ce contact existe déjà avec cet email.";
      } else {
        handleServerErrors(error);
        errorMessage.value = error.message;
      }
      isRequestInProgress.value = false;
      isAlertEditOpen.value = true;
    } else {
      formData.value.name = "";
      formData.value.email = "";
      formData.value.phone = "";
      formData.value.address = "";
      isRequestInProgress.value = false;
      customerStore.updatecustomers();
      console.log(customerStore.customer);

      isOpenEdit.value = false;
    }
  } catch (err) {
    handleServerErrors({ code: "23514", message: "Erreur serveur" });
    isRequestInProgress.value = false;
  }
};

// supprimer des groupes
const deleteGroups = async (customer_id, group_name) => {
  const { data, error: errorGroup } = await supabase
    .from("groups")
    .select()
    .single()
    .eq("name", group_name);

  if (data) {
    const { error } = await supabase
      .from("groups_customers")
      .delete()
      .eq("customers_id", customer_id)
      .eq("groups_id", data.id);
    if (!error) {
      selectedCustomer.value.groups = selectedCustomer.value.groups.filter(
        (item) => item !== group_name
      );
      fetchCustomersWithGroupNames();
    }
  }
};
// supprimer un contact
const isAlertDeleteOpen = ref(false);
let closeDeleteAlert = () => {
  isAlertDeleteOpen.value = false;
};
const deleteCustomer = async (customer) => {
  const { data, error } = await supabase
    .from("customers")
    .delete()
    .eq("id", customer)
    .select()
    .single();

  if (!error) {
    isAlertDeleteOpen.value = true;
    customerStore.updatecustomers();
    stat.decrementCustomer();
  }
};
const deleteMultiple = async () => {
  const selectedIds = selectedRows.value.map((row) => row.id);
  const { data, error } = await supabase
    .from("customers")
    .delete()
    .in("id", selectedIds)
    .select();
  if (!error) {
    isAlertDeleteOpen.value = true;
    customerStore.updatecustomers();

    data.forEach((customer) => {
      customerStore.decrementcustomerParticular(customer?.customer_type);
      stat.decrementCustomer();
    });
  }
};

// Mobile specific handlers
const handleMobileEdit = async ({ id, data, isEntreprise: isEnt }) => {
  customerId.value = id;
  formData.value = { ...data };
  isEntreprise.value = isEnt;
  await editCustomer();
};

const addGroup = async (groupName) => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .insert({ name: groupName, created_by: user.value.id })
      .select()
      .single();
    
    if (!error) {
      customerStore.updateGroup();
      // Notification de succès
      alert(t('contact.groups.group_added'));
    }
  } catch (err) {
    console.error('Error adding group:', err);
  }
};

const deleteGroupById = async (groupId) => {
  try {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', groupId);
    
    if (!error) {
      customerStore.updateGroup();
      alert(t('contact.groups.group_deleted'));
    } 
  } catch (err) {
    console.error('Error deleting group:', err);
  }
};
</script>

<style scoped>
.error {
  color: red;
}
</style>