<template>
  <ul
    class="border-[1px] border-slate-400 rounded-lg flex-col divide-y-[1px] divide-slate-400 bg-slate-100"
  >
    <ol class="flex justify-between p-4 items-center">
      <div class="flex items-center gap-2 basis-1/2">
        <img
          :src="
            'https://ui-avatars.com/api/?name=' +
            'julien' +
            '&background=7c3aed&color=ffffff'
          "
          alt=""
          class="w-12 h-12 rounded-full"
        />
        <p class="flex flex-col gap-[1px]">
          <span class="text-slate-800 text-md">Erik Duglas</span>
          <span class="text-slate-500 text-xs">Poupoinaka@gmail.com</span>
        </p>
      </div>
      <div class="flex justify-end gap-2 items-center basis-1/2">
        <div class="w-full">
          <USelectMenu
            v-model="selected"
            :options="users"
            value-attribute="id"
            option-attribute="name"
            color="violet"
            :ui="{ wrapper: 'bg-white' }"
          />
        </div>
        <UIcon
          name="i-heroicons-archive-box-x-mark"
          class="h-7 w-7 hover:text-red-700 cursor-pointer transition ease-in-out duration-300"
        />
      </div>
    </ol>
  </ul>
</template>

<script setup>
import { ref } from "vue";

const users = [
  {
    id: 1,
    name: "Administrateur",
  },
  {
    id: 2,
    name: "Éditeur",
  },
];
const selected = ref(users[0].id);


</script>
