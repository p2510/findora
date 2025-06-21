
<template>
  <div>
    <!-- Header Section -->
    <div
      class="w-full fixed top-0 z-40 bg-transparent backdrop-blur-lg  dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 mt-16"
    >
      <div class="px-4 py-3">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ $t("customer.manage_contacts") }}
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ totalContacts }} {{ $t("customer.contact(s)") }}
            </p>
          </div>
          <div class="flex items-center gap-2">
            <MobileCustomerAdd @submit="$emit('refresh')" />
            <button
              @click="showMobileFilters = true"
              class="p-2 bg-gray-100 dark:bg-slate-700 rounded-lg"
            >
              <UIcon name="i-heroicons-funnel" class="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Search Bar -->
      <div class="px-4 pb-3">
        <UInput
          v-model="localSearch"
          icon="i-heroicons-magnifying-glass-20-solid"
          :placeholder="$t('customer.search_by_name_phone_email')"
          class="w-full"
          size="md"
        />
      </div>
    </div>

    <!-- Action Cards -->
    <div class="px-4 py-3 grid grid-cols-2 gap-3 mt-44">
      <CustomerSynchro @submit="$emit('refresh')" />
      <div
        @click="showGroupModal = true"
        class="cursor-pointer border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-[#ffbd59] transition-colors"
      >
        <UIcon name="i-heroicons-user-group" class="w-6 h-6 text-gray-400" />
        <span class="text-xs text-gray-600 dark:text-gray-400 text-center">
          {{ $t("contact.groups.manage_title") }}
        </span>
      </div>
    </div>

    <!-- Contact List -->
    <div class="px-4 pb-20">
      <div v-if="loading" class="flex justify-center py-8">
        <UIcon
          name="i-heroicons-arrow-path"
          class="w-6 h-6 animate-spin text-gray-400"
        />
      </div>

      <div
        v-else-if="paginatedCustomers.length === 0"
        class="text-center py-12"
      >
        <div
          class="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <UIcon name="i-heroicons-users" class="w-8 h-8 text-gray-400" />
        </div>
        <p class="text-gray-600 dark:text-gray-400 mb-2">
          {{ $t("customer.no_contact_found") }}
        </p>
        <MobileCustomerAdd @submit="$emit('refresh')" />
      </div>

      <div v-else class="space-y-3">
        <MobileContactCard
          v-for="customer in paginatedCustomers"
          :key="customer.id"
          :customer="customer"
          :groups="getCustomerGroups(customer.id)"
          @edit="handleEdit(customer)"
          @delete="handleDelete(customer.id)"
          @view="handleView(customer)"
        />
      </div>

      <!-- Load More Button -->
      <div
        v-if="hasMore"
        class="mt-4"
      >
        <button
          @click="loadMore"
          class="w-full py-3 bg-gray-100 dark:bg-slate-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {{ $t("customer.load_more") }}
        </button>
      </div>
    </div>

    <!-- Mobile Filters Modal -->
    <MobileFiltersModal
      v-model="showMobileFilters"
      :selectedType="localSelectedType"
      @update:selectedType="localSelectedType = $event"
      :customerTypes="customerTypes"
      @reset="resetFilters"
    />
    
    <!-- Mobile View Customer Modal -->
    <MobileViewCustomer
      v-model="showViewModal"
      :customer="selectedCustomer"
      @delete-group="handleDeleteGroup"
    />

    <!-- Mobile Edit Customer Modal -->
    <MobileEditCustomer 
      v-model="showEditModal"
      :customerId="editingCustomerId"
      :initialData="editFormData"
      :isEntreprise="isEntreprise"
      @update:isEntreprise="isEntreprise = $event"
      @submit="handleEditSubmit"
      :loading="editLoading"
    />

    <!-- Mobile Group Management Modal -->
    <MobileGroupManagement
      v-model="showGroupModal"
      :groups="groups"
      @add="handleAddGroup" 
      @delete="handleDeleteGroupById"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  customers: {
    type: Array,
    default: () => []
  },
  groups: {
    type: Array,
    default: () => []
  },
  groupedCustomers: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  search: {
    type: String,
    default: ''
  },
  selectedType: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits([
  'refresh',
  'delete-customer',
  'edit-customer',
  'delete-group',
  'add-group',
  'delete-group-by-id',
  'update:search',
  'update:selectedType'
]);

const { t } = useI18n();

// Local state
const showMobileFilters = ref(false);
const showGroupModal = ref(false);
const showViewModal = ref(false);
const showEditModal = ref(false);
const mobilePageSize = ref(10);
const currentPage = ref(1);
const selectedCustomer = ref({});
const editingCustomerId = ref(null);
const editFormData = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
});
const isEntreprise = ref(false);
const editLoading = ref(false);

// Local search and filters
const localSearch = computed({
  get: () => props.search,
  set: (value) => emit('update:search', value)
});

const localSelectedType = computed({
  get: () => props.selectedType,
  set: (value) => emit('update:selectedType', value)
});

// Customer types
const customerTypes = [
  { key: "Entreprise", label: t('customer.company'), value: "Entreprise" },
  { key: "Particulier", label: t('customer.individual'), value: "Particulier" },
];

// Computed
const totalContacts = computed(() => props.customers?.length || 0);

const filteredCustomers = computed(() => {
  if (!Array.isArray(props.customers)) return [];
  
  return props.customers.filter(customer => {
    const matchesSearch = localSearch.value === "" ||
      [customer.name, customer.phone, customer.email]
        .join(" ")
        .toLowerCase()
        .includes(localSearch.value.toLowerCase());
    
    const matchesType = localSelectedType.value.length === 0 ||
      localSelectedType.value.some(obj => obj.value === customer.customer_type);
    
    return matchesSearch && matchesType;
  });
});

const paginatedCustomers = computed(() => {
  return filteredCustomers.value.slice(0, currentPage.value * mobilePageSize.value);
});

const hasMore = computed(() => {
  return filteredCustomers.value.length > paginatedCustomers.value.length;
});

// Methods
const getCustomerGroups = (customerId) => {
  const customer = props.groupedCustomers.find(
    c => c.customer_id === customerId
  );
  return customer ? customer.groups : [];
};

const loadMore = () => {
  currentPage.value++;
};

const resetFilters = () => {
  localSearch.value = "";
  localSelectedType.value = [];
  currentPage.value = 1;
};

const handleEdit = (customer) => {
  editingCustomerId.value = customer.id;
  editFormData.value = {
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
  };
  isEntreprise.value = customer.customer_type === "Entreprise";
  showEditModal.value = true;
};

const handleView = (customer) => {
  selectedCustomer.value = {
    ...customer,
    groups: getCustomerGroups(customer.id),
  };
  showViewModal.value = true;
};

const handleDelete = async (customerId) => {
  emit('delete-customer', customerId);
};

const handleEditSubmit = async (data) => {
  editLoading.value = true;
  await emit('edit-customer', {
    id: editingCustomerId.value,
    data,
    isEntreprise: isEntreprise.value
  });
  editLoading.value = false;
  showEditModal.value = false;
};

const handleDeleteGroup = (customerId, groupName) => {
  emit('delete-group', customerId, groupName);
  // Update local selected customer if needed
  if (selectedCustomer.value.id === customerId) {
    selectedCustomer.value.groups = selectedCustomer.value.groups.filter(
      g => g !== groupName
    );
  }
};

const handleAddGroup = (groupName) => {
  emit('add-group', groupName);
};

const handleDeleteGroupById = (groupId) => {
  emit('delete-group-by-id', groupId);
};

// Reset pagination when filters change
watch([localSearch, localSelectedType], () => {
  currentPage.value = 1;
});
</script>