<template>
  <div class="mt-14 space-y-4 pr-4">
    <OnboardingCarousel />
    <DashboardHeros />
  </div>
</template>

<script setup>
const { t } = useI18n();

definePageMeta({
  middleware: "auth",
});
useHead({
  title: t('dashboard.title'),
});
</script>
