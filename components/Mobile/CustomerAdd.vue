<!-- components/MobileCustomerAdd.vue -->
<template>
  <div>
    <button
      @click="isOpen = true"
      class="inline-flex items-center gap-2 px-4 py-2 bg-[#ffbd59] text-white rounded-lg font-medium text-sm hover:bg-[#f3c775] transition-colors"
    >
      <UIcon name="i-heroicons-plus" class="w-4 h-4" />
      <span v-if="showLabel">{{ $t('customer.add_contact') }}</span>
    </button>

    <USlideover v-model="isOpen">
      <div class="h-full flex flex-col bg-white dark:bg-slate-900">
        <!-- Header -->
        <div class="px-4 py-4 border-b border-gray-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ $t('customer.add_new_contact') }}
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
        <form @submit.prevent="addCustomer" class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Contact Type Toggle -->
          <div class="bg-gray-50 dark:bg-slate-800 rounded-xl p-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {{ isEntreprise ? $t('customer.company') : $t('customer.individual') }}
                </p>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {{ isEntreprise ? $t('customer.switch_to_individual_contact') : $t('customer.switch_to_company_contact') }}
                </p>
              </div>
              <UToggle
                v-model="isEntreprise"
                color="amber"
                size="lg"
              />
            </div>
          </div>

          <!-- Name Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ isEntreprise ? $t('customer.company_name') : $t('customer.full_name') }}
            </label>
            <UInput
              v-model="formData.name"
              :placeholder="isEntreprise ? 'Ex: Findora Inc.' : 'Ex: Jean Dupont'"
              size="lg"
              :color="errors.name.length ? 'red' : 'gray'"
            />
            <p v-if="errors.name.length" class="text-xs text-red-600 mt-1">
              {{ errors.name[0] }}
            </p>
          </div>

          <!-- Phone Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ $t('customer.phone_number') }} *
            </label>
            <MazPhoneNumberInput
              v-model="formData.phone"
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
              :error="errors.phone.length > 0"
            />
            <p v-if="errors.phone.length" class="text-xs text-red-600 mt-1">
              {{ errors.phone[0] }}
            </p>
          </div>

          <!-- Email Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ $t('customer.email') }}
            </label>
            <UInput
              v-model="formData.email"
              type="email"
              placeholder="Ex: contact@example.com"
              size="lg"
              :color="errors.email.length ? 'red' : 'gray'"
            />
            <p v-if="errors.email.length" class="text-xs text-red-600 mt-1">
              {{ errors.email[0] }}
            </p>
          </div>

          <!-- Address Field -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {{ $t('customer.address') }}
            </label>
            <UTextarea
              v-model="formData.address"
              :rows="3"
            />
          </div>

          <!-- Groups Selection -->
          <div v-if="customerStore.groups && customerStore.groups.length > 0">
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {{ $t('customer.assign_to_groups') }}
            </label>
            <div class="flex flex-wrap gap-2">
              <label
                v-for="group in customerStore.groups"
                :key="group.id"
                class="inline-flex items-center"
              >
                <input
                  type="checkbox"
                  v-model="selectedGroups"
                  :value="group.id"
                  class="rounded border-gray-300 text-[#ffbd59] focus:ring-[#ffbd59]"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  {{ group.name }}
                </span>
              </label>
            </div>
          </div>
        </form>

        <!-- Footer Actions -->
        <div class="px-4 py-4 border-t border-gray-200 dark:border-slate-700 space-y-3">
          <UButton
            @click="addCustomer"
            :loading="isRequestInProgress"
            color="amber"
            block
            size="lg"
          >
            {{ $t('customer.add_contact') }}
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
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { formatPhone } from "@/utils/shared/format";
import { useCustomer } from "@/stores/customer";
import { useStat } from "@/stores/stat";

const props = defineProps({
  showLabel: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit']);

const { t } = useI18n();
const customerStore = useCustomer();
const stat = useStat();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { errors, validateForm, handleServerErrors } = useFormValidation();

const isOpen = ref(false);
const isEntreprise = ref(false);
const isRequestInProgress = ref(false);
const selectedGroups = ref([]);

const formData = ref({
  name: "",
  email: "",
  phone: "",
  address: "",
});

const addCustomer = async () => {
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
      .insert({
        name: formData.value.name,
        email: formData.value.email,
        phone: formatPhone(formData.value.phone),
        address: formData.value.address,
        customer_type: isEntreprise.value ? "Entreprise" : "Particulier",
        created_by: user.value.id,
      })
      .select()
      .single();

    if (error) {
      handleServerErrors(error);
      isRequestInProgress.value = false;
    } else {
      // Ajouter aux groupes sélectionnés
      if (selectedGroups.value.length > 0) {
        const groupAssignments = selectedGroups.value.map(groupId => ({
          customers_id: data.id,
          groups_id: groupId
        }));
        
        await supabase
          .from("groups_customers")
          .insert(groupAssignments);
      }
      
      // Reset form
      formData.value = {
        name: "",
        email: "",
        phone: "",
        address: "",
      };
      selectedGroups.value = [];
      isEntreprise.value = false;
      isRequestInProgress.value = false;
      
      customerStore.updatecustomers();
      stat.incrementCustomer();
      stat.incrementcustomerParticular(data.customer_type);
      
      emit('submit');
      isOpen.value = false;
      
      // Success notification
      alert(t('customer.contact_added_successfully'));
    }
  } catch (err) {
    handleServerErrors({ code: "23514", message: "Erreur serveur" });
    isRequestInProgress.value = false;
  }
};
</script>