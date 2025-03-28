<template>
  <div class="w-full">
    <div class="grid grid-cols-12 gap-4 primary-font">
      <div
        class="col-span-full xl:col-span-6 flex flex-col items-center justify-center h-screen relative"
      >
        <h4 class="text-slate-900 text-4xl pb-2">
          <span
            class="bg-clip-text text-transparent bg-gradient-to-r from-[#f3c775] to-[#5e4414]"
          >
            Automatisez</span
          >

          , Suivez et Scalez
        </h4>
        <p class="text-slate-900/80 text-md font-normal">
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

        <p class="text-slate-950/20 text-xs font-semibold pt-3">Ou</p>
        <a
          target="_blank"
          href="https://myfindora.com/creer-un-compte"
          class="text-slate-700 text-sm underline hover:text-slate-950 transition duration-300 ease-in-out"
        >
          Créer un compte
        </a>

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

import { useUser } from "@/stores/user";
const user = useUser();
import { useWhatsapp } from "@/stores/whatsapp";
const whatsappStore = useWhatsapp();

definePageMeta({
  middleware: "redirect-auth",
});
useHead({
  title: "Findora - Me connecter",
});

// suite
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
    .then(async (res) => {
      if (res.data?.user) {
        let { data: userData, error: userError } = await supabase
          .from("users")
          .select("*")
          .single();
        if (userData) {
          user.updateInfo(userData);
        }
        let { data: subscriptionData, error: subscriptionError } =
          await supabase.from("subscriptions").select("*").single();
        if (subscriptionData) {
          user.updateSubscription(subscriptionData);
        }
        let { data: whatsappData, error: whatsappError } = await supabase
          .from("whatsapp_backlogs")
          .select("*");
        if (whatsappData) {
          if (whatsappData.length == 0) {
            whatsappStore.$reset();
          } else {
            whatsappStore.updateWhatsappBacklogs(whatsappData[0]);
          }
        }
        return navigateTo("/dashboard");
      }
    })
    .finally(() => {
      isRequestInProgress.value = false;
    });
  if (error?.code === "invalid_credentials") {
    errorMessage.value = "Identifiants de connexion invalides";
    isAlertOpen.value = true;
  }
};
</script>

<style scoped>
@import url("~/assets/css/font.css");
</style>
