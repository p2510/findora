<template>
  <div class="mt-14 space-y-4 pr-4">
    <CampaignHeader />
    <CampaignForm />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
definePageMeta({
  middleware: "auth",
  alias: "/campagne",
});
useHead({
  title: "Findora - Campagne",
});
</script>

<style scoped>
.error {
  color: red;
}
</style>
