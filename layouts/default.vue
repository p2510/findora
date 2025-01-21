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
  <div class="grid grid-cols-12 relative primary-font">
    <Header class="col-span-12 fixed z-40" :name="routeName" />
    <main
      class="relative 2xl:fixed isolate col-span-12 grid grid-cols-12 gap-2 w-full mt-14 bg-gradient-to-r from-white to-[#eeeff0]/30"
    >
      <div
        class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-white to-orange-200/70 opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
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
        class="2xl:sticky 2xl:top-0 col-span-full xl:col-span-2 w-full xl:h-screen flex justify-center"
      />
      <NuxtPage
        class="relative col-span-full xl:col-span-10 w-full px-4 xl:px-3"
      />
    </main>
  </div>
</template>
<style scoped>
@import url("~/assets/css/font.css");

</style>
