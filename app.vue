<template>
  <div class="">
    <NuxtLayout v-if="!shouldHideLayout">
      <NuxtPage class="w-full" />
    </NuxtLayout>
    <NuxtPage class="w-full" v-else />
  </div>
</template>

<script setup>
import { computed, watch } from "vue";
import { useRoute } from "#app";
//const { initialize } = useHotjar()

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
});

const route = useRoute();
const listRoute = ["/","/en", "/confirm"];
const shouldHideLayout = computed(() => listRoute.includes(route.path));

onMounted(() => {
  initialize()
  
  // Fix pour le scroll sur mobile iOS
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
    document.addEventListener('touchmove', function (e) {
      // Permettre le scroll seulement sur les éléments qui doivent scroller
      const scrollable = e.target.closest('.overflow-y-auto, .overflow-y-scroll, [data-scrollable="true"]');
      if (!scrollable) {
        e.preventDefault();
      }
    }, { passive: false });
  }
})
</script>

<style>
/* Fix global pour les problèmes de scroll sur mobile */
@media (max-width: 639px) {
  html, body {
    height: 100%;
    overflow: hidden;
    position: fixed;
    width: 100%;
    -webkit-overflow-scrolling: touch;
  }
  
  #__nuxt {
    height: 100%;
    overflow: hidden;
  }
  
  /* Empêcher le bounce scroll iOS */
  body {
    overscroll-behavior: none;
  }
  
  /* Fix pour les zones scrollables */
  .overflow-y-auto {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
  }
  
  /* Empêcher le scroll horizontal */
  * {
    max-width: 100vw !important;
  }
}

/* Prévenir le zoom sur les inputs */
input, select, textarea {
  font-size: 16px !important;
}
</style>