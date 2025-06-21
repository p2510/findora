<!-- components/MobileContactCard.vue -->
<template>
  <div class="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-slate-700">
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <!-- Name and Type -->
        <div class="flex items-center gap-2 mb-1">
          <h3 class="font-medium text-gray-900 dark:text-white truncate">
            {{ customer.name }}
          </h3>
          <UBadge
            v-if="customer.customer_type === 'Entreprise'"
            size="xs"
            color="emerald"
            variant="subtle"
          >
            {{ $t('customer.company') }}
          </UBadge>
          <UBadge
            v-else
            size="xs"
            color="orange"
            variant="subtle"
          >
            {{ $t('customer.individual') }}
          </UBadge>
        </div>

        <!-- Contact Info -->
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <UIcon name="i-heroicons-phone" class="w-4 h-4 flex-shrink-0" />
            <span>{{ customer.phone }}</span>
          </div>
          <div v-if="customer.email" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <UIcon name="i-heroicons-envelope" class="w-4 h-4 flex-shrink-0" />
            <span class="truncate">{{ customer.email }}</span>
          </div>
        </div>

        <!-- Groups -->
        <div v-if="groups.length > 0" class="flex flex-wrap gap-1 mt-2">
          <span
            v-for="(group, index) in groups.slice(0, 3)"
            :key="index"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400"
          >
            {{ group }}
          </span>
          <span
            v-if="groups.length > 3"
            class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
          >
            +{{ groups.length - 3 }}
          </span>
        </div>
      </div>

      <!-- Actions Menu -->
      <UDropdown :items="items" :popper="{ placement: 'bottom-end' }">
        <button class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
          <UIcon name="i-heroicons-ellipsis-vertical" class="w-5 h-5 text-gray-500" />
        </button>
      </UDropdown>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  customer: {
    type: Object,
    required: true
  },
  groups: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['edit', 'delete', 'view']);

const { t } = useI18n();

const items = computed(() => [
  [{
    label: t('customer.view'),
    icon: 'i-heroicons-eye',
    click: () => emit('view', props.customer)
  }],
  [{
    label: t('customer.edit'),
    icon: 'i-heroicons-pencil',
    click: () => emit('edit', props.customer)
  }],
  [{
    label: t('customer.delete'),
    icon: 'i-heroicons-trash',
    click: () => {
      if (confirm(t('customer.confirm_delete'))) {
        emit('delete', props.customer.id);
      }
    }
  }]
]);
</script>