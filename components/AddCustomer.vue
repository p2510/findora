<script setup>
import { ref, computed, defineEmits } from "vue";

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
          phone: formData.value.phone,
          address: formData.value.address,
          customer_type: isEntreprise.value ? "Entreprise" : "Particulier",
          created_by: user.value.id,
        },
      ])
      .select();

    if (error) {
      if (error.code === "23505") {
        errorMessage.value = "Ce client existe déjà avec cet adresse E-mail.";
      } else {
        handleServerErrors(error);
        errorMessage.value = error.message;
      }
      isAlertOpen.value = true; // Affichage de l'alerte
      isRequestInProgress.value = false;
      isOpen.value = false;
    } else {
      // Réinitialisation des champs si la soumission a réussi
      formData.value.name = "";
      formData.value.email = "";
      formData.value.phone = "";
      formData.value.address = "";
      isRequestInProgress.value = false;
      isOpen.value = false;
      emit("submit"); // Émettre un événement pour informer que le client a été créé
    }
  } catch (err) {
    handleServerErrors({ code: "23514", message: "Erreur serveur" });
    isRequestInProgress.value = false;
  }
};
</script>

<template>
  <div>
    <PrimaryButton @click="isOpen = true"
      >Créer un nouveau client</PrimaryButton
    >

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
              <UBadge color="gray" variant="soft" size="lg" v-if="!isEntreprise"
                >Particulier</UBadge
              >
              <UBadge color="amber" variant="soft" size="lg" v-else
                >Entreprise</UBadge
              >
            </h5>
            <span class="text-gray-500 text-sm" v-if="!isEntreprise">
              Vous êtes sur le point de créer un client de type particulier.
            </span>
            <span class="text-gray-500 text-sm" v-else>
              Vous êtes sur le point de créer un client de type entreprise.
            </span>
          </div>
        </template>

        <form class="grid grid-cols-12 gap-4" @submit.prevent="AddCustomer">
          <div class="col-span-full flex items-center justify-center gap-4">
            <p>
              <span class="text-gray-500 text-sm" v-if="!isEntreprise">
                Activer pour passer à un client de type entreprise
              </span>
              <span class="text-gray-500 text-sm" v-else>
                Activer pour passer à un client de type particulier
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

          <!-- Nom & Prénom / Nom d'entreprise -->
          <div class="col-span-full space-y-[1px]">
            <label
              for="name"
              class="text-gray-500 font-semibold"
              v-if="!isEntreprise"
              >Nom & prénom</label
            >
            <label for="name" class="text-gray-500 font-semibold" v-else
              >Nom d'entreprise</label
            >
            <InputFiled
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
            <label for="email" class="text-gray-500 font-semibold">Email</label>
            <InputFiled
              type="email"
              custom-class="hover:shadow-sm p-2 rounded-lg"
              v-model="formData.email"
            />
            <div v-if="errors.email.length" class="error">
              {{ errors.email[0] }}
            </div>
          </div>

          <!-- Téléphone -->
          <div class="col-span-full space-y-[1px] w-full">
            <label for="phone" class="text-gray-500 font-semibold"
              >Numéro de téléphone</label
            >

            <MazPhoneNumberInput
              block
              :translations="{
                countrySelector: {
                  placeholder: 'Indicatif',
                  error: 'Choisir un pays',
                  searchPlaceholder: 'Trouver un pays',
                },
                phoneInput: {
                  placeholder: 'Numéro de téléphone',
                  example: 'Exemple:',
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
            <label for="address" class="text-gray-500 font-semibold"
              >Adresse</label
            >
            <InputFiled
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
              Créer un nouveau client
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Alerte d'erreur -->
    <div v-if="isAlertOpen">
      <AlertModal
        title="Informations incorrectes"
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
