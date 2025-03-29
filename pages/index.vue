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
                <!-- Forme de base (rectangular shape with rounded corners) -->
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
        <h4 class="text-slate-900 text-3xl pb-2 font-semibold">
          Heureux de vous revoir !
        </h4>
        <p class="text-slate-900/60 text-sm font-normal">
          Automatisez et transformez votre whatsapp en CRM !
        </p>
        <form class="pt-10 w-2/3 space-y-4" @submit.prevent="login">
          <InputFiled
            placeholder="Votre adresse email"
            type="email"
            autofocus
            v-model="DataForms.email"
            custom-class=" pl-4 pr-2 py-3 rounded-md text-sm "
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
              custom-class="text-white w-1/2 flex justify-center gap-3 mt-4 bg-slate-950 hover:bg-slate-800 rounded-full"
              @click="handleButtonClick"
            >
              Me connecter
            </SubmitButton>
          </div>
        </form>

        <p class="text-slate-950/70 text-xs text-center w-2/3 pt-6">
          <span>Vous n'avez pas de compte ? </span>
          <a
            target="_blank"
            href="https://myfindora.com/creer-un-compte"
            class="pl-2 font-semibold text-slate-800 text-xs underline hover:text-slate-950 transition duration-300 ease-in-out"
          >
            Créer un compte
          </a>
        </p>

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
        class="xl:col-start-9 xl:col-end-13 h-screen hidden xl:flex xl:justify-start 00"
      >
        <section>
          <div class="relative">
            <div
              class="absolute w-full h-full top-0 bg-gradient-to-b from-transparent from-20% to-slate-950/90 z-20"
            ></div>

            <div class="absolute w-full h-[200px] top-1/3 z-30 p-4 space-y-4">
              <h3 class="text-white xl:text-4xl  text-center font-bold">
                Un compte whatsapp
              </h3>
              <div class="overflow-hidden h-[80px]">
                <div class="text-slide flex flex-col">
                  <h4
                    class="slide-item bg-gradient-to-r from-[#25D366] to-[#1e6337] text-5xl text-center font-bold p-2 rounded-full"
                  >
                    <span class="bg-clip-text text-white">Un CRM</span>
                  </h4>
                  <h4
                    class="slide-item bg-gradient-to-r from-[#25D366] to-[#1e6337] text-5xl text-center font-bold p-2 rounded-full"
                  >
                    <span class="bg-clip-text text-white"
                      >Un Agent IA</span
                    >
                  </h4>
                  <h4
                    class="slide-item bg-gradient-to-r from-[#25D366] to-[#1e6337] text-5xl text-center font-bold p-2 rounded-full"
                  >
                    <span class="bg-clip-text text-white"
                      >Un API token</span
                    >
                  </h4>
                </div>
              </div>
            </div>
            <img
              src="~/assets/img/slide/crm.webp"
              alt=""
              class="w-full h-screen object-cover"
            />
          </div>
        </section>
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
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: DataForms.value.email,
      password: DataForms.value.password,
      options: {
        emailRedirectTo: "http://localhost:3000/confirm",
      },
    });

    if (error) {
      if (error.message === "Invalid login credentials") {
        errorMessage.value = "Identifiants de connexion invalides";
      } else {
        errorMessage.value = "Erreur de connexion : " + error.message;
      }
      isAlertOpen.value = true;
      return;
    }

    if (data?.user) {
      const userId = data.user.id;

      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (userData) {
        user.updateInfo(userData);
      }

      const { data: subscriptionData } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (subscriptionData) {
        user.updateSubscription(subscriptionData);
      }

      const { data: whatsappData } = await supabase
        .from("whatsapp_backlogs")
        .select("*")
        .eq("user_id", userId);

      if (whatsappData) {
        if (whatsappData.length === 0) {
          whatsappStore.$reset();
        } else {
          whatsappStore.updateWhatsappBacklogs(whatsappData[0]);
        }
      }

      navigateTo("/dashboard");
    }
  } catch (err) {
    console.error("Erreur serveur :", err);
    errorMessage.value = "Une erreur est survenue. Veuillez réessayer.";
    isAlertOpen.value = true;
  } finally {
    isRequestInProgress.value = false;
  }
};
</script>

<style scoped>
@import url("~/assets/css/font.css");
.text-slide {
  position: relative;
  height: 80px;
}

.slide-item {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s, transform 0.5s;
}

.slide-item:nth-child(1) {
  animation: show-slide 6s infinite 0s;
}

.slide-item:nth-child(2) {
  animation: show-slide 6s infinite 2s;
}

.slide-item:nth-child(3) {
  animation: show-slide 6s infinite 4s;
}

@keyframes show-slide {
  0%,
  100% {
    opacity: 0;
    transform: translateY(20px);
  }
  10%,
  30% {
    opacity: 1;
    transform: translateY(0);
  }
  33%,
  100% {
    opacity: 0;
    transform: translateY(-20px);
  }
}
</style>
