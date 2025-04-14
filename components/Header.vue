<template>
  <header
    class="flex justify-between py-2 px-10 items-center w-full bg-transparent dark:bg-slate-950 border-b-[1.5px] border-slate-400"
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
              fill="#ffbd59"
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
            fill="#020617"
          >
            findora
          </text>
        </svg>
      </span>
    </div>
    <div
      class="flex justify-center gap-2 w-full text-slate-950 dark:text-slate-50"
      v-if="users.subscription.is_partner"
    >
      <p class="text-xs lg:text-sm text-white">
        <span> Vous êtes un partenaire Findora 🚀</span>
      </p>
    </div>

    <div class="flex justify-between gap-2 w-full" v-else>
      <p
        class="text-xs lg:block w-full lg:text-sm text-center text-slate-950 dark:text-slate-50"
        v-if="users.subscription.subscription_type === 'free'"
      >
        <span>
          Allez plus loin avec Findora en passant à l'Ultra.
          <NuxtLink
            to="/abonnement"
            class="hover:text-[#ffbd59] transition duration-500 ease-in-out"
          >
            Découvrez le plan Ultra
          </NuxtLink>
        </span>
      </p>

      <p
        class="text-xs lg:block w-full lg:text-sm text-center text-slate-950 dark:text-slate-50"
        v-else-if="
          (users.subscription.subscription_type === 'ultra' ||
            users.subscription.subscription_type === 'business') &&
          new Date(
            new Date(users.subscription.start_at).setMonth(
              new Date(users.subscription.start_at).getMonth() + 1
            )
          ).getTime() < new Date().getTime()
        "
      >
        <span>
          Votre abonnement a expiré.
          <NuxtLink
            to="/abonnement"
            class="hover:text-[#ffbd59] transition duration-500 ease-in-out"
          >
            Renouvelez le plan {{ users.subscription.subscription_type }}
          </NuxtLink>
        </span>
      </p>

      <p
        class="text-xs hidden lg:block w-full lg:text-sm text-center text-slate-950 dark:text-slate-50"
        v-else
      >
        <span>
          Votre abonnement {{ users.subscription.subscription_type }} est
          toujours actif.
        </span>
      </p>
    </div>

    <div
      class="hidden lg:flex items-center gap-3 divide-x-[1px] divide-slate-400 basis-1/2 justify-end"
    >
      <MazDropdown position="bottom right">
        <div
          class="flex gap-2 items-center bg-slate-700 py-2 px-3 rounded-xl transition-all duration-300 ease-in-out"
        >
          <p class="text-xs  text-white">Mon compte</p>
        </div>
        <template #dropdown>
          <div class="grid grid-cols-12 gap-3 pr-4">
            <MazBtn color="transparent" class="col-span-full">
              <NuxtLink to="/parametre" class="flex gap-2 items-center w-full">
                <div>
                  <p class="text-sm text-slate-950 dark:text-slate-50 text-left">Paramètre</p>
                  <p class="text-xs text-slate-950/80 dark:text-slate-50">
                    Modifier vos informations de compte
                  </p>
                </div>
              </NuxtLink>
            </MazBtn>
          </div>
        </template>
      </MazDropdown>

      <h4 class="hidden xl:flex gap-2 items-center tracking-tight pl-3">
        <img
          :src="
            'https://ui-avatars.com/api/?name=' +
            users.info.email +
            '&background=ffbd59&color=ffffff'
          "
          alt=""
          class="w-8 h-8 rounded-full"
        />
        <p class="flex flex-col justify-center">
          <span class="text-sm text-slate-950 dark:text-slate-100">{{ users.info.email }}</span>
        </p>
      </h4>
    </div>
  </header>
</template>

<script setup>
import { formatDate } from "@/utils/shared/format";
import { ArrowUpRightIcon } from "@heroicons/vue/24/solid";
import MazDropdown from "maz-ui/components/MazDropdown";
import { ref } from "vue";
import { useUser } from "@/stores/user";
const users = useUser();

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
