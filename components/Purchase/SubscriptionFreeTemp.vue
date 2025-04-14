<template>
  <div class="mt-14 space-y-4 pr-4">
    <h3 class="text-5xl text-center">
      <span> Débloquez l'expérience </span> <br />
      complète
      <span
        class="bg-clip-text text-transparent bg-gradient-to-r from-[#f3c775] to-[#5e4414]"
      >
        Findora
      </span>
    </h3>
    <p class="text-center text-sm text-slate-600 pb-6">
      En Côte d'Ivoire, moins de
      <span class="font-semibold"> 5 % des clients et prospects </span> lisent
      leurs e-mails. Les relances par wh permettent d'aller plus rapidement.
    </p>
    <section class="grid grid-cols-12 gap-2">
      <div class="col-span-full flex items-center justify-center gap-4">
        <p>
          <span class="text-gray-500 text-sm">
            😊 Payez à l’année et bénéficiez de 20 % de réduction ! Cliquez vous
            voir
          </span>
        </p>
        <UToggle
          v-model="byYear"
          size="2xl"
          on-icon="i-heroicons-check-20-solid"
          off-icon="i-heroicons-x-mark-20-solid"
          color="amber"
        />
      </div>
      <div
        class="col-span-full lg:col-span-3 bg-transparent border-[1px] border-slate-200 h-full 2xl:h-screen rounded-xl"
      >
        <p class="text-center py-4 text-lg text-slate-600">Free</p>
        <p class="flex justify-center items-baseline gap-x-2" v-if="!byYear">
          <span class="text-5xl font-semibold tracking-tight text-gray-900"
            >0F</span
          >
          <span class="text-base text-gray-500">/mois</span>
        </p>
        <p class="flex justify-center items-baseline gap-x-2" v-else>
          <span class="text-5xl font-semibold tracking-tight text-gray-900"
            >0F</span
          >
          <span class="text-base text-gray-500">/an</span>
        </p>

        <ul
          role="list"
          class="px-3 mt-8 space-y-3 text-sm/6 text-gray-600 sm:mt-10"
        >
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Gestion jusqu'à 10 contacts
          </li>
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Gestion jusqu'à 10 paiements
          </li>

          <li class="flex gap-x-3 text-slate-400">
            <svg
              class="h-6 w-5 flex-none text-slate-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
            Relances automatiques
          </li>

          <li class="flex gap-x-3 text-slate-400">
            <svg
              class="h-6 w-5 flex-none text-slate-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
            Automatisation whatsapp
          </li>
          <li class="flex gap-x-3 text-slate-400">
            <svg
              class="h-6 w-5 flex-none text-slate-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
            Modules complémentaires
          </li>
          <li class="flex gap-x-3 text-slate-400">
            <svg
              class="h-6 w-5 flex-none text-slate-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
            Personnalisation des templates
          </li>
          <li class="flex gap-x-3 text-slate-400">
            <svg
              class="h-6 w-5 flex-none text-slate-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
            Création et gestion de groupes
          </li>
        </ul>
      </div>
      <div
        class="col-span-full lg:col-span-3 bg-transparent border-[1px] border-orange-200 h-full 2xl:h-screen rounded-xl"
      >
        <p class="text-center py-4 text-lg text-slate-600">Premium</p>
        <p class="flex justify-center items-baseline gap-x-2" v-if="!byYear">
          <span class="text-5xl font-semibold tracking-tight text-gray-900"
            >6.500F</span
          >
          <span class="text-base text-gray-500">/mois</span>
        </p>
        <p class="flex justify-center items-baseline gap-x-2" v-else>
          <span class="text-5xl font-semibold tracking-tight text-gray-900"
            >58.000F</span
          >
          <span class="text-base text-gray-500">/an</span>
        </p>

        <ul
          role="list"
          class="px-3 mt-8 space-y-3 text-sm/6 text-gray-600 sm:mt-10"
        >
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Gestion de contacts illimités
          </li>
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Gestion de paiements illimités
          </li>
          <li class="flex gap-x-3 text-slate-400">
            <svg
              class="h-6 w-5 flex-none text-slate-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
            Relance automatique
          </li>

          <li class="flex gap-x-3 text-slate-400">
            <svg
              class="h-6 w-5 flex-none text-slate-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
            Automatisation whatsapp
          </li>
          <li class="flex gap-x-3 text-slate-400">
            <svg
              class="h-6 w-5 flex-none text-slate-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
            Modules complémentaires
          </li>
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Personnalisation des templates
          </li>
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Création et gestion de groupes
          </li>
        </ul>
        <div class="flex justify-center mt-6">
          <a
            href="https://wa.me/2250797966331"
            target="_blank"
            class="bg-[#f3c775] hover:bg-[#ddab4e] rounded-full shadow-md text-md py-3 px-6 transition-all duration-300 ease-in-out"
          >
            S'abonner
          </a>
        </div>
      </div>
      <div
        class="col-span-full lg:col-span-3 bg-transparent border-[1px] border-orange-200 h-full 2xl:h-screen rounded-xl"
      >
        <p class="text-center py-4 text-lg text-slate-600">Ultra</p>
        <p class="flex justify-center items-baseline gap-x-2" v-if="!byYear">
          <span class="text-5xl font-semibold tracking-tight text-gray-900"
            >19.900F</span
          >
          <span class="text-base text-gray-500">/mois</span>
        </p>
        <p class="flex justify-center items-baseline gap-x-2" v-else>
          <span class="text-5xl font-semibold tracking-tight text-gray-900"
            >191.000F</span
          >
          <span class="text-base text-gray-500">/an</span>
        </p>

        <ul
          role="list"
          class="px-3 mt-8 space-y-3 text-sm/6 text-gray-600 sm:mt-10"
        >
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Gestion de contacts illimités
          </li>
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Gestion de paiements illimités
          </li>
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Relance automatique
          </li>

          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Automatisation whatsapp
          </li>
          <li class="flex gap-x-3 text-slate-400">
            <svg
              class="h-6 w-5 flex-none text-slate-700"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
            Modules complémentaires
          </li>
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Personnalisation des templates
          </li>
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Création et gestion de groupes
          </li>
        </ul>
        <div class="flex justify-center mt-6">
          <a
            href="https://wa.me/2250797966331"
            target="_blank"
            class="bg-[#f3c775] hover:bg-[#ddab4e] rounded-full shadow-md text-md py-3 px-6 transition-all duration-300 ease-in-out"
          >
            S'abonner
          </a>
        </div>
      </div>
      <div
        class="col-span-full lg:col-span-3 bg-transparent border-[1px] border-orange-200 h-full 2xl:h-screen rounded-xl"
      >
        <p class="text-center py-4 text-lg text-slate-600">Entreprise</p>
        <p class="flex justify-center items-baseline gap-x-2" v-if="!byYear">
          <span class="text-5xl font-semibold tracking-tight text-gray-900"
            >49.900F</span
          >
          <span class="text-base text-gray-500">/mois</span>
        </p>
        <p class="flex justify-center items-baseline gap-x-2" v-else>
          <span class="text-5xl font-semibold tracking-tight text-gray-900"
            >470.000F</span
          >
          <span class="text-base text-gray-500">/an</span>
        </p>
        <ul
          role="list"
          class="px-3 mt-8 space-y-3 text-sm/6 text-gray-600 sm:mt-10"
        >
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Gestion de contacts illimités
          </li>
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Gestion de paiements illimités
          </li>
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Relance automatique
          </li>

          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Automatisation whatsapp
          </li>

          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Modules complémentaires
          </li>

          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Personnalisation des templates
          </li>
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#f3c775]"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
            >
              <path
                fill-rule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clip-rule="evenodd"
              />
            </svg>
            Création et gestion de groupes
          </li>
        </ul>
        <div class="flex justify-center mt-6">
          <a
            href="https://wa.me/2250797966331"
            target="_blank"
            class="bg-[#f3c775] hover:bg-[#ddab4e] rounded-full shadow-md text-md py-3 px-6 transition-all duration-300 ease-in-out"
          >
            S'abonner
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
<script setup>
import { useUser } from "@/stores/user";
const userStore = useUser();
let byYear = ref(false);
let suscribe = async (plan, type) => {
  const url = "https://app.myfindora.com/api/subscription/create";

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        email: userStore.info.email,
        plan: plan,
        type: type,
      }),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    if (json.fetchResponse) {
      console.log(json.fetchResponse);
      const paystack = new window.PaystackPop();
      paystack.resumeTransaction(json.fetchResponse.data.access_code);
    } else {
      alert(
        "Nous sommes actuellement en maintenance. Veuillez réessayer plus tard."
      );
    }
  } catch (error) {}
};
</script>
