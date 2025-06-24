<template>
  <div>
    <!-- Version Desktop -->
    <section v-if="!isMobile" class="">
      <AgentNav />
      <div class="space-y-8 flex justify-center pt-10">
        <div class="2xl:max-w-7xl basis-2/3">
          <h3 class="text-start text-xl pt-3 pb-6 dark:text-white">
            {{ $t("agent.units.pay_as_you_go") }}
          </h3>
          <p class="text-sm text-start text-slate-700 dark:text-slate-300">
            {{ $t("agent.units.current_credit") }}
          </p>
          <div class="flex items-center gap-1 pb-4">
            <p class="text-3xl text-slate-800 dark:text-white ">
              {{ userStore.subscription.max_limit }}
            </p>
            <button @click="refreshCredit" :disabled="isRefreshing" class="p-2">
              <svg
                class="w-5 h-5 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                :class="{ 'animate-spin': isRefreshing }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
          <p class="mb-6">
            <a
              target="_blank"
              href="https://wa.me/2250160485654"
              class="text-slate-800 dark:text-white bg-slate-200 dark:bg-slate-700 rounded-lg py-2 px-4 text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition duration-300 ease-in-out"
            >
              {{ $t("agent.units.buy_more_credit") }}
            </a>
          </p>
        </div>
      </div>
    </section>

    <!-- Version Mobile -->
    <MobileAgentView v-else class="pt-3 pb-32">
      <!-- Page d'accueil mobile avec carte de crédit -->
      <div class="px-4 py-6">
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-slate-700"
        >
          <div class="text-center">
            <div
              class="w-20 h-20 bg-gradient-to-br from-[#ffbd59]/20 to-[#ffbd59]/40 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <UIcon
                name="i-heroicons-credit-card"
                class="w-10 h-10 text-[#ffbd59]"
              />
            </div>

            <h3
              class="text-lg font-semibold text-gray-900 dark:text-white mb-2"
            >
              {{ $t("agent.units.your_balance") }}
            </h3>

            <div class="flex items-center justify-center gap-3">
              <p class="text-4xl font-bold text-[#ffbd59] mb-6">
                {{ userStore.subscription.max_limit }}
              </p>
              <button
                @click="refreshCredit"
                :disabled="isRefreshing"
                class="p-2 mb-6"
              >
                <svg
                  class="w-6 h-6 text-slate-600"
                  :class="{ 'animate-spin': isRefreshing }"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
            </div>

            <a
              href="https://wa.me/2250160485654"
              target="_blank"
              class="inline-flex items-center gap-2 bg-[#ffbd59] hover:bg-[#f3c775] text-slate-900 font-medium px-6 py-3 rounded-xl transition-colors"
            >
              <UIcon name="i-heroicons-shopping-cart" class="w-5 h-5" />
              {{ $t("agent.units.buy_more_credit") }}
            </a>
          </div>
        </div>

        <!-- Guide rapide -->
        <div class="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <div class="flex items-start gap-3">
            <UIcon
              name="i-heroicons-information-circle"
              class="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
            />
            <div>
              <h4 class="font-medium text-blue-900 dark:text-blue-200 mb-1">
                {{ $t("agent.units.how_it_works") }}
              </h4>
              <p class="text-sm text-blue-700 dark:text-blue-300">
                {{ $t("agent.units.credit_explanation") }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MobileAgentView>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useUser } from "@/stores/user";
import { createClient } from "@supabase/supabase-js";

const { t } = useI18n();
const userStore = useUser();
const isMobile = ref(false);
const isRefreshing = ref(false);
const config = useRuntimeConfig();

definePageMeta({
  middleware: ["auth", "is-ultra"],
  alias: "/agent",
});

useHead({
  title: t("agent.units.delegate_conversations"),
});

// Fonction simple pour rafraîchir le crédit
const refreshCredit = async () => {
  isRefreshing.value = true;

  try {
    // Connexion directe à Supabase
    const supabase = useSupabaseClient();

    // Récupérer l'abonnement
    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userStore.info.uuid)
      .single();

    if (data && !error) {
      // Mettre à jour dans le store
      userStore.updateSubscription(data);
    }
  } catch (error) {
    console.error("Erreur:", error);
  }

  isRefreshing.value = false;
};

onMounted(() => {
  isMobile.value = window.innerWidth < 768;
  window.addEventListener("resize", () => {
    isMobile.value = window.innerWidth < 768;
  });
});
</script>
