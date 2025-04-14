<template>
  <div class="flex justify-center">
  <ul
    class="flex justify-center gap-4 items-center bg-gradient-to-br from-[#ffbd59]/5 to-[#ffbd59]/20 dark:from-[#ffbd59]/10 dark:to-[#ffbd59]/30 rounded-lg py-2 px-4 2xl:max-w-7xl basis-2/3"
  >
    <NuxtLink to="/agent" class="w-full flex justify-center">
      <li
        :class="[
          'text-center flex items-center justify-center w-full gap-2 rounded-lg transition-all duration-200 ease-in-out',
          route.path === '/agent'
            ? 'py-3 pl-4 pr-10 text-slate-800 dark:text-white bg-[#ffbd59]/70'
            : 'py-3 pl-4 pr-10 text-slate-800 dark:text-white hover:bg-[#ffbd59]/40 hover:text-slate-800 dark:hover:text-white',
        ]"
      >
        <span class="text-sm xl:text-md">Crédit</span>
      </li>
    </NuxtLink>

    <NuxtLink to="/agent/config" class="w-full flex justify-center">
      <li
        :class="[
          'text-center flex items-center justify-center w-full gap-2 rounded-lg transition-all duration-200 ease-in-out',
          route.path === '/agent/config'
            ? 'py-3 pl-4 pr-10 text-slate-800 dark:text-white bg-[#ffbd59]/70'
            : 'py-3 pl-4 pr-10 text-slate-800 dark:text-white hover:bg-[#ffbd59]/40 hover:text-slate-800 dark:hover:text-white',
        ]"
      >
        <span class="text-sm xl:text-md">Configuration</span>
      </li>
    </NuxtLink>

    <NuxtLink to="/agent/chat" class="w-full flex justify-center">
      <li
        :class="[
          'text-center flex items-center justify-center w-full gap-2 rounded-lg transition-all duration-200 ease-in-out',
          route.path === '/agent/chat'
            ? 'py-3 pl-4 pr-10 text-slate-800 dark:text-white bg-[#ffbd59]/70'
            : 'py-3 pl-4 pr-10 text-slate-800 dark:text-white hover:bg-[#ffbd59]/40 hover:text-slate-800 dark:hover:text-white',
        ]"
      >
        <span class="text-sm xl:text-md">Chat</span>
      </li>
    </NuxtLink>
  </ul>
</div>

</template>

<script setup>
import { useRoute } from "vue-router";
const route = useRoute();
</script>

<style></style>