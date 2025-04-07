<template>
  <div class="text-center">
    <button
      @click="qrCode"
      class="flex items-center text-slate-700 hover:text-white bg-[#25D366] hover:bg-[#1e6337] rounded-md hover:shadow-md text-md p-3 transition-all duration-300 ease-in-out"
    >
      <span v-if="isProgress">
        <svg
          aria-hidden="true"
          role="status"
          class="inline w-4 h-4 me-3 text-black animate-spin"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="#E5E7EB"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <transition name="slide-up" mode="out-in">
        <span v-if="step == 0"> Préparer le serveur</span>
        <span v-else-if="step == 1"> Connecter mon whatsapp</span>
      </transition>
    </button>
    <UModal v-model="showModal" :dismissible="false">
      <section class="flex justify-center py-4">
        <div class="bg-white p-6 text-center space-y-4">
          <h3 class="text-center text-md pt-3 text-slate-800">
            Scanez le QR code
            <span class="mt-4 bg-slate-100 p-2 rounded-full text-slate-800">
              {{ expire }}
            </span>
          </h3>

          <img :src="qrCodeImage" alt="QR Code" class="mx-auto mb-4" />

          <button
            @click="updateAuthorize"
            class="mt-4 px-10 py-2 underline text-slate-950 hover:text-slate-700 transition-all duration-300 ease-in-out"
          >
            Cliquez ici après avoir scanné le QR code.
          </button>
        </div>
      </section>
    </UModal>
    <div v-if="isAlertOpen">
      <AlertModal
        title="Synchronisation"
        type="error"
        @close-alert="closeErrorAlert"
      >
        <template #message>
          <p>
            La préparation est en cours, veuillez patienter 5 secondes et
            réessayer.
          </p>
        </template>
      </AlertModal>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from "vue";
import { useUser } from "@/stores/user";
import { useWhatsapp } from "@/stores/whatsapp";
const users = useUser();
const whatsappStore = useWhatsapp();
const supabase = useSupabaseClient();
const isProgress = ref(false);
const showModal = ref(false);
let step = ref(0);
const qrCodeImage = ref("");
let expire = ref(30);
let expireTimer;
const startTimer = () => {
  expireTimer = setInterval(() => {
    expire.value--;
    if (expire.value <= 0) {
      showModal.value = false;
      clearInterval(expireTimer);
    }
  }, 1000);
};
let isAlertOpen = ref(false);
let closeErrorAlert = () => {
  isAlertOpen.value = false;
};
const qrCode = async () => {
  isProgress.value = true;
  const url = "https://app.myfindora.com/api/whatsapp/qr-code";

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        token: whatsappStore.whatsapp_backlogs.token,
      }),
    });

    if (!response.ok) {
      isProgress.value = false;
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    if (json && json.data) {
      if (json.data.base64) {
        qrCodeImage.value = json.data.base64;
        expire.value = json.data.expire;
        showModal.value = true;
        startTimer();
      } else if (json.data.status == "WAITING") {
        step.value = 1;
      } else if (json.data.error || json.error) {
        isAlertOpen.value = true;
      }
    }
    isProgress.value = false;
  } catch (error) {
    isProgress.value = false;
    console.error(error);
  }
};

let updateAuthorize = async () => {
  const { data, error } = await supabase
    .from("whatsapp_backlogs")
    .update({
      authorize: true,
    })
    .eq("user_id", users.info.uuid)
    .select();
  if (data) {
    whatsappStore.updateAuthorize();
    showModal.value = false;
  }
};
</script>
<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
