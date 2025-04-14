<template>
  <div class="flex justify-center">
    <ul
      class="flex justify-center gap-4 items-center bg-gradient-to-br from-[#ffbd59]/5 to-[#ffbd59]/20 rounded-lg py-2 px-4 2xl:max-w-7xl basis-2/3 dark:bg-gradient-to-br dark:from-[#ffbd59]/5 dark:to-[#ffbd59]/20"
    >
      <NuxtLink to="/api/jeton" class="w-full flex justify-center">
        <li
          :class="[
            'text-center flex items-center justify-center w-full gap-2 rounded-lg transition-all duration-200 ease-in-out',
            route.path === '/api/jeton'
              ? 'py-3 pl-4 pr-10 text-slate-800 bg-[#ffbd59]/70 dark:bg-[#ffbd59]/70 dark:text-slate-200'
              : 'py-3 pl-4 pr-10 text-slate-800 hover:bg-[#ffbd59]/40 hover:text-slate-800 dark:hover:bg-[#ffbd59]/30 dark:text-slate-200 dark:hover:text-slate-800',
          ]"
        >
          <span class="text-sm xl:text-md">Jeton APIs</span>
        </li>
      </NuxtLink>
      <NuxtLink to="/api/whatsapp" class="w-full flex justify-center">
        <li
          :class="[
            'text-center flex items-center justify-center w-full gap-2 rounded-lg transition-all duration-200 ease-in-out',
            route.path === '/api/whatsapp'
              ? 'py-3 pl-4 pr-10 text-slate-800 bg-[#ffbd59]/70 dark:bg-[#ffbd59]/70 dark:text-slate-200'
              : 'py-3 pl-4 pr-10 text-slate-800 hover:bg-[#ffbd59]/40 hover:text-slate-800 dark:hover:bg-[#ffbd59]/30 dark:text-slate-200 dark:hover:text-slate-800',
          ]"
        >
          <span class="text-sm xl:text-md">Whatsapp</span>
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
