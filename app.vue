<template>
  <div class="">
    <NuxtLayout v-if="!shouldHideLayout">
      <NuxtPage class="w-full" />
    </NuxtLayout>
    <NuxtPage class="w-full" v-else />
  </div>
</template>
<script setup>
import { computed } from "vue";
import { useRoute } from "#app";
useHead({
  script: [
    {
      src: "//code.tidio.co/ew6xfoks6xdz4jku5masrytmyvtk6ygm.js",
      async: true,
    },
  ],
});
const route = useRoute();
const listRoute = ["/", "/confirm"];
const shouldHideLayout = computed(() => listRoute.includes(route.path));
</script>
<style></style>
