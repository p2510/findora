<!-- components/MobileActionCard.vue -->
<template>
  <component
    :is="componentType"
    v-bind="componentProps"
    class="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors cursor-pointer border-b border-gray-100 dark:border-slate-700 last:border-b-0"
    @click="handleClick"
  >
    <div class="flex items-center gap-3">
      <div class="p-2 rounded-lg bg-gray-100 dark:bg-slate-700">
        <UIcon
          :name="icon"
          :class="[
            'w-5 h-5',
            iconColor || 'text-gray-600 dark:text-gray-400'
          ]"
        />
      </div>
      <div>
        <h3 class="font-medium text-gray-900 dark:text-white">
          {{ title }}
        </h3>
        <p v-if="subtitle" class="text-sm text-gray-500 dark:text-gray-400">
          {{ subtitle }}
        </p>
      </div>
    </div>
    
    <div class="flex items-center gap-2">
      <div
        v-if="hasNotification"
        class="w-2 h-2 bg-red-500 rounded-full animate-pulse"
      />
      <UIcon
        v-if="showArrow"
        name="i-heroicons-chevron-right"
        class="w-5 h-5 text-gray-400"
      />
      <UIcon
        v-else-if="isExternal"
        name="i-heroicons-arrow-top-right-on-square"
        class="w-4 h-4 text-gray-400"
      />
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  to: String,
  href: String,
  icon: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  subtitle: String,
  iconColor: String,
  showArrow: Boolean,
  isExternal: Boolean,
  isButton: Boolean,
  hasNotification: Boolean
});

const emit = defineEmits(['click']);

const componentType = computed(() => {
  if (props.to) return resolveComponent('NuxtLink');
  if (props.href) return 'a';
  return 'button';
});

const componentProps = computed(() => {
  const baseProps = {};
  
  if (props.to) {
    baseProps.to = props.to;
  } else if (props.href) {
    baseProps.href = props.href;
    if (props.isExternal) {
      baseProps.target = '_blank';
      baseProps.rel = 'noopener noreferrer';
    }
  }
  
  return baseProps;
});

const handleClick = () => {
  if (props.isButton) {
    emit('click');
  }
};
</script>