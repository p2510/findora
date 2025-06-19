<!-- components/MobileNavItem.vue -->
<template>
  <NuxtLink 
    :to="to"
    :class="[
      'flex flex-col items-center justify-center gap-1 transition-all duration-200',
      isActive 
        ? 'text-[#ffbd59]' 
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
      isCenter ? '' : 'pt-1'
    ]"
  >
    <slot />
    <span v-if="!isCenter" class="text-xs font-medium">{{ label }}</span>
  </NuxtLink>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  to: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  isCenter: {
    type: Boolean,
    default: false
  }
})

const route = useRoute()

const isActive = computed(() => {
  if (props.to === '/more') {
    return ['/abonnement', '/parametre', '/api/jeton'].includes(route.path)
  }
  return route.path === props.to || route.path.startsWith(props.to + '/')
})
</script>