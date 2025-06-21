<!-- components/MobileCampaignCustomerSelection.vue -->
<template>
  <div class="space-y-3">
    <!-- Compteur et actions -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-600 dark:text-gray-400">
        <span class="font-medium text-gray-900 dark:text-white">{{ localCustomers?.length || 0 }}</span>
        / {{ totalContacts.toLocaleString("fr-FR") }}
        {{ $t("whatsapp.customer.selected_contacts") }}
      </div>
      <button
        @click="selectAll"
        type="button"
        class="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition-colors"
      >
        {{ localCustomers?.length === totalContacts ? $t("whatsapp.customer.deselect_all") : $t("whatsapp.customer.select_all") }}
      </button>
    </div>

    <!-- Groupes -->
    <div v-if="list_group.length > 0" class="flex flex-wrap gap-2">
      <button
        v-for="group in list_group"
        :key="group.id"
        @click="selectByGroup(group.customers, group.name)"
        type="button"
        class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        :class="
          group_select === group.name
            ? 'bg-[#f3c775] text-slate-900'
            : 'bg-[#f3c775]/20 text-slate-700 dark:text-slate-300 hover:bg-[#f3c775]/30'
        "
      >
        {{ group.name }}
        <span class="text-xs opacity-70 ml-1">({{ group.customers.length }})</span>
      </button>
    </div>

    <!-- Recherche et sélection -->
    <div class="space-y-2">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="$t('whatsapp.customer.search_contact')"
        class="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#f3c775] focus:border-transparent outline-none"
      />
      
      <div
        class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto"
        ref="scrollContainer"
        @scroll="handleScroll"
      >
        <!-- État de chargement -->
        <div v-if="isLoading" class="flex items-center justify-center py-8">
          <div class="animate-spin rounded-full h-6 w-6 border-2 border-[#f3c775] border-t-transparent mr-2"></div>
          <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t("whatsapp.customer.loading") }}</span>
        </div>

        <!-- Liste des contacts -->
        <template v-else>
          <div v-if="filteredContacts.length === 0" class="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
            {{ $t("whatsapp.customer.no_contact_found") }} "{{ searchQuery }}"
          </div>
          
          <div v-else class="divide-y divide-gray-100 dark:divide-slate-800">
            <label
              v-for="contact in visibleContacts"
              :key="contact.id"
              class="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-slate-800 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                :checked="isSelected(contact)"
                @change="toggleContact(contact)"
                class="w-4 h-4 text-[#f3c775] bg-gray-100 border-gray-300 rounded focus:ring-[#f3c775] focus:ring-2"
              />
              <div class="ml-3 flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {{ contact.name }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ contact.phone }}
                </p>
              </div>
            </label>
            
            <!-- Chargement supplémentaire -->
            <div v-if="loadingMore" class="flex items-center justify-center py-3">
              <div class="animate-spin rounded-full h-4 w-4 border-2 border-[#f3c775] border-t-transparent mr-2"></div>
              <span class="text-xs text-gray-500">{{ $t("whatsapp.customer.loading_more") }}</span>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Contacts sélectionnés -->
    <div v-if="localCustomers.length > 0" class="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3">
      <p class="text-xs font-medium text-emerald-800 dark:text-emerald-400 mb-2">
        {{ $t("customer.selected") }} ({{ localCustomers.length }})
      </p>
      <div class="flex flex-wrap gap-1">
        <span
          v-for="(customer, index) in localCustomers.slice(0, 5)"
          :key="index"
          class="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-800 rounded text-xs"
        >
          {{ customer.name }}
          <button
            @click="toggleContact(customer)"
            type="button"
            class="text-gray-400 hover:text-gray-600"
          >
            <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
          </button>
        </span>
        <span
          v-if="localCustomers.length > 5"
          class="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-xs text-gray-600 dark:text-gray-400"
        >
          +{{ localCustomers.length - 5 }} {{ $t("customer.others") }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useCustomer } from "@/stores/customer";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:modelValue"]);

// Configuration
const PAGE_SIZE = 50;
const BUFFER_SIZE = 10;

// États
const customerStore = useCustomer();
const supabase = useSupabaseClient();
const localCustomers = ref(props.modelValue || []);
const list_group = ref([]);
const group_select = ref(null);
const searchQuery = ref("");
const isLoading = ref(true);
const loadingMore = ref(false);
const currentPage = ref(1);
const visibleContacts = ref([]);
const scrollContainer = ref(null);
const allContacts = ref([]);
const totalContacts = ref(0);

// Surveiller les changements
watch(localCustomers, (newValue) => {
  emit("update:modelValue", newValue);
});

// Filtrer les contacts
const filteredContacts = computed(() => {
  if (!searchQuery.value) return allContacts.value;
  
  const query = searchQuery.value.toLowerCase();
  return allContacts.value.filter(
    (contact) => 
      contact.name?.toLowerCase().includes(query) ||
      contact.phone?.includes(query)
  );
});

// Vérifier si sélectionné
const isSelected = (contact) => {
  return localCustomers.value.some((c) => c.id === contact.id);
};

// Basculer la sélection
const toggleContact = (contact) => {
  const index = localCustomers.value.findIndex((c) => c.id === contact.id);
  if (index >= 0) {
    localCustomers.value = localCustomers.value.filter((c) => c.id !== contact.id);
  } else {
    localCustomers.value = [...localCustomers.value, contact];
  }
  group_select.value = null;
};

// Sélectionner tout
const selectAll = () => {
  if (localCustomers.value.length === allContacts.value.length) {
    localCustomers.value = [];
  } else {
    localCustomers.value = [...allContacts.value];
  }
  group_select.value = null;
};

// Sélectionner par groupe
const selectByGroup = (customers, groupName) => {
  localCustomers.value = [...customers];
  group_select.value = groupName;
};

// Gérer le défilement
const handleScroll = async () => {
  if (!scrollContainer.value) return;
  
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
  
  if (scrollTop + clientHeight >= scrollHeight - 50) {
    await loadMoreContacts();
  }
};

// Mettre à jour les contacts visibles
const updateVisibleContacts = () => {
  if (!filteredContacts.value.length) {
    visibleContacts.value = [];
    return;
  }
  
  const endIndex = Math.min(
    currentPage.value * PAGE_SIZE,
    filteredContacts.value.length
  );
  
  visibleContacts.value = filteredContacts.value.slice(0, endIndex);
};

// Charger plus de contacts
const loadMoreContacts = async () => {
  if (
    loadingMore.value ||
    visibleContacts.value.length >= filteredContacts.value.length
  ) return;
  
  loadingMore.value = true;
  await new Promise(resolve => setTimeout(resolve, 300));
  
  currentPage.value++;
  updateVisibleContacts();
  loadingMore.value = false;
};

// Réinitialiser lors du changement de recherche
watch(searchQuery, () => {
  currentPage.value = 1;
  updateVisibleContacts();
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0;
  }
});

// Charger les données
const loadData = async () => {
  isLoading.value = true;
  
  try {
    // Charger les contacts
    if (!customerStore.customer) {
      await customerStore.updatecustomers();
    }
    
    allContacts.value = customerStore.customer || [];
    totalContacts.value = allContacts.value.length;
    
    // Charger les groupes
    const { data: groups } = await supabase
      .from("groups")
      .select("id, name");
    
    if (groups) {
      const { data: groupsCustomers } = await supabase
        .from("groups_customers")
        .select("*, customers(phone, name, id)");
      
      if (groupsCustomers) {
        groups.forEach((group) => {
          group.customers = groupsCustomers
            .filter((gc) => gc.groups_id === group.id)
            .map((gc) => gc.customers)
            .filter(Boolean);
        });
        
        list_group.value = groups.filter(g => g.customers.length > 0);
      }
    }
  } catch (err) {
    console.error("Erreur lors du chargement:", err);
  } finally {
    updateVisibleContacts();
    isLoading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>