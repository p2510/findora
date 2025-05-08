<template>
  <div class="mt-14 pr-4  h-[100vh]">
    <div v-if="!whatsappStore.whatsapp_backlogs?.authorize" class="space-y-8">
      <div class="space-y-4">
        <h3 class="text-center text-4xl pt-3 dark:text-white">
          Envoyez des milliers de messages
          <span class="text-[#25D366] font-semibold dark:text-[#25D366]">
            WhatsApp </span
          ><br />
          en
          <span class="px-3 py-2 dark:text-white"> une minute </span>
        </h3>
        <p class="text-sm text-center text-slate-700 dark:text-slate-300">
          Restez connecté à vos contacts grâce au réseau de plus de 2 milliards
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

      <div class="pt-4 flex justify-center"></div>
    </div>

    <div v-else>
      <section>
        <div
          v-if="whatsappStore.whatsapp_backlogs.mode == 'trial' && isExpired"
        >
          <div class="flex justify-center">
            <div
              class="rounded-lg px-4 py-2 bg-[#f3c775]/20 dark:bg-[#f3c775]/10 flex justify-between items-center gap-12"
            >
              <p class="text-slate-800 text-xs dark:text-white">
                <span class="font-semibold">Votre essai</span> est épuisé
              </p>
              <NuxtLink
                to="/abonnement"
                class="text-sm text-slate-700 hover:text-slate-800 bg-[#f3c775] hover:bg-[#f3c775]/50 rounded-md shadow-md text-md p-3 transition-all duration-300 ease-in-out dark:bg-[#f3c775] dark:hover:bg-[#f3c775]/50 dark:text-white"
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
            class="col-span-full md:col-span-6 lg:col-start-1 lg:col-end-6 xl:col-start-1 xl:col-end-5 2xl:col-start-1 2xl:col-end-5"
          >
            <div
              class="rounded-lg px-4 py-2 bg-[#25D366]/20 dark:bg-[#25D366]/10 flex justify-between items-center"
            >
              <p class="text-slate-800 text-xs dark:text-white">
                <span class="font-semibold">7 Jours</span>  d'essai gratuit
              </p>
              <NuxtLink
                to="/abonnement"
                class="text-sm text-slate-700 hover:text-slate-800 bg-[#25D366] hover:bg-[#25D366]/50 rounded-md shadow-md text-md p-3 transition-all duration-300 ease-in-out dark:bg-[#25D366] dark:hover:bg-[#25D366]/50 dark:text-white"
              >
                Passer en ultra
              </NuxtLink>
            </div>
          </div>

      
        </div>
      </section>

      <WhatsappSend class=" h-[80vh] overflow-y-scroll pb-4" />
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
  title: "Findora - Lancez et programmez vos campagnes en toute simplicité",
});
let step = ref(0);
let nextStep = (n) => {
  step.value = n;
};
const currentDate = new Date();
const expireDate = new Date(whatsappStore.whatsapp_backlogs?.expire_date);

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
