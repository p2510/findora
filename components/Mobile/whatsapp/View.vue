<!-- components/MobileWhatsappView.vue -->
<template>
  <div class="min-h-screen bg-transparent dark:bg-slate-900 pb-20 mt-6">
    <!-- Version non autorisée -->
    <div v-if="!whatsappStore.whatsapp_backlogs?.authorize" class="px-4 py-6 space-y-6">
      <!-- Header -->
      <div class="text-center space-y-3">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ $t("whatsapp.send_thousands_messages") }}
          <span class="text-[#25D366]">WhatsApp</span>
        </h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">
          {{ $t("whatsapp.stay_connected") }}
        </p>
      </div>

      <!-- État de connexion -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        <transition name="slide-up" mode="out-in">
          <WhatsappStart
            @IsUpdate="$emit('update-step', $event)"
            v-if="step == 0 && whatsappStore.whatsapp_backlogs == null"
          />
          <WhatsappConnect
            v-else-if="
              whatsappStore.whatsapp_backlogs.status == 'active' &&
              !whatsappStore.whatsapp_backlogs.authorize
            "
          />
        </transition>
      </div>
    </div>

    <!-- Version autorisée -->
    <div v-else>
      <!-- Bannière d'essai/expiration -->
      <div v-if="whatsappStore.whatsapp_backlogs.mode == 'trial'" class="px-4 pt-4">
        <div
          v-if="isExpired"
          class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
        >
          <div class="flex items-start gap-3">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm font-medium text-red-900 dark:text-red-200">
                {{ $t("whatsapp.your_trial") }} {{ $t("whatsapp.is_expired") }}
              </p>
              <NuxtLink
                to="/abonnement"
                class="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {{ $t("whatsapp.switch_to_ultra") }}
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </div>
        
        <div v-else class="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <UIcon name="i-heroicons-sparkles" class="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div class="flex-1">
              <p class="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                <span class="font-semibold">7 {{ $t("days") }}</span> {{ $t("whatsapp.free_trial") }}
              </p>
              <NuxtLink
                to="/abonnement"
                class="inline-flex items-center gap-2 mt-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                {{ $t("whatsapp.switch_to_ultra") }}
                <UIcon name="i-heroicons-arrow-right" class="w-4 h-4" />
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Interface d'envoi mobile -->
      <MobileWhatsappSend />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useWhatsapp } from "@/stores/whatsapp";

const props = defineProps({
  step: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['update-step']);

const whatsappStore = useWhatsapp();

// Vérifier si l'essai est expiré
const isExpired = computed(() => {
  if (!whatsappStore.whatsapp_backlogs?.expire_date) return false;
  const currentDate = new Date();
  const expireDate = new Date(whatsappStore.whatsapp_backlogs.expire_date);
  return expireDate < currentDate;
});
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