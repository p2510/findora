<template>
  <div class="mt-8 space-y-4 pr-4 h-96 lg:h-full overflow-y-auto">
    <h3 class="text-5xl text-center">
      {{ $t("subscription.free.unlock_experience") }}
      <span class="text-[#ffbd59]">{{ $t("subscription.free.complete") }}</span>
      <br />
      Findora
    </h3>

    <section class="grid grid-cols-12 gap-2">
      <div
        class="col-span-full lg:col-span-4 2xl:col-start-3 2xl:col-end-6 bg-transparent border-[1px] border-slate-200 h-full 2xl:h-screen rounded-xl"
      >
        <p class="text-center py-4 text-lg text-slate-600 dark:text-white">
          {{ $t("subscription.free.free") }}
        </p>
        <p class="flex justify-center items-baseline gap-x-2">
          <span
            class="text-5xl font-semibold tracking-tight text-gray-900 dark:text-slate-100"
            >{{ $t("subscription.free.price") }}</span
          >
          <span class="text-base text-gray-500">{{
            $t("subscription.free.per_month")
          }}</span>
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
            {{ $t("subscription.free.unlimited_contact_management") }}
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
            500 {{ $t("subscription.free.whatsapp_marketing") }}
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
            {{ $t("subscription.free.ai_agent") }}
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
            {{ $t("subscription.free.manage_apis") }}
          </li>
        </ul>
      </div>

      <div
        class="col-span-full lg:col-span-4 2xl:col-start-6 2xl:col-end-9 bg-transparent border-[1px] border-orange-200 h-full 2xl:h-screen rounded-xl"
      >
        <p class="text-center py-4 text-lg text-slate-600 dark:text-white">
          {{ $t("subscription.free.ultra") }}
        </p>
        <p class="flex justify-center items-baseline gap-x-2">
          <span
            class="text-5xl font-semibold tracking-tight text-gray-900 dark:text-slate-100"
            >69.900F</span
          >
          <span class="text-base text-gray-500">{{
            $t("subscription.free.per_month")
          }}</span>
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
            {{ $t("subscription.free.unlimited_contact_management") }}
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
            2000 {{ $t("subscription.free.whatsapp_marketing") }}
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
            {{ $t("subscription.free.ai_agent") }} (150
            {{ $t("subscription.free.conversations") }})
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
            {{ $t("subscription.free.manage_apis") }}
          </li>
        </ul>
        <div class="flex justify-center mt-6">
          <a
            target="_blank"
            href="https://wa.me/2250160485654?text=Abonnement ultra"
            class="bg-[#ffbd59] hover:bg-[#ddab4e] rounded-full shadow-md text-md py-3 px-6 transition-all duration-300 ease-in-out"
          >
            {{ $t("subscription.free.subscribe") }}
          </a>
        </div>
      </div>
      <div
        class="col-span-full lg:col-span-4 2xl:col-start-9 2xl:col-end-12 bg-transparent border-[1px] border-orange-200 h-full 2xl:h-screen rounded-xl"
      >
        <p class="text-center py-4 text-lg text-slate-600 dark:text-white">
          {{ $t("subscription.free.enterprise") }}
        </p>
        <p class="flex justify-center items-baseline gap-x-2">
          <span
            class="text-5xl font-semibold tracking-tight text-gray-900 dark:text-slate-100"
            >{{ $t("subscription.free.custom_quote") }}</span
          >
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
            {{ $t("subscription.free.unlimited_contact_management") }}
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
            {{ $t("subscription.free.whatsapp_marketing") }}
            {{ $t("subscription.free.unlimited") }}
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
            {{ $t("subscription.free.ai_agent") }}
            {{ $t("subscription.free.unlimited") }}
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
            {{ $t("subscription.free.manage_apis") }}
          </li>
        </ul>
        <div class="flex justify-center mt-6">
          <a
            target="_blank"
            href="https://wa.me/2250160485654?text=Abonnement entreprise"
            class="bg-[#ffbd59] hover:bg-[#ddab4e] rounded-full shadow-md text-md py-3 px-6 transition-all duration-300 ease-in-out"
          >
            {{ $t("subscription.free.subscribe") }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
<script setup>
import { useI18n } from "vue-i18n";
import { useUser } from "@/stores/user";
const { t } = useI18n();
const userStore = useUser();
let byYear = ref(false);
let suscribe = async (plan, type) => {
  const url = `${useRuntimeConfig().public.url_base}/api/subscription/create`;

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
      alert(t("subscription.free.maintenance_message"));
    }
  } catch (error) {}
};
</script>
