<template>
  <div class="">
    <!-- Splash Screen -->
    <MobileSplashScreen v-if="showSplash" @complete="onSplashComplete" />
    
    <!-- Contenu principal -->
    <template v-if="!showSplash">
      <NuxtLayout v-if="!shouldHideLayout">
        <NuxtPage class="w-full" />
      </NuxtLayout>
      <NuxtPage class="w-full" v-else />
    </template>
  </div>
</template>

<script setup>
import { computed, watch, onMounted, nextTick, ref } from "vue";
import { useRoute } from "#app";
const { initialize } = useHotjar()

// State pour le splash screen
const showSplash = ref(true)

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
  // Vérifier si c'est la première visite
  const hasVisited = sessionStorage.getItem('hasVisited')
  
  if (hasVisited) {
    showSplash.value = false
  } else {
    // Marquer comme visité pour cette session
    sessionStorage.setItem('hasVisited', 'true')
  }
  
  //initialize()
  
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

// Fonction appelée quand le splash screen se termine
const onSplashComplete = () => {
  showSplash.value = false
}

// Réinitialiser le scroll à chaque changement de route
watch(() => route.path, async () => {
  // Réinitialisation immédiate
  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
  
  // Attendre que le DOM soit prêt avec nextTick
  await nextTick();
  
  // Réinitialiser tous les éléments scrollables
  document.querySelectorAll('.overflow-y-auto, .overflow-y-scroll, [data-scrollable="true"]').forEach(el => {
    el.scrollTop = 0;
  });
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

/* Masquer la barre de scroll tout en gardant la fonctionnalité */
/* Pour Webkit (Chrome, Safari, Edge) */
*::-webkit-scrollbar {
  display: none;
}

/* Pour Firefox */
* {
  scrollbar-width: none;
}

/* Pour IE */
* {
  -ms-overflow-style: none;
}
</style>