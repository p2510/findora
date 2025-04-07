<template>
  <div class="flex justify-center">
    <section class="mt-8 p-5 w-full">
      <h3 class="text-lg pb-5 text-slate-950 flex gap-2 items-center">
        <span
          class="text-white flex items-center justify-center rounded-full px-3 py-[2px] bg-[#21a150]"
          >2</span
        >
        <span class="font-[500]">Connaissance de base</span>
      </h3>
      <form @submit.prevent="saveAgentKnow" class="grid grid-cols-12">
        <div class="col-span-full flex flex-col gap-6">
          <!-- Section Connaissances de base -->
          <div class="w-full">
            <label class="text-md text-slate-800">Connaissances de base</label>
            <p class="text-xs text-slate-600 pb-2">
              Ajoutez des informations liées à produit, site web, service ou
              réseaux sociaux...
            </p>

            <div
              v-for="(info, index) in knowledgeBase"
              :key="index"
              class="space-y-3 mb-4"
            >
              <div class="w-1/4">
                <select
                  v-model="info.type"
                  class="rounded-md text-sm p-2 bg-transparent outline-none border-[1.5px] border-solid focus:rounded-lg text-slate-950 w-full"
                >
                  <option value="presentation">Présentation</option>
                  <option value="produit">Produit</option>
                  <option value="service">Service</option>
                  <option value="site web">Site Web</option>
                  <option value="faq">FAQ</option>
                  <option value="réseaux sociaux">Réseaux Sociaux</option>
                </select>
              </div>
              <div class="">
                <textarea
                  v-model="info.content"
                  class="rounded-md text-sm px-2 p-2 bg-transparent outline-none border-[1.5px] border-solid focus:rounded-lg w-full transition duration-300 ease-in-out text-slate-950 focus:border-[#f3c775]"
                  placeholder="Entrez le contenu lié au type sélectionné"
                  rows="6"
                  :disabled="!configStore.config?.name"
                ></textarea>
              </div>

              <!-- Bouton supprimer spécifique à chaque élément -->
              <div class="flex gap-2 items-center">
                <button
                  :disabled="!configStore.config?.name"
                  type="button"
                  @click="removeKnowledge(index)"
                  class="bg-red-500 hover:bg-red-700 text-white rounded-md py-2 px-3 transition duration-300 ease-in-out"
                >
                  Supprimer
                </button>
              </div>
            </div>

            <!-- Bouton Ajouter une connaissance -->
            <div class="flex gap-2 items-center">
              <button
                :disabled="!configStore.config?.name"
                type="button"
                @click="addKnowledge"
                class="bg-emerald-500 hover:bg-emerald-700 text-white rounded-md py-2 px-3 transition duration-300 ease-in-out"
              >
                Ajouter une connaissance
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
          >
            <span> Sauvegarder</span>
          </UButton>
        </div>
      </form>
    </section>

    <!-- Alertes -->
    <div v-if="isAlertOpen">
      <AlertModal
        title="Informations incorrectes"
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
import { useAgentKnow } from "@/stores/agent/know";

const users = useUser();
const knowStore = useAgentKnow();
const configStore = useAgentConfig();

const isRequestInProgress = ref(false);

// Variables pour les connaissances
const knowledgeBase = ref([{ type: "presentation", content: "" }]);

// Fonction pour ajouter une nouvelle connaissance
const addKnowledge = () => {
  knowledgeBase.value.push({ type: "presentation", content: "" });
};

// Fonction pour supprimer une connaissance spécifique
const removeKnowledge = (index) => {
  knowledgeBase.value.splice(index, 1); // Supprime l'élément à l'index spécifié
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
  // Ajoutez les connaissances à la configuration de l'agent
  const knowledgeData = knowledgeBase.value.map((info) => ({
    type: info.type,
    content: info.content,
  }));

  isRequestInProgress.value = true;

  const url = "https://app.myfindora.com/api/agent/know/create";

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
      knowStore.updateKnowledge(knowledgeBase.value);
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
  console.log(knowStore.knowledge)
  if (knowStore.knowledge.metadata.length == 0) {
    const url = `https://app.myfindora.com/api/agent/know/list?user_id=${users.info.uuid}`;
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
        console.log(json.data)
        knowStore.updateKnowledge(json.data?.metadata);
        knowledgeBase.value = json.data?.metadata;
      }
    } catch (err) {
      errorMessage.value =
        "Une erreur s'est produite lors de l'enregistrement.";
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
