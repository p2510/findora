<template>
  <button
    @click="createChanel"
    class="flex items-center text-slate-700 hover:text-white bg-[#f3c775] hover:bg-[#99732c] rounded-md hover:shadow-md text-md p-3 transition-all duration-300 ease-in-out"
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
    <span v-if="step == 0">{{ $t("whatsapp.start.start_now") }}</span>
    <span v-if="step == 1">{{ $t("whatsapp.start.prepare_server") }}</span>
    <div v-if="isAlertOpen">
      <AlertModal
        :title="$t('whatsapp.start.synchronization')"
        type="error"
        @close-alert="closeErrorAlert"
      >
        <template #message>
          <p>
            {{ $t("whatsapp.start.synchronization_message") }}
          </p>
        </template>
      </AlertModal>
    </div>
  </button>
</template>
<script setup>
import { defineEmits } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "@/stores/user";
import { useWhatsapp } from "@/stores/whatsapp";
const { t } = useI18n();
const whatsappStore = useWhatsapp();
const supabase = useSupabaseClient();
const users = useUser();
const emit = defineEmits(["IsUpdate"]);
const isProgress = ref(false);
let isAlertOpen = ref(false);
let closeErrorAlert = () => {
  isAlertOpen.value = false;
};
let step = ref(0);
const createChanel = async () => {
  isProgress.value = true;

  const url = `${
    useRuntimeConfig().public.url_base
  }/api/whatsapp/create-chanel`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        user_id: users.info.uuid,
      }),
    });

    if (!response.ok) {
      isProgress.value = false;
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    if (json) {
      if (json.data.createChannel) {
        const isTrial = json.data.createChannel.mode === "trial";
        const baseDate = new Date(json.data.createChannel.activeTill);

        // Si mode = trial, on ajoute 2 jours. Sinon on garde la date d’origine.
        const expireDate = isTrial
          ? new Date(baseDate.setDate(baseDate.getDate() + 2))
          : baseDate;

        const { data, error } = await supabase
          .from("whatsapp_backlogs")
          .upsert({
            user_id: users.info.uuid,
            chanel_id: json.data.createChannel.id,
            expire_date: expireDate,
            token: json.data.createChannel.token,
            status: "active",
            mode: json.data.createChannel.mode,
            authorize: false,
          })
          .select();
        if (data) {
          whatsappStore.fetchWhatsapp();
          step.value = 1;
          isProgress.value = false;
          emit("IsUpdate", 1);
        } else {
          isProgress.value = false;
          isAlertOpen.value = true;
        }
      } else {
        isProgress.value = false;
      }

      return json;
    } else {
      alert(t("whatsapp.start.maintenance_message"));
      isProgress.value = false;
    }
  } catch (error) {
    isProgress.value = false;
    return error;
  }
};
</script>
