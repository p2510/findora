<template>
  <div class="flex justify-center">
    <section class="mt-8 p-5 w-full">
      <h3
        class="text-lg pb-5 text-slate-950 dark:text-white flex justify-between"
      >
        <p class="flex gap-2 items-center">
          <span
            class="text-white flex items-center justify-center rounded-full px-3 py-[2px] bg-[#21a150]"
          >
            1
          </span>
          <span class="font-[500]">{{
            $t("agent.config.info.agent_information")
          }}</span>
        </p>
        <p class="flex gap-2 items-center" v-if="configStore.config?.name">
          <span class="text-sm text-slate-600 dark:text-slate-300">{{
            $t("agent.config.info.agent_status")
          }}</span>

          <UToggle
            v-model="active"
            size="2xl"
            on-icon="i-heroicons-check-20-solid"
            off-icon="i-heroicons-x-mark-20-solid"
            color="amber"
          />
        </p>
      </h3>
      <form @submit.prevent="saveAgentConfig" class="grid grid-cols-12">
        <div class="col-span-full flex flex-col gap-6">
          <div class="w-1/4">
            <label class="text-md text-slate-800 dark:text-white">{{
              $t("agent.config.info.agent_name")
            }}</label>
            <p class="text-xs text-slate-600 dark:text-slate-300 pb-2">
              {{ $t("agent.config.info.agent_name_placeholder") }}
            </p>
            <input
              v-model="agentName"
              type="text"
              class="rounded-md text-sm p-2 bg-transparent outline-none border-[1.5px] border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-950 dark:text-white w-full focus:border-[#f3c775] dark:bg-slate-700 dark:border-slate-600 dark:focus:border-[#f3c775]"
              required
            />
          </div>

          <!-- Sélection de la Personnalité -->
          <div>
            <label class="text-md text-slate-800 dark:text-white">{{
              $t("agent.config.info.personality")
            }}</label>
            <p class="text-xs text-slate-600 dark:text-slate-300 pb-2">
              {{ $t("agent.config.info.personality_placeholder") }}
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                v-for="(personality, index) in personalities"
                :key="index"
                @click="selectedPersonality = personality.name"
                class="cursor-pointer p-4 rounded-lg border transition-all duration-300 ease-in-out flex flex-col items-center hover:shadow-md"
                :class="
                  selectedPersonality === personality.name
                    ? 'bg-[#f3c775]/20 text-slate-950 dark:text-white border-[#dfac4f]'
                    : 'bg-white opacity-80 border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white'
                "
              >
                <UIcon :name="personality.icon" class="w-8 h-8 mb-2" />

                <span class="font-[500]">{{
                  $t("agent.config.info.personality_name", {
                    name: transPersonality(personality.name),
                  })
                }}</span>
                <p class="opacity-60 text-xs text-center mt-1">
                  {{ $t(`agent.config.info.${personality.name}_description`) }}
                </p>
              </div>
            </div>
          </div>

          <!-- Sélection de l'Objectif -->
          <div>
            <label class="text-md text-slate-800 dark:text-white">{{
              $t("agent.config.info.goal")
            }}</label>
            <p class="text-xs text-slate-600 dark:text-slate-300 pb-2">
              {{ $t("agent.config.info.goal_placeholder") }}
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                v-for="(goal, index) in agentGoals"
                :key="index"
                @click="selectedGoal = goal.name"
                class="cursor-pointer p-4 rounded-lg border transition-all duration-300 ease-in-out flex flex-col items-center hover:shadow-md"
                :class="
                  selectedGoal === goal.name
                    ? 'bg-[#f3c775]/20 text-slate-950 dark:text-white border-[#dfac4f]'
                    : 'bg-white opacity-80 border-gray-300 dark:bg-slate-700 dark:border-slate-600 dark:text-white'
                "
              >
                <UIcon :name="goal.icon" class="w-8 h-8 mb-2" />
                <span class="font-[500]">{{
                  $t(`agent.config.info.goal_name`, {
                    name: transGoal(goal.name),
                  })
                }}</span>
                <p
                  class="opacity-60 text-xs text-center mt-1"
                  v-if="goal.name == 'Support Client'"
                >
                  {{ $t(`agent.config.info.customer_support_description`) }}
                </p>
                <p
                  class="opacity-60 text-xs text-center mt-1"
                  v-else-if="goal.name == 'Ventes & Closing'"
                >
                  {{ $t(`agent.config.info.sales_closing_description`) }}
                </p>
                <p
                  class="opacity-60 text-xs text-center mt-1"
                  v-else-if="goal.name == 'Interne'"
                >
                  {{ $t(`agent.config.info.internal_description`) }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div class="col-span-full space-y-[1px] pt-10">
          <UButton
            :loading="isRequestInProgress"
            type="submit"
            size="lg"
            variant="soft"
            color="emerald"
          >
            <span v-if="configStore.config?.name">{{
              $t("agent.config.info.update")
            }}</span>
            <span v-else>{{ $t("agent.config.info.save") }}</span>
          </UButton>
        </div>
      </form>
    </section>

    <div v-if="isAlertOpen">
      <AlertModal
        :title="$t('agent.config.info.incorrect_information')"
        type="error"
        @close-alert="closeErrorAlert"
      >
        <template #message>
          <p>
            {{ errorMessage }}
          </p>
        </template>
      </AlertModal>
    </div>
    <div v-if="isSuccessOpen">
      <AlertModal
        :title="$t('agent.config.info.information_saved')"
        type="success"
        @close-alert="closeSuccessAlert"
      >
        <template #message>
          <p>{{ successMessage }}</p>
        </template>
      </AlertModal>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from "vue";
import { useUser } from "@/stores/user";
import { useAgentConfig } from "@/stores/agent/config";

const { t } = useI18n();
const { locale } = useI18n();
const users = useUser();
const configStore = useAgentConfig();

const agentName = ref("");
const selectedPersonality = ref("Professionnel");
const selectedGoal = ref("Support Client");
const active = ref(false);
const isInitialized = ref(false);

let status = ref(false);
const isRequestInProgress = ref(false);

const personalities = ref([
  {
    name: "Professionnel",
    description: t("agent.config.info.professional_description"),
    icon: "heroicons:briefcase",
  },
  {
    name: "Concise",
    description: t("agent.config.info.concise_description"),
    icon: "heroicons:sparkles",
  },
  {
    name: "Amical",
    description: t("agent.config.info.friendly_description"),
    icon: "heroicons:face-smile",
  },
]);

let transPersonality = (name) => {
  if (locale.value == "en") {
    if (name == "Professionnel") {
      return "Professional";
    } else if (name == "Concise") {
      return "Concise";
    } else if (name == "Amical") {
      return "Friendly";
    }
  }
  return name;
};

const agentGoals = ref([
  {
    name: "Support Client",
    description: t("agent.config.info.customer_support_description"),
    icon: "heroicons:chat-bubble-left-right",
  },
  {
    name: "Ventes & Closing",
    description: t("agent.config.info.sales_closing_description"),
    icon: "heroicons:currency-dollar",
  },
  {
    name: "Interne",
    description: t("agent.config.info.internal_description"),
    icon: "heroicons:user-group",
  },
]);

let transGoal = (name) => {
  if (locale.value == "en") {
    if (name == "Support Client") {
      return "Customer support";
    } else if (name == "Ventes & Closing") {
      return "Sales & Closing";
    } else if (name == "Interne") {
      return "Internal";
    }
  }
  return name;
};

const errorMessage = ref("");
const isAlertOpen = ref(false);
let closeErrorAlert = () => {
  isAlertOpen.value = false;
};

let successMessage = ref("");
const isSuccessOpen = ref(false);
let closeSuccessAlert = () => {
  isSuccessOpen.value = false;
};

const saveAgentConfig = async () => {
  if (!agentName.value || !selectedPersonality.value || !selectedGoal.value) {
    errorMessage.value = t("agent.config.info.fill_all_fields");
    isAlertOpen.value = true;
    return;
  }

  isRequestInProgress.value = true;

  const url = `${useRuntimeConfig().public.url_base}/api/agent/config/create`;

  try {
    const response = await fetch(url, {
      method: "POST",
     
      body: JSON.stringify({
        name: agentName.value,
        personality: selectedPersonality.value,
        goal: selectedGoal.value,
        user_id: users.info.uuid,
      }),
    });

    if (!response.ok) {
      isRequestInProgress.value = false;
      const errorData = await response.text();
      console.error("Erreur réponse:", errorData);
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    
    if (json && json.success) {
      configStore.updateConfig(json.data);
      isRequestInProgress.value = false;
      isSuccessOpen.value = true;
      successMessage.value = json.message;
      
      // Mettre à jour active après sauvegarde
      active.value = json.data.status || false;
    } else {
      isRequestInProgress.value = false;
      errorMessage.value = json.message;
      isAlertOpen.value = true;
    }
  } catch (err) {
    console.error("Erreur saveAgentConfig:", err);
    isRequestInProgress.value = false;
    errorMessage.value = t("agent.config.info.error_occurred");
    isAlertOpen.value = true;
  } finally {
    isRequestInProgress.value = false;
  }
};

// Charger les données initiales
const loadInitialData = async () => {
  // D'abord vérifier si on a déjà des données dans le store
  if (configStore.config?.name) {
    agentName.value = configStore.config.name;
    selectedGoal.value = configStore.config.goal || "Support Client";
    selectedPersonality.value = configStore.config.personality || "Professionnel";
    status.value = configStore.config.status || false;
    active.value = configStore.config.status || false;
    isInitialized.value = true;
    return;
  }

  // Sinon charger depuis l'API
  const url = `${useRuntimeConfig().public.url_base}/api/agent/config/list?user_id=${users.info.uuid}`;
  
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();

    if (json && json.success && json.data) {
      configStore.updateConfig(json.data);
      agentName.value = json.data.name || "";
      selectedGoal.value = json.data.goal || "Support Client";
      selectedPersonality.value = json.data.personality || "Professionnel";
      status.value = json.data.status || false;
      active.value = json.data.status || false;
    }
  } catch (err) {
    console.error("Erreur chargement config:", err);
    errorMessage.value = t("agent.config.info.error_occurred");
  } finally {
    isInitialized.value = true;
  }
};

onMounted(async () => {
  await loadInitialData();
});

// Watch pour le changement de statut - ne s'exécute qu'après l'initialisation
watch(active, async (newValue, oldValue) => {
  // Ne pas exécuter si:
  // 1. Le composant n'est pas encore initialisé
  // 2. Il n'y a pas de configuration existante
  // 3. C'est la valeur initiale (oldValue est undefined)
  if (!isInitialized.value || !configStore.config?.name || oldValue === undefined) {
    return;
  }
  
  // Ne faire l'appel API que si la valeur a réellement changé
  if (newValue !== oldValue) {
    try {
      const response = await fetch(
        `${useRuntimeConfig().public.url_base}/api/agent/config/update-status`,
        {
          method: "POST",
          
          body: JSON.stringify({
            user_id: users.info.uuid,
            active: newValue,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        console.error("Erreur update status:", errorData);
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      
      if (json && json.success) {
        configStore.updateStatus(json.data.status);
        isSuccessOpen.value = true;
        successMessage.value = json.message;
      } else {
        // Remettre l'ancienne valeur si erreur
        active.value = oldValue;
        errorMessage.value = json.message;
        isAlertOpen.value = true;
      }
    } catch (err) {
      console.error("Erreur update status:", err);
      // Remettre l'ancienne valeur si erreur
      active.value = oldValue;
      errorMessage.value = t("agent.config.info.error_occurred");
      isAlertOpen.value = true;
    }
  }
});
</script>