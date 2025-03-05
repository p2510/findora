<template>
  <div class="mt-14 pr-4">
    <div v-if="!whatsappStore.whatsapp_backlogs?.authorize" class="space-y-8">
      <div class="space-y-4">
        <h3 class="text-center text-4xl pt-3">
          Automatisez vos relances et campagnes <br />
          avec
          <span
            class="bg-clip-text text-transparent bg-gradient-to-r from-[#f3c775] to-[#5e4414]"
          >
            Whatsapp
          </span>
        </h3>
        <p class="text-sm text-center text-slate-700">
          Restez connecté à vos clients grâce au réseau de plus de 2 milliards
          d'utilisateurs.
        </p>
      </div>
      <div class="flex justify-center">
        <transition name="slide-up" mode="out-in">
          <WhatsappStart
            @IsUpdate="nextStep"
            v-if="step == 0 && whatsappStore.whatsapp_backlogs == null"
          />
          <WhatsappConnect
            v-else-if="
              whatsappStore.whatsapp_backlogs.status == 'active' &&
              !whatsappStore.whatsapp_backlogs.authorize
            "
          />
        </transition>
      </div>

      <div class="pt-4 flex justify-center">
        <WhatsappHero />
      </div>
    </div>
    <div v-else>
      <section>
        <div
          v-if="whatsappStore.whatsapp_backlogs.mode == 'trial' && isExpired"
        >
          <div class="flex justify-center">
            <div
              class="rounded-lg px-4 py-2 bg-[#f3c775]/20 flex justify-between items-center gap-12"
            >
              <p class="text-slate-800 text-xs">
                <span class="font-semibold"> Votre essai </span> est epuisé
              </p>
              <NuxtLink
                to="/abonnement"
                class="text-sm text-slate-700 hover:text-slate-800 bg-[#f3c775] hover:bg-[#f3c775]/50 rounded-md shadow-md text-md p-3 transition-all duration-300 ease-in-out"
              >
                Passer en ultra
              </NuxtLink>
            </div>
          </div>
        </div>
        <div
          class="grid grid-cols-12 px-10 lg:px-12 mb-4 gap-4"
          v-else-if="whatsappStore.whatsapp_backlogs.mode == 'trial'"
        >
          <div
            class="col-span-full md:col-span-5 lg:col-start-1 lg:col-end-6 xl:col-start-1 xl:col-end-5 2xl:col-start-1 2xl:col-end-5"
          >
            <div
              class="rounded-lg px-4 py-2 bg-[#25D366]/20 flex justify-between items-center"
            >
              <p class="text-slate-800 text-xs">
                <span class="font-semibold"> 5 Jours </span> / d'essai limité
              </p>
              <NuxtLink
                to="/abonnement"
                class="text-sm text-slate-700 hover:text-slate-800 bg-[#25D366] hover:bg-[#25D366]/50 rounded-md shadow-md text-md p-3 transition-all duration-300 ease-in-out"
              >
                Passer en ultra
              </NuxtLink>
            </div>
          </div>
          <div
            class="col-span-full md:col-span-7 lg:col-start-7 lg:col-end-13 xl:col-start-7 xl:col-end-13 2xl:col-start-8 2xl:col-end-13"
          >
            <div
              class="rounded-lg px-4 py-2 bg-slate-300/20 flex justify-around items-center"
            >
              <div class="flex gap-4">
                <button
                  class="text-sm text-white bg-orange-600 rounded-md shadow-md text-md p-3 transition-all duration-300 ease-in-out"
                >
                  Message
                </button>
                <p class="flex flex-col justify-between">
                  <span class="text-slate-800 text-sm">Volume max</span>
                  <span class="text-orange-600 text-xl font-semibold">150</span>
                </p>
              </div>
              <div class="flex gap-4">
                <button
                  class="text-sm text-white bg-orange-600 rounded-md shadow-md text-md p-3 transition-all duration-300 ease-in-out"
                >
                  Numéro
                </button>
                <p class="flex flex-col justify-between">
                  <span class="text-slate-800 text-sm">Volume max</span>
                  <span class="text-orange-600 text-xl font-semibold">5</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <WhatsappSend />
    </div>
  </div>
</template>

<script setup>
import { useUser } from "@/stores/user";
import { useWhatsapp } from "@/stores/whatsapp";
const whatsappStore = useWhatsapp();
const userStore = useUser();
definePageMeta({
  middleware: "auth",
  alias: "/whatsapp",
});
useHead({
  title: "Findora - Dashboard",
});
let step = ref(0);
let nextStep = (n) => {
  step.value = n;
};
const currentDate = new Date();
const expireDate = new Date(whatsappStore.whatsapp_backlogs.expire_date);

const isExpired = expireDate < currentDate;
</script>
<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease-out;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(-30px);
}
</style>
