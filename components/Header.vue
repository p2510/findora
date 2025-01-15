<template>
  <header
    class="flex justify-between py-2 px-4 items-center w-full bg-gradient-to-r from-[#5e4414] to-slate-900 "
  >
    <div class="px-4 w-full flex items-center gap-3 divide-x-[1px] basis-1/2">
      <span class="flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="88"
          height="24"
          viewBox="0 0 88 24"
        >
          <g>
            <!-- Forme de base (rectangular shape with rounded corners) -->
            <rect
              x="0"
              y="0"
              width="88"
              height="24"
              rx="12"
              ry="12"
              fill="#f3c775"
            />

            <!-- Design interne : Ligne diagonale et cercle -->
            <circle cx="60" cy="12" r="6" fill="white" />
            <path d="M30 12 L58 12" stroke="white" stroke-width="2" />
          </g>
        </svg>
        <svg
          width="100"
          height="40"
          viewBox="0 0 100 40"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text
            x="10"
            y="30"
            font-family="Arial, sans-serif"
            font-size="30"
            fill="#f3c775"
          >
            findora
          </text>
        </svg>
      </span>
      <h3 class="font-medium text-xl text-slate-50 capitalize pl-3">
        {{ props.name }}
      </h3>
    </div>
    <div
      class="flex items-center gap-3 divide-x-[1px] divide-slate-400 basis-1/2 justify-end"
    >
      <input
        type="text"
        class="rounded-full px-8 py-2 bg-slate-600 text-slate-100 text-sm outline-none focus:scale-105 transition duration-300 ease-in-out"
        placeholder="Lancer une recherche"
      />
      <h4 class="flex gap-2 items-center tracking-tight pl-3">
        <img
          :src="
            'https://ui-avatars.com/api/?name=' +
            user.email +
            '&background=f3c775&color=ffffff'
          "
          alt=""
          class="w-8 h-8 rounded-full"
        />
        <p class="flex flex-col justify-center">
          <span class="text-sm text-slate-50">{{ user.email }}</span>
          <span class="text-sm text-slate-500 font-semibold">
            {{ formattedDate }}</span
          >
        </p>
      </h4>
    </div>
  </header>
</template>

<script setup>
import { ArrowUpRightIcon } from "@heroicons/vue/24/solid";
import { ref } from "vue";
const user = useSupabaseUser();

let props = defineProps(["name"]);
const options = {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
};

const formattedDate = ref(new Date().toLocaleDateString("fr-FR", options));
</script>
<style scoped>
@import url("~/assets/css/font.css");
</style>
