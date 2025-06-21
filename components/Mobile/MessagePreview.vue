<!-- components/MobileMessagePreview.vue -->
<template>
  <div class="h-full flex flex-col bg-white dark:bg-slate-900">
    <!-- Header -->
    <div class="px-4 py-4 border-b border-gray-200 dark:border-slate-700">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ $t("whatsapp.send.message_preview") }}
        </h3>
        <button @click="$emit('close')" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800">
          <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <!-- Sélecteur de client -->
      <div v-if="customers.length > 0" class="bg-gray-50 dark:bg-slate-800 rounded-lg p-3">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {{ $t("whatsapp.send.preview_for") }}:
        </label>
        <select 
          v-model="previewCustomerIndex" 
          class="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm"
        >
          <option v-for="(customer, index) in customers" :key="index" :value="index">
            {{ customer.name }} ({{ customer.phone }})
          </option>
        </select>
      </div>

      <!-- Aperçu style WhatsApp -->
      <div class="bg-[url('/whatsapp-bg.png')] dark:bg-slate-900 rounded-xl p-4 min-h-[400px]">
        <div class="flex items-start gap-2">
          <div class="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
            {{ customers[previewCustomerIndex]?.name?.charAt(0) || 'U' }}
          </div>
          <div class="flex-1 max-w-[85%]">
            <div class="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none p-3 shadow-sm">
              <p class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap text-sm">{{ previewMessage }}</p>
              
              <!-- Aperçu du média -->
              <div v-if="media" class="mt-2">
                <div v-if="mediaType === 'image' && mediaPreview" class="rounded-lg overflow-hidden">
                  <img :src="mediaPreview" alt="Media preview" class="w-full max-h-48 object-cover" />
                </div>
                <div v-else-if="mediaType === 'video' && mediaPreview" class="rounded-lg overflow-hidden">
                  <video :src="mediaPreview" controls class="w-full max-h-48" />
                </div>
                <div v-else class="flex items-center gap-2 p-2 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <UIcon :name="getDocumentIcon(mediaName)" class="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-medium text-gray-800 dark:text-gray-200 truncate">{{ mediaName }}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ formatFileSize(mediaSize) }}</p>
                  </div>
                </div>
              </div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">{{ formatTime(new Date()) }}</p>
          </div>
        </div>
      </div>

      <!-- Message si aucun destinataire -->
      <div v-if="customers.length === 0" class="text-center py-12 text-gray-500 dark:text-gray-400">
        <UIcon name="i-heroicons-user-group" class="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p class="text-sm">{{ $t("whatsapp.send.select_recipients_first") }}</p>
      </div>

      <!-- Variables disponibles -->
      <div class="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
        <p class="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
          {{ $t("whatsapp.send.available_variables") }}:
        </p>
        <div class="flex flex-wrap gap-2">
          <code class="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded">{name}</code>
          <code class="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded">{email}</code>
          <code class="text-xs bg-white dark:bg-slate-800 px-2 py-1 rounded">{phone}</code>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  content: String,
  customers: Array,
  media: Object,
  mediaType: String,
  mediaName: String,
  mediaSize: Number,
  mediaPreview: String
});

const emit = defineEmits(['close']);

const previewCustomerIndex = ref(0);

// Variables disponibles
const availableVariables = [
  { key: "name", label: "Nom" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Téléphone" },
];

// Message personnalisé
const previewMessage = computed(() => {
  if (!props.customers || props.customers.length === 0) return props.content;

  const selectedCustomer = props.customers[previewCustomerIndex.value];
  if (!selectedCustomer) return props.content;

  let message = props.content;
  for (const variable of availableVariables) {
    const regex = new RegExp(`{${variable.key}}`, "g");
    message = message.replace(regex, selectedCustomer[variable.key] || "");
  }

  return message;
});

// Formater l'heure
const formatTime = (date) => {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Icône de document
const getDocumentIcon = (filename) => {
  if (!filename) return "i-heroicons-document";
  
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

// Formater la taille du fichier
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
</script>