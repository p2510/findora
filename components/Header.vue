<template>
  <header
    class="flex justify-between py-2 px-10 items-center w-full bg-gradient-to-r from-[#5e4414] to-slate-900"
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
    </div>
    <div
      class="flex justify-center gap-2 w-full"
      v-if="users.subscription.is_partner"
    >
      <p class="text-xs lg:text-sm text-white">
        <span> Vous êtes partenaire Findora 🚀</span>
      </p>
    </div>

    <div class="flex justify-between gap-2 w-full" v-else>
      <p
        class="text-xs lg:block w-full lg:text-sm text-center text-white"
        v-if="users.subscription.subscription_type === 'free'"
      >
        <span>
          Allez plus loin avec Findora en passant au ultra.
          <NuxtLink
            to="/abonnement"
            class="text-[#f3c775] hover:text-[#f0cd8e] transition duration-500 ease-in-out"
          >
            Découvrir l'offre ultra
          </NuxtLink>
        </span>
      </p>

      <p
        class="text-xs lg:block w-full lg:text-sm text-center text-white"
        v-else-if="
          (users.subscription.subscription_type === 'premium' ||
            users.subscription.subscription_type === 'ultra' ||
            users.subscription.subscription_type === 'entreprise') &&
          new Date(
            new Date(users.subscription.start_at).setMonth(
              new Date(users.subscription.start_at).getMonth() + 1
            )
          ).getTime() < new Date().getTime()
        "
      >
        <span>
          Votre abonnement est expiré.
          <NuxtLink
            to="/abonnement"
            class="text-[#f3c775] hover:text-[#f0cd8e] transition duration-500 ease-in-out"
          >
            Renouveler l'offre {{ users.subscription.subscription_type }}
          </NuxtLink>
        </span>
      </p>

      <p
        class="text-xs hidden lg:block w-full lg:text-sm text-center text-white"
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
          class="flex gap-2 items-center bg-slate-700 hover:bg-slate-600 py-2 px-3 rounded-xl transition-all duration-300 ease-in-out"
        >
          <p class="rounded-xl flex items-center">
            <UIcon
              name="i-heroicons-square-3-stack-3d"
              class="w-6 h-6 text-white"
            />
          </p>
          <p class="text-xs lg:text-sm text-white">Intégration</p>
        </div>
        <template #dropdown>
          <div class="grid grid-cols-12 gap-3 pr-4">
            <MazBtn color="transparent" class="col-span-full">
              <NuxtLink to="/whatsapp" class="flex gap-2 items-center w-full">
                <svg
                  class="w-10 h-10"
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="100"
                  height="100"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#fff"
                    d="M4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5c5.1,0,9.8,2,13.4,5.6	C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19c0,0,0,0,0,0h0c-3.2,0-6.3-0.8-9.1-2.3L4.9,43.3z"
                  ></path>
                  <path
                    fill="#fff"
                    d="M4.9,43.8c-0.1,0-0.3-0.1-0.4-0.1c-0.1-0.1-0.2-0.3-0.1-0.5L7,33.5c-1.6-2.9-2.5-6.2-2.5-9.6	C4.5,13.2,13.3,4.5,24,4.5c5.2,0,10.1,2,13.8,5.7c3.7,3.7,5.7,8.6,5.7,13.8c0,10.7-8.7,19.5-19.5,19.5c-3.2,0-6.3-0.8-9.1-2.3	L5,43.8C5,43.8,4.9,43.8,4.9,43.8z"
                  ></path>
                  <path
                    fill="#cfd8dc"
                    d="M24,5c5.1,0,9.8,2,13.4,5.6C41,14.2,43,18.9,43,24c0,10.5-8.5,19-19,19h0c-3.2,0-6.3-0.8-9.1-2.3	L4.9,43.3l2.7-9.8C5.9,30.6,5,27.3,5,24C5,13.5,13.5,5,24,5 M24,43L24,43L24,43 M24,43L24,43L24,43 M24,4L24,4C13,4,4,13,4,24	c0,3.4,0.8,6.7,2.5,9.6L3.9,43c-0.1,0.3,0,0.7,0.3,1c0.2,0.2,0.4,0.3,0.7,0.3c0.1,0,0.2,0,0.3,0l9.7-2.5c2.8,1.5,6,2.2,9.2,2.2	c11,0,20-9,20-20c0-5.3-2.1-10.4-5.8-14.1C34.4,6.1,29.4,4,24,4L24,4z"
                  ></path>
                  <path
                    fill="#40c351"
                    d="M35.2,12.8c-3-3-6.9-4.6-11.2-4.6C15.3,8.2,8.2,15.3,8.2,24c0,3,0.8,5.9,2.4,8.4L11,33l-1.6,5.8	l6-1.6l0.6,0.3c2.4,1.4,5.2,2.2,8,2.2h0c8.7,0,15.8-7.1,15.8-15.8C39.8,19.8,38.2,15.8,35.2,12.8z"
                  ></path>
                  <path
                    fill="#fff"
                    fill-rule="evenodd"
                    d="M19.3,16c-0.4-0.8-0.7-0.8-1.1-0.8c-0.3,0-0.6,0-0.9,0	s-0.8,0.1-1.3,0.6c-0.4,0.5-1.7,1.6-1.7,4s1.7,4.6,1.9,4.9s3.3,5.3,8.1,7.2c4,1.6,4.8,1.3,5.7,1.2c0.9-0.1,2.8-1.1,3.2-2.3	c0.4-1.1,0.4-2.1,0.3-2.3c-0.1-0.2-0.4-0.3-0.9-0.6s-2.8-1.4-3.2-1.5c-0.4-0.2-0.8-0.2-1.1,0.2c-0.3,0.5-1.2,1.5-1.5,1.9	c-0.3,0.3-0.6,0.4-1,0.1c-0.5-0.2-2-0.7-3.8-2.4c-1.4-1.3-2.4-2.8-2.6-3.3c-0.3-0.5,0-0.7,0.2-1c0.2-0.2,0.5-0.6,0.7-0.8	c0.2-0.3,0.3-0.5,0.5-0.8c0.2-0.3,0.1-0.6,0-0.8C20.6,19.3,19.7,17,19.3,16z"
                    clip-rule="evenodd"
                  ></path>
                </svg>

                <div>
                  <p class="text-sm text-slate-950 text-left">Whatsapp</p>
                  <p class="text-xs text-slate-950/80">
                    Automatisez vos relances et campagnes via WhatsApp
                  </p>
                </div>
              </NuxtLink>
            </MazBtn>

            <MazBtn color="transparent" class="col-span-full">
              <NuxtLink to="/dashboard" class="flex gap-2 items-center w-full">
                <img
                  src="/public/image/scenario.png"
                  alt=""
                  class="w-10 h-10"
                />
                <div>
                  <p class="text-sm text-slate-950 text-left">
                    Scénario
                    <span
                      class="text-xs bg-[#f3c775] px-2 py-[1px] rounded-full text-slate-950"
                      >Pour entreprise</span
                    >
                  </p>
                  <p class="text-xs text-slate-950/80">
                    Créez vos scénarios de relance et laissez faire le reste !
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
            '&background=f3c775&color=ffffff'
          "
          alt=""
          class="w-8 h-8 rounded-full"
        />
        <p class="flex flex-col justify-center">
          <span class="text-sm text-slate-50">{{ users.info.email }}</span>
          <span class="text-xs text-slate-300"> {{ formattedDate }}</span>
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
