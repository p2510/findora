<template>
  <div
    class="animate-pulse  rounded-3xl px-5 py-3 space-y-2 bg-slate-950/5"
  >
    <p class="flex justify-between items-center text-sm text-white">
      <span class="px-8 py-2 bg-slate-950/10 rounded-full"></span>

      <button
        class="flex items-center justify-center rounded-full p-2 text-slate-800 bg-white"
      >
        <UIcon name="i-heroicons-arrow-up-right" />
      </button>
    </p>
    <div class="flex pt-3">
      <span class="invisible text-5xl">0</span>
    </div>
    <div class="flex items-center text-white gap-2">
      <span class="text-md w-full px-8 py-2 bg-slate-950/10 rounded-full">
      </span>
    </div>
  </div>
</template>
