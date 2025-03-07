<template>
  <div class="flex justify-center">
    <ul
      class="flex justify-center gap-4 items-center bg-slate-100 rounded-lg py-2 px-4 2xl:max-w-5xl basis-2/3"
    >
      <NuxtLink to="/scenario" class="w-full flex justify-center">
        <li
          :class="[
            'text-center flex items-center justify-center w-full gap-2  rounded-lg transition-all duration-200 ease-in-out',
            route.path === '/scenario'
              ? 'py-3 pl-4 pr-10 text-white  bg-blue-600/70'
              : 'py-3 pl-4 pr-10 text-slate-800 hover:bg-blue-600/40 hover:text-slate-800',
          ]"
        >
          <UIcon name="i-heroicons-cube" class="w-5 h-5" />
          <span class="text-sm xl:text-md">Onboarding</span>
        </li>
      </NuxtLink>
      <NuxtLink to="/scenario/creer-scenario" class="w-full flex justify-center">
        <li
          :class="[
            'text-center flex items-center justify-center w-full gap-2  rounded-lg transition-all duration-200 ease-in-out',
            route.path === '/scenario/creer-scenario'
              ? 'py-3 pl-4 pr-10 text-white  bg-blue-600/70 '
              : 'py-3 pl-4 pr-10 text-slate-800 hover:bg-blue-600/40 hover:text-slate-800',
          ]"
        >
          <UIcon name="i-heroicons-squares-plus" class="w-5 h-5" />
          <span class="text-sm xl:text-md">Nouveau</span>
        </li>
      </NuxtLink>
      <NuxtLink to="/scenario/mes-scenarios" class="w-full flex justify-center">
        <li
          :class="[
            'text-center flex items-center  justify-center w-full gap-2  rounded-lg transition-all duration-200 ease-in-out',
            route.path === '/scenario/mes-scenarios'
              ? 'py-3 pl-4 pr-10 text-white  bg-blue-600/70'
              : 'py-3 pl-4 pr-10 text-slate-800 hover:bg-blue-600/40 hover:text-slate-800',
          ]"
        >
          <UIcon name="i-heroicons-inbox-stack" class="w-5 h-5" />
          <span class="text-sm xl:text-md">Mes scénarios</span>
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
