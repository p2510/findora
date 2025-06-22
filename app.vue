<!-- app.vue -->
<template>
  <div id="app" :class="appClasses">
    <!-- Splash Screen animé (optionnel) -->
    <SplashScreen v-if="showSplash" @complete="onSplashComplete" />
    
    <!-- Contenu principal -->
    <NuxtLayout v-if="!shouldHideLayout && !showSplash">
      <NuxtPage class="w-full" />
    </NuxtLayout>
    <NuxtPage class="w-full" v-else-if="!showSplash" />
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from "vue";
import { useRoute } from "#app";

const { initialize } = useHotjar()
const route = useRoute();
const showSplash = ref(false) // Mettez à true si vous voulez activer le splash screen

// Routes qui cachent le layout
const listRoute = ["/", "/en", "/confirm", "/qrcode"];
const shouldHideLayout = computed(() => listRoute.includes(route.path));

// Classes pour l'app selon la route
const appClasses = computed(() => {
  const classes = ['min-h-screen'];
  
  // Sur mobile uniquement
  if (window.innerWidth < 640) {
    // Pages qui ne doivent pas avoir de scroll au niveau app
    const noScrollPages = ['/dashboard', '/agent/chat'];
    if (noScrollPages.some(page => route.path.startsWith(page))) {
      classes.push('h-screen', 'overflow-hidden');
    }
  }
  
  return classes.join(' ');
});

// Gestion du splash screen
const onSplashComplete = () => {
  showSplash.value = false;
};

// Meta tags et configuration PWA
useHead({
  title: 'Findora',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
    { name: 'description', content: 'Déléguez vos conversations WhatsApp en toute simplicité' },
    { name: 'theme-color', content: '#ffbd59' },
    
    // iOS meta tags
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'apple-mobile-web-app-title', content: 'Findora' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    
    // Format detection
    { name: 'format-detection', content: 'telephone=no' },
    
    // Open Graph
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Findora' },
    { property: 'og:description', content: 'Déléguez vos conversations WhatsApp en toute simplicité' },
    { property: 'og:image', content: '/icon-512.png' },
  ],
  link: [
    { rel: 'manifest', href: '/manifest.json' },
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    
    // Splash screens iOS - Ajoutez tous les splash screens générés ici
    { 
      rel: 'apple-touch-startup-image',
      media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)',
      href: '/splash/iphone-8.png'
    },
    // ... Ajoutez les autres tailles selon votre script
  ]
});

onMounted(() => {
  initialize();
  
  // Prévenir le bounce scroll sur iOS
  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
    document.body.addEventListener('touchmove', function(e) {
      if (!e.target.closest('.scrollable')) {
        e.preventDefault();
      }
    }, { passive: false });
  }
});

// Gestion du changement de route pour réinitialiser le scroll
watch(() => route.path, () => {
  // Reset scroll position on route change
  window.scrollTo(0, 0);
  document.body.scrollTop = 0;
});
</script>

<style>
/* Styles globaux pour la gestion du scroll et PWA */
:root {
  --sat: env(safe-area-inset-top);
  --sar: env(safe-area-inset-right);
  --sab: env(safe-area-inset-bottom);
  --sal: env(safe-area-inset-left);
}

* {
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
}

html {
  height: 100%;
  overflow: hidden;
  -webkit-text-size-adjust: 100%;
}

body {
  height: 100%;
  overflow: hidden;
  position: fixed;
  width: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overscroll-behavior: none;
}

#__nuxt, #app {
  height: 100%;
  overflow: hidden;
}

/* Classes utilitaires pour le scroll */
.scrollable {
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior-y: contain;
}

.no-scroll {
  overflow: hidden !important;
}

/* Optimisations pour iOS PWA */
@supports (padding-top: env(safe-area-inset-top)) {
  .safe-top {
    padding-top: env(safe-area-inset-top);
  }
  
  .safe-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .safe-left {
    padding-left: env(safe-area-inset-left);
  }
  
  .safe-right {
    padding-right: env(safe-area-inset-right);
  }
}

/* Prévenir le zoom sur les inputs iOS */
input, select, textarea {
  font-size: 16px !important;
}

/* Animation de chargement de page */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>