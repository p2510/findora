<!-- pages/more.vue -->
<template>
  <div>
    <!-- Version Desktop -->
    <div
      v-if="!isMobile"
      class="min-h-screen bg-gray-50 dark:bg-slate-900 mt-14 pr-4"
    >
      <div class="max-w-4xl mx-auto py-8 px-4">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {{ $t("more.title") }}
          </h1>
          <p class="text-gray-600 dark:text-gray-400">
            {{ $t("more.subtitle") }}
          </p>
        </div>

        <!-- User Profile Card -->
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 mb-8">
          <div class="flex items-center gap-6">
            <img
              :src="`https://ui-avatars.com/api/?name=${user.info.email}&background=ffbd59&color=ffffff`"
              alt="Avatar"
              class="w-24 h-24 rounded-full shadow-md"
            />
            <div class="flex-1">
              <h2
                class="text-2xl font-semibold text-gray-900 dark:text-white mb-1"
              >
                {{ user.info.name || user.info.email }}
              </h2>
              <p class="text-gray-600 dark:text-gray-400 mb-3">
                {{ user.info.email }}
              </p>
              <div class="flex items-center gap-3">
                <span
                  :class="[
                    'px-3 py-1.5 text-sm font-medium rounded-full',
                    getPlanClass(user.subscription.subscription_type),
                  ]"
                >
                  {{ $t("more.profile.plan") }}
                  {{ user.subscription.subscription_type }}
                </span>
                <span class="text-sm text-gray-500 dark:text-gray-400">
                  {{ $t("more.profile.member_since") }}
                  {{ formatDate(user.info.created_at) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Options Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- API Management -->
          <NuxtLink
            to="/api/jeton"
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all group"
          >
            <div class="flex items-start gap-4">
              <div
                class="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl group-hover:scale-110 transition-transform"
              >
                <UIcon
                  name="i-heroicons-key"
                  class="w-6 h-6 text-blue-600 dark:text-blue-400"
                />
              </div>
              <div class="flex-1">
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-1"
                >
                  {{ $t("more.menu.api_management") }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">
                  {{ $t("more.menu.api_description") }}
                </p>
              </div>
              <UIcon
                name="i-heroicons-arrow-right"
                class="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform"
              />
            </div>
          </NuxtLink>

          <!-- Subscription -->
          <NuxtLink
            to="/abonnement"
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all group relative"
          >
            <div
              v-if="shouldShowSubscriptionAlert()"
              class="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full animate-pulse"
            />
            <div class="flex items-start gap-4">
              <div
                class="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl group-hover:scale-110 transition-transform"
              >
                <UIcon
                  name="i-heroicons-lifebuoy"
                  class="w-6 h-6 text-amber-600 dark:text-amber-400"
                />
              </div>
              <div class="flex-1">
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-1"
                >
                  {{ $t("more.menu.subscription") }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">
                  {{ getSubscriptionStatus() }}
                </p>
              </div>
              <UIcon
                name="i-heroicons-arrow-right"
                class="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform"
              />
            </div>
          </NuxtLink>

          <!-- Settings -->
          <NuxtLink
            to="/parametre"
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all group"
          >
            <div class="flex items-start gap-4">
              <div
                class="p-3 bg-gray-100 dark:bg-gray-700 rounded-xl group-hover:scale-110 transition-transform"
              >
                <UIcon
                  name="i-heroicons-cog-6-tooth"
                  class="w-6 h-6 text-gray-600 dark:text-gray-400"
                />
              </div>
              <div class="flex-1">
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-1"
                >
                  {{ $t("more.menu.settings") }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">
                  {{ $t("more.menu.settings_description") }}
                </p>
              </div>
              <UIcon
                name="i-heroicons-arrow-right"
                class="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform"
              />
            </div>
          </NuxtLink>

          <!-- Support -->
          <a
            href="https://wa.me/2250797966331?text=Bonjour Findora"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 hover:shadow-md transition-all group"
          >
            <div class="flex items-start gap-4">
              <div
                class="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl group-hover:scale-110 transition-transform"
              >
                <UIcon
                  name="i-heroicons-chat-bubble-left-right"
                  class="w-6 h-6 text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div class="flex-1">
                <h3
                  class="text-lg font-semibold text-gray-900 dark:text-white mb-1"
                >
                  {{ $t("more.menu.support") }}
                </h3>
                <p class="text-gray-600 dark:text-gray-400 text-sm">
                  {{ $t("more.menu.support_description") }}
                </p>
              </div>
              <UIcon
                name="i-heroicons-arrow-top-right-on-square"
                class="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform"
              />
            </div>
          </a>
        </div>

        <!-- Additional Options -->
        <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Tutorials -->
          <a
            href="https://youtu.be/tFQJnCIQHxE"
            target="_blank"
            rel="noopener noreferrer"
            class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-all group flex items-center gap-3"
          >
            <UIcon
              name="i-heroicons-play-circle"
              class="w-8 h-8 text-purple-600 dark:text-purple-400"
            />
            <div>
              <h4 class="font-medium text-gray-900 dark:text-white">
                {{ $t("more.menu.tutorials") }}
              </h4>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{ $t("more.menu.tutorials_description") }}
              </p>
            </div>
          </a>

          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 hover:shadow-md transition-all group flex items-center gap-3"
          >
            <UIcon
              :name="
                $colorMode.value === 'dark'
                  ? 'i-heroicons-sun'
                  : 'i-heroicons-moon'
              "
              class="w-8 h-8 text-indigo-600 dark:text-indigo-400"
            />
            <div class="text-left">
              <h4 class="font-medium text-gray-900 dark:text-white">
                {{ $t("more.menu.theme") }}
              </h4>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                {{
                  $colorMode.value === "dark"
                    ? $t("more.menu.theme_dark")
                    : $t("more.menu.theme_light")
                }}
              </p>
            </div>
          </button>
        </div>

        <!-- Logout Button -->
        <div class="mt-8 flex justify-center">
          <button
            @click="logout"
            class="flex items-center gap-2 px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          >
            <UIcon name="i-heroicons-power" class="w-5 h-5" />
            <span class="font-medium">{{ $t("more.menu.logout") }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Version Mobile -->
    <div v-else class="min-h-screen bg-transparent mt-8 dark:bg-slate-900">
      <!-- Header -->
      <div class="px-4 pt-4 pb-2">
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
          {{ $t("more.title") }}
        </h2>
      </div>

      <!-- User Profile Section -->
      <div
        class="mx-4 mt-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700"
      >
        <div class="flex items-center gap-4">
          <img
            :src="`https://ui-avatars.com/api/?name=${user.info.email}&background=ffbd59&color=ffffff`"
            alt="Avatar"
            class="w-16 h-16 rounded-full"
          />
          <div class="flex-1">
            <h3 class="font-semibold text-gray-900 dark:text-white">
              {{ user.info.name || user.info.email }}
            </h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ user.info.email }}
            </p>
            <div class="flex items-center gap-2 mt-2">
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  getPlanClass(user.subscription.subscription_type),
                ]"
              >
                {{ $t("more.profile.plan") }}
                {{ user.subscription.subscription_type }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Menu Items -->
      <div class="mt-6 px-4 space-y-2">

        <div
          class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          <MobileActionCard
            to="/abonnement"
            icon="i-heroicons-lifebuoy"
            :title="$t('more.menu.subscription')"
            :subtitle="getSubscriptionStatus()"
            showArrow
            :hasNotification="shouldShowSubscriptionAlert()"
          />
          <MobileActionCard
            href="https://wa.me/2250797966331?text=Bonjour Findora"
            icon="i-heroicons-chat-bubble-left-right"
            :title="$t('more.menu.support')"
            :subtitle="$t('more.menu.support_subtitle')"
            isExternal
          />

          <MobileActionCard
            href="https://youtu.be/tFQJnCIQHxE"
            icon="i-heroicons-play-circle"
            :title="$t('more.menu.tutorials')"
            :subtitle="$t('more.menu.tutorials_subtitle')"
            isExternal
          />
        </div>

        <!-- App Info -->
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          <MobileActionCard
            @click="toggleTheme"
            icon="i-heroicons-moon"
            :title="$t('more.menu.theme')"
            :subtitle="
              $colorMode.value === 'dark'
                ? $t('more.menu.theme_dark')
                : $t('more.menu.theme_light')
            "
            isButton
          />
        </div>

        <!-- Logout -->
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden"
        >
          <MobileActionCard
            @click="logout"
            icon="i-heroicons-power"
            :title="$t('more.menu.logout')"
            iconColor="text-red-600 dark:text-red-400"
            isButton
          />
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-8 pb-24 px-4 text-center">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          {{ $t("more.footer.copyright") }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUser } from "@/stores/user";
import { reset } from "@/utils/shared/resetStore";

const { t } = useI18n();
const user = useUser();
const supabase = useSupabaseClient();
const colorMode = useColorMode();

const isMobile = ref(false);

onMounted(() => {
  isMobile.value = window.innerWidth < 768;
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth < 768;
  });
});

const toggleTheme = () => {
  // Basculer entre les thèmes
  const newTheme = colorMode.value === "dark" ? "light" : "dark";

  colorMode.preference = newTheme;
  colorMode.value = newTheme;

  if (process.client) {
    localStorage.setItem("nuxt-color-mode", newTheme);

    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  }
};

const logout = async () => {
  const confirm = window.confirm(t("more.menu.logout_confirm"));
  if (confirm) {
    let { error } = await supabase.auth.signOut();
    if (!error) {
      reset();
      return navigateTo("/");
    }
  }
};

const getPlanClass = (plan) => {
  const classes = {
    free: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    ultra:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400",
    entreprise:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400",
  };
  return classes[plan] || classes["free"];
};

const getSubscriptionStatus = () => {
  const plan = user.subscription.subscription_type;
  if (plan === "free") return t("more.menu.subscription_subtitle_free");

  const endDate = new Date(user.subscription.start_at);
  endDate.setMonth(endDate.getMonth() + 1);

  if (endDate < new Date()) {
    return t("more.menu.subscription_expired");
  }

  const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
  return t("more.menu.subscription_days_left", { days: daysLeft });
};

const shouldShowSubscriptionAlert = () => {
  if (user.subscription.subscription_type === "free") return true;

  const endDate = new Date(user.subscription.start_at);
  endDate.setMonth(endDate.getMonth() + 1);

  return endDate < new Date();
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const locale = useI18n().locale.value;
  return date.toLocaleDateString(locale === "fr" ? "fr-FR" : "en-US", {
    month: "long",
    year: "numeric",
  });
};
</script>
