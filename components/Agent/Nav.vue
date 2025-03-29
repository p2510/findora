<template>
  <div class="flex justify-center">
    <ul
      class="flex justify-center gap-4 items-center bg-gradient-to-br from-[#f3c775]/5 to-[#f3c775]/20 rounded-lg py-2 px-4 2xl:max-w-7xl basis-2/3"
    >
      <NuxtLink to="/agent/config" class="w-full flex justify-center">
        <li
          :class="[
            'text-center flex items-center justify-center w-full gap-2  rounded-lg transition-all duration-200 ease-in-out',
            route.path === '/agent/config'
              ? 'py-3 pl-4 pr-10 text-slate-800  bg-[#f3c775]/70'
              : 'py-3 pl-4 pr-10 text-slate-800 hover:bg-[#f3c775]/40 hover:text-slate-800',
          ]"
        >
          <span class="text-sm xl:text-md">Configuration</span>
        </li>
      </NuxtLink>
      <NuxtLink to="/agent/chat" class="w-full flex justify-center">
        <li
          :class="[
            'text-center flex items-center justify-center w-full gap-2  rounded-lg transition-all duration-200 ease-in-out',
            route.path === '/agent/chat'
              ? 'py-3 pl-4 pr-10 text-slate-800  bg-[#f3c775]/70'
              : 'py-3 pl-4 pr-10 text-slate-800 hover:bg-[#f3c775]/40 hover:text-slate-800',
          ]"
        >
          <span class="text-sm xl:text-md">Chat</span>
        </li>
      </NuxtLink>
      <NuxtLink to="/agent/know" class="w-full flex justify-center">
        <li
          :class="[
            'text-center flex items-center justify-center w-full gap-2  rounded-lg transition-all duration-200 ease-in-out',
            route.path === '/agent/know'
              ? 'py-3 pl-4 pr-10 text-slate-800  bg-[#f3c775]/70'
              : 'py-3 pl-4 pr-10 text-slate-800 hover:bg-[#f3c775]/40 hover:text-slate-800',
          ]"
        >
          <span class="text-sm xl:text-md">Connaissance</span>
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
