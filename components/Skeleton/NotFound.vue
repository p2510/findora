<template>
  <div>
    <h3 class="text-center" :class="customCss">
      <span> {{ title }}</span> <br />

      <span
        class="bg-clip-text text-transparent bg-gradient-to-r from-[#f3c775] to-[#5e4414]"
      >
        {{ subtitle }}
      </span>
    </h3>
    <div class="flex justify-center pt-4">
      <NuxtLink
        :to="to"
        class="text-slate-700 hover:text-white bg-[#f3c775] hover:bg-[#99732c] rounded-md shadow-md text-sm py-3 px-5 transition-all duration-300 ease-in-out"
      >
        {{ labelBtn }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: "",
  },
  subtitle: {
    type: String,
    default: "",
  },
  to: {
    type: String,
    default: "",
  },
  labelBtn: {
    type: String,
    default: "",
  },
  customCss: {
    type: String,
    default: "",
  },
});
</script>
