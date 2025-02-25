<template>
  <div class="col-span-full flex items-end gap-4">
    <div class="space-y-[1px]">
      <label for="name" class="text-gray-500 text-sm">Client</label>
      <USelectMenu
        searchable
        searchable-placeholder="Trouver un client..."
        class="w-full lg:w-48"
        placeholder="Choisir un client"
        :options="customerStore.customer"
        option-attribute="name"
        multiple
        v-model="localCustomers"
        size="lg"
        color="black"
        variant="none"
        :ui="{
          base: 'hover:shadow-sm rounded-lg hover:shadow-sm  rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-[#f3c775]',
        }"
      >
        <template #option-empty="{ query }">
          <q>{{ query }}</q> n'existe pas
        </template>
        <template #label>
          <span v-if="localCustomers?.length" class="truncate"
            >{{ localCustomers?.length }} Selectionné(s)</span
          >
          <span v-else>Selection client</span>
        </template>
      </USelectMenu>
    </div>
    <button
      @click="selectAll"
      type="button"
      class="bg-slate-800 text-white rounded-md px-3 py-2 hover:bg-slate-950 transition duration-300 ease-in-out"
    >
      Choisir tous les clients
    </button>
    <div class="flex gap-4" v-if="list_group == null">
      <SkeletonButton />
      <SkeletonButton />
    </div>
    <button
      v-else
      v-for="group in list_group"
      :key="group.id"
      @click="selectByGroup(group.customers, group.name)"
      type="button"
      class="text-slate-800 rounded-md px-3 py-2 transition duration-300 ease-in-out"
      :class="
        group_select === group.name
          ? ' bg-[#f3c775] hover:bg-[#b99653]'
          : ' bg-[#f3c775]/50 hover:bg-[#b99653]'
      "
    >
      {{ group.name }}
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, defineProps, defineEmits } from "vue";
import { useCustomer } from "@/stores/customer";
const customerStore = useCustomer();
const { modelValue } = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
});

// Événements pour émettre des changements vers le parent
const emit = defineEmits(["update:modelValue"]);

// Valeur locale pour la sélection de clients
const localCustomers = ref(modelValue); // Référence initiale à modelValue

// Mise à jour du parent chaque fois que la sélection change
watch(localCustomers, (newValue) => {
  emit("update:modelValue", newValue); // Propager le changement vers le parent
});

const supabase = useSupabaseClient();
const list_group = ref(null);
const group_select = ref(null);

// Méthodes pour sélectionner des clients
const selectAll = () => {
  localCustomers.value = customerStore.customer;
  group_select.value = null;
};

const selectByGroup = (customers, group) => {
  localCustomers.value = customers;
  group_select.value = group;
};

onMounted(async () => {
  try {
    const { data: groups, error: groupsError } = await supabase
      .from("groups")
      .select("id, name");
    if (!groupsError) {
      const { data: groupsCustomers } = await supabase
        .from("groups_customers")
        .select("*, customers(phone, name, id)");
      groupsCustomers.forEach((item) => {
        const targetGroup = groups.find((g) => g.id === item.groups_id);
        if (targetGroup) {
          if (!targetGroup.customers) {
            targetGroup.customers = [];
          }
          targetGroup.customers.push(item.customers);
        }
      });
      list_group.value = groups;
    }
  } catch (err) {
    console.error(err);
  }
  if (customerStore.customer == null) {
    customerStore.updatecustomers();
  }
});
</script>
