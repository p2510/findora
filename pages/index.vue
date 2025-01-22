<template>
  <div class="w-full">
    <div class="grid grid-cols-12 gap-4 primary-font">
      <div
        class="col-span-full xl:col-span-6 flex flex-col items-center justify-center h-screen relative"
      >
        <h4 class="text-slate-900 text-4xl pb-2">
          Un seul
          <span
            class="bg-clip-text text-transparent bg-gradient-to-r from-[#f3c775] to-[#5e4414]"
          >
            endroit </span
          >, plusieurs clients
        </h4>
        <p class="text-slate-900/50 text-2xl font-normal">
          Connectez-vous maintenant !
        </p>
        <form class="pt-10 w-2/3 space-y-4" @submit.prevent="login">
          <InputFiled
            placeholder="E-mail"
            type="email"
            autofocus
            v-model="DataForms.email"
            custom-class="hover:shadow-sm p-4 "
          />
          <InputFiled
            placeholder="Mot de passe"
            type="password"
            autofocus
            v-model="DataForms.password"
            custom-class="hover:shadow-sm p-4"
          />
          <div class="flex justify-center">
            <SubmitButton
              :isLoading="isRequestInProgress"
              :disabled="isDisabled"
              type="submit"
              custom-class="text-white w-1/2 flex justify-center gap-3 mt-4"
              @click="handleButtonClick"
            >
              Connexion
            </SubmitButton>
          </div>
        </form>
        <div class="flex justify-center pt-10">
          <a
            href="https://calendly.com/poupoinaka03/demo-findora"
            target="_blank"
            class="text-md text-slate-700 hover:text-slate-800 transition ease-in-out duration-300"
            >Demander une démo</a
          >
        </div>

        <div v-if="isAlertOpen">
          <AlertModal
            title="Accès Incorrect"
            type="error"
            @close-alert="closeAlert"
          >
            <template #message>
              <p class="">
                Les informations de connexion que vous avez saisies sont
                incorrectes. Vérifiez
                <span class="font-semibold">
                  votre e-mail et votre mot de passe</span
                >, puis réessayez.
              </p>
            </template>
          </AlertModal>
        </div>
      </div>
      <div
        class="bg-gradient-to-r to-[#f3c775] from-[#9e7c3c] xl:col-span-6 h-screen hidden xl:block"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
definePageMeta({
  middleware: "redirect-auth",
});
useHead({
  title: "Findora - Me connecter",
});
const supabase = useSupabaseClient();
const isAlertOpen = ref(false);
let closeAlert = () => {
  isAlertOpen.value = false;
};

let DataForms = ref({
  email: "",
  password: "",
});
let errorMessage = ref(null);
let isRequestInProgress = ref(false);
let login = async () => {
  isRequestInProgress.value = true;
  const { data, error } = await supabase.auth
    .signInWithPassword({
      email: DataForms.value.email,
      password: DataForms.value.password,
      options: {
        emailRedirectTo: "http://localhost:3000/confirm",
      },
    })
    .finally(() => {
      isRequestInProgress.value = false;
    });
  if (error?.code === "invalid_credentials") {
    errorMessage.value = "Identifiants de connexion invalides";
    isAlertOpen.value = true;
  }
  if (data?.user) {
    return navigateTo("/confirm");
  }
};
</script>

<style scoped>
@import url("~/assets/css/font.css");
</style>
