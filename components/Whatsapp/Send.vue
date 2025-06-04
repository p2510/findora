<template>
  <section class="px-10 lg:px-12">
    <h4
      class="text-slate-900 dark:text-white text-2xl lg:text-4xl pb-2 flex items-center justify-between"
    >
      <p>
        {{ $t("whatsapp.send.launch_new_campaign") }}
        <span
          class="bg-clip-text text-transparent bg-gradient-to-r from-[#25D366] to-[#1e6337] dark:from-[#25D366] dark:to-[#1e6337]"
        >
          {{ $t("whatsapp.send.campaign") }}
        </span>
      </p>
      <p
        class="rounded-lg px-4 py-2 bg-[#25D366]/20 dark:bg-[#25D366]/10 flex justify-between items-center"
      >
        <span class="text-slate-800 text-xs dark:text-white">
          <i class="font-semibold not-italic">{{
            users.subscription.max_campaigns
          }}</i>
          {{ $t("whatsapp.send.remaining_campaigns") }}
        </span>
      </p>
    </h4>

    <form class="grid grid-cols-12 gap-4 pt-6" @submit.prevent="handleSubmit">
      <div class="col-span-full space-y-3 relative">
        <label for="content" class="text-gray-500 dark:text-gray-300">{{
          $t("whatsapp.send.create_campaign_content")
        }}</label>
        <div class="relative">
          <textarea
            v-model="formData.content"
            autofocus
            class="border-2 border-slate-200 text-sm p-4 rounded-3xl bg-slate-100/60 dark:bg-slate-800/60 outline-none text-slate-800 dark:text-white w-full"
            rows="8"
            minlength="3"
            :placeholder="$t('whatsapp.send.type_message')"
          >
          </textarea>
          <!-- Section pour l'upload de média -->
          <!-- Section pour l'upload de média -->
          <div class="col-span-full space-y-3">
            <label class="text-gray-500 dark:text-gray-300">
              {{ $t("whatsapp.send.attach_media") }}
            </label>

            <div class="flex flex-wrap items-center gap-4">
              <!-- Boutons d'upload par type -->
              <div class="flex gap-2">
                <!-- Image -->
                <label
                  for="image-upload"
                  class="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 hover:bg-emerald-200 dark:hover:bg-emerald-900/30 transition-colors"
                >
                  <UIcon
                    name="i-heroicons-photo"
                    class="w-5 h-5 text-emerald-600"
                  />
                  <span class="text-sm">{{ $t("whatsapp.send.image") }}</span>
                </label>
                <input
                  id="image-upload"
                  type="file"
                  @change="(e) => handleMediaUpload(e, 'image')"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  class="hidden"
                />

                <!-- Vidéo -->
                <label
                  for="video-upload"
                  class="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <UIcon
                    name="i-heroicons-video-camera"
                    class="w-5 h-5 text-blue-600"
                  />
                  <span class="text-sm">{{ $t("whatsapp.send.video") }}</span>
                </label>
                <input
                  id="video-upload"
                  type="file"
                  @change="(e) => handleMediaUpload(e, 'video')"
                  accept="video/mp4,video/3gpp"
                  class="hidden"
                />

                <!-- Document -->
                <label
                  for="document-upload"
                  class="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg bg-orange-100 dark:bg-orange-900/20 hover:bg-orange-200 dark:hover:bg-orange-900/30 transition-colors"
                >
                  <UIcon
                    name="i-heroicons-document"
                    class="w-5 h-5 text-orange-600"
                  />
                  <span class="text-sm">{{
                    $t("whatsapp.send.document")
                  }}</span>
                </label>
                <input
                  id="document-upload"
                  type="file"
                  @change="(e) => handleMediaUpload(e, 'document')"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                  class="hidden"
                />
              </div>

              <!-- Affichage du fichier sélectionné -->
              <div
                v-if="formData.media"
                class="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                <UIcon
                  :name="getMediaIcon(formData.mediaType)"
                  :class="getMediaIconColor(formData.mediaType)"
                  class="w-5 h-5"
                />
                <div class="flex flex-col">
                  <span
                    class="text-sm font-medium text-slate-700 dark:text-slate-200"
                    >{{ formData.mediaName }}</span
                  >
                  <span class="text-xs text-slate-500 dark:text-slate-400">{{
                    formatFileSize(formData.mediaSize)
                  }}</span>
                </div>
                <button
                  type="button"
                  @click="removeMedia"
                  class="ml-4 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                >
                  <UIcon
                    name="i-heroicons-x-mark"
                    class="w-4 h-4 text-red-600"
                  />
                </button>
              </div>
            </div>

            <!-- Prévisualisation du média -->
            <div v-if="formData.media && formData.mediaPreview" class="mt-4">
              <div
                v-if="formData.mediaType === 'image'"
                class="relative inline-block rounded-lg overflow-hidden shadow-md"
              >
                <img
                  :src="formData.mediaPreview"
                  alt="Preview"
                  class="max-w-md max-h-64 object-cover"
                />
              </div>
              <div
                v-else-if="formData.mediaType === 'video'"
                class="relative inline-block rounded-lg overflow-hidden shadow-md"
              >
                <video
                  :src="formData.mediaPreview"
                  controls
                  class="max-w-md max-h-64"
                />
              </div>
              <div
                v-else-if="formData.mediaType === 'document'"
                class="p-8 bg-slate-100 dark:bg-slate-800 rounded-lg inline-block"
              >
                <UIcon
                  :name="getDocumentIcon(formData.mediaName)"
                  class="w-16 h-16 text-slate-600 dark:text-slate-400 mx-auto"
                />
                <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
                  {{ formData.mediaName }}
                </p>
              </div>
            </div>
          </div>
          <button
            @click="showPreview = true"
            type="button"
            class="bg-slate-700 hover:bg-slate-800 transition ease-in-out duration-300 px-2 py-[3px] rounded-md z-40 absolute text-sm bottom-24 left-4 text-white"
          >
            {{ $t("whatsapp.send.preview") }}
          </button>
          <button
            @click="showIA = true"
            type="button"
            class="animate-pulse bg-gradient-to-tr px-2 py-[3px] rounded-md from-yellow-400 to-yellow-600 z-40 absolute text-sm bottom-24 right-4 text-white"
          >
            {{ $t("whatsapp.send.generate_with_ai") }}
          </button>
        </div>
      </div>

      <div class="col-span-full flex items-end gap-4 mb-12">
        <CampaignCustomerSelection v-model="formData.customers" class="z-40" />
      </div>

      <div class="col-span-full flex justify-center items-center gap-4">
        <button
          class="p-4 rounded-xl border-2 border-emerald-600 outline-3 focus:outline outline-emerald-600/40 flex flex-col gap-2"
          type="button"
          @click="sendNow"
        >
          <p class="flex justify-between">
            <span class="text-lg text-slate-800 dark:text-white">{{
              $t("whatsapp.send.send_now")
            }}</span>
            <UIcon
              v-if="!isScheduled"
              name="i-heroicons-check-circle"
              class="w-6 h-6 text-emerald-600"
            />
          </p>
          <span
            class="hidden md:block text-xs text-slate-800 dark:text-gray-300"
          >
            {{ $t("whatsapp.send.send_now_placeholder") }}
          </span>
        </button>
        <button
          class="p-4 rounded-xl border-2 border-emerald-600 outline-3 focus:outline outline-emerald-600/40 flex flex-col gap-2"
          type="button"
          @click="programCampaign"
        >
          <p class="flex justify-between">
            <span class="text-lg text-slate-800 dark:text-white">{{
              $t("whatsapp.send.schedule")
            }}</span>
            <UIcon
              v-if="isScheduled"
              name="i-heroicons-check-circle"
              class="w-6 h-6 text-emerald-600"
            />
          </p>
          <span
            class="hidden md:block text-xs text-slate-800 dark:text-gray-300"
          >
            {{ $t("whatsapp.send.schedule_placeholder") }}
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
          <span>{{ $t("whatsapp.send.launch") }}</span>
        </UButton>
      </div>

      <div v-if="isScheduled" class="col-span-full space-y-3">
        <label for="scheduleDate" class="text-gray-500 dark:text-gray-300">{{
          $t("whatsapp.send.choose_date")
        }}</label>
        <input
          v-model="formData.scheduleDate"
          type="date"
          id="scheduleDate"
          class="border-2 border-slate-200 text-sm p-4 rounded-3xl bg-slate-100/60 dark:bg-slate-800/60 outline-none text-slate-800 dark:text-white w-full"
        />
      </div>
    </form>

    <div v-if="isAlertOpen">
      <AlertModal
        :title="$t('whatsapp.send.incorrect_information')"
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
        :title="$t('whatsapp.send.campaign_validated')"
        type="success"
        @close-alert="closeSuccessAlert"
      >
        <template #message>
          <p>{{ successMessage }}</p>
        </template>
      </AlertModal>
    </div>

    <UModal v-model="showIA">
      <UCard class="dark:bg-neutral-900 dark:text-white">
        <template #header>
          <div>
            <h5>
              <UBadge color="gray" variant="soft" size="lg">{{
                $t("whatsapp.send.generate_with_ai_header")
              }}</UBadge>
            </h5>
            <span class="text-gray-500 dark:text-gray-300 text-sm">
              {{ $t("whatsapp.send.generate_with_ai_placeholder") }}
            </span>
          </div>
        </template>

        <form class="grid grid-cols-12 gap-4" @submit.prevent>
          <div class="col-span-full flex items-center justify-center gap-4">
            <textarea
              v-model="senderMessage"
              class="border-2 border-slate-100 text-sm p-4 rounded-3xl bg-slate-100/20 dark:bg-slate-800/60 outline-none text-slate-800 dark:text-white w-full"
              rows="5"
              minlength="3"
              maxlength="150"
            >
            </textarea>
          </div>

          <div class="col-span-full">
            <UButton
              @click="generateContent"
              :loading="isRequestIA"
              size="lg"
              variant="solid"
              color="black"
            >
              {{ $t("whatsapp.send.generate") }}
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
    <!-- Message preview section -->
    <!-- Dans le modal de prévisualisation, ajoutez après le message -->
    <div
      v-if="formData.media"
      class="mt-3 p-2 bg-slate-100 dark:bg-slate-700 rounded"
    >
      <div class="flex items-center gap-2">
        <UIcon
          :name="getMediaIcon(formData.mediaType)"
          :class="getMediaIconColor(formData.mediaType)"
          class="w-4 h-4"
        />
        <span class="text-xs text-slate-600 dark:text-slate-400">
          {{ formData.mediaName }} ({{ formatFileSize(formData.mediaSize) }})
        </span>
      </div>
    </div>
  </section>
</template>
<script setup>
import { ref, watch, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "@/stores/user";
import { useWhatsapp } from "@/stores/whatsapp";
const { t } = useI18n();
const whatsappStore = useWhatsapp();
const users = useUser();
const supabase = useSupabaseClient();
const formData = ref({
  customers: [],
  content: "",
  scheduleDate: null,
  media: null, // Fichier média
  mediaType: null, // 'image', 'video' ou 'document'
  mediaName: null, // Nom du fichier
  mediaSize: null, // Taille du fichier
  mediaPreview: null, // URL de prévisualisation
});
// Limites de taille par type de média (en bytes)
const mediaLimits = {
  image: 5 * 1024 * 1024, // 5MB
  video: 16 * 1024 * 1024, // 16MB
  document: 100 * 1024 * 1024, // 100MB
};
// Extensions autorisées par type
const allowedExtensions = {
  image: ["jpg", "jpeg", "png", "webp"],
  video: ["mp4", "3gpp"],
  document: ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "zip"],
};
const handleMediaUpload = (event, type) => {
  const file = event.target.files[0];
  if (!file) return;

  // Vérifier l'extension
  const extension = file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions[type].includes(extension)) {
    errorMessage.value = t('whatsapp.send.invalid_file_type');
    isAlertOpen.value = true;
    event.target.value = '';
    return;
  }

  // Vérifier la taille du fichier
  const maxSize = mediaLimits[type];
  if (file.size > maxSize) {
    errorMessage.value = t('whatsapp.send.file_too_large', { 
      max: formatFileSize(maxSize) 
    });
    isAlertOpen.value = true;
    event.target.value = '';
    return;
  }

  // Créer une prévisualisation pour images et vidéos
  if (type === 'image' || type === 'video') {
    const reader = new FileReader();
    reader.onload = (e) => {
      formData.value.mediaPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    formData.value.mediaPreview = true; // Flag pour afficher l'icône de document
  }

  // Stocker les informations du fichier
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
  
  // Reset tous les inputs file
  ['image-upload', 'video-upload', 'document-upload'].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.value = '';
  });
};

const getMediaIcon = (type) => {
  const icons = {
    image: "i-heroicons-photo",
    video: "i-heroicons-video-camera",
    document: "i-heroicons-document",
  };
  return icons[type] || "i-heroicons-paper-clip";
};

const getMediaIconColor = (type) => {
  const colors = {
    image: "text-emerald-600",
    video: "text-blue-600",
    document: "text-orange-600",
  };
  return colors[type] || "text-gray-600";
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

let isProgress = ref(false);
const isScheduled = ref(false);
const errorMessage = ref("");
const isAlertOpen = ref(false);
let showPreview = ref(false);
let closeErrorAlert = () => {
  isAlertOpen.value = false;
};
let successMessage = ref("");
const isSuccessOpen = ref(false);
let closeSuccessAlert = () => {
  isSuccessOpen.value = false;
};

// Variables pour l'aperçu du message
const previewCustomerIndex = ref(0);

// Variables pour l'effet typewriter
const isTyping = ref(false);
const typingSpeed = ref(50); // Vitesse de frappe (ms)
const generatedContent = ref(""); // Contient le texte complet généré par l'IA

// Variables disponibles pour la personnalisation
const availableVariables = [
  { key: "name", label: t("whatsapp.send.name") },
  { key: "email", label: t("whatsapp.send.email") },
  { key: "phone", label: t("whatsapp.send.phone") },
];

// Insérer une variable à la position du curseur dans le textarea
function insertVariable(key) {
  const textarea = document.querySelector("textarea");
  if (!textarea) return;

  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;
  const textBefore = formData.value.content.substring(0, startPos);
  const textAfter = formData.value.content.substring(endPos);

  formData.value.content = `${textBefore}{${key}}${textAfter}`;

  // Replacer le curseur après la variable insérée
  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = startPos + key.length + 2;
  }, 0);
}

// Fonction pour formater l'heure pour l'aperçu du message
function formatTime(date) {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Message personnalisé pour l'aperçu
const previewMessage = computed(() => {
  if (formData.value.customers.length === 0) return formData.value.content;

  const selectedCustomer = formData.value.customers[previewCustomerIndex.value];
  if (!selectedCustomer) return formData.value.content;

  // Remplacer les variables par les valeurs du client
  let message = formData.value.content;
  for (const variable of availableVariables) {
    const regex = new RegExp(`{${variable.key}}`, "g");
    message = message.replace(regex, selectedCustomer[variable.key] || "");
  }

  return message;
});

function sendNow() {
  isScheduled.value = false;
  formData.value.scheduleDate = null;
}

function programCampaign() {
  isScheduled.value = true;
}

// Fonction pour l'effet machine à écrire
function typewriterEffect(text) {
  isTyping.value = true;
  formData.value.content = ""; // Réinitialiser le textarea
  generatedContent.value = text;

  let i = 0;
  const typeNextChar = () => {
    if (i < text.length) {
      formData.value.content += text.charAt(i);
      i++;
      setTimeout(typeNextChar, typingSpeed.value);
    } else {
      isTyping.value = false;
    }
  };

  typeNextChar();
}

// handleSubmit pour inclure le média
let handleSubmit = async () => {
  isProgress.value = true;

  if (isScheduled.value && !formData.value.scheduleDate) {
    isProgress.value = false;
    isAlertOpen.value = true;
    errorMessage.value = t("whatsapp.send.please_choose_date");
    return;
  }

  if (!isScheduled.value) {
    const url = `${
      useRuntimeConfig().public.url_base
    }/api/whatsapp/send-message`;

    try {
      // Créer FormData pour envoyer fichier + données
      const requestData = new FormData();
      requestData.append("customers", JSON.stringify(formData.value.customers));
      requestData.append("content", formData.value.content);
      requestData.append("token", whatsappStore.whatsapp_backlogs.token);
      requestData.append("user_id", users.info.uuid);

      // Ajouter le média si présent
      if (formData.value.media) {
        requestData.append("media", formData.value.media);
        requestData.append("mediaType", formData.value.mediaType);
      }

      const response = await fetch(url, {
        method: "POST",
        body: requestData, // Envoyer FormData au lieu de JSON
      });

      if (!response.ok) {
        isProgress.value = false;
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();

      if (json && json.success) {
        isProgress.value = false;
        isSuccessOpen.value = true;
        successMessage.value = t("whatsapp.send.campaign_sent");
        users.subscription.max_campaigns =
          users.subscription.max_campaigns - formData.value.customers.length;

        // Réinitialiser le formulaire
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
      } else {
        isProgress.value = false;
        errorMessage.value = json.message;
        isAlertOpen.value = true;
      }
    } catch (error) {
      isProgress.value = false;
      errorMessage.value = error.message;
      isAlertOpen.value = true;
    }
  } else {
    // Pour les campagnes programmées
    if (formData.value.media) {
      // Upload vers Supabase Storage
      const fileName = `campaigns/${Date.now()}-${formData.value.mediaName}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("whatsapp-media")
        .upload(fileName, formData.value.media);

      if (uploadError) {
        isProgress.value = false;
        errorMessage.value = t("whatsapp.send.media_upload_error");
        isAlertOpen.value = true;
        return;
      }

      // Obtenir l'URL publique
      const {
        data: { publicUrl },
      } = supabase.storage.from("whatsapp-media").getPublicUrl(fileName);

      // Sauvegarder la campagne avec l'URL du média
      const { data, error } = await supabase
        .from("whatsapp_campaigns_schedule")
        .insert({
          customers: formData.value.customers,
          content: formData.value.content,
          user_id: users.info.uuid,
          token: whatsappStore.whatsapp_backlogs.token,
          send_date: formData.value.scheduleDate,
          is_sent: false,
          media_url: publicUrl,
          media_type: formData.value.mediaType,
        });

      if (error) {
        isProgress.value = false;
        errorMessage.value = error.message;
        isAlertOpen.value = true;
      } else {
        // Mise à jour du quota et réinitialisation
        users.subscription.max_campaigns -= formData.value.customers.length;
        await supabase
          .from("subscriptions")
          .update({ max_campaigns: users.subscription.max_campaigns })
          .eq("user_id", users.info.uuid);

        isSuccessOpen.value = true;
        successMessage.value = t("whatsapp.send.campaign_scheduled");
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
        isProgress.value = false;
      }
    }
  }
};

// generate by IA
let showIA = ref(false);
let isRequestIA = ref(false);
let senderMessage = ref("");
let responseMessage = ref("");
let generateContent = async () => {
  isRequestIA.value = true;
  const url = `${
    useRuntimeConfig().public.url_base
  }/api/whatsapp/generate-message`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        content: senderMessage.value,
      }),
    });

    if (!response.ok) {
      isRequestIA.value = false;

      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();

    if (json && json.success) {
      isRequestIA.value = false;
      responseMessage.value = json.response;
      showIA.value = false;

      // Appliquer l'effet machine à écrire
      typewriterEffect(json.response);
    } else {
      isRequestIA.value = false;
    }
  } catch (error) {
    isRequestIA.value = false;
  }
};
</script>

<style scoped>
h4 {
  font-weight: 300;
}

/* Style pour le curseur clignotant (optionnel) */
@keyframes blink {
  from,
  to {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

textarea:focus {
  caret-color: auto; /* Couleur du curseur par défaut */
}

.typing textarea:focus {
  caret-color: transparent; /* Cache le curseur pendant l'animation */
}
</style>
