<!-- components/MobileViewCustomer.vue -->
<template>
  <USlideover v-model="isOpen" :ui="{ width: 'max-w-md' }">
    <div v-if="customer" class="h-full flex flex-col bg-white dark:bg-slate-900">
      <!-- Header -->
      <div class="px-4 py-4 border-b border-gray-200 dark:border-slate-700">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ customer.name }}
            </h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ customer.email }}
            </p>
          </div>
          <button
            @click="isOpen = false"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-4 space-y-6">
        <!-- Contact Type Badge -->
        <div class="flex justify-center">
          <UBadge
            :color="customer.customer_type === 'Entreprise' ? 'emerald' : 'orange'"
            size="lg"
            class="px-4 py-2"
          >
            <UIcon
              :name="customer.customer_type === 'Entreprise' ? 'i-heroicons-building-office-2' : 'i-heroicons-user'"
              class="w-4 h-4 mr-2"
            />
            {{ customer.customer_type === 'Entreprise' ? $t('customer.company') : $t('customer.individual') }}
          </UBadge>
        </div>

        <!-- Contact Information -->
        <div class="space-y-4">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ $t('customer.contact_information') }}
          </h3>
          
          <div class="space-y-3">
            <!-- Phone -->
            <div class="flex items-start gap-3">
              <div class="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
                <UIcon name="i-heroicons-phone" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('customer.phone') }}</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">+{{ customer.phone }}</p>
              </div>
            </div>

            <!-- Email -->
            <div v-if="customer.email" class="flex items-start gap-3">
              <div class="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
                <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('customer.email') }}</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white break-all">{{ customer.email }}</p>
              </div>
            </div>

            <!-- Address -->
            <div v-if="customer.address" class="flex items-start gap-3">
              <div class="p-2 bg-gray-100 dark:bg-slate-800 rounded-lg">
                <UIcon name="i-heroicons-map-pin" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ $t('customer.address') }}</p>
                <p class="text-sm font-medium text-gray-900 dark:text-white">{{ customer.address }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Groups -->
        <div v-if="customer.groups && customer.groups.length > 0" class="space-y-4">
          <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ $t('customer.groups') }}
          </h3>
          <div class="flex flex-wrap gap-2">
            <div
              v-for="(group, index) in customer.groups"
              :key="index"
              class="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg"
            >
              <span class="text-sm font-medium text-emerald-800 dark:text-emerald-400">
                {{ group }}
              </span>
              <button
                @click="$emit('delete-group', customer.id, group)"
                class="p-0.5 rounded hover:bg-emerald-200 dark:hover:bg-emerald-800 transition-colors"
              >
                <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
              </button>
            </div>
          </div>
        </div>

        <!-- Created Date -->
        <div v-if="customer.created_at" class="pt-4 border-t border-gray-200 dark:border-slate-700">
          <p class="text-xs text-gray-500 dark:text-gray-400">
            {{ $t('customer.created_on') }} {{ new Date(customer.created_at).toLocaleDateString() }}
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="px-4 py-4 border-t border-gray-200 dark:border-slate-700">
        <UButton
          @click="isOpen = false"
          color="gray"
          variant="ghost"
          block
          size="lg"
        >
          {{ $t('customer.cancel') }}
        </UButton>
      </div>
    </div>
  </USlideover>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  customer: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['update:modelValue', 'delete-group']);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});
</script>