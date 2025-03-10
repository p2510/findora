<template>
  <div class="mt-14 space-y-4 pr-4">
    <CustomerMetrics />

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
            Gérer vos clients
          </h2>
          <div class="flex gap-2">
            <CustomerAdd @submit="fetchCustomers" />
            <CustomerImport @submit="fetchCustomers" />
          </div>
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
          <USelectMenu
            v-model="selectedType"
            :options="customerTypes"
            multiple
            placeholder="Type de client"
            variant="none"
            class="w-40 border-[#f3c775] border-[1px] rounded-lg basis-1/2"
          >
            <template #label>
              <span v-if="selectedType.length" class="truncate"
                >{{ selectedType.length }} Selectionné(s)</span
              >
              <span v-else>Type de client</span>
            </template>
          </USelectMenu>
        </div>

        <AssignGroup class="basis-1/2" :customers="selectedRows" />
      </div>
      <!-- Header and Action buttons -->
      <div class="flex justify-between items-center w-full px-4 py-3">
        <div class="flex items-center gap-1.5">
          <span class="text-sm leading-5">Ligne par page :</span>

          <USelect
            v-model="pageCount"
            :options="[3, 5, 10, 20, 30, 40]"
            class="me-2 w-20"
            size="sm"
          />

          <button
            @click="deleteMultiple"
            v-show="selectedRows.length > 0"
            class="p-2 text-white bg-red-600 hover:bg-red-700 transition duration-300 ease-in-out rounded-md flex items-center gap-2"
          >
            <span class="text-xs">Supprimer</span>
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
          Réinitialiser
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
        class="w-full h-80 overflow-y-scroll"
        :ui="{
          td: { base: 'max-w-[0] truncate' },
          default: { checkbox: { color: 'gray' } },
        }"
        @select="select"
        :empty-state="{
          icon: 'i-heroicons-circle-stack-20-solid',
          label: 'Oups , Aucun client trouvé',
        }"
      >
        <template #customer_type-data="{ row }">
          <UBadge
            v-if="row.customer_type == 'Entreprise'"
            size="xs"
            label="Entreprise"
            color="emerald"
            variant="subtle"
          />
          <UBadge
            v-else
            size="xs"
            label="Particulier"
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
              <span class="font-medium">{{ filteredCustomers.length }}</span>
              résultats
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

    <!--Show customer-->
    <UModal v-model="isOpenShow">
      <div class="p-4 space-y-5">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="font-semibold text-gray-700 text-xl">
              {{ selectedCustomer.name }}
            </h3>
            <h5 class="font-semibold text-gray-500 text-md">
              {{ selectedCustomer?.email }}
            </h5>
          </div>
          <div class="flex items-center gap-2">
            <UIcon
              name="i-heroicons-phone-arrow-up-right"
              class="text-gray-700 w-5 h-5"
            />
            <span class="font-semibold text-gray-700 text-md">
              {{ selectedCustomer.phone }}</span
            >
          </div>
          <UBadge
            color="amber"
            variant="soft"
            class="text-md"
            :icon="
              selectedCustomer.customer_type == 'Particulier'
                ? 'i-heroicons-users'
                : 'i-heroicons-building-office-2'
            "
            >{{ selectedCustomer.customer_type }}</UBadge
          >
        </div>
        <div class="flex justify-between items-center">
          <div class="flex gap-2 items-center">
            <UBadge
              color="emerald"
              variant="soft"
              v-for="item in selectedCustomer.groups"
              :key="item.id"
              class="text-sm flex items-center justify-between"
            >
              <span>{{ item }}</span>
              <UIcon
                @click="deleteGroups(selectedCustomer.id, item)"
                name="i-heroicons-x-mark"
                class="cursor-pointer text-slate-800 w-3 h-3 hover:opacity-80 transition ease-in-out duration-300"
            /></UBadge>
          </div>

          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-map-pin" class="text-gray-800 w-5 h-5" />
            <span class="text-gray-800 text-md">
              {{ selectedCustomer?.address }}</span
            >
          </div>
        </div>
      </div>
    </UModal>
    <!--Edit customer-->
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
              <UBadge color="gray" variant="soft" size="lg" v-if="!isEntreprise"
                >Particulier</UBadge
              >
              <UBadge color="amber" variant="soft" size="lg" v-else
                >Entreprise</UBadge
              >
            </h5>
            <span class="text-gray-500 text-sm" v-if="!isEntreprise"
              >Vous êtes sur le point de modifier un client de type
              particulier.</span
            >
            <span class="text-gray-500 text-sm" v-else
              >Vous êtes sur le point de modifier un client de type
              entreprise.</span
            >
          </div>
        </template>

        <form class="grid grid-cols-12 gap-4" @submit.prevent="editCustomer">
          <div class="col-span-full flex items-center justify-center gap-4">
            <p>
              <span class="text-gray-500 text-sm" v-if="!isEntreprise"
                >Activer pour passer à un client de type entreprise</span
              >
              <span class="text-gray-500 text-sm" v-else
                >Activer pour passer à un client de type particulier</span
              >
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
              class="text-gray-500 font-semibold"
              v-if="!isEntreprise"
              >Nom & prénom
            </label>
            <label for="name" class="text-gray-500 font-semibold" v-else
              >Nom d'entreprise
            </label>
            <InputFiled
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
            <label for="email" class="text-gray-500 font-semibold">Email</label>
            <InputFiled
              type="email"
              custom-class="hover:shadow-sm p-2 rounded-lg"
              v-model="formData.email"
            />
            <div v-if="errors.email.length" class="error">
              {{ errors.email[0] }}
            </div>
          </div>
          <div class="col-span-full space-y-[1px]">
            <label for="phone" class="text-gray-500 font-semibold"
              >Numéro de téléphone</label
            >
            <MazPhoneNumberInput
              block
              :translations="{
                countrySelector: {
                  placeholder: 'Indicatif',
                  error: 'Choisir un pays',
                  searchPlaceholder: 'Trouver un pays',
                },
                phoneInput: {
                  placeholder: 'Numéro de téléphone',
                  example: 'Exemple:',
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
            <label for="adress" class="text-gray-500 font-semibold"
              >Adresse</label
            >
            <InputFiled
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
              color="yellow"
              >Mettre à jour ce client</UButton
            >
          </div>
        </form>
      </UCard>
    </USlideover>

    <!--Alert message-->
    <div v-if="isAlertDeleteOpen">
      <AlertModal
        title="Client supprimé"
        type="success"
        @close-alert="closeDeleteAlert"
      >
        <template #message>
          <p>
            La suppression du client a été effectuée avec
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
  alias: "/client",
});
useHead({
  title: "Findora - Mes clients",
});
import { useCustomer } from "@/stores/customer";
const customerStore = useCustomer();
import { useStat } from "@/stores/stat";
const stat = useStat();
const supabase = useSupabaseClient();
const { errors, validateForm, handleServerErrors } = useFormValidation();

let selectedRows = ref([]);
// Table Columns
const columns = [
  { key: "id", label: "ID", sortable: false },
  { key: "name", label: "Nom", sortable: true },
  { key: "phone", label: "Téléphone", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "address", label: "Adresse", sortable: true },
  { key: "customer_type", label: "Type", sortable: true },
  { key: "actions", label: "Actions", sortable: false },
];
const selectedColumns = ref(columns);
const columnsTable = computed(() =>
  columns.filter((column) => selectedColumns.value.includes(column))
);

// Filters and Search
const search = ref("");
const selectedType = ref([]);
const customerTypes = [
  { key: "Entreprise", label: "Entreprise", value: "Entreprise" },
  { key: "Particulier", label: "Particulier", value: "Particulier" },
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
  if (!filteredCustomers.value || filteredCustomers.value.length === 0) {
    return 0;
  }
  return Math.min(page.value * pageCount.value, filteredCustomers.value.length);
});

// callback function
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
// groups
let groupedCustomers = ref([]);
const fetchCustomersWithGroupNames = async () => {
  try {
    // Requête avec jointure pour récupérer les noms des groupes associés à chaque client
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

      // Ajouter le nom du groupe au client
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
  fetchCustomersWithGroupNames();
});

// Filtered and Paginated Data
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
      label: "Voir ce client",
      icon: "i-heroicons-eye-20-solid",
      click: () => {
        isOpenShow.value = true;
        selectedCustomer.value = filteredCustomers.value.find(
          (customer) => customer.id === row.id
        );
        const customerGroups = getCustomerGroupsById(selectedCustomer.value.id);

        // Assigner les groupes du client à selectedCustomer ou une autre variable si nécessaire
        selectedCustomer.value.groups = customerGroups;
      },
    },
    {
      label: "Modifier",
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
      label: "Supprimer",
      icon: "i-heroicons-trash-20-solid",
      click: () => deleteCustomer(row.id),
    },
  ],
];

//show Customer

// edit customer
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
        phone: formData.value.phone,
        address: formData.value.address,
        customer_type: isEntreprise.value ? "Entreprise" : "Particulier",
      })
      .eq("id", customerId.value)
      .select()
      .single();

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
      formData.value.name = "";
      formData.value.email = "";
      formData.value.phone = "";
      formData.value.address = "";
      isRequestInProgress.value = false;
      customerStore.updatecustomers();
      if (oldIsEntreprise.value !== isEntreprise.value) {
        customerStore.mixcustomerParticular(isEntreprise.value);
      }

      isOpenEdit.value = false;
    }
  } catch (err) {
    handleServerErrors({ code: "23514", message: "Erreur serveur" });
    isRequestInProgress.value = false;
  }
};

// delete groups
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
    }
  }
};
// delete customer
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
    customerStore.decrementcustomerParticular(data?.customer_type);
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
</script>

<style scoped>
.error {
  color: red;
}
</style>
