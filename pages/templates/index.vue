<template>
  <div class="mt-14 space-y-4 pr-4 grid grid-cols-12 items-start h-full">
    <div class="col-span-12 grid grid-cols-12 gap-3">
      <h2 class="col-span-full text-4xl text-slate-900 pb-4">
        Gérer vos templates
      </h2>
      <div class="col-span-3 space-y-4">
        <p
          class="bg-white/80 px-6 py-2 w-full font-semibold text-slate-800/80 rounded-lg shadow-md"
        >
          Nouveauté
        </p>
        <ul class="space-y-2">
          <li
            class="rounded-xl p-4 space-y-2 bg-gradient-to-r from-white to-[#eeeff0]/30"
          >
            <p class="flex justify-center grayscale">
              <img
                src="~/assets/img/createAdd.png"
                alt="Image de création de template"
                class="rounded-lg"
              />
            </p>
            <h5 class="text-md">Nouveau template</h5>
            <p class="text-sm text-slate-900/80">
              Les templates vous offrent plusieurs modèles prédéfinis,
              permettant ainsi de
              <span class="font-semibold"> gagner du temps.</span>
            </p>
            <button
              @click="isOpen = true"
              class="flex justify-center gap-2 bg-slate-800/20 hover:bg-slate-800/30 text-sm py-2 px-3 rounded-lg text-slate-800 w-full border-slate-800/50 border-2 hover:shadow-lg transition duration-500 ease-in-out"
            >
              <UIcon name="i-heroicons-plus" class="w-5 h-5" />
              <span> Créer un template</span>
            </button>
          </li>
        </ul>
      </div>
      <div class="col-span-4 space-y-4">
        <p
          class="bg-white/80 px-6 py-2 w-full font-semibold text-slate-800/80 rounded-lg shadow-md"
        >
          Vos templates SMS
        </p>
        <!--List template-->
        <SkeletonNotFound
          v-if="templates_Sms.length == 0"
          title="Aucun template détecté"
          subtitle="actuellement"
          label-btn=" Créer votre premier template"
          to="/templates"
          custom-css="text-lg lg:text-xl xl:text-3xl "
        />
        <ul v-else class="space-y-2 overflow-y-auto h-[75vh] pb-8 pr-3">
          <TemplateSmsCard
            v-for="template in templates_Sms"
            :key="template.id"
            :id="template.id"
            :name="template.name"
            :content="template.content"
            :created_at="template.created_at"
            @template-delete="deleteTemplate"
          />
        </ul>
      </div>
      <div class="col-span-4 space-y-4">
        <p
          class="bg-white/80 px-6 py-2 w-full font-semibold text-slate-800/80 rounded-lg shadow-md"
        >
          Templates préfinis
        </p>
        <!--List template-->
        <ul class="space-y-2 overflow-y-scroll h-[75vh] pb-8 pr-3">
          <li
            class="rounded-xl p-4 bg-[#eeeff0]/50 hover:shadow-md transition duration-500 ease-in-out"
            v-for="template in templates_Predicated"
            :key="template.id"
          >
            <div class="flex justify-between items-center gap-2">
              <p class="flex gap-2">
                <span
                  class="items-center flex gap-2 text-xs py-2 px-3 rounded-md"
                  :class="{
                    'bg-blue-200 text-blue-800':
                      template.category === 'Relance Paiement',
                    'bg-green-200 text-green-800':
                      template.category === 'Notification',
                    'bg-yellow-200 text-yellow-800':
                      template.category === 'Marketing',
                  }"
                >
                  <i class="not-italic">{{ template.category }}</i>
                </span>
              </p>
              <UDropdown
                :items="items"
                :popper="{ placement: 'bottom-start' }"
                @click="updateText(template.content)"
              >
                <UIcon name="i-heroicons-ellipsis-vertical" class="w-6 h-6" />
              </UDropdown>
            </div>
            <h4 class="pt-4 pb-[1px]">{{ template.name }}</h4>
            <p class="text-sm text-slate-900/80">
              {{ template.content?.slice(0, 50) }} ...
            </p>
          </li>
        </ul>
      </div>
    </div>
    <UModal v-model="isVisible">
      <div class="p-4">
        <p class="text-sm text-slate-900/80">{{ textContent }}</p>
      </div>
    </UModal>
    <UModal v-model="isOpen" prevent-close>
      <!--<div class="p-4 space-y-6" v-if="!showFormModal">
        <h4
          class="text-slate-800 text-lg font-semibold pb-2 flex justify-between"
        >
          <span> Quel template souhaitez-vous créer ?</span>
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-x-mark-20-solid"
            class="-my-1"
            @click="closeModal"
          />
        </h4>
        <ul class="flex justify-between gap-4">
          <li
            :class="
              !isEmailTemplate
                ? 'basis-1/2 rounded-xl p-3 flex justify-between gap-2 bg-[#f3c775] items-center cursor-pointer'
                : 'basis-1/2 rounded-xl p-3 flex justify-between gap-2 bg-slate-800/10 items-center cursor-pointer'
            "
            @click="isEmailTemplate = false"
          >
            <button class="flex justify-start gap-2 items-center">
              <UIcon
                name="i-heroicons-chat-bubble-bottom-center-text"
                :class="
                  !isEmailTemplate
                    ? 'w-10 h-10 text-white'
                    : 'w-10 h-10 text-slate-800'
                "
              />
              <span
                :class="
                  !isEmailTemplate
                    ? 'text-2xl text-white'
                    : 'text-2xl text-slate-800'
                "
                >SMS
              </span>
            </button>
            <span class="w-10 h-10 text-white" v-if="!isEmailTemplate">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="size-10"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </li>
          <li
            :class="
              isEmailTemplate
                ? 'basis-1/2 rounded-xl p-3 flex justify-between items-center gap-2 bg-[#f3c775]  cursor-pointer'
                : 'basis-1/2 rounded-xl p-3 flex justify-between gap-2 bg-slate-800/10 items-center cursor-pointer'
            "
            @click="isEmailTemplate = true"
          >
            <button class="flex justify-start gap-2 items-center">
              <UIcon
                name="i-heroicons-envelope"
                :class="
                  isEmailTemplate
                    ? 'w-10 h-10 text-white'
                    : 'w-10 h-10 text-slate-800'
                "
              />
              <span
                :class="
                  isEmailTemplate
                    ? 'text-2xl text-white'
                    : 'text-2xl text-slate-800'
                "
                >Email
              </span>
            </button>
            <span v-if="isEmailTemplate" class="w-10 h-10 text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="size-10"
              >
                <path
                  fill-rule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </li>
        </ul>
        <button
          @click="showEmailForm"
          class="w-full text-white bg-blue-700 hover:bg-blue-800 rounded-full shadow-md text-xl px-3 py-4 transition-all duration-300 ease-in-out"
        >
          Continue
        </button>
      </div>-->
      <div class="p-4">
        <div class="space-y-6">
          <h4
            class="text-slate-800 text-lg font-semibold pb-2 flex justify-between"
          >
            <span> Création SMS template</span>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="closeModal"
            />
          </h4>
          <form class="grid grid-cols-12 gap-4" @submit.prevent="AddSms">
            <div class="col-span-full space-y-[1px]">
              <label for="name" class="text-gray-500 font-semibold"
                >Nom de votre template</label
              >
              <InputFiled
                type="text"
                custom-class="hover:shadow-sm p-2 rounded-lg"
                v-model="formDataSms.name"
              />
              <div v-if="errors.name.length" class="error">
                {{ errors.name[0] }}
              </div>
            </div>
            <div class="col-span-full space-y-[1px]">
              <label for="content" class="text-gray-500 font-semibold"
                >Contenu de votre template</label
              >
              <textarea
                v-model="formDataSms.content"
                class="hover:shadow-sm p-2 rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-[#f3c775]"
                rows="7"
              ></textarea>
              <div v-if="errors.content.length" class="error">
                {{ errors.content[0] }}
              </div>
            </div>
            <div class="col-span-full space-y-[1px]">
              <UButton
                :loading="isRequestInProgress"
                type="submit"
                size="lg"
                variant="soft"
                color="emerald"
              >
                Créer ce template
              </UButton>
            </div>
          </form>
        </div>
      </div>
    </UModal>
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
definePageMeta({
  middleware: "auth",
  alias: "/templates",
});
const { errors, validateForm, handleServerErrors } = useFormValidationSms();
const supabase = useSupabaseClient();
const isOpen = ref(false); // open choice of template
let isEmailTemplate = ref(false); //  Check if email selected
let showFormModal = ref(false);
const errorMessage = ref("");
const isAlertOpen = ref(false);
let closeErrorAlert = () => {
  isAlertOpen.value = false;
};
let showEmailForm = () => {
  showFormModal.value = true;
};

let closeModal = () => {
  isOpen.value = false;
  showFormModal.value = false;
};

// Add template
const user = useSupabaseUser();

const isRequestInProgress = ref(false);
let formDataSms = ref({
  name: "",
  content: "",
});
let AddSms = async () => {
  isRequestInProgress.value = true;
  const validationErrors = validateForm({
    name: formDataSms.value.name,
    content: formDataSms.value.content,
  });

  if (validationErrors.global.length > 0) {
    isRequestInProgress.value = false;
    return;
  }

  try {
    const { data, error } = await supabase
      .from("templates")
      .insert([
        {
          name: formDataSms.value.name,
          content: formDataSms.value.content,
          created_by: user.value.id,
        },
      ])
      .select();

    if (error) {
      if (error.code === "23505") {
        errorMessage.value = "Erreur du serveur";
      } else {
        handleServerErrors(error);
        errorMessage.value = error.message;
      }
      isAlertOpen.value = true; // Affichage de l'alerte
      isRequestInProgress.value = false;
      isOpen.value = false;
    } else {
      // Réinitialisation des champs si la soumission a réussi
      formDataSms.value.name = "";
      formDataSms.value.content = "";
      isRequestInProgress.value = false;
      isOpen.value = false;
      fetchTemplateSms();
      emit("submit"); // Émettre un événement pour informer que le client a été créé
    }
  } catch (err) {
    console.error(err);
    handleServerErrors({ code: "23514", message: "Erreur serveur" });
    isRequestInProgress.value = false;
  }
};

const templates_Sms = ref([]);
const status = ref("idle");
const fetchTemplateSms = async () => {
  status.value = "pending";
  const { data, error } = await supabase.from("templates").select("*");
  if (error) {
    console.error("Error fetching templates:", error);
    status.value = "error";
  } else {
    templates_Sms.value = data || [];
    status.value = "success";
  }
};
onMounted(() => {
  fetchTemplateSms();
  fetchTemplatePredicated();
});
const deleteTemplate = async (id) => {
  const { error } = await supabase.from("templates").delete().eq("id", id);
  if (!error) {
    fetchTemplateSms();
  }
};
const templates_Predicated = ref([]);
const fetchTemplatePredicated = async () => {
  const { data, error } = await supabase
    .from("templates_predicted")
    .select("*");
  if (error) {
    console.error("Error fetching templates:", error);
  } else {
    templates_Predicated.value = data || [];
  }
};
let textContent = ref(null);
let updateText = (text) => {
  textContent.value = text;
};
let isVisible = ref(false);
const items = [
  [
    {
      label: "Lire tout",
      icon: "i-heroicons-eye",
      click: () => {
        isVisible.value = true;
      },
    },
  ],
];
</script>
<style scoped>
.error {
  color: red;
}
/* Styles de la scrollbar */
::-webkit-scrollbar {
  width: 10px; /* Largeur de la scrollbar */
  height: 10px; /* Hauteur (pour le scroll horizontal) */
}

::-webkit-scrollbar-track {
  background: #f1f1f1; /* Couleur de l'arrière-plan */
}

::-webkit-scrollbar-thumb {
  background: #888; /* Couleur de la "poignée" */
  border-radius: 5px; /* Arrondi */
}

::-webkit-scrollbar-thumb:hover {
  background: #555; /* Couleur au survol */
}
</style>
