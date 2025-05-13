<template>
  <div class="w-full">
    <div class="grid grid-cols-12 gap-4 primary-font">
      <div
        class="col-span-full xl:col-start-3 xl:col-end-8 flex flex-col justify-center items-center h-screen relative md:pl-10 lg:pl-8 xl:pl-12"
      >
        <div class="flex gap-3 items-center pb-10">
          <span class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="88"
              height="24"
              viewBox="0 0 88 24"
            >
              <g>
                <!-- Forme de base (forme rectangulaire avec coins arrondis) -->
                <rect
                  x="0"
                  y="0"
                  width="88"
                  height="24"
                  rx="12"
                  ry="12"
                  fill="#f3c775"
                />

                <!-- Design interne : Ligne diagonale et cercle -->
                <circle cx="60" cy="12" r="6" fill="white" />
                <path d="M30 12 L58 12" stroke="white" stroke-width="2" />
              </g>
            </svg>
            <svg
              width="100"
              height="40"
              viewBox="0 0 100 40"
              xmlns="http://www.w3.org/2000/svg"
            > 
              <text
                x="10"
                y="30"
                font-family="Arial, sans-serif"
                font-size="20"
                fill="#110b01"
              >
                findora
              </text>
            </svg>
          </span>
        </div>
        <h4
          class="text-slate-900 dark:text-slate-50 text-3xl pb-2 font-semibold"
        >
          Heureux de vous revoir !
        </h4>
        <p class="text-slate-900/60 dark:text-slate-200 text-sm font-normal">
          Allez plus vite avec un agent IA et le marketing WhatsApp !
        </p>
        <form class="pt-10 w-2/3 space-y-4" @submit.prevent="login">
          <InputFiled
            placeholder="Votre adresse e-mail"
            type="email"
            autofocus
            v-model="DataForms.email"
            custom-class="pl-4 pr-2 py-3 rounded-md text-sm"
          />
          <InputFiled
            placeholder="Votre mot de passe"
            type="password"
            autofocus
            v-model="DataForms.password"
            custom-class="pl-4 pr-2 py-3 rounded-md text-sm"
          />
          <div class="flex justify-center">
            <SubmitButton
              :isLoading="isRequestInProgress"
              :disabled="isDisabled"
              type="submit"
              custom-class="text-white w-1/2 flex justify-center gap-3 mt-4 bg-slate-950 hover:bg-slate-800 dark:bg-white dark:text-slate-800 hover:dark:bg-slate-100 rounded-full"
              @click="handleButtonClick"
            >
              Se connecter
            </SubmitButton>
          </div>
        </form>

        <p class="text-slate-950/70 dark:text-slate-100 text-xs text-center w-2/3 pt-6">
          <span>Vous n'avez pas de compte ? </span>
          <a
            target="_blank"
            href="https://myfindora.com/creer-un-compte"
            class="pl-2 font-semibold text-slate-800 dark:text-slate-200 text-xs underline hover:text-slate-950 transition duration-300 ease-in-out"
          >
            S'inscrire
          </a>
        </p>

        <div v-if="isAlertOpen">
          <AlertModal
            title="Accès incorrect"
            type="error"
            @close-alert="closeAlert"
          >
            <template #message>
              <p class="">
                Les informations de connexion que vous avez saisies sont
                incorrectes. Veuillez vérifier votre e-mail et votre mot de
                passe, puis réessayez.
              </p>
            </template>
          </AlertModal>
        </div>
      </div>
      <div
        class="xl:col-start-9 xl:col-end-13 h-screen hidden xl:flex xl:justify-start"
      >
        <section></section>
      </div>
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
  title: "Findora - Sign In",
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
    .then(async (res) => {
      console.log(res);
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
      } else {
        if (res.error?.code === "invalid_credentials") {
          errorMessage.value = "Login failed. Please check your credentials.";
          isAlertOpen.value = true;
        }
      }
    })
    .catch((err) => {})
    .finally(() => {
      isRequestInProgress.value = false;
    });
};
</script>
