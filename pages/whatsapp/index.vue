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
          L'intégration de WhatsApp est uniquement disponible pour les comptes
          Ultra.
        </p>
      </div>
      <div
        class="flex justify-center"
        v-if="userStore.subscription.subscription_type == 'ultra'"
      >
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
      <div class="flex justify-center" v-else>
        <NuxtLink
          to="/abonnement"
          class="flex items-center text-slate-700 hover:text-white bg-[#f3c775] hover:bg-[#99732c] rounded-md hover:shadow-md text-md p-3 transition-all duration-300 ease-in-out"
          >Passer ultra</NuxtLink
        >
      </div>
      <div class="pt-4 flex justify-center">
        <WhatsappHero />
      </div>
    </div>
    <div v-else>
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
