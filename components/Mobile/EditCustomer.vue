<!-- components/MobileEditCustomer.vue -->
<template>
  <USlideover v-model="isOpen" :ui="{ width: 'max-w-md' }">
    <div class="h-full flex flex-col bg-white dark:bg-slate-900">
      <!-- Header -->
      <div class="px-4 py-4 border-b border-gray-200 dark:border-slate-700">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t('customer.edit_contact') }}
          </h2>
          <button
            @click="isOpen = false"
            class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Contact Type Toggle -->
        <div class="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                {{ localIsEntreprise ? $t('customer.company') : $t('customer.individual') }}
              </p>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ localIsEntreprise ? $t('customer.switch_to_individual_contact') : $t('customer.switch_to_company_contact') }}
              </p>
            </div>
            <UToggle
              v-model="localIsEntreprise"
              color="amber"
              size="lg"
            />
          </div>
        </div>

        <!-- Name Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ localIsEntreprise ? $t('customer.company_name') : $t('customer.full_name') }}
          </label>
          <UInput
            v-model="localFormData.name"
            :placeholder="localIsEntreprise ? 'Ex: Findora Inc.' : 'Ex: Jean Dupont'"
            size="lg"
            :color="errors.name?.length ? 'red' : 'gray'"
          />
          <p v-if="errors.name?.length" class="text-xs text-red-600 mt-1">
            {{ errors.name[0] }}
          </p>
        </div>

        <!-- Phone Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $t('customer.phone_number') }} *
          </label>
          <MazPhoneNumberInput
            v-model="localFormData.phone"
            :translations="{
              countrySelector: {
                placeholder: $t('customer.country_code'),
                searchPlaceholder: $t('customer.find_country'),
              },
              phoneInput: {
                placeholder: $t('customer.phone_number'),
                example: $t('customer.example'),
              },
            }"
            country-code="CI"
            color="warning"
            :success="false"
            :error="errors.phone?.length > 0"
          />
          <p v-if="errors.phone?.length" class="text-xs text-red-600 mt-1">
            {{ errors.phone[0] }}
          </p>
        </div>

        <!-- Email Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $t('customer.email') }}
          </label>
          <UInput
            v-model="localFormData.email"
            type="email"
            placeholder="Ex: contact@example.com"
            size="lg"
            :color="errors.email?.length ? 'red' : 'gray'"
          />
          <p v-if="errors.email?.length" class="text-xs text-red-600 mt-1">
            {{ errors.email[0] }}
          </p>
        </div>

        <!-- Address Field -->
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {{ $t('customer.address') }}
          </label>
          <UTextarea
            v-model="localFormData.address"
            :rows="3"
          />
        </div>
      </form>

      <!-- Footer Actions -->
      <div class="px-4 py-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
        <UButton
          @click="handleSubmit"
          :loading="loading"
          color="amber"
          block
          size="lg"
        >
          {{ $t('customer.update_contact') }}
        </UButton>
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
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: Boolean,
  customerId: {
    type: Number,
    required: true
  },
  initialData: {
    type: Object,
    default: () => ({
      name: '',
      email: '',
      phone: '',
      address: ''
    })
  },
  isEntreprise: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'update:isEntreprise', 'submit']);

const { validateForm } = useFormValidation();

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
});

const localIsEntreprise = computed({
  get: () => props.isEntreprise,
  set: (value) => emit('update:isEntreprise', value)
});

const localFormData = ref({
  name: '',
  email: '',
  phone: '',
  address: ''
});

const errors = ref({
  name: [],
  email: [],
  phone: []
});

// Watch for changes in initialData to update local form data
watch(() => props.initialData, (newData) => {
  localFormData.value = { ...newData };
}, { deep: true, immediate: true });

// Reset form when modal opens
watch(isOpen, (newValue) => {
  if (newValue) {
    localFormData.value = { ...props.initialData };
    errors.value = {
      name: [],
      email: [],
      phone: []
    };
  }
});

const handleSubmit = () => {
  const validationErrors = validateForm(localFormData.value);
  
  if (validationErrors.global.length > 0) {
    errors.value = validationErrors;
    return;
  }
  
  emit('submit', localFormData.value);
};
</script>