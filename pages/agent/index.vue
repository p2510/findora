<!-- pages/agent/index.vue -->
<template>
  <div>
    <!-- Version Desktop -->
    <section v-if="!isMobile" class="mt-14">
      <AgentNav />
      <div class="space-y-8 flex justify-center pt-10">
        <div class="2xl:max-w-7xl basis-2/3">
          <h3 class="text-start text-xl pt-3 pb-6 dark:text-white">
            {{ $t('agent.units.pay_as_you_go') }}
          </h3>
          <p class="text-sm text-start text-slate-700 dark:text-slate-300">
            {{ $t('agent.units.current_credit') }}
          </p>
          <p class="text-3xl text-slate-800 dark:text-white pb-4">
            {{ userStore.subscription.max_limit }}
          </p>
          <p class="mb-6">
            <a
              target="_blank"
              href="https://wa.me/2250160485654"
              class="text-slate-800 dark:text-white bg-slate-200 dark:bg-slate-700 rounded-lg py-2 px-4 text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition duration-300 ease-in-out"
            >
              {{ $t('agent.units.buy_more_credit') }}
            </a>
          </p>
        </div>
      </div>
    </section>

    <!-- Version Mobile -->
    <MobileAgentView v-else class=" pt-3 pb-32">
      <!-- Page d'accueil mobile avec carte de crédit -->
      <div class="px-4 py-6">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-slate-700">
          <div class="text-center">
            <div class="w-20 h-20 bg-gradient-to-br from-[#ffbd59]/20 to-[#ffbd59]/40 rounded-full flex items-center justify-center mx-auto mb-4">
              <UIcon name="i-heroicons-credit-card" class="w-10 h-10 text-[#ffbd59]" />
            </div>
            
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {{ $t('agent.units.your_balance') }}
            </h3>
            
            <p class="text-4xl font-bold text-[#ffbd59] mb-6">
              {{ userStore.subscription.max_limit }}
            </p>
            
            <a
              href="https://wa.me/2250160485654"
              target="_blank"
              class="inline-flex items-center gap-2 bg-[#ffbd59] hover:bg-[#f3c775] text-slate-900 font-medium px-6 py-3 rounded-xl transition-colors"
            >
              <UIcon name="i-heroicons-shopping-cart" class="w-5 h-5" />
              {{ $t('agent.units.buy_more_credit') }}
            </a>
          </div>
        </div>

        <!-- Guide rapide -->
        <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <UIcon name="i-heroicons-information-circle" class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 class="font-medium text-blue-900 dark:text-blue-200 mb-1">
                {{ $t('agent.units.how_it_works') }}
              </h4>
              <p class="text-sm text-blue-700 dark:text-blue-300">
                {{ $t('agent.units.credit_explanation') }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileAgentView>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUser } from "@/stores/user";

const { t } = useI18n();
const userStore = useUser();
const isMobile = ref(false);

definePageMeta({
  middleware: ["auth", "is-ultra"],
  alias: "/agent",
});

useHead({
  title: t('agent.units.delegate_conversations'),
});

onMounted(() => {
  isMobile.value = window.innerWidth < 768;
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768;
  });
});
</script>