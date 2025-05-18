<template>
  <form
    class="grid grid-cols-span-12 gap-2 w-full bg-white p-4 rounded-xl"
    @submit.prevent="submit"
  >
    <UBadge color="gray" variant="soft" size="lg" class="w-1/2"
      >{{ $t('setting.info.account_information') }}</UBadge
    >
    <div
      class="col-span-full space-y-[1px] flex justify-between items-center pt-4"
    >
      <div class="basis-full w-full flex justify-center">
        <MazPhoneNumberInput
          :translations="{
            countrySelector: {
              placeholder: $t('setting.info.country_code_placeholder'),
              error: $t('setting.info.select_country'),
              searchPlaceholder: $t('setting.info.find_country'),
            },
            phoneInput: {
              placeholder: $t('setting.info.phone_number'),
              example: $t('setting.info.example'),
            },
          }"
          countryCode="CI"
          orientation="responsive"
          v-model="DataForms.phone"
          color="Warning"
        />
      </div>
    </div>
    <div
      class="col-span-full space-y-[1px] flex justify-between items-center pt-4"
    >
      <label class="text-slate-800 basis-1/2"
        >{{ $t('setting.info.company_name') }}</label
      >
      <div class="basis-1/2">
        <InputFiled
          v-model="DataForms.name"
          type="text"
          custom-class="p-2 hover:shadow-sm rounded-lg  w-full bg-red-500"
        />
        <div v-if="errors.name.length" class="error">
          <div v-for="(error, index) in errors.name" :key="index">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
    <div
      class="col-span-full space-y-[1px] flex justify-between items-center pt-4"
    >
      <label class="text-slate-800 basis-1/2">{{ $t('setting.info.business_sector') }}</label>
      <div class="basis-1/2">
        <USelectMenu
          v-model="DataForms.domain"
          searchable
          :searchable-placeholder="$t('setting.info.find_domain')"
          :placeholder="$t('setting.info.choose_domain')"
          :options="[
            'Production agricole',
            'Agriculture durable',
            'Transformation alimentaire',
            'Énergie renouvelable',
            'Gestion des ressources naturelles',
            'Logistique et transport',
            'Consulting en management',
            'Développement web',
            'Design graphique',
            'Cybersécurité',
            'Marketing digital',
            'Gestion financière',
            'Services de formation',
            'Conseil juridique',
            'Développement mobile',
            'Réseautage et événements',
            'Gestion de projet',
            'Ressources humaines',
            'Innovation technologique',
            'Services à la personne',
            'Événementiel',
            'E-commerce',
            'Création de contenu',
            'Vente et distribution',
            'Communication visuelle',
          ]"
          class="hover:shadow-sm rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-[#f3c775]"
        >
          <template #option-empty="{ query }">
            <q>{{ query }}</q> {{ $t('setting.info.domain_not_found') }}
          </template>
        </USelectMenu>
        <div v-if="errors.domain.length" class="error">
          <div v-for="(error, index) in errors.domain" :key="index">
            {{ error }}
          </div>
        </div>
      </div>
    </div>
    <div class="col-span-full pt-5">
      <UButton
        :loading="isRequestInProgress"
        type="submit"
        size="lg"
        variant="solid"
        color="yellow"
        >{{ $t('setting.info.update') }}
      </UButton>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from 'vue-i18n';
import { useUser } from "@/stores/user";
const { t } = useI18n();
const users = useUser();
const { errors, validateForm, handleServerErrors } =
  useFormValidationUserInfo();
const supabase = useSupabaseClient();

let DataForms = ref({
  phone: "",
  domain: "",
  name: "",
});
let isRequestInProgress = ref(false);
const errorMessage = ref("");
const isAlertOpen = ref(false);
let closeErrorAlert = () => {
  isAlertOpen.value = false;
};

let submit = async () => {
  isRequestInProgress.value = true;
  const validationErrors = validateForm({
    domain: DataForms.value.domain,
    name: DataForms.value.name,
  });
  if (validationErrors.global.length > 0) {
    isRequestInProgress.value = false;
    return;
  }
  try {
    const { data: userData, error } = await supabase
      .from("users")
      .update({
        name: DataForms.value.name,
        domain: DataForms.value.domain,
        phone: DataForms.value.phone,
      })
      .eq("id", users.info?.id)
      .select();
    if (error) {
      if (error.code === "23505") {
        errorMessage.value =
          t('setting.info.user_exists_with_email');
      } else {
        handleServerErrors(error);
        errorMessage.value = error.message;
      }
      isAlertOpen.value = true; // Affichage de l'alerte
      isRequestInProgress.value = false;
      isOpen.value = false;
    } else {
      // Réinitialisation des champs si la soumission a réussi
      users.info.name = DataForms.value.name;
      users.info.phone = DataForms.value.phone;
      users.info.domain = DataForms.value.domain;
      isRequestInProgress.value = false;
      isOpen.value = false;
      emit("submit");
    }
  } catch {
    handleServerErrors({ code: "23514", message: t('setting.info.server_error') });
    isRequestInProgress.value = false;
  }
};

onMounted(async () => {
  DataForms.value.name = users.info.name;
  DataForms.value.phone = users.info.phone;
  DataForms.value.domain = users.info.domain;
});
</script>

<style scoped>
.error {
  color: red;
}
</style>
