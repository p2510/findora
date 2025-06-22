<template>
  <div class="">
    <!-- Splash Screen -->
    <SplashScreen v-if="showSplash" />
    
    <!-- Contenu principal -->
    <NuxtLayout v-if="!shouldHideLayout && !showSplash">
      <NuxtPage class="w-full" />
    </NuxtLayout>
    <NuxtPage class="w-full" v-else-if="!showSplash" />
  </div>
</template>

<script setup>
import { computed, watch, ref, onMounted } from "vue";
import { useRoute } from "#app";

const { initialize } = useHotjar()
const route = useRoute();
const showSplash = ref(false);

// Configuration meta pour iOS
useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover' },
    { name: 'apple-mobile-web-app-capable', content: 'yes' },
    { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
    { name: 'mobile-web-app-capable', content: 'yes' },
    { name: 'theme-color', content: '#ffbd59' },
    { name: 'apple-mobile-web-app-title', content: 'Findora' },
    { name: 'format-detection', content: 'telephone=no' },
    { name: 'msapplication-TileColor', content: '#ffbd59' },
    { name: 'msapplication-tap-highlight', content: 'no' }
  ],
  link: [
    { rel: 'manifest', href: '/manifest.json' },
    
    // Icônes Apple
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
    { rel: 'apple-touch-icon', sizes: '57x57', href: '/apple-touch-icon-57x57.png' },
    { rel: 'apple-touch-icon', sizes: '72x72', href: '/apple-touch-icon-72x72.png' },
    { rel: 'apple-touch-icon', sizes: '76x76', href: '/apple-touch-icon-76x76.png' },
    { rel: 'apple-touch-icon', sizes: '114x114', href: '/apple-touch-icon-114x114.png' },
    { rel: 'apple-touch-icon', sizes: '120x120', href: '/apple-touch-icon-120x120.png' },
    { rel: 'apple-touch-icon', sizes: '144x144', href: '/apple-touch-icon-144x144.png' },
    { rel: 'apple-touch-icon', sizes: '152x152', href: '/apple-touch-icon-152x152.png' },
    { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon-180x180.png' },
    
    // Splash screens pour iPhone
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-se.png', media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-8.png', media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-8-plus.png', media: '(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-x.png', media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-xr.png', media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-xs-max.png', media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-11-pro.png', media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-11-pro-max.png', media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-12-mini.png', media: '(device-width: 360px) and (device-height: 780px) and (-webkit-device-pixel-ratio: 3)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-12.png', media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-12-pro-max.png', media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-13-mini.png', media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-13.png', media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-13-pro.png', media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-13-pro-max.png', media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-14.png', media: '(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-14-plus.png', media: '(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-14-pro.png', media: '(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)' },
    { rel: 'apple-touch-startup-image', href: '/splash/iphone-14-pro-max.png', media: '(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)' },
    
    // Splash screens pour iPad
    { rel: 'apple-touch-startup-image', href: '/splash/ipad-mini.png', media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)' },
    { rel: 'apple-touch-startup-image', href: '/splash/ipad-air.png', media: '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)' },
    { rel: 'apple-touch-startup-image', href: '/splash/ipad-pro-10.5.png', media: '(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)' },
    { rel: 'apple-touch-startup-image', href: '/splash/ipad-pro-11.png', media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)' },
    { rel: 'apple-touch-startup-image', href: '/splash/ipad-pro-12.9.png', media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)' },
    
    // Favicon
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
    { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
  ],
  /*
  script: [
    {
      src: "//code.tidio.co/ew6xfoks6xdz4jku5masrytmyvtk6ygm.js",
      async: true,
    },
  ],*/
});

const listRoute = ["/", "/en", "/confirm"];
const shouldHideLayout = computed(() => listRoute.includes(route.path));

onMounted(() => {
  initialize();
  
  // Gérer le splash screen
  const isFirstVisit = !sessionStorage.getItem('splashShown');
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                       window.navigator.standalone || 
                       document.referrer.includes('android-app://');
  
  if (isFirstVisit && isStandalone) {
    showSplash.value = true;
    sessionStorage.setItem('splashShown', 'true');
    
    setTimeout(() => {
      showSplash.value = false;
    }, 2500);
  }
  
  // Prévenir le zoom sur iOS
  document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
  });
  
  // Empêcher le pull-to-refresh sur iOS
  let lastTouchY = 0;
  let preventPullToRefresh = false;
  
  document.addEventListener('touchstart', function(e) {
    if (e.touches.length !== 1) return;
    lastTouchY = e.touches[0].clientY;
    preventPullToRefresh = window.pageYOffset === 0;
  }, { passive: false });
  
  document.addEventListener('touchmove', function(e) {
    const touchY = e.touches[0].clientY;
    const touchYDelta = touchY - lastTouchY;
    lastTouchY = touchY;
    
    if (preventPullToRefresh && touchYDelta > 0) {
      e.preventDefault();
    }
  }, { passive: false });
});
</script>

<style>
/* Styles pour améliorer l'expérience iOS */
body {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-text-size-adjust: 100%;
}

/* Safe area pour les iPhones avec encoche */
@supports (padding: max(0px)) {
  .safe-area-top {
    padding-top: max(12px, env(safe-area-inset-top));
  }
  
  .safe-area-bottom {
    padding-bottom: max(12px, env(safe-area-inset-bottom));
  }
}

/* Prévenir le bounce effect sur iOS */
html {
  position: fixed;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

body {
  position: fixed;
  height: 100%;
  width: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
}
</style>