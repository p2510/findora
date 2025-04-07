<template>
  <section class="mt-14">
    <AgentNav />
    <div class="2xl:h-screen">
      <div class="2xl:h-3/4 2xl:overflow-y-scroll">
        <AgentConfigInfo />
        <AgentConfigKnow />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from "vue";
definePageMeta({
  middleware:  ["auth","is-entreprise"],
  alias: "/agent/config",
});
useHead({
  title:
    "Findora Agent  - Économisez des heures avec notre agent IA Whatsapp intelligent.",
});

</script>
