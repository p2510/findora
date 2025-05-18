<template>
  <section class="mt-14">
    <AgentNav />
    <div class="h-screen">
      <div class="h-1/2 lg:h-4/6 xl:h-3/4 overflow-y-scroll">
        <AgentConfigInfo />
        <AgentConfigKnow />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

definePageMeta({
  middleware: ["auth", "is-ultra"],
  alias: "/agent/config",
});
useHead({
  title: t("agent.config.configure_your_ai_agent"),
});
</script>
