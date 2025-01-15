<template>
    <button
      :type="type"
      :disabled="disabled || isLoading"
      :class="computedClass + ' ' + customClass"
      @click="handleClick"
    >
      <span v-if="!isLoading">
        <slot>Connexion</slot>
      </span>
      <span v-else class="opacity-80 flex items-center gap-2">
        <svg
          class="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.963 7.963 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        Chargement...
      </span>
    </button>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  // Props
  defineProps({
    type: {
      type: String,
      default: 'button',
    },
    isLoading: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    customClass: {
      type: String,
      default: '',
    },
  });
  
  // Emit custom events
  defineEmits(['click']);
  
  // Computed class for styling
  const computedClass = computed(() =>
    `  bg-[#f3c775] hover:bg-[#9e7c3c] rounded-md shadow-md text-md p-3 transition-all duration-300 ease-in-out `
  );
  
  // Handle button click
  const handleClick = (event) => {
    if (!disabled && !isLoading) {
      emit('click', event);
    }
  };
  </script>
  

  