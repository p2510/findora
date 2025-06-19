<!-- components/MenuItem.vue -->
<template>
  <component
    :is="componentType"
    :to="to"
    :href="href"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
    @click="handleClick"
    class="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer border-b border-gray-100 dark:border-slate-700 last:border-0"
  >
    <div class="flex items-center gap-3">
      <!-- Icon -->
      <div :class="[
        'p-2 rounded-xl',
        iconColor ? '' : 'bg-gray-100 dark:bg-slate-700'
      ]">
        <UIcon 
          :name="icon" 
          :class="[
            'w-5 h-5',
            iconColor || 'text-gray-600 dark:text-gray-400'
          ]" 
        />
      </div>
      
      <!-- Text -->
      <div>
        <h4 class="text-sm font-medium text-gray-900 dark:text-white">
          {{ title }}
        </h4>
        <p v-if="subtitle" class="text-xs text-gray-600 dark:text-gray-400">
          {{ subtitle }}
        </p>
      </div>
    </div>
    
    <!-- Right Side -->
    <div class="flex items-center gap-2">
      <!-- Notification Badge -->
      <div v-if="hasNotification" 
           class="w-2 h-2 bg-red-500 rounded-full">
      </div>
      
      <!-- Arrow -->
      <UIcon 
        v-if="showArrow || isExternal" 
        :name="isExternal ? 'i-heroicons-arrow-top-right-on-square' : 'i-heroicons-chevron-right'" 
        class="w-4 h-4 text-gray-400" 
      />
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  to: {
    type: String,
    default: ''
  },
  href: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    required: true
  },
  iconColor: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  showArrow: {
    type: Boolean,
    default: false
  },
  hasNotification: {
    type: Boolean,
    default: false
  },
  isExternal: {
    type: Boolean,
    default: false
  },
  isButton: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const componentType = computed(() => {
  if (props.isButton) return 'button'
  if (props.href) return 'a'
  if (props.to) return 'NuxtLink'
  return 'div'
})

const handleClick = () => {
  if (props.isButton) {
    emit('click')
  }
}
</script>