<template>
  <div class="space-y-5 pb-2">
    <h2
      class="text-xl xl:text-2xl font-semibold text-neutral-800 dark:text-white tracking-tight pl-8"
    >
      {{ $t("dashboard.greeting", { name: user?.info?.name }) }}
    </h2>
    <div
      v-if="whatsappStore.whatsapp_backlogs == null"
      class="bg-gradient-to-br from-[#f3c775]/5 to-[#f3c775]/20 dark:from-[#f3c775]/10 dark:to-[#f3c775]/30 rounded-xl py-4 px-5 flex gap-2 flex-col lg:flex-row lg:justify-between items-center transition duration-300 ease-in-out"
    >
      <div class="flex items-center gap-3">
        <span
          class="p-2 rounded-full bg-[#f3c775] dark:bg-[#f3c775]/80 flex items-center"
        >
          <UIcon
            name="i-heroicons-bell-alert"
            class="w-4 h-4 text-lg:w-5 text-lg:h-5 text-slate-950 dark:text-slate-900"
          />
        </span>
        <h4>
          <p class="text-sm lg:text-md text-slate-800 dark:text-slate-200">
            {{ $t("dashboard.connect_whatsapp_title") }}
          </p>
          <p class="text-xs lg:text-xs text-slate-600 dark:text-slate-50">
            {{ $t("dashboard.connect_whatsapp_desc") }}
          </p>
        </h4>
      </div>
      <a
        href="https://youtu.be/tFQJnCIQHxE"
        target="_blank"
        class="animate-bounce text-slate-800 dark:text-slate-900 px-4 py-2 rounded-3xl bg-[#f3c775] dark:bg-[#f3c775]/90 hover:bg-[#d6b77c] hover:shadow-sm transition duration-300 ease-in-out"
      >
        {{ $t("dashboard.watch_video") }}
      </a>
    </div>

    <div
      class="px-8 h-screen bg-neutral-100 dark:bg-slate-950/30"
      v-if="whatsappStore.whatsapp_backlogs == null"
    >
      <p class="font-[500] text-neutral-800 dark:text-white text-lg pt-6 pb-3">
        {{ $t("dashboard.start_now") }}
      </p>
      <ul class="col-span-full grid grid-cols-12 gap-4">
        <li
          class="sm:col-span-6 lg:col-span-4 2xl:col-span-3 bg-white text-slate-800 dark:bg-slate-800 dark:text-white rounded-md shadow-md hover:shadow-lg transition duration-300 ease-in-out"
        >
          <nuxt-link
            to="/whatsapp"
            class="flex gap-4 justify-start items-center p-3"
          >
            <p
              class="border-[#ffbd59] dark:bg-slate-950/30 border-[1.8px] px-2 py-2 rounded-md flex items-center"
            >
              <img
                src="~/assets/img/whatsapp.png"
                alt="logo de whatsapp"
                class="object-cover size-6"
              />
            </p>
            <p class="flex flex-col">
              <strong class="font-[500] text-sm text-slate-950 dark:text-white">
                {{ $t("dashboard.connect_whatsapp") }}
              </strong>
              <span
                class="text-xs text-slate-700 font-[300] dark:text-slate-100"
              >
                {{ $t("dashboard.connect_whatsapp_sub") }}
              </span>
            </p>
          </nuxt-link>
        </li>

        <li
          class="sm:col-span-6 lg:col-span-4 2xl:col-span-3 bg-white text-slate-800 dark:bg-slate-800 dark:text-white rounded-md shadow-md hover:shadow-lg transition duration-300 ease-in-out"
        >
          <nuxt-link
            to="/abonnement"
            class="flex gap-4 justify-start items-center p-3"
          >
            <p
              class="bg-[#ffbd59]/10 dark:bg-slate-950/30 border-[#ffbd59] border-[1.8px] px-2 py-2 rounded-md flex items-center"
            >
              <UIcon
                class="size-6 text-[#ffbd59] dark:text-slate-50"
                name="i-heroicons-lifebuoy"
              />
            </p>
            <p class="flex flex-col">
              <strong class="font-[500] text-sm text-slate-950 dark:text-white">
                {{ $t("dashboard.subscriptions") }}
              </strong>
              <span
                class="text-xs text-slate-700 font-[300] dark:text-slate-100"
              >
                {{ $t("dashboard.subscriptions_sub") }}
              </span>
            </p>
          </nuxt-link>
        </li>

        <li
          class="hidden lg:block lg:col-span-4 2xl:col-span-3 bg-white text-slate-800 dark:bg-slate-800 dark:text-white rounded-md shadow-md hover:shadow-lg transition duration-300 ease-in-out"
        >
          <a
            target="_blank"
            href="https://wa.me/2250797966331?text=Bonjour Findora"
            class="flex gap-4 justify-start items-center p-3"
          >
            <p
              class="bg-[#ffbd59]/10 dark:bg-slate-950/30 border-[#ffbd59] border-[1.8px] px-2 py-2 rounded-md flex items-center"
            >
              <UIcon
                class="size-6 text-[#ffbd59] dark:text-slate-50"
                name="i-heroicons-rectangle-group"
              />
            </p>
            <p class="flex flex-col">
              <strong class="font-[500] text-sm text-slate-950 dark:text-white">
                {{ $t("dashboard.try_ai_agent") }}
              </strong>
              <span
                class="text-xs text-slate-700 font-[300] dark:text-slate-100"
              >
                {{ $t("dashboard.try_ai_agent_sub") }}
              </span>
            </p>
          </a>
        </li>

        <li
          class="hidden 2xl:block 2xl:col-span-3 bg-white text-slate-800 dark:bg-slate-800 dark:text-white rounded-md shadow-md hover:shadow-lg transition duration-300 ease-in-out"
        >
          <nuxt-link
            to="/dashboard"
            class="flex gap-4 justify-start items-center p-3"
          >
            <p
              class="bg-[#ffbd59]/10 dark:bg-slate-950/30 border-[#ffbd59] border-[1.8px] px-2 py-2 rounded-md flex items-center"
            >
              <UIcon
                class="size-6 text-[#ffbd59] dark:text-slate-50"
                name="i-heroicons-users"
              />
            </p>
            <p class="flex flex-col">
              <strong class="font-[500] text-sm text-slate-950 dark:text-white">
                {{ $t("dashboard.add_first_contact") }}
              </strong>
              <span
                class="text-xs text-slate-700 font-[300] dark:text-slate-100"
              >
                {{ $t("dashboard.add_first_contact_sub") }}
              </span>
            </p>
          </nuxt-link>
        </li>
      </ul>
    </div>

    <div v-else class="px-8 h-screen bg-neutral-100 dark:bg-slate-950/30">
      <p class="font-[500] text-neutral-800 dark:text-white text-lg pt-6 pb-3">
        {{ $t("dashboard.start_now") }}
      </p>
      <ul class="col-span-full grid grid-cols-12 gap-4">
        <li
          class="sm:col-span-6 lg:col-span-4 2xl:col-span-3 bg-white text-slate-800 dark:bg-slate-800 dark:text-white rounded-md shadow-md hover:shadow-lg transition duration-300 ease-in-out"
        >
          <nuxt-link
            to="/agent"
            class="flex gap-4 justify-start items-center p-3"
          >
            <p
              class="bg-[#ffbd59]/20 border-[#ffbd59] dark:bg-slate-950/30 border-[1.8px] px-2 py-2 rounded-md flex items-center"
            >
              <UIcon
                class="w-6 h-6 text-[#ffbd59] dark:text-slate-50"
                name="i-heroicons-rectangle-group"
              />
            </p>
            <p class="flex flex-col">
              <strong
                class="font-[500] text-sm text-slate-950 dark:text-white"
                >{{ $t("dashboard.ai_agent") }}</strong
              >
              <span
                class="text-xs text-slate-700 font-[300] dark:text-slate-100"
              >
                {{ $t("dashboard.ai_agent_sub") }}</span
              >
            </p>
          </nuxt-link>
        </li>
        <li
          class="sm:col-span-6 lg:col-span-4 2xl:col-span-3 bg-white text-slate-800 dark:bg-slate-800 dark:text-white rounded-md shadow-md hover:shadow-lg transition duration-300 ease-in-out"
        >
          <nuxt-link
            to="/whatsapp"
            class="flex gap-4 justify-start items-center p-3"
          >
            <p
              class="bg-[#ffbd59]/20 border-[#ffbd59] dark:bg-slate-950/30 border-[1.8px] px-2 py-2 rounded-md flex items-center"
            >
              <UIcon
                class="w-6 h-6 text-[#ffbd59] dark:text-slate-50"
                name="i-heroicons-paper-airplane"
              />
            </p>
            <p class="flex flex-col">
              <strong class="font-[500] text-sm text-slate-950 dark:text-white">
                {{ $t("dashboard.launch_campaign") }}
              </strong>
              <span
                class="text-xs text-slate-700 font-[300] dark:text-slate-100"
              >
                {{ $t("dashboard.launch_campaign_sub") }}
              </span>
            </p>
          </nuxt-link>
        </li>

        <li
          class="hidden lg:block lg:col-span-4 2xl:col-span-3 bg-white text-slate-800 dark:bg-slate-800 dark:text-white rounded-md shadow-md hover:shadow-lg transition duration-300 ease-in-out"
        >
          <nuxt-link
            to="/api/jeton"
            class="flex gap-4 justify-start items-center p-3"
          >
            <p
              class="bg-[#ffbd59]/20 border-[#ffbd59] dark:bg-slate-950/30 border-[1.8px] px-2 py-2 rounded-md flex items-center"
            >
              <UIcon
                class="w-6 h-6 text-[#ffbd59] dark:text-slate-50"
                name="i-heroicons-key"
              />
            </p>
            <p class="flex flex-col">
              <strong class="font-[500] text-sm text-slate-950 dark:text-white">
                {{ $t("dashboard.manage_apis") }}
              </strong>
              <span
                class="text-xs text-slate-700 font-[300] dark:text-slate-100"
              >
                {{ $t("dashboard.connect_with_app") }}
              </span>
            </p>
          </nuxt-link>
        </li>

        <li
          class="hidden 2xl:block 2xl:col-span-3 bg-white text-slate-800 dark:bg-slate-800 dark:text-white rounded-md shadow-md hover:shadow-lg transition duration-300 ease-in-out"
        >
          <nuxt-link
            to="/contacts"
            class="flex gap-4 justify-start items-center p-3"
          >
            <p
              class="bg-[#ffbd59]/20 border-[#ffbd59] dark:bg-slate-950/30 border-[1.8px] px-2 py-2 rounded-md flex items-center"
            >
              <UIcon
                class="w-6 h-6 text-[#ffbd59] dark:text-slate-50"
                name="i-heroicons-users"
              />
            </p>
            <p class="flex flex-col">
              <strong class="font-[500] text-sm text-slate-950 dark:text-white">
                {{ $t("dashboard.contact_sync") }}
              </strong>
              <span
                class="text-xs text-slate-700 font-[300] dark:text-slate-100"
              >
                {{ $t("dashboard.import_contacts") }}
              </span>
            </p>
          </nuxt-link>
        </li>
      </ul>
      <div class="grid grid-cols-12 gap-4">
        <div class="col-span-full pt-2">
          <DashboardCalendar />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { useUser } from "@/stores/user";
import { useWhatsapp } from "@/stores/whatsapp";
const user = useUser();
const whatsappStore = useWhatsapp();
</script>
