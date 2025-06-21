<template>
  <section class="min-h-screen  dark:bg-slate-900">
    <!-- Header -->
    <div class=" dark:bg-slate-800  dark:border-slate-700">
      <div class="px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">
              {{ $t("whatsapp.send.launch_new_campaign") }}
            </h1>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ $t("whatsapp.send.create_campaign_content") }}
            </p>
          </div>
          <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-full shadow-lg">
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-chart-bar" class="w-5 h-5" />
              <span class="font-bold text-lg">{{ users.subscription.max_campaigns }}</span>
              <span class="text-sm">{{ $t("whatsapp.send.remaining_campaigns") }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-6 lg:px-8 py-8 pb-24">
      <form @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <!-- Colonne principale (2/3) -->
          <div class="xl:col-span-2 space-y-6">
            <!-- Étape 1: Message -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div class="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="bg-white/20 p-2 rounded-lg">
                    <UIcon name="i-heroicons-chat-bubble-left-right" class="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 class="text-lg font-semibold text-white">{{ $t("whatsapp.send.create_campaign_content") }}</h2>
                    <p class="text-emerald-100 text-sm">{{ $t("whatsapp.send.name") }}, {{ $t("whatsapp.send.email") }}, {{ $t("whatsapp.send.phone") }}</p>
                  </div>
                </div>
              </div>
              
              <div class="p-6">
                <div class="relative">
                  <textarea
                    v-model="formData.content"
                    autofocus
                    class="w-full px-4 py-3 pb-20 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 resize-none"
                    rows="8"
                    minlength="3"
                    :placeholder="$t('whatsapp.send.type_message')"
                  />
                  
                  <!-- Boutons d'action -->
                  <div class="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-white dark:bg-slate-800 rounded-lg p-2">
                    <button
                      @click="showPreview = true"
                      type="button"
                      class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
                    >
                      <UIcon name="i-heroicons-eye" class="w-4 h-4 text-gray-600 dark:text-gray-400" />
                      <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t("whatsapp.send.preview") }}</span>
                    </button>
                    
                    <button
                      @click="showIA = true"
                      type="button"
                      class="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <UIcon name="i-heroicons-sparkles" class="w-4 h-4" />
                      <span class="text-sm font-medium">{{ $t("whatsapp.send.generate_with_ai") }}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Étape 2: Médias -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <div class="flex items-center gap-3">
                  <UIcon name="i-heroicons-paper-clip" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t("whatsapp.send.attach_media") }}</h3>
                </div>
              </div>
              
              <div class="p-6">
                <!-- Zone d'upload -->
                <div v-if="!formData.media" class="grid grid-cols-3 gap-4">
                  <!-- Image -->
                  <label for="image-upload" class="group cursor-pointer">
                    <div class="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 p-6 text-center hover:border-emerald-500 dark:hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-all duration-200">
                      <div class="space-y-2">
                        <div class="mx-auto w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <UIcon name="i-heroicons-photo" class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t("whatsapp.send.image") }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-500">JPG, PNG, WebP</p>
                        <p class="text-xs text-gray-400 dark:text-gray-600">Max 5MB</p>
                      </div>
                    </div>
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    @change="(e) => handleMediaUpload(e, 'image')"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    class="hidden"
                  />

                  <!-- Vidéo -->
                  <label for="video-upload" class="group cursor-pointer">
                    <div class="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 p-6 text-center hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-200">
                      <div class="space-y-2">
                        <div class="mx-auto w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <UIcon name="i-heroicons-video-camera" class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t("whatsapp.send.video") }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-500">MP4, 3GPP</p>
                        <p class="text-xs text-gray-400 dark:text-gray-600">Max 16MB</p>
                      </div>
                    </div>
                  </label>
                  <input
                    id="video-upload"
                    type="file"
                    @change="(e) => handleMediaUpload(e, 'video')"
                    accept="video/mp4,video/3gpp"
                    class="hidden"
                  />

                  <!-- Document -->
                  <label for="document-upload" class="group cursor-pointer">
                    <div class="relative overflow-hidden rounded-xl border-2 border-dashed border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 p-6 text-center hover:border-orange-500 dark:hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950 transition-all duration-200">
                      <div class="space-y-2">
                        <div class="mx-auto w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                          <UIcon name="i-heroicons-document" class="w-6 h-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <p class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ $t("whatsapp.send.document") }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-500">PDF, DOC, XLS...</p>
                        <p class="text-xs text-gray-400 dark:text-gray-600">Max 100MB</p>
                      </div>
                    </div>
                  </label>
                  <input
                    id="document-upload"
                    type="file"
                    @change="(e) => handleMediaUpload(e, 'document')"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                    class="hidden"
                  />
                </div>

                <!-- Média sélectionné -->
                <div v-else>
                  <div class="bg-gray-50 dark:bg-slate-900 rounded-xl p-4">
                    <div class="flex items-start gap-4">
                      <!-- Aperçu -->
                      <div v-if="formData.mediaType === 'image' && formData.mediaPreview" class="flex-shrink-0">
                        <img
                          :src="formData.mediaPreview"
                          alt="Preview"
                          class="w-24 h-24 object-cover rounded-lg shadow-md"
                        />
                      </div>
                      <div v-else-if="formData.mediaType === 'video' && formData.mediaPreview" class="flex-shrink-0">
                        <video
                          :src="formData.mediaPreview"
                          class="w-24 h-24 object-cover rounded-lg shadow-md"
                        />
                      </div>
                      <div v-else class="flex-shrink-0">
                        <div class="w-24 h-24 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                          <UIcon
                            :name="getDocumentIcon(formData.mediaName)"
                            class="w-12 h-12 text-gray-600 dark:text-gray-400"
                          />
                        </div>
                      </div>
                      
                      <!-- Infos -->
                      <div class="flex-1">
                        <h4 class="font-medium text-gray-900 dark:text-white">{{ formData.mediaName }}</h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {{ formatFileSize(formData.mediaSize) }}
                        </p>
                        <button
                          type="button"
                          @click="removeMedia"
                          class="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium transition-colors"
                        >
                          <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                          {{ $t("whatsapp.send.change_media") }}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Étape 3: Destinataires -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <div class="flex items-center gap-3">
                  <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t("whatsapp.send.recipient") }}</h3>
                </div>
              </div>
              
              <div class="p-6">
                <CampaignCustomerSelection v-model="formData.customers" />
              </div>
            </div>
          </div>

          <!-- Colonne latérale (1/3) -->
          <div class="xl:col-span-1 space-y-6">
            <!-- Options d'envoi -->
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden sticky top-6">
              <div class="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ $t("whatsapp.send.send_title") }}</h3>
              </div>
              
              <div class="p-6 space-y-4">
                <!-- Type d'envoi -->
                <div class="space-y-3">
                  <button
                    type="button"
                    @click="sendNow"
                    class="w-full p-4 rounded-xl border-2 transition-all duration-200"
                    :class="!isScheduled 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 shadow-md' 
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
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
                        <div class="text-left">
                          <p class="font-medium text-gray-900 dark:text-white">{{ $t("whatsapp.send.send_now") }}</p>
                          <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t("whatsapp.send.send_now_placeholder") }}</p>
                        </div>
                      </div>
                      <UIcon v-if="!isScheduled" name="i-heroicons-check-circle" class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </button>

                  <button
                    type="button"
                    @click="programCampaign"
                    class="w-full p-4 rounded-xl border-2 transition-all duration-200"
                    :class="isScheduled 
                      ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950 shadow-md' 
                      : 'border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-3">
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
                        <div class="text-left">
                          <p class="font-medium text-gray-900 dark:text-white">{{ $t("whatsapp.send.schedule") }}</p>
                          <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t("whatsapp.send.schedule_placeholder") }}</p>
                        </div>
                      </div>
                      <UIcon v-if="isScheduled" name="i-heroicons-check-circle" class="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                  </button>
                </div>

                <!-- Date si programmé -->
                <div v-if="isScheduled" class="pt-2">
                  <label for="scheduleDate" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {{ $t("whatsapp.send.choose_date") }}
                  </label>
                  <input
                    v-model="formData.scheduleDate"
                    type="date"
                    id="scheduleDate"
                    class="w-full px-4 py-2 bg-gray-50 dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <!-- Bouton d'envoi -->
                <div class="pt-4">
                  <UButton
                    :loading="isProgress"
                    :disabled="formData.customers.length === 0 || formData.content.length < 3"
                    type="submit"
                    size="lg"
                    color="emerald"
                    class="w-full justify-center shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <UIcon name="i-heroicons-paper-airplane" class="w-5 h-5 mr-2" />
                    {{ $t("whatsapp.send.launch") }}
                  </UButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>

    <!-- Modals -->
    <div v-if="isAlertOpen">
      <AlertModal
        :title="$t('whatsapp.send.incorrect_information')"
        type="error"
        @close-alert="closeErrorAlert"
      >
        <template #message>
          <p>{{ errorMessage }}</p>
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

    <UModal v-model="showIA" :ui="{ width: 'sm:max-w-2xl' }">
      <UCard class="dark:bg-slate-800">
        <template #header>
          <div class="flex items-center gap-3">
            <div class="p-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg">
              <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
                {{ $t("whatsapp.send.generate_with_ai_header") }}
              </h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ $t("whatsapp.send.generate_with_ai_placeholder") }}
              </p>
            </div>
          </div>
        </template>

        <div class="space-y-4">
          <textarea
            v-model="senderMessage"
            class="w-full px-4 py-3 text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-slate-900 border-2 border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200"
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
            <UButton
              @click="showIA = false"
              size="lg"
              color="gray"
              variant="ghost"
            >
              Annuler
            </UButton>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Modal Preview -->
    <UModal v-model="showPreview" :ui="{ width: 'sm:max-w-md' }">
      <UCard class="dark:bg-slate-800">
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ $t("whatsapp.send.message_preview") }}
            </h3>
            <button @click="showPreview = false" class="text-gray-400 hover:text-gray-600">
              <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
            </button>
          </div>
        </template>

        <div class="space-y-4">
          <!-- Sélecteur de client pour preview -->
          <div v-if="formData.customers.length > 0" class="flex items-center gap-2 pb-3 border-b border-gray-200 dark:border-slate-700">
            <span class="text-sm text-gray-600 dark:text-gray-400">{{ $t("whatsapp.send.preview_for") || "Aperçu pour" }}:</span>
            <select 
              v-model="previewCustomerIndex" 
              class="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm"
            >
              <option v-for="(customer, index) in formData.customers" :key="index" :value="index">
                {{ customer.name }} ({{ customer.phone }})
              </option>
            </select>
          </div>

          <!-- Aperçu style WhatsApp -->
          <div class="bg-gray-100 dark:bg-slate-900 rounded-xl p-4">
            <div class="flex items-start gap-3">
              <div class="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white font-semibold">
                {{ formData.customers[previewCustomerIndex]?.name?.charAt(0) || 'U' }}
              </div>
              <div class="flex-1">
                <div class="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none p-4 shadow-sm">
                  <p class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{{ previewMessage }}</p>
                  
                  <!-- Aperçu du média si présent -->
                  <div v-if="formData.media" class="mt-3">
                    <div v-if="formData.mediaType === 'image' && formData.mediaPreview" class="rounded-lg overflow-hidden">
                      <img :src="formData.mediaPreview" alt="Media preview" class="w-full max-h-48 object-cover" />
                    </div>
                    <div v-else-if="formData.mediaType === 'video' && formData.mediaPreview" class="rounded-lg overflow-hidden">
                      <video :src="formData.mediaPreview" controls class="w-full max-h-48" />
                    </div>
                    <div v-else class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-700 rounded-lg">
                      <UIcon :name="getDocumentIcon(formData.mediaName)" class="w-8 h-8 text-gray-600 dark:text-gray-400" />
                      <div class="flex-1 text-sm">
                        <p class="font-medium text-gray-800 dark:text-gray-200">{{ formData.mediaName }}</p>
                        <p class="text-gray-500 dark:text-gray-400">{{ formatFileSize(formData.mediaSize) }}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">{{ formatTime(new Date()) }}</p>
              </div>
            </div>
          </div>

          <!-- Message si aucun destinataire -->
          <div v-if="formData.customers.length === 0" class="text-center py-8 text-gray-500 dark:text-gray-400">
            <UIcon name="i-heroicons-user-group" class="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p class="text-sm">Sélectionnez d'abord des destinataires pour voir l'aperçu personnalisé</p>
          </div>
        </div>
      </UCard>
    </UModal>
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
  const extension = file.name.split(".").pop().toLowerCase();
  if (!allowedExtensions[type].includes(extension)) {
    errorMessage.value = t("whatsapp.send.invalid_file_type");
    isAlertOpen.value = true;
    event.target.value = "";
    return;
  }

  // Vérifier la taille du fichier
  const maxSize = mediaLimits[type];
  if (file.size > maxSize) {
    errorMessage.value = t("whatsapp.send.file_too_large", {
      max: formatFileSize(maxSize),
    });
    isAlertOpen.value = true;
    event.target.value = "";
    return;
  }

  // Créer une prévisualisation pour images et vidéos
  if (type === "image" || type === "video") {
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
  ["image-upload", "video-upload", "document-upload"].forEach((id) => {
    const input = document.getElementById(id);
    if (input) input.value = "";
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

  try {
    // Créer FormData pour les deux cas (direct et programmé)
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

    if (!isScheduled.value) {
      // ENVOI IMMÉDIAT - Utilise l'API existante
      const url = `${
        useRuntimeConfig().public.url_base
      }/api/whatsapp/send-message`;

      const response = await fetch(url, {
        method: "POST",
        body: requestData,
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
    } else {
      // CAMPAGNE PROGRAMMÉE - Utiliser une API similaire
      requestData.append("scheduleDate", formData.value.scheduleDate);

      const url = `${
        useRuntimeConfig().public.url_base
      }/api/whatsapp/send-message-schedule`;

      const response = await fetch(url, {
        method: "POST",
        body: requestData,
      });

      if (!response.ok) {
        isProgress.value = false;
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();

      if (json && json.success) {
        // Mise à jour du quota et réinitialisation
        users.subscription.max_campaigns -= formData.value.customers.length;

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
      } else {
        isProgress.value = false;
        errorMessage.value = json.message;
        isAlertOpen.value = true;
      }
    }
  } catch (error) {
    isProgress.value = false;
    errorMessage.value = error.message;
    isAlertOpen.value = true;
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