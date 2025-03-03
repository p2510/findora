<template>
  <div class="mt-14 space-y-4 pr-4 grid grid-cols-12 items-start h-full">
    <div class="col-span-12 grid grid-cols-12 gap-3">
      <h2 class="col-span-full text-4xl text-slate-900 pb-4">
        Gérer vos templates
      </h2>
      <div class="col-span-6 lg:col-span-3 space-y-4">
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
      <div class="col-span-6 lg:col-span-4 space-y-4">
        <p
          class="bg-white/80 px-6 py-2 w-full font-semibold text-slate-800/80 rounded-lg shadow-md"
        >
          Vos templates 
        </p>
        <!--List template-->

        <SkeletonTemplateCard v-if="template.template == null" />
        <div class="space-y-4" v-if="template.template !== null">
          <SkeletonNotFound
            v-if="template.template.length == 0"
            title="Aucun template détecté"
            subtitle="actuellement"
            label-btn=" Créer votre premier template"
            to="/templates"
            custom-css="text-lg lg:text-xl xl:text-3xl "
          />
          <ul v-else class="space-y-2 overflow-y-auto h-[75vh] pb-8 pr-3">
            <TemplateCard
              v-for="template in template.template"
              :key="template.id"
              :id="template.id"
              :name="template.name"
              :content="template.content"
              :created_at="template.created_at"
              @template-delete="deleteTemplate"
            />
          </ul>
        </div>
      </div>
      <div class="hidden lg:block lg:col-span-4 space-y-4">
        <p
          class="bg-white/80 px-6 py-2 w-full font-semibold text-slate-800/80 rounded-lg shadow-md"
        >
          Templates préfinis
        </p>
        <SkeletonTemplateCard v-if="template.template_predicated == null" />
        <!--List template-->
        <ul class="space-y-2 overflow-y-scroll h-[75vh] pb-8 pr-3" v-else>
          <li
            class="rounded-xl p-4 bg-[#eeeff0]/50 hover:shadow-md transition duration-500 ease-in-out"
            v-for="template in template.template_predicated"
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
    
      <div class="p-4">
        <div class="space-y-6">
          <h4
            class="text-slate-800 text-lg font-semibold pb-2 flex justify-between"
          >
            <span> Création  template</span>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="closeModal"
            />
          </h4>
          <form class="grid grid-cols-12 gap-4" @submit.prevent="Add">
            <div class="col-span-full space-y-[1px]">
              <label for="name" class="text-gray-500 font-semibold"
                >Nom de votre template</label
              >
              <InputFiled
                type="text"
                custom-class="hover:shadow-sm p-2 rounded-lg"
                v-model="formData.name"
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
                v-model="formData.content"
                class="hover:shadow-sm p-2 rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-[#f3c775]"
                rows="7"
                maxlength="160"
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
import { ref, onMounted } from "vue";
definePageMeta({
  middleware: "auth",
  alias: "/templates",
});
useHead({
  title: "Findora - Template",
});
import { useTemplate } from "@/stores/template";
const template = useTemplate();
const { errors, validateForm, handleServerErrors } = useFormValidationTemplate();
const supabase = useSupabaseClient();
const isOpen = ref(false); // open choice of template
let showFormModal = ref(false);
const errorMessage = ref("");
const isAlertOpen = ref(false);
let closeErrorAlert = () => {
  isAlertOpen.value = false;
};

let closeModal = () => {
  isOpen.value = false;
  showFormModal.value = false;
};

// Add template
const user = useSupabaseUser();

const isRequestInProgress = ref(false);
let formData = ref({
  name: "",
  content: "",
});
let Add = async () => {
  isRequestInProgress.value = true;
  const validationErrors = validateForm({
    name: formData.value.name,
    content: formData.value.content,
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
          name: formData.value.name,
          content: formData.value.content,
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
      formData.value.name = "";
      formData.value.content = "";
      isRequestInProgress.value = false;
      isOpen.value = false;
      fetchTemplate();
      emit("submit"); // Émettre un événement pour informer que le client a été créé
    }
  } catch (err) {
    handleServerErrors({ code: "23514", message: "Erreur serveur" });
    isRequestInProgress.value = false;
  }
};

const status = ref("idle");
const fetchTemplate= async () => {
  status.value = "pending";
  const { data, error } = await supabase.from("templates").select("*");
  if (error) {
    status.value = "error";
  } else {
    template.template = data;
    status.value = "success";
  }
};
onMounted(() => {
  if (template.template == null) {
    fetchTemplate();
  }
  if (template.template_predicated == null) {
    fetchTemplatePredicated();
  }
});

const deleteTemplate = async (id) => {
  const { error } = await supabase.from("templates").delete().eq("id", id);
  if (!error) {
    fetchTemplate();
  }
};

const fetchTemplatePredicated = async () => {
  const { data, error } = await supabase
    .from("templates_predicted")
    .select("*");
  if (error) {
  } else {
    template.template_predicated = data;
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
