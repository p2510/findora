<!-- components/MobileFiltersModal.vue -->
<template>
  <USlideover v-model="isOpen" :ui="{ width: 'max-w-sm' }">
    <div class="h-full flex flex-col bg-white dark:bg-slate-900">
      <!-- Header -->
      <div class="px-4 py-4 border-b border-gray-200 dark:border-slate-700">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('customer.filters') }}
          </h2>
          <button
            @click="isOpen = false"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Filter Options -->
      <div class="flex-1 overflow-y-auto p-4 space-y-6">
        <!-- Contact Type Filter -->
        <div>
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            {{ $t('customer.contact_type') }}
          </h3>
          <div class="space-y-2">
            <label
              v-for="type in customerTypes"
              :key="type.key"
              class="flex items-center p-3 bg-gray-50 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <input
                type="checkbox"
                :value="type"
                :checked="selectedType.some(t => t.key === type.key)"
                @change="toggleType(type)"
                class="rounded border-gray-300 text-[#ffbd59] focus:ring-[#ffbd59]"
              />
              <span class="ml-3 text-sm text-gray-700 dark:text-gray-300">
                {{ type.label }}
              </span>
            </label>
          </div>
        </div>

        <!-- Active Filters Summary -->
        <div v-if="selectedType.length > 0" class="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3">
          <p class="text-sm text-amber-800 dark:text-amber-200 mb-2">
            {{ $t('customer.active_filters') }}:
          </p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="type in selectedType"
              :key="type.key"
              class="inline-flex items-center gap-1 px-2 py-1 bg-white dark:bg-slate-800 rounded-md text-xs"
            >
              {{ type.label }}
              <button
                @click="removeType(type)"
                class="text-gray-400 hover:text-gray-600"
              >
                <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="px-4 py-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
        <UButton
          @click="applyFilters"
          color="amber"
          block
          size="lg"
        >
          {{ $t('customer.apply_filters') }}
        </UButton>
        <UButton
          @click="resetAndClose"
          color="gray"
          variant="ghost"
          block
          size="lg"
        >
          {{ $t('customer.reset') }}
        </UButton>
      </div>
    </div>
  </USlideover>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  selectedType: {
    type: Array,
    default: () => []
  },
  customerTypes: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['update:modelValue', 'update:selectedType', 'reset']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const toggleType = (type) => {
  const currentTypes = [...props.selectedType];
  const index = currentTypes.findIndex(t => t.key === type.key);
  
  if (index > -1) {
    currentTypes.splice(index, 1);
  } else {
    currentTypes.push(type);
  }
  
  emit('update:selectedType', currentTypes);
};

const removeType = (type) => {
  const currentTypes = props.selectedType.filter(t => t.key !== type.key);
  emit('update:selectedType', currentTypes);
};

const applyFilters = () => {
  isOpen.value = false;
};

const resetAndClose = () => {
  emit('reset');
  isOpen.value = false;
};
</script>