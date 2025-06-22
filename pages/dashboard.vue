<!-- pages/dashboard.vue - Version Mobile -->
<template>
  <div class="min-h-screen  bg-transparent dark:bg-slate-900">
    <!-- Desktop Version -->
    <div class="hidden sm:block mt-4 space-y-4 ">
      <OnboardingCarousel />
      <DashboardHeros />
    </div>

    <!-- Mobile Version -->
    <div
      class="sm:hidden pt-40 pb-16"
    >
      <!-- User Greeting -->
      <div class="px-4 pt-12 pb-2">
        <h2 class="text-slate-700/70 dark:text-slate-200 text-4xl font-semibold transparent">
          <span class="">{{ user?.info?.name }},</span> <br />
          <span class="text-3xl text-slate-700 dark:text-slate-400"> Que voulez vous faire ? </span>
        </h2>
      </div>

      <!-- WhatsApp Connection Alert (if needed) -->
      <div
        v-if="whatsappStore.whatsapp_backlogs == null"
        class="mx-4 mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800"
      >
        <div class="flex items-start gap-3">
          <div class="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-full">
            <UIcon
              name="i-heroicons-bell-alert"
              class="w-5 h-5 text-amber-600 dark:text-amber-400"
            />
          </div>
          <div class="flex-1">
            <h4 class="text-sm font-medium text-gray-900 dark:text-white">
              {{ $t("dashboard.connect_whatsapp_title") }}
            </h4>
            <p class="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {{ $t("dashboard.connect_whatsapp_desc") }}
            </p>
            <a
              href="https://youtu.be/tFQJnCIQHxE"
              target="_blank"
              class="inline-flex items-center gap-1 mt-2 text-xs font-medium text-amber-600 dark:text-amber-400"
            >
              {{ $t("dashboard.watch_video") }}
              <UIcon
                name="i-heroicons-arrow-top-right-on-square"
                class="w-3 h-3"
              />
            </a>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="px-4">
        <!-- Action Cards Grid -->
        <div class="grid grid-cols-2 gap-3 mt-4">
          <!-- Without WhatsApp -->
          <template v-if="whatsappStore.whatsapp_backlogs == null">
            <MobileDashboardActionCard
              to="/whatsapp"
              icon="whatsapp"
              :iconImage="true"
              title="Connecter WhatsApp"
              color="green"
            />

            <MobileDashboardActionCard
              to="/abonnement"
              icon="i-heroicons-lifebuoy"
              title="Abonnements"
              color="amber"
            />

            <MobileDashboardActionCard
              to="/agent"
              icon="i-heroicons-rectangle-group"
              title="Agent IA"
              subtitle="Essayer"
              color="blue"
            />

            <MobileDashboardActionCard
              to="/contacts"
              icon="i-heroicons-users"
              title="Contacts"
              subtitle="Ajouter"
              color="purple"
            />
          </template>

          <!-- With WhatsApp -->
          <template v-else>
            <MobileDashboardActionCard
              to="/agent"
              icon="i-heroicons-rectangle-group"
              title="Agent IA"
              subtitle="Plus de conversations"
              color="amber"
              :isPrimary="true"
            />

            <MobileDashboardActionCard
              to="/whatsapp"
              icon="i-heroicons-paper-airplane"
              title="Campagne"
              subtitle="Plus de satisfactions"
              color="green"
              :isPrimary="true"
            />

            <MobileDashboardActionCard
              to="/contacts"
              icon="i-heroicons-users"
              title="Mes contacts"
              subtitle="Gérer vos différents contacts"
              color="slate"
              :isFullWidthWhite="true"
              class="col-span-full"
            />
          </template>
        </div>
      </div>

      <!-- Calendar Preview -->
      <div
        v-if="whatsappStore.whatsapp_backlogs != null"
        class="mt-6 px-4 pb-6"
      >
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-md font-medium text-gray-700 dark:text-gray-300">
            Dernières campagnes 
          </h3>
          <NuxtLink
            to="/whatsapp"
            class="text-xs font-medium text-slate-950 dark:text-slate-200 bg-slate-500/10 rounded-full p-2 flex items-center justify-center"
          >
            <UIcon name="i-heroicons-arrow-up-right" class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div
          class="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          <MobileDashboardCampaignList />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUser } from "@/stores/user";
import { useWhatsapp } from "@/stores/whatsapp";

const { t } = useI18n();
const user = useUser();
const whatsappStore = useWhatsapp();

definePageMeta({
  middleware: "auth",
});
  
useHead({
  title: t("dashboard.title"),
});
</script>
