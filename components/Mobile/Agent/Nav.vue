<!-- components/MobileAgentNav.vue -->
<template>
  <div class="px-4 pb-3">
    <div class="bg-gradient-to-br from-[#ffbd59]/5 to-[#ffbd59]/20 dark:from-[#ffbd59]/10 dark:to-[#ffbd59]/30 rounded-xl p-1">
      <div class="grid grid-cols-2 gap-1">
        <NuxtLink 
          to="/agent" 
          :class="[
            'text-center py-3 px-4 rounded-lg transition-all duration-200 ease-in-out',
            route.path === '/agent' || route.path === '/agent/chat'
              ? 'bg-[#ffbd59]/70 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-800 dark:text-white hover:bg-[#ffbd59]/40'
          ]"
        >
          <UIcon name="i-heroicons-credit-card" class="w-5 h-5 mb-1" />
          <p class="text-xs font-medium">{{ $t("agent.nav.credit") }}</p>
        </NuxtLink>

        <NuxtLink 
          to="/agent/chat" 
          :class="[
            'text-center py-3 px-4 rounded-lg transition-all duration-200 ease-in-out',
            route.path === '/agent/chat'
              ? 'bg-[#ffbd59]/70 text-slate-800 dark:text-white shadow-sm'
              : 'text-slate-800 dark:text-white hover:bg-[#ffbd59]/40'
          ]"
        >
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-5 h-5 mb-1" />
          <p class="text-xs font-medium">{{ $t("agent.nav.chat") }}</p>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from "vue-router";
const route = useRoute();
</script>