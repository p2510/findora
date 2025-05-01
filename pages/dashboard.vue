<template>
  <div class="mt-14 space-y-4 pr-4">
    <OnboardingCarousel />
    <DashboardHeros />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});
useHead({
  title:
    "Findora - Votre tableau de bord pour une Gestion des contacts sans effort",
});


</script>
