<template>
  <NuxtLink :to="to" class="block">
    <li
      :class="[
        'flex items-center justify-center gap-2  rounded-full transition-all duration-200 ease-in-out',
        route.path === to
          ? 'py-3 px-3  text-[#5e4414] bg-orange-200/70 dark:text-slate-200 dark:bg-slate-800'
          : 'py-2 px-3 text-slate-600/70 hover:bg-[#f3c775] hover:text-slate-800 dark:text-white',
      ]"
    >
      <slot name="icon" />
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
