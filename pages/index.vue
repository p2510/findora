<template>
  <div class="w-full">
    <div class="grid grid-cols-12 primary-font">
      <!-- Form -->
      <div class="bg-[#75A7871F] col-span-full lg:col-span-6 h-screen relative">
        <div class="pt-5 pl-3 fixed"><switchLangage /></div>

        <div class="h-full flex flex-col items-center justify-center">
          <div
            class="flex flex-col justify-center items-center bg-white p-12 rounded-3xl resgister"
          >
            <h4
              class="text-slate-900 dark:text-slate-50 text-3xl pb-2 font-semibold"
            >
              {{ $t("login.title") }}
            </h4>
            <p
              class="text-slate-900/60 dark:text-slate-200 text-sm font-normal"
            >
              {{ $t("login.subtitle") }}
            </p>
            <form class="pt-10 space-y-4" @submit.prevent="login">
              <InputFiled
                :placeholder="$t('login.email')"
                type="email"
                autofocus
                v-model="DataForms.email"
                custom-class="pl-4 pr-2 py-3 rounded-md text-sm"
              />
              <InputFiled
                :placeholder="$t('login.password')"
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
                  {{ $t("login.submit") }}
                </SubmitButton>
              </div>
            </form>

            <p
              class="text-slate-950/70 dark:text-slate-100 text-xs text-center w-2/3 pt-6"
            >
              <span>{{ $t("login.no_account") }} </span>
              <a
                target="_blank"
                href="https://myfindora.com/creer-un-compte"
                class="pl-2 font-semibold text-slate-800 dark:text-slate-200 text-xs underline hover:text-slate-950 transition duration-300 ease-in-out"
              >
                {{ $t("login.signup") }}
              </a>
            </p>
          </div>
        </div>

        <div v-if="isAlertOpen">
          <AlertModal
            :title="$t('login.error_title')"
            type="error"
            @close-alert="closeAlert"
          >
            <template #message>
              <p class="">
                {{ $t("login.error_message") }}
              </p>
            </template>
          </AlertModal>
        </div>
      </div>
      <!-- Slide-->

      <div
        class="col-span-full lg:col-span-6 bg-[#F3F4F6] h-screen hidden lg:flex lg:justify-start p-8"
      >
        <section class="h-full">
          <div class="flex flex-col gap-y-8 items-center h-full">
            <!-- Logo -->
            <span class="flex items-center justify-end w-full">
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
                    fill="#ffbd59"
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
                  y="26"
                  font-family="Arial, sans-serif"
                  font-size="20"
                  fill="#110b01"
                >
                  findora
                </text>
              </svg>
            </span>
            <div>
              <div class="flex justify-center w-full">
                <div class="rotate-3d flex justify-center w-full">
                  <img
                    src="~/assets/img/dashboard.webp"
                    alt="Dashboard Findora"
                    class="border-4 border-[#75A7871F]/5 w-5/6 rounded-xl shadow-lg"
                  />
                </div>
              </div>
            </div>
            <h3 class="typewriter text-slate-800 text-5xl font-semibold">
              {{ $t("login.description") }}
            </h3>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUser } from "@/stores/user";
const { t } = useI18n();

const user = useUser();
import { useWhatsapp } from "@/stores/whatsapp";
const whatsappStore = useWhatsapp();

definePageMeta({
  middleware: "redirect-auth",
});
useHead({
  title: t('login.headtitle'),
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

<style scoped>
.resgister {
  box-shadow: 0px 4px 40px 16px rgba(0, 7, 38, 0.16);
}
.rotate-3d {
  transform: rotateX(0deg) rotateZ(0deg);
  transition: transform 0.5s ease;
}
.rotate-3d:hover {
  transform: rotateX(20deg) rotateZ(10deg);
}
</style>
