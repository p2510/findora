<template>
  <div class="mt-8 space-y-4 pr-4 h-96 lg:h-full overflow-y-auto">
    <h3 class="text-5xl text-center">
      Débloquez <span class="text-[#ffbd59]"> l'expérience </span> <br />
      complète Findora
    </h3>

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
        class="col-span-full lg:col-span-4 2xl:col-start-3 2xl:col-end-6 bg-transparent border-[1px] border-slate-200 h-full 2xl:h-screen rounded-xl"
      >
        <p class="text-center py-4 text-lg text-slate-600 dark:text-white">Free</p>
        <p class="flex justify-center items-baseline gap-x-2" v-if="!byYear">
          <span class="text-5xl font-semibold tracking-tight text-gray-900 dark:text-slate-100"
            >0F</span
          >
          <span class="text-base text-gray-500">/mois</span>
        </p>
        <p class="flex justify-center items-baseline gap-x-2" v-else>
          <span class="text-5xl font-semibold tracking-tight text-gray-900 dark:text-slate-100"
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
              class="h-6 w-5 flex-none text-[#ffbd59]"
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
              class="h-6 w-5 flex-none text-[#ffbd59]"
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
            Whatsapp Marketing 7 Jours
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
            Agent IA Whatsapp
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
            Manage APIs
          </li>
        </ul>
      </div>

      <div
        class="col-span-full lg:col-span-4 2xl:col-start-6 2xl:col-end-9 bg-transparent border-[1px] border-orange-200 h-full 2xl:h-screen rounded-xl"
      >
        <p class="text-center py-4 text-lg text-slate-600 dark:text-white">Ultra</p>
        <p class="flex justify-center items-baseline gap-x-2" v-if="!byYear">
          <span class="text-5xl font-semibold tracking-tight text-gray-900 dark:text-slate-100"
            >19.900F</span
          >
          <span class="text-base text-gray-500">/mois</span>
        </p>
        <p class="flex justify-center items-baseline gap-x-2" v-else>
          <span class="text-5xl font-semibold tracking-tight text-gray-900 dark:text-slate-100"
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
              class="h-6 w-5 flex-none text-[#ffbd59]"
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
              class="h-6 w-5 flex-none text-[#ffbd59]"
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
            Whatsapp Marketing illimités
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
            Agent IA Whatsapp
          </li>

          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#ffbd59]"
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
            Manage APIs
          </li>
        </ul>
        <div class="flex justify-center mt-6">
          <button
            v-if="!byYear"
            @click="suscribe('ultra', 'month')"
            class="bg-[#ffbd59] hover:bg-[#ddab4e] rounded-full shadow-md text-md py-3 px-6 transition-all duration-300 ease-in-out"
          >
            S'abonner
          </button>
          <button
            v-else
            @click="suscribe('ultra', 'year')"
            class="bg-[#ffbd59] hover:bg-[#ddab4e] rounded-full shadow-md text-md py-3 px-6 transition-all duration-300 ease-in-out"
          >
            S'abonner
          </button>
        </div>
      </div>
      <div
        class="col-span-full lg:col-span-4 2xl:col-start-9 2xl:col-end-12 bg-transparent border-[1px] border-orange-200 h-full 2xl:h-screen rounded-xl"
      >
        <p class="text-center py-4 text-lg text-slate-600 dark:text-white">Entreprise</p>
        <p class="flex justify-center items-baseline gap-x-2" v-if="!byYear">
          <span class="text-5xl font-semibold tracking-tight text-gray-900 dark:text-slate-100"
            >49.900F</span
          >
          <span class="text-base text-gray-500">/mois</span>
        </p>
        <p class="flex justify-center items-baseline gap-x-2" v-else>
          <span class="text-5xl font-semibold tracking-tight text-gray-900 dark:text-slate-100"
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
              class="h-6 w-5 flex-none text-[#ffbd59]"
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
              class="h-6 w-5 flex-none text-[#ffbd59]"
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
            Whatsapp Marketing illimités
          </li>
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#ffbd59]"
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
            Agent IA Whatsapp
          </li>
          <li class="flex gap-x-3">
            <svg
              class="h-6 w-5 flex-none text-[#ffbd59]"
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
            Manage APIs
          </li>
        </ul>
        <div class="flex justify-center mt-6">
          <button
            v-if="!byYear"
            @click="suscribe('entreprise', 'month')"
            class="bg-[#ffbd59] hover:bg-[#ddab4e] rounded-full shadow-md text-md py-3 px-6 transition-all duration-300 ease-in-out"
          >
            S'abonner
          </button>
          <button
            v-else
            @click="suscribe('entreprise', 'year')"
            class="bg-[#ffbd59] hover:bg-[#ddab4e] rounded-full shadow-md text-md py-3 px-6 transition-all duration-300 ease-in-out"
          >
            S'abonner
          </button>
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
      console.log(json);

      alert(
        "Nous sommes actuellement en maintenance. Veuillez réessayer plus tard."
      );
    }
  } catch (error) {}
};
</script>
