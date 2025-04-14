<template>
  <NuxtLink :to="to" class="block">
    <li
      :class="[
        'flex items-center gap-2  rounded-md transition-all duration-200 ease-in-out text-sm',
        route.path === to
          ? 'py-3 pl-4 pr-10 text-slate-950 bg-[#ffbd59]/10 dark:text-slate-200 dark:bg-slate-800'
          : 'py-2 pl-4 pr-10 text-neutral-900 hover:bg-neutral-200/20 hover:text-slate-800 dark:text-white',
      ]"
    >
      <p :class="[route.path === to ? 'text-[#ffbd59] dark:text-white' : 'text-slate-950 dark:text-white']">
        <slot name="icon" class="" />
      </p>
      <span>{{ label }}</span>
    </li>
  </NuxtLink>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

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
