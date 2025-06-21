<!-- components/MobileWhatsappSend.vue -->
<template>
  <div class="px-4 py-6 space-y-4">
    <!-- Header avec quota -->
    <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ $t("whatsapp.send.launch_new_campaign") }}
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ $t("whatsapp.send.create_campaign_content") }}
          </p>
        </div>
        <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-2 rounded-full shadow-md">
          <div class="flex items-center gap-1.5 text-sm">
            <UIcon name="i-heroicons-chart-bar" class="w-4 h-4" />
            <span class="font-bold">{{ users.subscription.max_campaigns }}</span>
          </div>
        </div>
      </div>
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- Étape 1: Message -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-chat-bubble-left-right" class="w-5 h-5 text-white" />
            <p class="text-white font-medium">{{ $t("whatsapp.send.create_campaign_content") }}</p>
          </div>
        </div>
        
        <div class="p-4">
          <textarea
            v-model="formData.content"
            autofocus
            class="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none"
            rows="6"
            minlength="3"
            :placeholder="$t('whatsapp.send.type_message')"
          />
          
          <!-- Actions -->
          <div class="flex gap-2 mt-3">
            <button
              @click="showPreview = true"
              type="button"
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
            >
              <UIcon name="i-heroicons-eye" class="w-4 h-4" />
              <span class="text-sm font-medium">{{ $t("whatsapp.send.preview") }}</span>
            </button>
            
            <button
              @click="showIA = true"
              type="button"
              class="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-lg transition-all"
            >
              <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
              <span class="text-sm font-medium">{{ $t("whatsapp.send.generate_with_ai") }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Étape 2: Médias -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-paper-clip" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 class="font-medium text-gray-900 dark:text-white">{{ $t("whatsapp.send.attach_media") }}</h3>
          </div>
        </div>
        
        <div class="p-4">
          <!-- Zone d'upload -->
          <div v-if="!formData.media" class="grid grid-cols-3 gap-2">
            <!-- Image -->
            <label for="mobile-image-upload" class="cursor-pointer">
              <div class="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 p-2 text-center hover:border-emerald-500 transition-all flex flex-col items-center justify-center">
                <UIcon name="i-heroicons-photo" class="w-6 h-6 text-emerald-600 dark:text-emerald-400 mb-1" />
                <p class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ $t("whatsapp.send.image") }}</p>
                <p class="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">Max 5MB</p>
              </div>
            </label>
            <input
              id="mobile-image-upload"
              type="file"
              @change="(e) => handleMediaUpload(e, 'image')"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              class="hidden"
            />

            <!-- Vidéo -->
            <label for="mobile-video-upload" class="cursor-pointer">
              <div class="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 p-2 text-center hover:border-blue-500 transition-all flex flex-col items-center justify-center">
                <UIcon name="i-heroicons-video-camera" class="w-6 h-6 text-blue-600 dark:text-blue-400 mb-1" />
                <p class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ $t("whatsapp.send.video") }}</p>
                <p class="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">Max 16MB</p>
              </div>
            </label>
            <input
              id="mobile-video-upload"
              type="file"
              @change="(e) => handleMediaUpload(e, 'video')"
              accept="video/mp4,video/3gpp"
              class="hidden"
            />

            <!-- Document -->
            <label for="mobile-document-upload" class="cursor-pointer">
              <div class="aspect-square rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 p-2 text-center hover:border-orange-500 transition-all flex flex-col items-center justify-center">
                <UIcon name="i-heroicons-document" class="w-6 h-6 text-orange-600 dark:text-orange-400 mb-1" />
                <p class="text-xs font-medium text-gray-700 dark:text-gray-300">{{ $t("whatsapp.send.document") }}</p>
                <p class="text-[10px] text-gray-500 dark:text-gray-500 mt-0.5">Max 100MB</p>
              </div>
            </label>
            <input
              id="mobile-document-upload"
              type="file"
              @change="(e) => handleMediaUpload(e, 'document')"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
              class="hidden"
            />
          </div>

          <!-- Média sélectionné -->
          <div v-else>
            <div class="bg-gray-50 dark:bg-slate-900 rounded-lg p-3">
              <div class="flex items-center gap-3">
                <!-- Aperçu -->
                <div v-if="formData.mediaType === 'image' && formData.mediaPreview" class="flex-shrink-0">
                  <img
                    :src="formData.mediaPreview"
                    alt="Preview"
                    class="w-16 h-16 object-cover rounded-lg shadow-sm"
                  />
                </div>
                <div v-else-if="formData.mediaType === 'video' && formData.mediaPreview" class="flex-shrink-0">
                  <video
                    :src="formData.mediaPreview"
                    class="w-16 h-16 object-cover rounded-lg shadow-sm"
                  />
                </div>
                <div v-else class="flex-shrink-0">
                  <div class="w-16 h-16 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <UIcon
                      :name="getDocumentIcon(formData.mediaName)"
                      class="w-8 h-8 text-gray-600 dark:text-gray-400"
                    />
                  </div>
                </div>
                
                <!-- Infos -->
                <div class="flex-1 min-w-0">
                  <h4 class="font-medium text-gray-900 dark:text-white text-sm truncate">{{ formData.mediaName }}</h4>
                  <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {{ formatFileSize(formData.mediaSize) }}
                  </p>
                  <button
                    type="button"
                    @click="removeMedia"
                    class="mt-2 inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded text-xs font-medium"
                  >
                    <UIcon name="i-heroicons-trash" class="w-3 h-3" />
                    {{ $t("whatsapp.send.change_media") }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Étape 3: Destinataires -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden">
        <div class="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 class="font-medium text-gray-900 dark:text-white">{{ $t("whatsapp.send.recipient") }}</h3>
          </div>
        </div>
        
        <div class="p-4">
          <MobileCampaignCustomerSelection v-model="formData.customers" />
        </div>
      </div>

      <!-- Options d'envoi -->
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 space-y-3">
        <h3 class="font-medium text-gray-900 dark:text-white mb-2">{{ $t("whatsapp.send.send_title") }}</h3>
        
        <!-- Type d'envoi -->
        <button
          type="button"
          @click="sendNow"
          class="w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3"
          :class="!isScheduled 
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' 
            : 'border-gray-200 dark:border-slate-700'"
        >
          <div class="p-2 rounded-lg"
            :class="!isScheduled 
              ? 'bg-emerald-100 dark:bg-emerald-900' 
              : 'bg-gray-100 dark:bg-slate-700'">
            <UIcon name="i-heroicons-paper-airplane" 
              class="w-5 h-5"
              :class="!isScheduled 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-gray-600 dark:text-gray-400'" />
          </div>
          <div class="flex-1 text-left">
            <p class="font-medium text-gray-900 dark:text-white">{{ $t("whatsapp.send.send_now") }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t("whatsapp.send.send_now_placeholder") }}</p>
          </div>
          <UIcon v-if="!isScheduled" name="i-heroicons-check-circle" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </button>

        <button
          type="button"
          @click="programCampaign"
          class="w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center gap-3"
          :class="isScheduled 
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950' 
            : 'border-gray-200 dark:border-slate-700'"
        >
          <div class="p-2 rounded-lg"
            :class="isScheduled 
              ? 'bg-emerald-100 dark:bg-emerald-900' 
              : 'bg-gray-100 dark:bg-slate-700'">
            <UIcon name="i-heroicons-clock" 
              class="w-5 h-5"
              :class="isScheduled 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-gray-600 dark:text-gray-400'" />
          </div>
          <div class="flex-1 text-left">
            <p class="font-medium text-gray-900 dark:text-white">{{ $t("whatsapp.send.schedule") }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t("whatsapp.send.schedule_placeholder") }}</p>
          </div>
          <UIcon v-if="isScheduled" name="i-heroicons-check-circle" class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </button>

        <!-- Date si programmé -->
        <div v-if="isScheduled" class="pt-2">
          <label for="scheduleDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {{ $t("whatsapp.send.choose_date") }}
          </label>
          <input
            v-model="formData.scheduleDate"
            type="date"
            id="scheduleDate"
            class="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      <!-- Bouton d'envoi fixe en bas -->
      <div class=" right-0 p-4  dark:bg-slate-800 dark:border-slate-700">
        <UButton
          :loading="isProgress"
          :disabled="formData.customers.length === 0 || formData.content.length < 3"
          type="submit"
          size="lg"
          color="emerald"
          class="w-full justify-center"
        >
          <UIcon name="i-heroicons-paper-airplane" class="w-5 h-5 mr-2" />
          {{ $t("whatsapp.send.launch") }}
        </UButton>
      </div>
    </form>

    <!-- Modals -->
    <AlertModal
      v-if="isAlertOpen"
      :title="$t('whatsapp.send.incorrect_information')"
      type="error"
      @close-alert="closeErrorAlert"
    >
      <template #message>
        <p>{{ errorMessage }}</p>
      </template>
    </AlertModal>
    
    <AlertModal
      v-if="isSuccessOpen"
      :title="$t('whatsapp.send.campaign_validated')"
      type="success"
      @close-alert="closeSuccessAlert"
    >
      <template #message>
        <p>{{ successMessage }}</p>
      </template>
    </AlertModal>

    <!-- Modal IA -->
    <USlideover v-model="showIA">
      <div class="h-full flex flex-col bg-white dark:bg-slate-900">
        <div class="px-4 py-4 border-b border-gray-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg">
                <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 class="font-semibold text-gray-900 dark:text-white">
                  {{ $t("whatsapp.send.generate_with_ai_header") }}
                </h3>
                <p class="text-xs text-gray-500 dark:text-gray-400">
                  {{ $t("whatsapp.send.generate_with_ai_placeholder") }}
                </p>
              </div>
            </div>
            <button @click="showIA = false" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
            </button>
          </div>
        </div>

        <div class="flex-1 p-4 space-y-4">
          <textarea
            v-model="senderMessage"
            class="w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            rows="5"
            minlength="3"
            maxlength="150"
           
          />
          
          <div class="flex gap-3">
            <UButton
              @click="generateContent"
              :loading="isRequestIA"
              size="lg"
              color="violet"
              class="flex-1 justify-center"
            >
              <UIcon name="i-heroicons-sparkles" class="w-5 h-5 mr-2" />
              {{ $t("whatsapp.send.generate") }}
            </UButton>
          
          </div>
        </div>
      </div>
    </USlideover>

    <!-- Modal Preview -->
    <USlideover v-model="showPreview">
      <MobileMessagePreview
        :content="formData.content"
        :customers="formData.customers"
        :media="formData.media"
        :mediaType="formData.mediaType"
        :mediaName="formData.mediaName"
        :mediaSize="formData.mediaSize"
        :mediaPreview="formData.mediaPreview"
        @close="showPreview = false"
      />
    </USlideover>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useUser } from "@/stores/user";
import { useWhatsapp } from "@/stores/whatsapp";

const { t } = useI18n();
const whatsappStore = useWhatsapp();
const users = useUser();
const supabase = useSupabaseClient();

// États
const formData = ref({
  customers: [],
  content: "",
  scheduleDate: null,
  media: null,
  mediaType: null,
  mediaName: null,
  mediaSize: null,
  mediaPreview: null,
});

const isProgress = ref(false);
const isScheduled = ref(false);
const errorMessage = ref("");
const isAlertOpen = ref(false);
const showPreview = ref(false);
const successMessage = ref("");
const isSuccessOpen = ref(false);
const showIA = ref(false);
const isRequestIA = ref(false);
const senderMessage = ref("");

// Limites de taille
const mediaLimits = {
  image: 5 * 1024 * 1024,
  video: 16 * 1024 * 1024,
  document: 100 * 1024 * 1024,
};

const allowedExtensions = {
  image: ["jpg", "jpeg", "png", "webp"],
  video: ["mp4", "3gpp"],
  document: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "zip"],
};

// Méthodes
const handleMediaUpload = (event, type) => {
  const file = event.target.files[0];
  if (!file) return;

  const extension = file.name.split(".").pop().toLowerCase();
  if (!allowedExtensions[type].includes(extension)) {
    errorMessage.value = t("whatsapp.send.invalid_file_type");
    isAlertOpen.value = true;
    event.target.value = "";
    return;
  }

  if (file.size > mediaLimits[type]) {
    errorMessage.value = t("whatsapp.send.file_too_large", {
      max: formatFileSize(mediaLimits[type]),
    });
    isAlertOpen.value = true;
    event.target.value = "";
    return;
  }

  if (type === "image" || type === "video") {
    const reader = new FileReader();
    reader.onload = (e) => {
      formData.value.mediaPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  formData.value.media = file;
  formData.value.mediaType = type;
  formData.value.mediaName = file.name;
  formData.value.mediaSize = file.size;
};

const removeMedia = () => {
  formData.value.media = null;
  formData.value.mediaType = null;
  formData.value.mediaName = null;
  formData.value.mediaSize = null;
  formData.value.mediaPreview = null;

  ["mobile-image-upload", "mobile-video-upload", "mobile-document-upload"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.value = "";
  });
};

const getDocumentIcon = (filename) => {
  const ext = filename.split(".").pop().toLowerCase();
  const iconMap = {
    pdf: "i-heroicons-document-text",
    doc: "i-heroicons-document-text",
    docx: "i-heroicons-document-text",
    xls: "i-heroicons-table-cells",
    xlsx: "i-heroicons-table-cells",
    ppt: "i-heroicons-presentation-chart-bar",
    pptx: "i-heroicons-presentation-chart-bar",
    txt: "i-heroicons-document",
    zip: "i-heroicons-archive-box",
  };
  return iconMap[ext] || "i-heroicons-document";
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const sendNow = () => {
  isScheduled.value = false;
  formData.value.scheduleDate = null;
};

const programCampaign = () => {
  isScheduled.value = true;
};

const closeErrorAlert = () => {
  isAlertOpen.value = false;
};

const closeSuccessAlert = () => {
  isSuccessOpen.value = false;
};

const handleSubmit = async () => {
  isProgress.value = true;

  if (isScheduled.value && !formData.value.scheduleDate) {
    isProgress.value = false;
    isAlertOpen.value = true;
    errorMessage.value = t("whatsapp.send.please_choose_date");
    return;
  }

  try {
    const requestData = new FormData();
    requestData.append("customers", JSON.stringify(formData.value.customers));
    requestData.append("content", formData.value.content);
    requestData.append("token", whatsappStore.whatsapp_backlogs.token);
    requestData.append("user_id", users.info.uuid);

    if (formData.value.media) {
      requestData.append("media", formData.value.media);
      requestData.append("mediaType", formData.value.mediaType);
    }

    const endpoint = isScheduled.value ? "send-message-schedule" : "send-message";
    if (isScheduled.value) {
      requestData.append("scheduleDate", formData.value.scheduleDate);
    }

    const url = `${useRuntimeConfig().public.url_base}/api/whatsapp/${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      body: requestData,
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();

    if (json && json.success) {
      users.subscription.max_campaigns -= formData.value.customers.length;
      isSuccessOpen.value = true;
      successMessage.value = isScheduled.value 
        ? t("whatsapp.send.campaign_scheduled") 
        : t("whatsapp.send.campaign_sent");

      // Réinitialiser
      formData.value = {
        customers: [],
        content: "",
        scheduleDate: null,
        media: null,
        mediaType: null,
        mediaName: null,
        mediaSize: null,
        mediaPreview: null,
      };
      isScheduled.value = false;
    } else {
      errorMessage.value = json.message;
      isAlertOpen.value = true;
    }
  } catch (error) {
    errorMessage.value = error.message;
    isAlertOpen.value = true;
  } finally {
    isProgress.value = false;
  }
};

const generateContent = async () => {
  isRequestIA.value = true;
  const url = `${useRuntimeConfig().public.url_base}/api/whatsapp/generate-message`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        content: senderMessage.value,
      }),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();

    if (json && json.success) {
      formData.value.content = json.response;
      showIA.value = false;
      senderMessage.value = "";
    }
  } catch (error) {
    errorMessage.value = error.message;
    isAlertOpen.value = true;
  } finally {
    isRequestIA.value = false;
  }
};
</script>