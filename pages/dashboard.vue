<template>
  <div class="mt-14 space-y-4 pr-4">
    <DashboardHeros />
    <DashboardStat />
    <DashboardPayment />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: "auth",
});
useHead({
  title: "Findora - Dashboard",
});


</script>
