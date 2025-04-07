<template>
  <div class="flex justify-center">
    <section class="mt-8 p-5 w-full">
      <h3 class="text-lg pb-5 text-slate-950 flex justify-between">
        <p class="flex gap-2 items-center">
          <span
            class="text-white flex items-center justify-center rounded-full px-3 py-[2px] bg-[#21a150]"
            >1</span
          >
          <span class="font-[500]">Information Agent</span>
        </p>
        <p class="flex gap-2 items-center" v-if="configStore.config?.name">
          <span class="text-sm text-slate-600">Status de l'agent</span>
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
            <label class="text-md text-slate-800">Nom d'agent</label>
            <p class="text-xs text-slate-600 pb-2">Le nom de votre agent</p>
            <input
              v-model="agentName"
              type="text"
              class="rounded-md text-sm p-2 bg-transparent outline-none border-[1.5px] border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-950 w-full focus:border-[#f3c775]"
              required
            />
          </div>

          <!-- Sélection de la Personnalité -->
          <div>
            <label class="text-md text-slate-800">Personnalité</label>
            <p class="text-xs text-slate-600 pb-2">
              La personnalité de votre agent
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                v-for="(personality, index) in personalities"
                :key="index"
                @click="selectedPersonality = personality.name"
                class="cursor-pointer p-4 rounded-lg border transition-all duration-300 ease-in-out flex flex-col items-center hover:shadow-md"
                :class="
                  selectedPersonality === personality.name
                    ? 'bg-[#f3c775]/20 text-slate-950 border-[#dfac4f]'
                    : 'bg-white opacity-80 border-gray-300'
                "
              >
                <UIcon :name="personality.icon" class="w-8 h-8 mb-2" />
                <span class="font-[500]">{{ personality.name }}</span>
                <p class="opacity-60 text-xs text-center mt-1">
                  {{ personality.description }}
                </p>
              </div>
            </div>
          </div>

          <!-- Sélection de l'Objectif -->
          <div>
            <label class="text-md text-slate-800">Objectif</label>
            <p class="text-xs text-slate-600 pb-2">
              Définissez le rôle principal de votre agent.
            </p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                v-for="(goal, index) in agentGoals"
                :key="index"
                @click="selectedGoal = goal.name"
                class="cursor-pointer p-4 rounded-lg border transition-all duration-300 ease-in-out flex flex-col items-center hover:shadow-md"
                :class="
                  selectedGoal === goal.name
                    ? 'bg-[#f3c775]/20 text-slate-950 border-[#dfac4f]'
                    : 'bg-white opacity-80 border-gray-300'
                "
              >
                <UIcon :name="goal.icon" class="w-8 h-8 mb-2" />
                <span class="font-[500]">{{ goal.name }}</span>
                <p class="opacity-60 text-xs text-center mt-1">
                  {{ goal.description }}
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
            <span v-if="configStore.config?.name">Mettre à jour</span>
            <span v-else> Sauvegarder</span>
          </UButton>
        </div>
      </form>
    </section>
    <div v-if="isAlertOpen">
      <AlertModal
        title="Informations incorrectes"
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
        title="Informations enregistrées"
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
import { ref } from "vue";
import { useUser } from "@/stores/user";
import { useAgentConfig } from "@/stores/agent/config";
const supabase = useSupabaseClient();
const users = useUser();
const configStore = useAgentConfig();
const agentName = ref(configStore.config?.name);
const selectedPersonality = ref(configStore.config?.personality);
const selectedGoal = ref(configStore.config?.goal);
const status = ref(configStore.config?.status);
const isRequestInProgress = ref(false);

const personalities = ref([
  {
    name: "Professionnel",
    description:
      "Un ton formel et structuré, idéal pour les interactions B2B et les communications d'entreprise. L'agent répond avec précision et clarté.",
    icon: "heroicons:briefcase",
  },
  {
    name: "Concise",
    description:
      "Des réponses courtes et directes, parfaites pour les utilisateurs qui recherchent des informations rapides et efficaces.",
    icon: "heroicons:sparkles",
  },
  {
    name: "Amical",
    description:
      "Un ton chaleureux et engageant, adapté aux interactions informelles et aux relations clients.",
    icon: "heroicons:face-smile",
  },
]);

const agentGoals = ref([
  {
    name: "Support Client",
    description:
      "Répond aux questions des clients et fournit une assistance efficace.",
    icon: "heroicons:chat-bubble-left-right",
  },
  {
    name: "Ventes & Closing",
    description:
      "Aide à la conversion des prospects en clients et optimise les ventes.",
    icon: "heroicons:currency-dollar",
  },
  {
    name: "Interne",
    description:
      "Soutient les équipes internes avec des réponses adaptées et des ressources.",
    icon: "heroicons:user-group",
  },
]);

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
    alert("Veuillez remplir tous les champs avant de sauvegarder.");
    return;
  }

  isRequestInProgress.value = true;

  const url = "https://app.myfindora.com/api/agent/config/create";

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
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();
    if (json && json.success) {
      configStore.updateConfig(json.data);
      isRequestInProgress.value = false;
      isSuccessOpen.value = true;
      successMessage.value = json.message;
    } else {
      isRequestInProgress.value = false;
      errorMessage.value = json.message;
      isAlertOpen.value = true;
    }
  } catch (err) {
    isRequestInProgress.value = false;
    errorMessage.value = "Une erreur s'est produite lors de l'enregistrement.";
    isAlertOpen.value = true;
  } finally {
    isRequestInProgress.value = false;
  }
};
onMounted(async () => {
  if (!configStore.config?.name) {
    const url = `https://app.myfindora.com/api/agent/config/list?user_id=${users.info.uuid}`;
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

      if (json && json.success) {
        configStore.updateConfig(json.data);
        agentName.value = json.data?.name;
        selectedGoal.value = json.data?.goal;
        selectedPersonality.value = json.data?.personality;
        status.value = json.data?.status;
      }
    } catch (err) {
      errorMessage.value =
        "Une erreur s'est produite lors de l'enregistrement.";
    }
  }
});

let active = ref(configStore.config?.status);
watch(active, async (oldValue, newValue) => {
  if (oldValue != newValue) {
    try {
      const response = await fetch(
        "https://app.myfindora.com/api/agent/config/update-status",
        {
          method: "POST",
          body: JSON.stringify({
            user_id: users.info.uuid,
            active: active.value,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      if (json && json.success) {
        configStore.updateStatus(json.data.status);
        isSuccessOpen.value = true;
        successMessage.value = json.message;
      } else {
        errorMessage.value = json.message;
        isAlertOpen.value = true;
      }
    } catch (err) {
      errorMessage.value =
        "Une erreur s'est produite lors de l'enregistrement." + err;
      isAlertOpen.value = true;
    }
  }
});
</script>
