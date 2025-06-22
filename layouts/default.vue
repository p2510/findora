<!-- layouts/default.vue -->
<template>
  <div class="h-screen flex flex-col sm:h-auto sm:min-h-screen">
    <!-- Desktop Layout -->
    <div
      class="hidden sm:grid grid-cols-12 relative primary-font h-full"
      :class="{ 'overflow-hidden': routeName === 'agent/chat' }"
    >
      <Header class="col-span-12 fixed z-40" :name="routeName" />

      <main
        class="fixed isolate col-span-12 grid grid-cols-12 gap-2 w-full mt-8 dark:bg-transparent dark:from-slate-800 dark:to-slate-950 h-full"
      >
        <div
          class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] dark:bg-transparent bg-gradient-to-tr from-white to-orange-200/70 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style="
              clip-path: polygon(
                74.1% 44.1%,
                100% 61.6%,
                97.5% 26.9%,
                85.5% 0.1%,
                80.7% 2%,
                72.5% 32.5%,
                60.2% 62.4%,
                52.4% 68.1%,
                47.5% 58.3%,
                45.2% 34.5%,
                27.5% 76.7%,
                0.1% 64.9%,
                17.9% 100%,
                27.6% 76.8%,
                76.1% 97.7%,
                74.1% 44.1%
              );
            "
          />
        </div>

        <Nav
          class="col-span-full fixed z-30 xl:relative xl:col-span-3 2xl:col-span-2 w-full xl:h-screen inline-flex justify-center xl:flex xl:justify-start mt-8 xl:mt-0 pl-2"
        />

        <NuxtPage
          class="relative col-span-full xl:col-span-9 2xl:col-span-10 w-full px-4 xl:px-3 mt-36 xl:mt-20"
          :class="!isDashboard ? 'overflow-y-auto' : ''"
        />
      </main>
    </div>

    <!-- Mobile Layout -->
    <div class="sm:hidden flex flex-col h-full">
      <!-- Mobile Header -->
      <header
        ref="mobileHeader"
        :class="[
          'fixed top-0 left-0 right-0 z-50 safe-top transition-all duration-300',
          isScrolled
            ? 'bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-md'
            : 'bg-transparent',
        ]"
      >
        <div class="flex items-center justify-between px-4 py-3">
          <!-- Logo -->
          <div class="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="88"
              height="24"
              viewBox="0 0 88 24"
            >
              <g>
                <rect
                  x="0"
                  y="0"
                  width="88"
                  height="24"
                  rx="12"
                  ry="12"
                  fill="#ffbd59"
                />
                <circle cx="60" cy="12" r="6" fill="white" />
                <path d="M30 12 L58 12" stroke="white" stroke-width="2" />
              </g>
            </svg>
          </div>
          
          <!-- Support Button -->
          <div class="bg-slate-50 dark:bg-slate-700 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M11.77 20v-1h6.615q.25 0 .432-.154q.183-.154.183-.404v-6.888q0-2.81-2.066-4.693Q14.867 4.977 12 4.977T7.066 6.861Q5 8.744 5 11.554v5.677h-.5q-.613 0-1.057-.415Q3 16.402 3 15.79v-1.885q0-.448.291-.795q.292-.348.709-.565l.017-1.229q.027-1.565.68-2.9t1.744-2.323t2.524-1.54T12 4t3.033.552t2.513 1.538t1.735 2.32t.702 2.9L20 12.513q.398.187.699.503q.301.315.301.757v2.166q0 .442-.301.757t-.699.502v1.244q0 .652-.472 1.105T18.385 20zm-2.385-6.461q-.31 0-.54-.211q-.23-.21-.23-.52t.23-.53t.54-.22t.539.22t.23.53t-.23.52t-.54.21m5.232 0q-.31 0-.54-.21t-.23-.52t.23-.53t.54-.22t.539.22t.23.53t-.23.52t-.54.21M6.718 11.95q-.136-2.246 1.447-3.829q1.582-1.583 3.886-1.583q1.936 0 3.432 1.163t1.826 3.055q-1.987-.025-3.688-1.014t-2.61-2.75q-.362 1.731-1.505 3.034q-1.144 1.303-2.788 1.924"
              />
            </svg>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main
        ref="mainContent"
        :class="[
          'flex-1 scrollable',
          headerHeight ? `pt-[${headerHeight}px]` : 'pt-20',
          'pb-20 safe-bottom'
        ]"
        @scroll="handleScroll"
      >
        <slot />
      </main>

      <!-- Bottom Navigation -->
      <nav class="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
        <!-- Background with blur effect -->
        <div
          class="absolute inset-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-gray-200/20 dark:border-slate-700/20"
        ></div>

        <!-- Navigation Container -->
        <div class="relative flex items-end justify-around h-20 px-2">
          <!-- Dashboard -->
          <NuxtLink
            to="/dashboard"
            class="flex flex-col items-center justify-center pb-2 pt-1 px-3 min-w-[64px] group"
          >
            <div
              :class="[
                'flex flex-col items-center gap-1 transition-all duration-200',
                $route.path === '/dashboard' ||
                $route.path.startsWith('/dashboard/')
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-gray-500 dark:text-gray-400',
              ]"
            >
              <Squares2X2Icon
                class="w-6 h-6 transition-transform duration-200 group-active:scale-90"
              />
              <span class="text-[10px] font-medium">Dashboard</span>
            </div>
          </NuxtLink>

          <!-- Contacts -->
          <NuxtLink
            to="/contacts"
            class="flex flex-col items-center justify-center pb-2 pt-1 px-3 min-w-[64px] group"
          >
            <div
              :class="[
                'flex flex-col items-center gap-1 transition-all duration-200',
                $route.path === '/contacts' ||
                $route.path.startsWith('/contacts/')
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-gray-500 dark:text-gray-400',
              ]"
            >
              <UsersIcon
                class="w-6 h-6 transition-transform duration-200 group-active:scale-90"
              />
              <span class="text-[10px] font-medium">Contacts</span>
            </div>
          </NuxtLink>

          <!-- Agent (Center Special) -->
          <NuxtLink to="/agent" class="relative -mt-2 group">
            <div class="relative">
              <!-- Glow effect -->
              <div
                class="absolute inset-0 bg-gradient-to-r from-[#ffbd59] to-[#f3c775] rounded-full blur-xl opacity-40 scale-110 group-hover:opacity-60 transition-opacity duration-300"
              ></div>

              <!-- Button -->
              <div
                :class="[
                  'relative bg-gradient-to-r from-[#ffbd59] to-[#f3c775] rounded-full p-3.5 shadow-lg transition-all duration-300',
                  'group-hover:shadow-xl group-active:scale-95',
                  $route.path === '/agent' || $route.path.startsWith('/agent/')
                    ? 'shadow-xl scale-105'
                    : '',
                ]"
              >
                <RectangleGroupIcon class="w-7 h-7 text-white" />
                <!-- Inner highlight -->
                <div
                  class="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-full pointer-events-none"
                ></div>
              </div>

              <!-- Active ring -->
              <div
                v-if="
                  $route.path === '/agent' || $route.path.startsWith('/agent/')
                "
                class="absolute inset-0 rounded-full border-2 border-white/30 scale-125 animate-pulse"
              ></div>
            </div>
          </NuxtLink>

          <!-- WhatsApp -->
          <NuxtLink
            to="/whatsapp"
            class="flex flex-col items-center justify-center pb-2 pt-1 px-3 min-w-[64px] group"
          >
            <div
              :class="[
                'flex flex-col items-center gap-1 transition-all duration-200',
                $route.path === '/whatsapp' ||
                $route.path.startsWith('/whatsapp/')
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-gray-500 dark:text-gray-400',
              ]"
            >
              <PaperAirplaneIcon
                class="w-6 h-6 transition-transform duration-200 group-active:scale-90"
              />
              <span class="text-[10px] font-medium">Campagne</span>
            </div>
          </NuxtLink>

          <!-- More -->
          <NuxtLink
            to="/more"
            class="flex flex-col items-center justify-center pb-2 pt-1 px-3 min-w-[64px] group"
          >
            <div
              :class="[
                'flex flex-col items-center gap-1 transition-all duration-200',
                ['/more', '/abonnement', '/parametre', '/api/jeton'].includes(
                  $route.path
                )
                  ? 'text-slate-900 dark:text-slate-100'
                  : 'text-gray-500 dark:text-gray-400',
              ]"
            >
              <Bars3Icon
                class="w-6 h-6 transition-transform duration-200 group-active:scale-90"
              />
              <span class="text-[10px] font-medium">Plus</span>
            </div>
          </NuxtLink>
        </div>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, nextTick } from "vue";
import { useRoute } from "#app";
import {
  Squares2X2Icon,
  UsersIcon,
  RectangleGroupIcon,
  PaperAirplaneIcon,
  Bars3Icon,
} from "@heroicons/vue/24/outline";

const route = useRoute();
const routeName = ref(route.path.substring(1));
const isDashboard = computed(() => route.path === "/dashboard");

// Mobile scroll management
const mainContent = ref(null);
const mobileHeader = ref(null);
const isScrolled = ref(false);
const headerHeight = ref(0);

// Calculate header height dynamically
const updateHeaderHeight = () => {
  if (mobileHeader.value) {
    headerHeight.value = mobileHeader.value.offsetHeight;
  }
};

// Handle scroll
const handleScroll = () => {
  if (mainContent.value) {
    isScrolled.value = mainContent.value.scrollTop > 10;
  }
};

// Watch route changes
watch(
  () => route.path,
  (newPath) => {
    routeName.value = newPath.substring(1);
    // Reset scroll position
    if (mainContent.value) {
      mainContent.value.scrollTop = 0;
    }
    isScrolled.value = false;
  }
);

// Setup on mount
onMounted(() => {
  updateHeaderHeight();
  
  // Update header height on resize
  window.addEventListener('resize', updateHeaderHeight);
  
  // Observe header size changes
  if (mobileHeader.value && window.ResizeObserver) {
    const resizeObserver = new ResizeObserver(updateHeaderHeight);
    resizeObserver.observe(mobileHeader.value);
  }
});

// Cleanup
onUnmounted(() => {
  window.removeEventListener('resize', updateHeaderHeight);
});
</script>

<style scoped>
@import url("~/assets/css/font.css");

/* Mobile-specific optimizations */
@media (max-width: 639px) {
  /* Ensure smooth scrolling */
  .scrollable {
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-y: contain;
  }
  
  /* Prevent horizontal scroll */
  * {
    max-width: 100vw;
  }
}

/* Prevent text selection on navigation */
nav {
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

/* Smooth transitions for active states */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>