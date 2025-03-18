<template>
  <nav class="py-2">
    <div class="hidden xl:flex flex-col gap-y-24 space-y-2 pt-10">
      <ul class="flex flex-col gap-2">
        <NavLink to="/dashboard" label="Dashboard">
          <template #icon>
            <Squares2X2Icon class="size-5" />
          </template>
        </NavLink>
        <NavLink to="/client" label="Mes clients">
          <template #icon>
            <UsersIcon class="size-5" />
          </template>
        </NavLink>
        <NavLink to="/paiement" label="Paiement">
          <template #icon>
            <CreditCardIcon class="size-5" />
          </template>
        </NavLink>
        <NavLink to="/relance" label="Relance">
          <template #icon>
            <BoltIcon class="size-5" />
          </template>
        </NavLink>

        <NavLink to="/templates" label="Templates">
          <template #icon>
            <InboxArrowDownIcon class="size-5" />
          </template>
        </NavLink>
        <NavLink to="/abonnement" label="Abonnement">
          <template #icon>
            <LifebuoyIcon class="size-5" />
          </template>
        </NavLink>
      </ul>
      <ul class="flex flex-col gap-2">
        <NavLink to="/parametre" label="Paramètre">
          <template #icon>
            <Cog6ToothIcon class="size-5" />
          </template>
        </NavLink>
        <li
          @click="logout"
          class="cursor-pointer flex items-center gap-2 rounded-full transition-all duration-200 ease-in-out py-2 pl-4 pr-10 text-slate-600/70 hover:bg-[#f3c775] hover:text-slate-800"
        >
          <PowerIcon class="size-5" />
          <span>Déconnexion</span>
        </li>

      </ul>
    </div>
    <div
      class="flex xl:hidden flex-row py-4 px-6 bg-slate-800/5 rounded-full items-center"
    >
      <ul class="flex flex-row gap-2">
        <NavIcon to="/dashboard">
          <template #icon>
            <Squares2X2Icon class="size-8 flex justify-center" />
          </template>
        </NavIcon>
        <NavIcon to="/client">
          <template #icon>
            <UsersIcon class="size-8 flex justify-center" />
          </template>
        </NavIcon>
        <NavIcon to="/paiement">
          <template #icon>
            <CreditCardIcon class="size-8 flex justify-center" />
          </template>
        </NavIcon>
        <NavIcon to="/relance">
          <template #icon>
            <BoltIcon class="size-8 flex justify-center" />
          </template>
        </NavIcon>

        <NavIcon to="/templates">
          <template #icon>
            <InboxArrowDownIcon class="size-8 flex justify-center" />
          </template>
        </NavIcon>

        <NavIcon to="/abonnement">
          <template #icon>
            <LifebuoyIcon class="size-8 flex justify-center" />
          </template>
        </NavIcon>
      </ul>
      <ul class="flex flex-row">
        <NavIcon to="/parametre">
          <template #icon>
            <Cog6ToothIcon class="size-8 flex justify-center" />
          </template>
        </NavIcon>
        <li
          @click="logout"
          class="cursor-pointer flex items-center gap-2 rounded-full transition-all duration-200 ease-in-out px-3 text-slate-600/70 hover:bg-[#f3c775] hover:text-slate-800"
        >
          <PowerIcon class="size-8 flex justify-center" />
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
  PowerIcon,
  InboxArrowDownIcon,
  UsersIcon,
  BoltIcon,
  LifebuoyIcon,
  CreditCardIcon,
  PresentationChartLineIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  MegaphoneIcon,
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
