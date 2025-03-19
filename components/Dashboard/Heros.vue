<template>
  <div class="space-y-5 pb-2">
    <div v-if="whatsappStore.whatsapp_backlogs==null"
      class=" bg-gradient-to-br from-[#f3c775]/5 to-[#f3c775]/20 rounded-xl py-4 px-5 flex gap-2 flex-col lg:flex-row   lg:justify-between items-center transition duration-300 ease-in-out "
    >
      <div class="flex items-center gap-3">
        <span class="p-2 rounded-full bg-[#f3c775] flex items-center">
          <UIcon name="i-heroicons-bell-alert" class="w-4 h-4 text-lg:w-5 text-lg:h-5 text-slate-950" />
        </span>
        <h4>
          <p class="text-sm lg:text-md text-slate-800">Connectez mon whatsapp</p>
          <p class="text-xs lg:text-sm text-slate-600">
            Avant d'aller plus loin dans l'utilisation, nous vous invitons à   connecter votre WhatsApp.
          </p>
        </h4>
      </div>
      <a href="https://youtu.be/tFQJnCIQHxE" target='_blank' class="animate-bounce text-slate-800 px-4 py-2 rounded-3xl  bg-[#f3c775] hover:bg-[#d6b77c]  hover:shadow-sm transition duration-300 ease-in-out">
        Connectez mon whatsapp</a>
    </div>
    <h2 class="text-4xl text-slate-950/80 tracking-tight ">
      Heureux de vous revoir ,
      <span class="font-semibold underline underline-offset-8 text-[#dfb058]">{{
        user?.info?.name
      }}</span>
      !
    </h2>
    <p class="text-md w-3/4 text-slate-700">
      En Côte d'Ivoire, moins de
      <span class="font-semibold"> 5 % des clients et prospects </span> lisent
      leurs e-mails. Les relances par whatsapp permettent d'aller plus
      rapidement.
    </p>
  </div>
</template>
<script setup>
import { useUser } from "@/stores/user";
import { useWhatsapp } from "@/stores/whatsapp";
const user = useUser();
const whatsappStore = useWhatsapp();
</script>
