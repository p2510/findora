<template>
    <input
      :type="type"
      :placeholder="placeholder"
      :class="computedClass + ' ' + customClass"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </template>
  
  <script setup>
  import { computed } from "vue";
  
  // Props pour personnaliser l'input
  defineProps({
    type: {
      type: String,
      default: "text",
    },
    placeholder: {
      type: String,
      default: "",
    },
    modelValue: {
      type: String,
      default: "",
    },
    autofocus: {
      type: Boolean,
      default: false,
    },
  
    customClass: {
      type: String,
      default: "",
    },
  });
  
  // Classe CSS par défaut avec une possibilité d'ajouter des classes personnalisées
  const computedClass = computed(
    () =>
      ` bg-white outline-none border-[1.5px] border-solid rounded-md transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-[#ffbd59] `
  );
  </script>
  