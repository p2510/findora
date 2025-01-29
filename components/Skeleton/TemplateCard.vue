<template>
  <div
    class="rounded-xl space-y-2 p-4 bg-[#eeeff0]/50 hover:shadow-md transition duration-500 ease-in-out"
  >
    <div class="flex justify-between items-center gap-2">
      <p class="flex gap-2 animate-pulse">
        <span
          class="items-center flex gap-2 bg-slate-800/20 text-xs py-2 px-3 rounded-md text-slate-800"
        >
          <UIcon name="i-heroicons-calendar-days" class="w-4 h-4" />
          <i
            class="not-italic px-10 text-transparent bg-slate-950/5 rounded-md py-2"
          ></i>
        </span>
      </p>

      <UIcon name="i-heroicons-ellipsis-vertical" class="w-6 h-6" />
    </div>
    <h4 class="px-10 text-transparent bg-slate-950/5 rounded-md py-2"></h4>
    <p class="px-10 text-transparent bg-slate-950/5 rounded-md py-2">Text</p>
  </div>
</template>
