<template>
  <div class="flex justify-center">
    <section class="mt-8 p-5 w-full dark:bg-slate-800 dark:text-white">
      <h3
        class="text-lg pb-5 text-slate-950 flex gap-2 items-center dark:text-white"
      >
        <span
          class="text-white flex items-center justify-center rounded-full px-3 py-[2px] bg-[#21a150]"
        >
          2
        </span>
        <span class="font-[500]">{{
          $t("agent.config.know.basic_knowledge")
        }}</span>
      </h3>



      <form @submit.prevent="saveAgentKnow" class="grid grid-cols-12">
        <div class="col-span-full flex flex-col gap-6">
          <div class="w-full">
            <label class="text-md text-slate-800 dark:text-slate-300">{{
              $t("agent.config.know.basic_knowledge")
            }}</label>
            <p class="text-xs text-slate-600 pb-2 dark:text-slate-400">
              {{ $t("agent.config.know.basic_knowledge_placeholder") }}
            </p>

            <div
              v-for="(info, index) in knowledgeBase"
              :key="index"
              class="space-y-3 mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700"
            >
              <div class="flex gap-3 items-start">
                <div class="w-1/4">
                  <select
                    v-model="info.type"
                    class="rounded-md text-sm p-2 bg-white dark:bg-slate-700 outline-none border-[1.5px] border-gray-300 dark:border-gray-600 focus:border-[#f3c775] dark:focus:border-[#f3c775] focus:rounded-lg dark:text-white w-full transition duration-300"
                    :disabled="!configStore.config?.name"
                  >
                    <option value="presentation">
                      {{ $t("agent.config.know.presentation") }}
                    </option>
                    <option value="produit">
                      {{ $t("agent.config.know.product") }}
                    </option>
                    <option value="service">
                      {{ $t("agent.config.know.service") }}
                    </option>
                    <option value="site web">
                      {{ $t("agent.config.know.website") }}
                    </option>
                    <option value="faq">{{ $t("agent.config.know.faq") }}</option>
                    <option value="réseaux sociaux">
                      {{ $t("agent.config.know.social_media") }}
                    </option>
                  </select>
                </div>
                
                <div class="flex-1">
                  <div class="relative">
                    <textarea
                      v-model="info.content"
                      class="rounded-md text-sm px-3 py-2 bg-white dark:bg-slate-700 outline-none border-[1.5px] border-gray-300 dark:border-gray-600 focus:border-[#f3c775] dark:focus:border-[#f3c775] focus:rounded-lg dark:text-white w-full transition duration-300 ease-in-out resize-none"
                      :placeholder="$t('agent.config.know.enter_content')"
                      rows="6"
                      :disabled="!configStore.config?.name"
                    ></textarea>
                    
                    <!-- Indicateurs en bas -->
                  
                  </div>
                </div>
              </div>

              <!-- Bouton supprimer -->
              <div class="flex justify-end">
                <button
                  :disabled="!configStore.config?.name || knowledgeBase.length === 1"
                  type="button"
                  @click="removeKnowledge(index)"
                  class="bg-red-500 hover:bg-red-700 text-white rounded-md py-2 px-3 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <UIcon name="i-heroicons-trash" class="w-4 h-4" />
                  {{ $t("agent.config.know.delete") }}
                </button>
              </div>
            </div>

            <!-- Bouton Ajouter une connaissance -->
            <div class="flex gap-2 items-center">
              <button
                :disabled="!configStore.config?.name"
                type="button"
                @click="addKnowledge"
                class="bg-emerald-500 hover:bg-emerald-700 text-white rounded-md py-2 px-4 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <UIcon name="i-heroicons-plus-circle" class="w-5 h-5" />
                {{ $t("agent.config.know.add_knowledge") }}
              </button>
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
            :disabled="!configStore.config?.name || totalContentSize === 0"
          >
            <span>{{ $t("agent.config.know.save") }}</span>
          </UButton>
        </div>
      </form>
    </section>

    <!-- Alertes -->
    <div v-if="isAlertOpen">
      <AlertModal
        :title="$t('agent.config.know.incorrect_information')"
        type="error"
        @close-alert="closeErrorAlert"
      >
        <template #message>
          <p>{{ errorMessage }}</p>
        </template>
      </AlertModal>
    </div>
    
    <div v-if="isSuccessOpen">
      <AlertModal
        :title="$t('agent.config.know.information_saved')"
        type="success"
        @close-alert="closeSuccessAlert"
      >
        <template #message>
          <p>{{ successMessage }}</p>
          <p v-if="totalChunks > 0" class="mt-2 text-sm">
            <strong>{{ totalChunks }}</strong> chunks ont été créés et indexés avec succès.
          </p>
        </template>
      </AlertModal>
    </div>
  </div>
</template>

<script setup>
import { ref, watchEffect, onMounted, computed } from "vue";
import { useI18n } from "vue-i18n";
import { useUser } from "@/stores/user";
import { useAgentConfig } from "@/stores/agent/config";
import { useAgentKnow } from "@/stores/agent/know";

const { t } = useI18n();
const users = useUser();
const knowStore = useAgentKnow();
const configStore = useAgentConfig();

const isRequestInProgress = ref(false);
const totalChunks = ref(0);

// Variables pour les connaissances
const knowledgeBase = ref([{ type: "presentation", content: "" }]);

// Computed pour les statistiques
const totalContentSize = computed(() => {
  return knowledgeBase.value.reduce((total, item) => total + item.content.length, 0);
});

const estimatedChunks = computed(() => {
  return Math.ceil(totalContentSize.value / 500);
});

// Fonction pour ajouter une nouvelle connaissance
const addKnowledge = () => {
  knowledgeBase.value.push({ type: "presentation", content: "" });
};

// Fonction pour supprimer une connaissance spécifique
const removeKnowledge = (index) => {
  knowledgeBase.value.splice(index, 1);
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

// Fonction de sauvegarde de la configuration de l'agent
const saveAgentKnow = async () => {
  // Vérifier qu'il y a du contenu
  const hasContent = knowledgeBase.value.some(item => item.content.trim().length > 0);
  if (!hasContent) {
    errorMessage.value = "Veuillez ajouter au moins une information.";
    isAlertOpen.value = true;
    return;
  }

  // Filtrer les entrées vides
  const knowledgeData = knowledgeBase.value
    .filter(item => item.content.trim().length > 0)
    .map((info) => ({
      type: info.type,
      content: info.content.trim(),
    }));

  isRequestInProgress.value = true;

  const url = `${useRuntimeConfig().public.url_base}/api/agent/know/create`;

  try {
    const response = await fetch(url, {
      method: "POST",
 
      body: JSON.stringify({
        user_id: users.info.uuid,
        metadata: knowledgeData,
      }),
    });

    if (!response.ok) {
      isRequestInProgress.value = false;
      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();

    if (json && json.success) {
      knowStore.updateKnowledge(knowledgeData);
      totalChunks.value = json.totalChunks || 0;
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
    errorMessage.value = t("agent.config.know.error_occurred");
    isAlertOpen.value = true;
  } finally {
    isRequestInProgress.value = false;
  }
};

onMounted(async () => {
  if (knowStore.knowledge.metadata.length == 0) {
    const url = `${
      useRuntimeConfig().public.url_base
    }/api/agent/know/list?user_id=${users.info.uuid}`;
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
        console.log(json.data);
        knowStore.updateKnowledge(json.data?.metadata);
        knowledgeBase.value = json.data?.metadata || [{ type: "presentation", content: "" }];
        totalChunks.value = json.data?.total_chunks || 0;
      }
    } catch (err) {
      errorMessage.value = t("agent.config.know.error_occurred");
    }
  }
});
 
watchEffect(() => {
  if (knowStore.knowledge.metadata && knowStore.knowledge.metadata.length > 0) {
    knowledgeBase.value = knowStore.knowledge.metadata;
  } else {
    knowledgeBase.value = [{ type: "presentation", content: "" }];
  }
});
</script>