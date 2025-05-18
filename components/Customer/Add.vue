<script setup>
import { ref, defineEmits } from "vue";
import { useI18n } from "vue-i18n";
import { useCustomer } from "@/stores/customer";
import { useStat } from "@/stores/stat";
import { formatPhone } from "@/utils/shared/format";

const { t } = useI18n();
const stat = useStat();
const customerStore = useCustomer();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { errors, validateForm, handleServerErrors } = useFormValidation();

const isOpen = ref(false);
const isEntreprise = ref(false);
const isRequestInProgress = ref(false);
const errorMessage = ref("");
const isAlertOpen = ref(false);
let closeErrorAlert = () => {
  isAlertOpen.value = false;
};

const formData = ref({
  name: "",
  email: "",
  phone: "",
  address: "",
});

const emit = defineEmits(["submit"]);

// Fonction de soumission du formulaire
let AddCustomer = async () => {
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
      .insert([
        {
          name: formData.value.name,
          email: formData.value.email,
          phone: formatPhone(formData.value.phone),
          address: formData.value.address,
          customer_type: isEntreprise.value ? "Entreprise" : "Particulier",
          created_by: user.value.id,
        },
      ])
      .select();

    if (error) {
      if (error.code === "23505") {
        errorMessage.value = t("customer.add.contact_exists_with_email");
      } else {
        handleServerErrors(error);
        errorMessage.value = error.message;
      }
      isAlertOpen.value = true; // Affichage de l'alerte
      isRequestInProgress.value = false;
      isOpen.value = false;
    } else {
      // Réinitialisation des champs si la soumission a réussi
      customerStore.updatecustomers();
      stat.incrementCustomer();

      formData.value.name = "";
      formData.value.email = "";
      formData.value.phone = "";
      formData.value.address = "";
      isRequestInProgress.value = false;
      isOpen.value = false;
      emit("submit"); // Émettre un événement pour informer que le contact a été créé
    }
  } catch (err) {
    handleServerErrors({
      code: "23514",
      message: t("customer.add.server_error"),
    });
    isRequestInProgress.value = false;
  }
};
</script>
<template>
  <div>
    <PrimaryButton
      @click="isOpen = true"
      class="flex gap-2 items-center justify-between"
    >
      <UIcon name="i-heroicons-plus" class="w-5 h-5 text-neutral-800" />
      <span>{{ $t("customer.add.create_new_contact") }}</span>
    </PrimaryButton>

    <UModal v-model="isOpen">
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="space-y-[1px]">
            <h5>
              <UBadge
                color="gray"
                variant="soft"
                size="lg"
                v-if="!isEntreprise"
              >
                {{ $t("customer.add.individual") }}
              </UBadge>
              <UBadge color="amber" variant="soft" size="lg" v-else>
                {{ $t("customer.add.company") }}
              </UBadge>
            </h5>
            <span class="text-gray-500 text-sm" v-if="!isEntreprise">
              {{ $t("customer.add.creating_individual_contact") }}
            </span>
            <span class="text-gray-500 text-sm" v-else>
              {{ $t("customer.add.creating_company_contact") }}
            </span>
          </div>
        </template>

        <form class="grid grid-cols-12 gap-4" @submit.prevent="AddCustomer">
          <div class="col-span-full flex items-center justify-center gap-4">
            <p>
              <span class="text-gray-500 text-sm" v-if="!isEntreprise">
                {{ $t("customer.add.switch_to_company_contact") }}
              </span>
              <span class="text-gray-500 text-sm" v-else>
                {{ $t("customer.add.switch_to_individual_contact") }}
              </span>
            </p>
            <UToggle
              v-model="isEntreprise"
              size="2xl"
              on-icon="i-heroicons-check-20-solid"
              off-icon="i-heroicons-x-mark-20-solid"
              color="amber"
            />
          </div>

          <!-- Nom & Prénom / Nom de l'entreprise -->
          <div class="col-span-full space-y-[1px]">
            <label
              for="name"
              class="text-gray-500 text-sm"
              v-if="!isEntreprise"
            >
              {{ $t("customer.add.full_name") }}
            </label>
            <label for="name" class="text-gray-500 text-sm" v-else>
              {{ $t("customer.add.company_name") }}
            </label>
            <InputFieldSimple
              type="text"
              autofocus
              custom-class="hover:shadow-sm p-2 rounded-lg"
              v-model="formData.name"
            />
            <div v-if="errors.name.length" class="error">
              {{ errors.name[0] }}
            </div>
          </div>

          <!-- Email -->
          <div class="col-span-full space-y-[1px]">
            <label for="email" class="text-gray-500 text-sm">{{
              $t("customer.add.email")
            }}</label>
            <InputFieldSimple
              type="email"
              custom-class="hover:shadow-sm p-2 rounded-lg"
              v-model="formData.email"
            />
            <div v-if="errors.email.length" class="error">
              {{ errors.email[0] }}
            </div>
          </div>

          <!-- Numéro de téléphone -->
          <div class="col-span-full space-y-[1px] w-full">
            <label for="phone" class="text-gray-500 text-sm">{{
              $t("customer.add.phone_number")
            }}</label>

            <MazPhoneNumberInput
              block
              :translations="{
                countrySelector: {
                  placeholder: $t('customer.add.country_code'),
                  error: $t('customer.add.select_country'),
                  searchPlaceholder: $t('customer.add.find_country'),
                },
                phoneInput: {
                  placeholder: $t('customer.add.phone_number'),
                  example: $t('customer.add.example'),
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

          <!-- Adresse -->
          <div class="col-span-full space-y-[1px]">
            <label for="address" class="text-gray-500 text-sm">{{
              $t("customer.add.address")
            }}</label>
            <InputFieldSimple
              type="text"
              custom-class="hover:shadow-sm p-2 rounded-lg"
              v-model="formData.address"
            />
          </div>

          <!-- Bouton de soumission -->
          <div class="col-span-full space-y-[1px]">
            <UButton
              :loading="isRequestInProgress"
              type="submit"
              size="lg"
              variant="soft"
              color="emerald"
            >
              {{ $t("customer.add.create_new_contact") }}
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Alerte d'erreur -->
    <div v-if="isAlertOpen">
      <AlertModal
        :title="$t('customer.add.incorrect_information')"
        type="error"
        @close-alert="closeErrorAlert"
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

<style scoped>
.error {
  color: red;
}
</style>
