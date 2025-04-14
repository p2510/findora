<script setup>
import { ref, watch } from "vue";
import { useRoute } from "#app";

let route = useRoute();
let routeName = ref(route.path.substring(1));

watch(
  () => route.path,
  (newPath) => {
    routeName.value = newPath.substring(1);
  }
);
</script>

<template>
  <div
    class="grid grid-cols-12 relative primary-font "
    :class="{ 'overflow-hidden h-screen': routeName === 'agent/chat' }"
  >
    <Header class="col-span-12 fixed z-40" :name="routeName" />

    <main
      class="fixed isolate col-span-12 hidden sm:grid grid-cols-12 gap-2 w-full mt-8 dark:bg-transparent bg-gradient-to-r from-white dark:from-slate-800 dark:to-slate-950 to-[#eeeff0]/30 fox"
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
        class="col-span-full fixed z-30 xl:relative xl:col-span-3 2xl:col-span-2 w-full xl:h-screen inline-flex justify-center xl:flex xl:justify-start mt-8 xl:mt-0 pl-2 "
      />

      <NuxtPage
        class="relative col-span-full xl:col-span-9 2xl:col-span-10 w-full px-4 xl:px-3 mt-36 xl:mt-20"
      />
    </main>

    <div
      class="col-span-12 block sm:hidden w-full mt-40 bg-gradient-to-r from-white to-[#eeeff0]/30 p-6"
    >
      <div class="space-y-5 pb-2">
        <h2 class="text-center text-2xl text-slate-950/80 tracking-tight">
          Heureux de vous revoir !
        </h2>
        <p class="text-center text-md text-slate-700">
          Findora n'est pe encore
          <span class="font-semibold">disponible </span>
          sur téléphone. Vous pouvez vous connecter sur votre tablette ou
          ordinateur
        </p>
      </div>
    </div>
  </div>
</template>
<style scoped>
@import url("~/assets/css/font.css");
</style>
