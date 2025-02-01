<template>
  <form
    class="grid grid-cols-span-12 gap-2 w-full bg-white p-4 rounded-xl"
    @submit.prevent="submit"
  >
    <UBadge color="gray" variant="soft" size="lg" class="w-1/2">
      Informations d'authentification
    </UBadge>
    <!-- Email -->
    <div class="col-span-full flex justify-between items-center pt-4">
      <label class="text-slate-800 basis-1/2">E-mail</label>
      <div class="basis-1/2">
        <InputFiled
          type="email"
          v-model="DataForms.email"
          custom-class="p-2 hover:shadow-sm rounded-lg w-full"
        />
        <div v-if="errors.email.length" class="error">
          <div v-for="(error, index) in errors.email" :key="index">
            {{ error }}
          </div>
        </div>
      </div>
    </div>

    <!-- Password -->
    <div class="col-span-full flex justify-between items-center pt-4">
      <label class="text-slate-800 basis-1/2">Mot de passe</label>
      <div class="basis-1/2">
        <InputFiled
          type="password"
          v-model="DataForms.password"
          custom-class="p-2 hover:shadow-sm rounded-lg w-full"
        />
        <div v-if="errors.password.length" class="error">
          <div v-for="(error, index) in errors.password" :key="index">
            {{ error }}
          </div>
        </div>
      </div>
    </div>

    <!-- Confirm Password -->
    <div class="col-span-full flex justify-between items-center pt-4">
      <label class="text-slate-800 basis-1/2">Confirmer mot de passe</label>
      <div class="basis-1/2">
        <InputFiled
          type="password"
          v-model="DataForms.confirm_password"
          custom-class="p-2 hover:shadow-sm rounded-lg w-full"
        />
        <div v-if="errors.confirm_password.length" class="error">
          <div v-for="(error, index) in errors.confirm_password" :key="index">
            {{ error }}
          </div>
        </div>
      </div>
    </div>

    <!-- Submit Button -->
    <div class="col-span-full pt-5">
      <UButton
        :loading="isRequestInProgress"
        type="submit"
        size="lg"
        variant="solid"
        color="yellow"
      >
        Mettre à jour
      </UButton>
    </div>
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
  </form>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
const { errors, validateForm, handleServerErrors } = useFormValidationUser();
const supabase = useSupabaseClient();
const user = useSupabaseUser(); // Auth user
let userId = ref(null); // UserId info

let DataForms = ref({
  email: user.value?.email,
  password: "",
  confirm_password: "",
});
let isRequestInProgress = ref(false);
const errorMessage = ref("");
const isAlertOpen = ref(false);
let closeErrorAlert = () => {
  isAlertOpen.value = false;
};
let updateEmail = async () => {
  if (DataForms.value.email != user.value?.email) {
    const { data, error } = await supabase
      .from("users")
      .update({ email: DataForms.value.email })
      .eq("id", userId.value)
      .select();
  }
};

let submit = async () => {
  isRequestInProgress.value = true;
  const validationErrors = validateForm({
    email: DataForms.value.email,
    password: DataForms.value.password,
    confirm_password: DataForms.value.confirm_password,
  });
  if (validationErrors.global.length > 0) {
    isRequestInProgress.value = false;
    return;
  }
  try {
    updateEmail();
    const { data, error } = await supabase.auth.updateUser({
      email: DataForms.value.email,
      password: DataForms.value.password,
    });
    if (error) {
      if (error.code === "23505") {
        errorMessage.value =
          "Ce utilisateur existe déjà avec cet adresse E-mail.";
      } else {
        handleServerErrors(error);
        errorMessage.value = error.message;
      }
      isAlertOpen.value = true; // Affichage de l'alerte
      isRequestInProgress.value = false;
      isOpen.value = false;
    } else {
      // Réinitialisation des champs si la soumission a réussi
      DataForms.value.password = "";
      DataForms.value.confirm_password = "";
      isRequestInProgress.value = false;
      isOpen.value = false;
      alert("Compte mise à jour");
      emit("submit");
    }
  } catch {
    handleServerErrors({ code: "23514", message: "Erreur serveur" });
    isRequestInProgress.value = false;
  }
};
onMounted(async () => {
  let { data: users, error } = await supabase.from("users").select("id");
  userId.value = users[0]?.id;
});
</script>
<style scoped>
.error {
  color: red;
}
</style>
