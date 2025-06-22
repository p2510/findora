<template>
  <div class="">
    <NuxtLayout v-if="!shouldHideLayout">
      <NuxtPage class="w-full" />
    </NuxtLayout>
    <NuxtPage class="w-full" v-else />
  </div>
</template>
<script setup>
import { computed,watch } from "vue";
import { useRoute } from "#app";
const { initialize } = useHotjar()
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'theme-color', content: '#ffffff' },
    { name: 'apple-mobile-web-app-title', content: 'Findora' }
  ],
  link: [
    { rel: 'manifest', href: '/manifest.json' }
  ],
  /*
  script: [
    {
      src: "//code.tidio.co/ew6xfoks6xdz4jku5masrytmyvtk6ygm.js",
      async: true,
    },
  ],*/
});
const route = useRoute();
const listRoute = ["/","/en", "/confirm"];
const shouldHideLayout = computed(() => listRoute.includes(route.path));
onMounted(() => {
  initialize()
  
})

</script>
<style></style>
