<template>
  <section class="mt-14">
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
</template>
<script setup>
import { useUser } from "@/stores/user";
const userStore = useUser();
const { t } = useI18n();

definePageMeta({
  middleware: ["auth", "is-ultra"],
  alias: "/agent",
});
useHead({
  title: t('agent.units.delegate_conversations'),
});
</script>
