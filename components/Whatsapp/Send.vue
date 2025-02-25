<template>
  <section class="px-10 lg:px-12">
    <h4 class="text-slate-900 text-4xl pb-2">
      Commençez une <br />
      Nouvelle
      <span
        class="bg-clip-text text-transparent bg-gradient-to-r from-[#25D366] to-[#1e6337]"
      >
        campagne
      </span>
      ou automatisez
    </h4>
    <form class="grid grid-cols-12 gap-4 pt-10" @submit.prevent="handleSubmit">
      <div class="col-span-full space-y-3">
        <label for="content" class="text-gray-500"
          >Créer le contenu de votre campagne</label
        >
        <textarea
          v-model="formData.content"
          autofocus
          class="border-2 border-slate-200 text-sm p-4 rounded-3xl bg-slate-100/60 outline-none text-slate-800 w-full"
          rows="7"
          minlength="3"
        ></textarea>
      </div>
      <div class="col-span-full flex items-end gap-4 mb-12">
        <CampaignCustomerSelection v-model="formData.customers" />
      </div>
      <div class="col-span-full flex justify-center items-center gap-4">
        <button
          class="p-4 rounded-xl border-2 border-emerald-600 outline-3 focus:outline outline-emerald-600/40 flex flex-col gap-2"
          type="button"
          @click="sendNow"
        >
          <p class="flex justify-between">
            <span class="text-lg text-slate-800">Maintenant</span>
            <UIcon
              v-if="!isScheduled"
              name="i-heroicons-check-circle"
              class="w-6 h-6 text-emerald-600"
            />
          </p>
          <span class="text-xs text-slate-800"
            >Si vous souhaitez envoyer à vos clients dès maintenant.
          </span>
        </button>
        <button
          class="p-4 rounded-xl border-2 border-emerald-600 outline-3 focus:outline outline-emerald-600/40 flex flex-col gap-2"
          type="button"
          @click="programCampaign"
        >
          <p class="flex justify-between">
            <span class="text-lg text-slate-800">Programmer</span>
            <UIcon
              v-if="isScheduled"
              name="i-heroicons-check-circle"
              class="w-6 h-6 text-emerald-600"
            />
          </p>
          <span class="text-xs text-slate-800"
            >Si vous souhaitez l'envoyer plus tard à vos clients.
          </span>
        </button>

        <UButton
          :loading="isProgress"
          type="submit"
          size="xl"
          variant="solid"
          color="emerald"
          class="flex justify-around items-center gap-2 p-4"
        >
          <UIcon name="i-heroicons-paper-airplane" class="h-6 w-6" />
          <span>Lancer</span>
        </UButton>
      </div>

      <div v-if="isScheduled" class="col-span-full space-y-3">
        <label for="scheduleDate" class="text-gray-500"
          >Choisissez la date et l'heure</label
        >
        <input
          v-model="formData.scheduleDate"
          type="date"
          id="scheduleDate"
          class="border-2 border-slate-200 text-sm p-4 rounded-3xl bg-slate-100/60 outline-none text-slate-800 w-full"
        />
      </div>
    </form>
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
    <div v-if="isSuccessOpen">
      <AlertModal
        title="Campagne validée"
        type="success"
        @close-alert="closeSuccessAlert"
      >
        <template #message>
          <p>{{ successMessage }}</p>
        </template>
      </AlertModal>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useUser } from "@/stores/user";
import { useWhatsapp } from "@/stores/whatsapp";
const whatsappStore = useWhatsapp();
const users = useUser();
const supabase = useSupabaseClient();
const formData = ref({
  customers: [],
  content: "",
  scheduleDate: null,
});
let isProgress = ref(false);
const isScheduled = ref(false);
const errorMessage = ref("");
const isAlertOpen = ref(false);
let closeErrorAlert = () => {
  isAlertOpen.value = false;
};
let successMessage = ref("");
const isSuccessOpen = ref(false);
let closeSuccessAlert = () => {
  isSuccessOpen.value = false;
};

function sendNow() {
  isScheduled.value = false;
  formData.value.scheduleDate = null;
}

function programCampaign() {
  isScheduled.value = true;
}

// send or program
let handleSubmit = async () => {
  isProgress.value = true;
  if (isScheduled.value && !formData.value.scheduleDate) {
    isProgress.value = false;
    isAlertOpen.value = true;
    errorMessage.value = "Veuillez choisir une date avant de programmer. ";
    return;
  }
  if (!isScheduled.value) {
    const url = "https://app.myfindora.com/api/whatsapp/send-message";
    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          customers: formData.value.customers,
          content: formData.value.content,
          token: whatsappStore.whatsapp_backlogs.token,
          user_id: users.info.uuid,
        }),
      });

      if (!response.ok) {
        isProgress.value = false;
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      if (json && json.data) {
        isProgress.value = false;
        isSuccessOpen.value = true;
        successMessage.value = "Votre campagne a bien été envoyée.";
      } else if (json && json.error) {
        errorMessage.value = json.error;
        isAlertOpen.value = true;
      }
    } catch (error) {
      isProgress.value = false;
      errorMessage.value = error.message;
      isAlertOpen.value = true;
    }
  } else {
    try {
      const { data, error } = await supabase
        .from("whatsapp_campaigns_schedule")
        .insert({
          user_id: users.info.uuid,
          customers: formData.value.customers,
          content: formData.value.content,
          token: whatsappStore.whatsapp_backlogs.token,
          send_date: formData.value.scheduleDate,
          is_sent: false,
        })
        .select();

      if (error) {
        errorMessage.value = error.message;
        isAlertOpen.value = true;
        isRequestInProgress.value = false;
      } else {
        // Réinitialisation des champs si la soumission a réussi
        isSuccessOpen.value = true;
        successMessage.value = "Votre campagne a bien été programmée.";
        formData.value.customers = [];
        formData.value.content = "";
        formData.value.scheduleDate = null;
        isProgress.value = false;
      }
    } catch (err) {
      isProgress.value = false;
    }
  }
};
</script>

<style scoped>
h4 {
  font-weight: 300;
}
</style>
