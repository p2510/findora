<template>
  <nav class="py-2">
    <div class="hidden xl:flex flex-col gap-y-24 space-y-2 pt-10">
      <ul class="flex flex-col gap-2">
        <NavLink to="/dashboard" :label="$t('nav.dashboard')">
          <template #icon>
            <Squares2X2Icon class="size-5" />
          </template>
        </NavLink>
        <NavLink to="/contacts" :label="$t('nav.contacts')">
          <template #icon>
            <UsersIcon class="size-5" />
          </template>
        </NavLink>
        <NavLink to="/agent" :label="$t('nav.agent')">
          <template #icon>
            <RectangleGroupIcon class="size-5" />
          </template>
        </NavLink>
        <NavLink to="/whatsapp" :label="$t('nav.whatsapp')">
          <template #icon>
            <PaperAirplaneIcon class="size-5" />
          </template>
        </NavLink>
        <NavLink to="/api/jeton" :label="$t('nav.api')">
          <template #icon>
            <KeyIcon class="size-5" />
          </template>
        </NavLink>
      </ul>
      <ul class="flex flex-col gap-2">
        <NavLink to="/abonnement" :label="$t('nav.subscription')">
          <template #icon>
            <LifebuoyIcon class="size-5" />
          </template>
        </NavLink>
        <li
          @click="logout"
          class="text-sm cursor-pointer flex items-center gap-2 rounded-full transition-all duration-300 pr-10 pl-4 hover:text-slate-600 ease-in-out"
        >
          <PowerIcon class="size-5" />
          <span>{{ $t('nav.logout') }}</span>
        </li>
      </ul>
    </div>
    <div 
      class="flex xl:hidden flex-row py-4 px-6 bg-slate-800/5 dark:bg-slate-950/20 rounded-full items-center"
    >
      <ul class="flex flex-row gap-2">
        <NavIcon to="/dashboard">
          <template #icon>
            <Squares2X2Icon class="size-6 flex justify-center" />
          </template>
        </NavIcon>
        <NavIcon to="/contacts">
          <template #icon>
            <UsersIcon class="size-6 flex justify-center" />
          </template>
        </NavIcon>
        <NavIcon to="/agent">
          <template #icon>
            <RectangleGroupIcon class="size-6 flex justify-center" />
          </template>
        </NavIcon>
        <NavIcon to="/whatsapp">
          <template #icon>
            <PaperAirplaneIcon class="size-6 flex justify-center" />
          </template>
        </NavIcon>
        <NavIcon to="/api/jeton">
          <template #icon>
            <KeyIcon class="size-6 flex justify-center" />
          </template>
        </NavIcon>
        <NavIcon to="/abonnement">
          <template #icon>
            <LifebuoyIcon class="size-6 flex justify-center" />
          </template>
        </NavIcon>
      </ul>
      <ul class="flex flex-row">
        <NavIcon to="/parametre">
          <template #icon>
            <Cog6ToothIcon class="size-6 flex justify-center" />
          </template>
        </NavIcon>
        <li
          @click="logout"
          class="cursor-pointer flex items-center gap-2 rounded-full transition-all duration-200 ease-in-out px-3 text-slate-600/70 hover:bg-[#f3c775] hover:text-slate-800 dark:text-slate-50"
        >
          <PowerIcon class="size-6 flex justify-center" />
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { reset } from "@/utils/shared/resetStore";
import {
  Squares2X2Icon,
  UsersIcon,
  RectangleGroupIcon,
  LifebuoyIcon,
  PaperAirplaneIcon,
  Cog6ToothIcon,
  KeyIcon,
  PowerIcon,
} from "@heroicons/vue/24/outline";
import { useUser } from "@/stores/user";
const users = useUser();
const supabase = useSupabaseClient();

let logout = async () => {
  let { error } = await supabase.auth.signOut();
  if (!error) {
    reset();
    return navigateTo("/");
  }
};
</script>
