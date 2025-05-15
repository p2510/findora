<template>
  <div class="col-span-full flex flex-col gap-4 z-30 w-full">
    <!-- En-tête avec compteurs et filtres -->
    <div class="flex items-center justify-between">
      <div class="text-sm text-gray-600 pr-4">
        {{ localCustomers?.length || 0 }} / {{ totalContacts.toLocaleString("fr-FR") }} sélectionné(s)
      </div>
      <div class="flex items-center gap-2">
   
        <button
          @click="selectAll"
          type="button"
          class="bg-slate-800 text-white rounded-md px-3 py-2 text-sm hover:bg-slate-950 transition duration-300 ease-in-out"
        >
          Tout sélectionner
        </button>
            <!-- Groupes de contacts -->
        <div class="flex flex-wrap gap-2 ">
          <button
            v-for="group in list_group"
            :key="group.id"
            @click="selectByGroup(group.customers, group.name)"
            type="button"
            class="text-slate-800 rounded-md px-3 py-2 text-sm transition duration-300 ease-in-out"
            :class="
              group_select === group.name
                ? 'bg-[#f3c775] hover:bg-[#b99653]'
                : 'bg-[#f3c775]/50 hover:bg-[#b99653]'
            "
          >
            {{ group.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Sélecteur principal avec virtualisation -->
    <div class="relative">
      <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Rechercher un contact..." 
          class="w-full px-3 py-2 border border-gray-300 rounded-t-lg text-sm focus:border-[#f3c775] outline-none"
        />
      <div 
        class="w-full border-2 rounded-b-lg bg-white p-2 max-h-40 overflow-auto"
        ref="scrollContainer"
        @scroll="handleScroll"
      >
        <!-- État de chargement initial -->
        <div v-if="isLoading" class="flex justify-center py-4">
          <div class="animate-spin rounded-full h-6 w-6 border-2 border-[#f3c775] border-t-transparent"></div>
        </div>
        
        <!-- Liste virtualisée des contacts -->
        <template v-else>
          <div v-if="filteredContacts.length === 0" class="text-center py-4 text-gray-500">
            Aucun contact trouvé pour "{{ searchQuery }}"
          </div>
          <div v-else class="space-y-1">
            <div 
              v-for="contact in visibleContacts" 
              :key="contact.id"
              class="flex items-center px-2 py-2 hover:bg-gray-100 rounded-md cursor-pointer"
              @click="toggleContact(contact)"
            >
              <input 
                type="checkbox" 
                :checked="isSelected(contact)" 
                class="mr-3 h-4 w-4 accent-[#f3c775]"
                @click.stop
              />
              <p class="truncate text-sm"> <span>{{ contact.name }} </span> - <span class="text-xs opacity-70">{{ contact.phone }} </span> </p>
            </div>
            <!-- Indicateur de chargement en bas -->
            <div v-if="loadingMore" class="flex justify-center py-2">
              <div class="animate-spin rounded-full h-4 w-4 border-2 border-[#f3c775] border-t-transparent"></div>
            </div>
          </div>
        </template>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, computed, onMounted, defineProps, defineEmits, watch, nextTick } from "vue";
import { useCustomer } from "@/stores/customer";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

// Configuration pour le chargement paginé
const PAGE_SIZE = 100;
const BUFFER_SIZE = 20; // Nombre d'éléments à charger en avance

// États et références
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
const lastScrollPosition = ref(0);
const allContacts = ref([]);
const totalContacts = ref(0);

// Émetteur d'événements
const emit = defineEmits(["update:modelValue"]);

// Surveiller les changements de sélection
watch(localCustomers, (newValue) => {
  emit("update:modelValue", newValue);
});

// Filtrer les contacts en fonction de la recherche
const filteredContacts = computed(() => {
  if (!searchQuery.value) return allContacts.value;
  
  const query = searchQuery.value.toLowerCase();
  return allContacts.value.filter(contact => 
    contact.name && contact.name.toLowerCase().includes(query)
  );
});

// Vérifier si un contact est sélectionné
const isSelected = (contact) => {
  return localCustomers.value.some(c => c.id === contact.id);
};

// Gérer la sélection d'un contact
const toggleContact = (contact) => {
  const index = localCustomers.value.findIndex(c => c.id === contact.id);
  if (index >= 0) {
    const newSelection = [...localCustomers.value];
    newSelection.splice(index, 1);
    localCustomers.value = newSelection;
  } else {
    localCustomers.value = [...localCustomers.value, contact];
  }
};

// Sélectionner tous les contacts affichés
const selectAll = () => {
  if (filteredContacts.value.length === localCustomers.value.length) {
    // Si tous sont déjà sélectionnés, désélectionner tout
    localCustomers.value = [];
  } else {
    // Sinon sélectionner tous les contacts filtrés
    localCustomers.value = [...filteredContacts.value];
  }
  group_select.value = null;
};

// Sélectionner par groupe
const selectByGroup = (customers, group) => {
  localCustomers.value = [...customers];
  group_select.value = group;
};

// Gérer le défilement et charger plus de données si nécessaire
const handleScroll = async () => {
  if (!scrollContainer.value) return;
  
  const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value;
  
  // Déterminer la direction du défilement
  const isScrollingDown = scrollTop > lastScrollPosition.value;
  lastScrollPosition.value = scrollTop;
  
  // Charger plus d'éléments si proche du bas
  if (isScrollingDown && scrollTop + clientHeight >= scrollHeight - 100) {
    await loadMoreContacts();
  }
  
  // Mettre à jour les contacts visibles en fonction de la position de défilement
  updateVisibleContacts();
};

// Mettre à jour la liste des contacts visibles
const updateVisibleContacts = () => {
  if (!filteredContacts.value.length) return;
  
  const startIndex = Math.max(0, currentPage.value * PAGE_SIZE - PAGE_SIZE);
  const endIndex = Math.min(filteredContacts.value.length, currentPage.value * PAGE_SIZE + BUFFER_SIZE);
  
  visibleContacts.value = filteredContacts.value.slice(startIndex, endIndex);
};

// Charger plus de contacts
const loadMoreContacts = async () => {
  if (loadingMore.value || visibleContacts.value.length >= filteredContacts.value.length) return;
  
  loadingMore.value = true;
  
  // Simuler un délai de chargement (à supprimer en production)
  await new Promise(resolve => setTimeout(resolve, 300));
  
  currentPage.value++;
  updateVisibleContacts();
  loadingMore.value = false;
};

// Réinitialiser la pagination quand le filtre change
watch(searchQuery, () => {
  currentPage.value = 1;
  updateVisibleContacts();
  
  // Réinitialiser la position de défilement
  if (scrollContainer.value) {
    scrollContainer.value.scrollTop = 0;
  }
});

// Charger les contacts et les groupes
const loadCustomersAndGroups = async () => {
  isLoading.value = true;
  
  try {
    // Charger les contacts
    if (customerStore.customer == null) {
      await customerStore.updatecustomers();
    }
    
    // Utiliser les données du store
    allContacts.value = customerStore.customer || [];
    totalContacts.value = allContacts.value.length;
    
    // Charger les groupes
    const { data: groups, error: groupsError } = await supabase
      .from("groups")
      .select("id, name");
      
    if (!groupsError && groups) {
      const { data: groupsCustomers, error: gcError } = await supabase
        .from("groups_customers")
        .select("*, customers(phone, name, id)");
        
      if (!gcError && groupsCustomers) {
        groups.forEach((group) => {
          group.customers = groupsCustomers
            .filter(gc => gc.groups_id === group.id)
            .map(gc => gc.customers)
            .filter(Boolean);
        });
        
        list_group.value = groups;
      }
    }
  } catch (err) {
    console.error("Erreur lors du chargement des données:", err);
  } finally {
    // Initialiser les contacts visibles
    updateVisibleContacts();
    isLoading.value = false;
  }
};

// Initialisation
onMounted(async () => {
  await loadCustomersAndGroups();
  
  // Observer les redimensionnements pour recalculer les contacts visibles
  if (window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(() => {
      updateVisibleContacts();
    });
    
    if (scrollContainer.value) {
      resizeObserver.observe(scrollContainer.value);
    }
  }
});
</script>