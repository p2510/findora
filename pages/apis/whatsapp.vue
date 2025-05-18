<template>
  <section class="mt-14 h-screen overflow-y-auto pb-48">
    <ApiNav class="" />
    <section class="space-y-4 grid grid-cols-12 items-bottom gap-4 pt-8">
      <div class="col-span-full 2xl:col-span-8 space-y-4 overflow-y-auto">
        <MazAccordion class="w-full" @click="showExemple = 1">
          <template #title-1>
            <div class="flex items-center gap-3">
              <span class="bg-emerald-600 text-white px-4 py-[3px] rounded-md">POST</span>
              <h5>
                <p class="text-sm lg:text-md text-slate-700 dark:text-slate-100">
                  {{ $t('api.whatsapp.send_message') }}
                </p>
                <p class="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
                  {{ $t('api.whatsapp.send_message_description') }}
                </p>
              </h5>
            </div>
          </template>
          <template #content-1>
            <div class="space-y-3">
              <ul>
                <li>
                  <p class="text-slate-700 dark:text-slate-200 text-md font-medium">{{ $t('api.whatsapp.url') }}</p>
                  <p class="text-slate-600 dark:text-slate-200 text-sm">
                    https://api.myfindora.com/api/message/send
                  </p>
                </li>
              </ul>
              <ul>
                <li>
                  <p class="text-slate-700 dark:text-slate-200 text-md font-medium">{{ $t('api.whatsapp.body') }}</p>
                </li>
                <ol class="flex gap-3">
                  <li class="text-slate-600 dark:text-slate-200 text-xs">{{ $t('api.whatsapp.phone') }}</li>
                  <li class="text-slate-600 dark:text-slate-200 text-xs">{{ $t('api.whatsapp.message') }}</li>
                </ol>
              </ul>
              <ul>
                <li>
                  <p class="text-slate-700 dark:text-slate-200 text-md font-medium">{{ $t('api.whatsapp.response') }}</p>
                </li>
                <ol class="flex gap-3">
                  <li class="text-slate-600 dark:text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-emerald-700"></i> 200 : {{ $t('api.whatsapp.success') }}
                  </li>
                  <li class="text-slate-600 dark:text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 400 : {{ $t('api.whatsapp.bad_body') }}
                  </li>
                  <li class="text-slate-600 dark:text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 401 : {{ $t('api.whatsapp.authentication') }}
                  </li>
                  <li class="text-slate-600 dark:text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 500 : {{ $t('api.whatsapp.server_error') }}
                  </li>
                </ol>
              </ul>
            </div>
          </template>
        </MazAccordion>

        <!-- SECOND MazAccordion -->
        <MazAccordion class="w-full" @click="showExemple = 2">
          <template #title-1>
            <div class="flex items-center gap-3">
              <span class="bg-emerald-600 text-white px-4 py-[3px] rounded-md">POST</span>
              <h5>
                <p class="text-sm lg:text-md text-slate-700 dark:text-slate-100">
                  {{ $t('api.whatsapp.schedule_message') }}
                </p>
                <p class="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
                  {{ $t('api.whatsapp.schedule_message_description') }}
                </p>
              </h5>
            </div>
          </template>
          <template #content-1>
            <div class="space-y-3">
              <ul>
                <li>
                  <p class="text-slate-700 dark:text-slate-200 text-md font-medium">{{ $t('api.whatsapp.url') }}</p>
                  <p class="text-slate-600 dark:text-slate-200 text-sm">
                    https://api.myfindora.com/api/message/send-schedule
                  </p>
                </li>
              </ul>
              <ul>
                <li>
                  <p class="text-slate-700 dark:text-slate-200 text-md font-medium">{{ $t('api.whatsapp.body') }}</p>
                </li>
                <ol class="flex gap-3">
                  <li class="text-slate-600 dark:text-slate-200 text-xs">{{ $t('api.whatsapp.phone') }}</li>
                  <li class="text-slate-600 dark:text-slate-200 text-xs">{{ $t('api.whatsapp.message') }}</li>
                  <li class="text-slate-600 dark:text-slate-200 text-xs">{{ $t('api.whatsapp.send_at') }}</li>
                </ol>
              </ul>
              <ul>
                <li>
                  <p class="text-slate-700 dark:text-slate-200 text-md font-medium">{{ $t('api.whatsapp.response') }}</p>
                </li>
                <ol class="flex gap-3">
                  <li class="text-slate-600 dark:text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-emerald-700"></i> 200 : {{ $t('api.whatsapp.success') }}
                  </li>
                  <li class="text-slate-600 dark:text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 400 : {{ $t('api.whatsapp.bad_body') }}
                  </li>
                  <li class="text-slate-600 dark:text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 401 : {{ $t('api.whatsapp.authentication') }}
                  </li>
                  <li class="text-slate-600 dark:text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 500 : {{ $t('api.whatsapp.server_error') }}
                  </li>
                </ol>
              </ul>
            </div>
          </template>
        </MazAccordion>

        <!-- THIRD MazAccordion -->
        <MazAccordion class="w-full" @click="showExemple = 3">
          <template #title-1>
            <div class="flex items-center gap-3">
              <span class="bg-emerald-600 text-white px-4 py-[3px] rounded-md">GET</span>
              <h5>
                <p class="text-sm lg:text-md text-slate-700 dark:text-slate-100">
                  {{ $t('api.whatsapp.get_scheduled_messages') }}
                </p>
                <p class="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
                  {{ $t('api.whatsapp.get_scheduled_messages_description') }}
                </p>
              </h5>
            </div>
          </template>
          <template #content-1>
            <div class="space-y-3">
              <ul>
                <li>
                  <p class="text-slate-700 dark:text-slate-200 text-md font-medium">{{ $t('api.whatsapp.url') }}</p>
                  <p class="text-slate-600 dark:text-slate-200 text-sm">
                    https://api.myfindora.com/api/message/get-schedule
                  </p>
                </li>
              </ul>
              <ul>
                <li>
                  <p class="text-slate-700 dark:text-slate-200 text-md font-medium">{{ $t('api.whatsapp.body') }}</p>
                </li>
                <ol class="flex gap-3">
                  <li class="text-slate-600 dark:text-slate-200 text-xs">{{ $t('api.whatsapp.none') }}</li>
                </ol>
              </ul>
              <ul>
                <li>
                  <p class="text-slate-700 dark:text-slate-200 text-md font-medium">{{ $t('api.whatsapp.response') }}</p>
                </li>
                <ol class="flex gap-3">
                  <li class="text-slate-600 dark:text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-emerald-700"></i> 200 : {{ $t('api.whatsapp.success') }}
                  </li>
                  <li class="text-slate-600 dark:text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 400 : {{ $t('api.whatsapp.bad_body') }}
                  </li>
                  <li class="text-slate-600 dark:text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 401 : {{ $t('api.whatsapp.authentication') }}
                  </li>
                  <li class="text-slate-600 dark:text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 500 : {{ $t('api.whatsapp.server_error') }}
                  </li>
                </ol>
              </ul>
            </div>
          </template>
        </MazAccordion>

        <!-- FOURTH MazAccordion -->
        <MazAccordion class="w-full" @click="showExemple = 4">
          <template #title-1>
            <div class="flex items-center gap-3">
              <span class="bg-red-600 text-white px-4 py-[3px] rounded-md">DELETE</span>
              <h5>
                <p class="text-sm lg:text-md text-slate-700 dark:text-slate-100">
                  {{ $t('api.whatsapp.delete_scheduled_message') }}
                </p>
                <p class="text-xs lg:text-sm text-slate-500 dark:text-slate-400">
                  {{ $t('api.whatsapp.delete_scheduled_message_description') }}
                </p>
              </h5>
            </div>
          </template>
          <template #content-1>
            <div class="space-y-3">
              <ul>
                <li>
                  <p class="text-slate-700 dark:text-slate-200 text-md font-medium">{{ $t('api.whatsapp.url') }}</p>
                  <p class="text-slate-600 dark:text-slate-200 text-sm">
                    https://api.myfindora.com/api/message/delete-schedule
                  </p>
                </li>
              </ul>
              <ul>
                <li>
                  <p class="text-slate-700 dark:text-slate-200 text-md font-medium">{{ $t('api.whatsapp.body') }}</p>
                </li>
                <ol class="flex gap-3">
                  <li class="text-slate-600 dark:text-slate-200 text-xs">{{ $t('api.whatsapp.id') }}</li>
                </ol>
              </ul>
              <ul>
                <li>
                  <p class="text-slate-700 dark:text-slate-200 text-md font-medium">{{ $t('api.whatsapp.response') }}</p>
                </li>
                <ol class="flex gap-3">
                  <li class="text-slate-600 dark:text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-emerald-700"></i> 200 : {{ $t('api.whatsapp.success') }}
                  </li>
                  <li class="text-slate-600 dark:text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 400 : {{ $t('api.whatsapp.bad_body') }}
                  </li>
                  <li class="text-slate-600 dark:text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 401 : {{ $t('api.whatsapp.authentication') }}
                  </li>
                  <li class="text-slate-600 dark:text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 500 : {{ $t('api.whatsapp.server_error') }}
                  </li>
                </ol>
              </ul>
            </div>
          </template>
        </MazAccordion>
      </div>
      <div class="col-span-full 2xl:col-span-4">
        <section
          class="bg-gradient-to-br from-slate-300/5 to-slate-300/20 mt-8 p-5 rounded-2xl"
        >
          <h4 class="text-md text-slate-950">{{ $t('api.whatsapp.api_usage_example') }}</h4>

          <div class="bg-slate-300/40 mt-5 px-4 py-2 rounded-xl space-y-4">
            <ApiwhatsappExemple1 v-if="showExemple == 1" />
            <ApiwhatsappExemple2 v-else-if="showExemple == 2" />
            <ApiwhatsappExemple3 v-else-if="showExemple == 3" />
            <ApiwhatsappExemple4 v-else-if="showExemple == 4" />
            <p class="text-xs text-slate-500">
              {{ $t('api.whatsapp.api_usage_description') }}
            </p>
          </div>
        </section>
      </div>
    </section>
  </section>
</template>


<script setup>
import MazAccordion from "maz-ui/components/MazAccordion";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

definePageMeta({
  middleware: ["auth"],
  alias: "/api/whatsapp",
});
useHead({
  title: t("api.whatsapp.title"),
});

let showExemple = ref(1);
</script>

