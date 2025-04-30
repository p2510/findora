<template>
  <section class="px-10 lg:px-12">
    <h4
      class="text-slate-900 dark:text-white text-2xl lg:text-4xl pb-2 flex items-center justify-between"
    >
      <p>
        Lancez une nouvelle
        <span
          class="bg-clip-text text-transparent bg-gradient-to-r from-[#25D366] to-[#1e6337] dark:from-[#25D366] dark:to-[#1e6337]"
        >
          campagne
        </span>
      </p>
      <p
        class="rounded-lg px-4 py-2 bg-[#25D366]/20 dark:bg-[#25D366]/10 flex justify-between items-center"
      >
        <span class="text-slate-800 text-xs dark:text-white">
          <i class="font-semibold not-italic">{{
            users.subscription.max_campaigns
          }}</i>
          Campagnes restantes
        </span>
      </p>
    </h4>

    <form class="grid grid-cols-12 gap-4 pt-6" @submit.prevent="handleSubmit">
      <div class="col-span-full space-y-3 relative">
        <label for="content" class="text-gray-500 dark:text-gray-300"
          >Créons le contenu de votre campagne !</label
        >
        <div class="relative">
          <textarea
            v-model="formData.content"
            autofocus
            class="border-2 border-slate-200 text-sm p-4 rounded-3xl bg-slate-100/60 dark:bg-slate-800/60 outline-none text-slate-800 dark:text-white w-full"
            rows="8"
            minlength="3"
          >
          </textarea>
          <div class="absolute top-2 right-2 flex flex-wrap gap-1">
            <button
              v-for="variable in availableVariables"
              :key="variable.key"
              type="button"
              @click="insertVariable(variable.key)"
              class="text-xs px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
            >
              {{ variable.label }}
            </button>
          </div>
          <button
            @click="showPreview = true"
            type="button"
            class="bg-slate-700 hover:bg-slate-800 transition ease-in-out duration-300 px-2 py-[3px] rounded-md z-40 absolute text-sm bottom-4 left-4 text-white"
          >
            Aperçu
          </button>
          <button
            @click="showIA = true"
            type="button"
            class="animate-pulse bg-gradient-to-tr px-2 py-[3px] rounded-md from-yellow-400 to-yellow-600 z-40 absolute text-sm bottom-4 right-4 text-white"
          >
            Générer avec IA
          </button>
        </div>
      </div>

      <div class="col-span-full flex items-end gap-4 mb-12">
        <CampaignCustomerSelection v-model="formData.customers" />
      </div>

      <div class="col-span-full flex justify-center items-center gap-4">
        <button
          class="p-4 rounded-xl border-2 border-emerald-600 outline-3 focus:outline outline-emerald-600/40 flex flex-col gap-2"
          type="button"
          @click="sendNow"
        >
          <p class="flex justify-between">
            <span class="text-lg text-slate-800 dark:text-white"
              >Envoyer maintenant</span
            >
            <UIcon
              v-if="!isScheduled"
              name="i-heroicons-check-circle"
              class="w-6 h-6 text-emerald-600"
            />
          </p>
          <span
            class="hidden md:block text-xs text-slate-800 dark:text-gray-300"
          >
            Si vous souhaitez envoyer à vos contacts dès maintenant.
          </span>
        </button>
        <button
          class="p-4 rounded-xl border-2 border-emerald-600 outline-3 focus:outline outline-emerald-600/40 flex flex-col gap-2"
          type="button"
          @click="programCampaign"
        >
          <p class="flex justify-between">
            <span class="text-lg text-slate-800 dark:text-white"
              >Programmer</span
            >
            <UIcon
              v-if="isScheduled"
              name="i-heroicons-check-circle"
              class="w-6 h-6 text-emerald-600"
            />
          </p>
          <span
            class="hidden md:block text-xs text-slate-800 dark:text-gray-300"
          >
            Si vous souhaitez l'envoyer plus tard à vos contacts.
          </span>
        </button>

        <UButton
          :loading="isProgress"
          type="submit"
          size="xl"
          variant="solid"
          color="emerald"
          class="flex justify-around items-center gap-2 p-4"
        >
          <UIcon name="i-heroicons-paper-airplane" class="h-6 w-6" />
          <span>Lancer</span>
        </UButton>
      </div>

      <div v-if="isScheduled" class="col-span-full space-y-3">
        <label for="scheduleDate" class="text-gray-500 dark:text-gray-300"
          >Choisissez la date</label
        >
        <input
          v-model="formData.scheduleDate"
          type="date"
          id="scheduleDate"
          class="border-2 border-slate-200 text-sm p-4 rounded-3xl bg-slate-100/60 dark:bg-slate-800/60 outline-none text-slate-800 dark:text-white w-full"
        />
      </div>
    </form>

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
        title="Campagne validée"
        type="success"
        @close-alert="closeSuccessAlert"
      >
        <template #message>
          <p>{{ successMessage }}</p>
        </template>
      </AlertModal>
    </div>

    <UModal v-model="showIA">
      <UCard class="dark:bg-neutral-900 dark:text-white">
        <template #header>
          <div>
            <h5>
              <UBadge color="gray" variant="soft" size="lg"
                >Générer avec IA</UBadge
              >
            </h5>
            <span class="text-gray-500 dark:text-gray-300 text-sm">
              Décrivrez ce que vous voulez pour votre campagne
            </span>
          </div>
        </template>

        <form class="grid grid-cols-12 gap-4" @submit.prevent>
          <div class="col-span-full flex items-center justify-center gap-4">
            <textarea
              v-model="senderMessage"
              class="border-2 border-slate-100 text-sm p-4 rounded-3xl bg-slate-100/20 dark:bg-slate-800/60 outline-none text-slate-800 dark:text-white w-full"
              rows="5"
              minlength="3"
              maxlength="150"
            >
            </textarea>
          </div>

          <div class="col-span-full">
            <UButton
              @click="generateContent"
              :loading="isRequestIA"
              size="lg"
              variant="solid"
              color="black"
            >
              Génerer
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>
    <!-- Message preview section -->
    <UModal v-model="showPreview" v-if="formData.customers.length > 0">
      <UCard class="dark:bg-neutral-900 dark:text-white">
        <template #header>
          <div>
            <h5>
              <UBadge color="gray" variant="soft" size="lg">Aperçu </UBadge>
            </h5>
            <span class="text-gray-500 dark:text-gray-300 text-sm">
              Découvrez en avance un aperçu
            </span>
          </div>
        </template>

        <div class="col-span-full mb-4">
          <div
            class="border-2 border-slate-200 p-4 rounded-lg bg-slate-50 dark:bg-slate-800"
          >
            <h3 class="text-md text-slate-800 dark:text-white mb-2">
              Aperçu du message
            </h3>
            <div class="flex items-center gap-4 mb-2">
              <div class="flex-1">
                <label class="text-sm text-slate-500 dark:text-slate-400"
                  >Destinataire</label
                >
                <select
                  v-model="previewCustomerIndex"
                  class="w-full p-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                >
                  <option
                    v-for="(customer, index) in formData.customers"
                    :key="index"
                    :value="index"
                  >
                    {{ customer.name || "Client " + (index + 1) }} ({{
                      customer.phone
                    }})
                  </option>
                </select>
              </div>
            </div>
            <div class="p-3 bg-white dark:bg-slate-900 rounded-lg">
              <div class="w-full">
                <div
                  class="w-full bg-[#E1FFC7] dark:bg-emerald-800/80 p-3 rounded-lg"
                >
                  <p class="text-slate-800 dark:text-white whitespace-pre-wrap">
                    {{ previewMessage }}
                  </p>
                  <p
                    class="text-xs text-slate-500 dark:text-slate-400 text-right mt-1"
                  >
                    {{ formatTime(new Date()) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </UModal>
  </section>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { useUser } from "@/stores/user";
import { useWhatsapp } from "@/stores/whatsapp";
const whatsappStore = useWhatsapp();
const users = useUser();
const supabase = useSupabaseClient();
const formData = ref({
  customers: [],
  content: "",
  scheduleDate: null,
});
let isProgress = ref(false);
const isScheduled = ref(false);
const errorMessage = ref("");
const isAlertOpen = ref(false);
let showPreview = ref(false);
let closeErrorAlert = () => {
  isAlertOpen.value = false;
};
let successMessage = ref("");
const isSuccessOpen = ref(false);
let closeSuccessAlert = () => {
  isSuccessOpen.value = false;
};

// Variables pour l'aperçu du message
const previewCustomerIndex = ref(0);

// Variables pour l'effet typewriter
const isTyping = ref(false);
const typingSpeed = ref(50); // Vitesse de frappe (ms)
const generatedContent = ref(""); // Contient le texte complet généré par l'IA

// Variables disponibles pour la personnalisation
const availableVariables = [
  { key: "name", label: "Nom" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Téléphone" },
];

// Insérer une variable à la position du curseur dans le textarea
function insertVariable(key) {
  const textarea = document.querySelector("textarea");
  if (!textarea) return;

  const startPos = textarea.selectionStart;
  const endPos = textarea.selectionEnd;
  const textBefore = formData.value.content.substring(0, startPos);
  const textAfter = formData.value.content.substring(endPos);

  formData.value.content = `${textBefore}{${key}}${textAfter}`;

  // Replacer le curseur après la variable insérée
  setTimeout(() => {
    textarea.focus();
    textarea.selectionStart = textarea.selectionEnd = startPos + key.length + 2;
  }, 0);
}

// Fonction pour formater l'heure pour l'aperçu du message
function formatTime(date) {
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Message personnalisé pour l'aperçu
const previewMessage = computed(() => {
  if (formData.value.customers.length === 0) return formData.value.content;

  const selectedCustomer = formData.value.customers[previewCustomerIndex.value];
  if (!selectedCustomer) return formData.value.content;

  // Remplacer les variables par les valeurs du client
  let message = formData.value.content;
  for (const variable of availableVariables) {
    const regex = new RegExp(`{${variable.key}}`, "g");
    message = message.replace(regex, selectedCustomer[variable.key] || "");
  }

  return message;
});

function sendNow() {
  isScheduled.value = false;
  formData.value.scheduleDate = null;
}

function programCampaign() {
  isScheduled.value = true;
}

// Fonction pour l'effet machine à écrire
function typewriterEffect(text) {
  isTyping.value = true;
  formData.value.content = ""; // Réinitialiser le textarea
  generatedContent.value = text;

  let i = 0;
  const typeNextChar = () => {
    if (i < text.length) {
      formData.value.content += text.charAt(i);
      i++;
      setTimeout(typeNextChar, typingSpeed.value);
    } else {
      isTyping.value = false;
    }
  };

  typeNextChar();
}

// send or program
let handleSubmit = async () => {
  isProgress.value = true;
  if (isScheduled.value && !formData.value.scheduleDate) {
    isProgress.value = false;
    isAlertOpen.value = true;
    errorMessage.value = "Veuillez choisir une date avant de programmer. ";

    return;
  }

  if (!isScheduled.value) {
    const url = `${
      useRuntimeConfig().public.url_base
    }/api/whatsapp/send-message`;

    try {
      const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          customers: formData.value.customers,
          content: formData.value.content, // Le contenu contient les variables qui seront remplacées côté serveur
          token: whatsappStore.whatsapp_backlogs.token,
          user_id: users.info.uuid,
        }),
      });

      if (!response.ok) {
        isProgress.value = false;
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();

      if (json && json.success) {
        isProgress.value = false;
        isSuccessOpen.value = true;
        successMessage.value = "Votre campagne a bien été envoyée.";
        users.subscription.max_campaigns =
          users.subscription.max_campaigns - formData.value.customers.length;
      } else {
        isProgress.value = false;
        errorMessage.value = json.message;
        isAlertOpen.value = true;
      }
    } catch (error) {
      isProgress.value = false;
      errorMessage.value = error.message;
      isAlertOpen.value = true;
    }
  } else {
    const today = new Date();
    const chosenDate = new Date(formData.value.scheduleDate);
    if (chosenDate < today) {
      isProgress.value = false;
      isAlertOpen.value = true;
      errorMessage.value =
        "La date choisie est déjà passée. Veuillez en sélectionner une autre.";
      return;
    }
    const { data: subscription, error } = await supabase
      .from("subscriptions")
      .select("max_campaigns")
      .single();
    if (subscription.max_campaigns < formData.value.customers.length) {
      isProgress.value = false;
      isAlertOpen.value = true;
      errorMessage.value = "Le volume de message est insuffisant";
      return;
    }

    try {
      const chunkArray = (array, size) => {
        return Array.from(
          { length: Math.ceil(array.length / size) },
          (_, index) => array.slice(index * size, index * size + size)
        );
      };
      const customerChunks = chunkArray(formData.value.customers, 10);
      const insertPromises = customerChunks.map(async (chunk) => {
        return supabase.from("whatsapp_campaigns_schedule").insert({
          customers: chunk,
          content: formData.value.content, // Le contenu contient les variables qui seront remplacées lors de l'envoi
          user_id: users.info.uuid,
          token: whatsappStore.whatsapp_backlogs.token,
          send_date: formData.value.scheduleDate,
          is_sent: false,
        });
      });
      const results = await Promise.all(insertPromises);

      if (results.length > 0 && results[0].error) {
        errorMessage.value = results[0].error.message;
        isAlertOpen.value = true;
        isRequestInProgress.value = false;
      } else {
        // Réinitialisation des champs si la soumission a réussi
        users.subscription.max_campaigns =
          users.subscription.max_campaigns - formData.value.customers.length;

        await supabase
          .from("subscriptions")
          .update({
            max_campaigns: users.subscription.max_campaigns,
          })
          .eq("user_id", users.info.uuid)
          .select();

        isSuccessOpen.value = true;
        successMessage.value = "Votre campagne a bien été programmée.";
        formData.value.customers = [];
        formData.value.content = "";
        formData.value.scheduleDate = null;
        isProgress.value = false;
      }
    } catch (err) {
      isProgress.value = false;
    }
  }
};

// generate by IA
let showIA = ref(false);
let isRequestIA = ref(false);
let senderMessage = ref("");
let responseMessage = ref("");
let generateContent = async () => {
  isRequestIA.value = true;
  const url = `${
    useRuntimeConfig().public.url_base
  }/api/whatsapp/generate-message`;

  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        content: senderMessage.value,
      }),
    });

    if (!response.ok) {
      isRequestIA.value = false;

      throw new Error(`Response status: ${response.status}`);
    }

    const json = await response.json();

    if (json && json.success) {
      isRequestIA.value = false;
      responseMessage.value = json.response;
      showIA.value = false;

      // Appliquer l'effet machine à écrire
      typewriterEffect(json.response);
    } else {
      isRequestIA.value = false;
    }
  } catch (error) {
    isRequestIA.value = false;
  }
};
</script>

<style scoped>
h4 {
  font-weight: 300;
}

/* Style pour le curseur clignotant (optionnel) */
@keyframes blink {
  from,
  to {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

textarea:focus {
  caret-color: auto; /* Couleur du curseur par défaut */
}

.typing textarea:focus {
  caret-color: transparent; /* Cache le curseur pendant l'animation */
}
</style>
