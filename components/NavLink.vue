<template>
    <NuxtLink :to="to" class="block">
      <li
        :class="[
          'flex items-center gap-2  rounded-full transition-all duration-200 ease-in-out',
          route.path === to
            ? 'py-3 pl-4 pr-10 text-[#5e4414] bg-orange-200/70'
            : 'py-2 pl-4 pr-10 text-slate-600/70 hover:bg-[#f3c775] hover:text-slate-800'
        ]"
      >
        <slot name="icon" />
        <span>{{ label }}</span>
      </li>
    </NuxtLink>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  import { useRoute } from 'vue-router';
  
  // Props
  defineProps({
    to: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
  });
  
  const route = useRoute();
  
  </script>

  