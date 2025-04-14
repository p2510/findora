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
definePageMeta({
  middleware: ["auth", "is-entreprise"],
  alias: "/agent/config",
});
useHead({
  title:
    "Configurez votre agent IA pour qu'il s'adapte à vos besoins et ambitions..",
});
</script>
