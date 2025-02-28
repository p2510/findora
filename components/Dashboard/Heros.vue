<template>
  <div class="space-y-5 pb-2">
    <h2 class="text-4xl text-slate-950/80 tracking-tight">
      Heureux de vous revoir ,
      <span class="font-semibold underline underline-offset-8 text-[#dfb058]">{{
        user?.info?.name
      }}</span>
      !
    </h2>
    <p class="text-md w-3/4 text-slate-700">
      En Côte d'Ivoire, moins de
      <span class="font-semibold"> 5 % des clients et prospects </span> lisent
      leurs e-mails. Les relances par whatsapp permettent d'aller plus rapidement.
    </p>
  </div>
</template>
<script setup>
import { useUser } from "@/stores/user";
const user = useUser();
</script>
