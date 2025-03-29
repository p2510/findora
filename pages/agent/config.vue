<template>
  <section class="mt-14">
    <ApiNav />
  </section>
</template>

<script setup>
import { onMounted } from "vue";
definePageMeta({
  middleware: ["auth"],
  alias: "/agent/config",
});
useHead({
  title:
    "Findora Agent IA Whatsapp - Économisez des heures avec notre agent IA intelligent.",
});




</script>
