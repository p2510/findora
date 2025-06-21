<!-- components/MobileAgentView.vue -->
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900 pb-20 mt-14">
    <!-- Header avec crédit -->
    <div class="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
      <div class="px-4 py-4">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              {{ $t('agent.units.pay_as_you_go') }}
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {{ $t('agent.units.current_credit') }}
            </p>
          </div>
          <div class="text-right">
            <p class="text-2xl font-bold text-[#ffbd59]">
              {{ userStore.subscription.max_limit }}
            </p>
            <a
              href="https://wa.me/2250160485654"
              target="_blank"
              class="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
            >
              {{ $t('agent.units.buy_more') }}
              <UIcon name="i-heroicons-arrow-top-right-on-square" class="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="sticky top-0 z-30 bg-gray-50 dark:bg-slate-900 pt-3">
      <MobileAgentNav />
    </div>

    <slot />
  </div>
</template>

<script setup>
import { useUser } from "@/stores/user";
const userStore = useUser();
</script>