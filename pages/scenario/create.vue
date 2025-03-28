<template>
  <section class="mt-14">
    <ScenarioNav />
    <section class="bg-dotted-pattern h-[75vh] grid grid-cols-12 relative px-4">
      <div class="col-span-8 flex flex-col items-center w-full pt-20">
        <!-- Déclencheur -->
        <ScenarioTrigger />

        <!-- Ligne verticale entre Déclencheur et Action -->
        <svg class="h-32 w-1 relative" xmlns="http://www.w3.org/2000/svg">
          <!-- Ligne verticale -->
          <line
            x1="50%"
            y1="0"
            x2="50%"
            y2="100%"
            stroke="#2563eb"
            stroke-width="2"
          />
          <!-- Cercle début -->
          <circle cx="50%" cy="0" r="4" fill="#2563eb" />
          <!-- Cercle fin -->
          <circle cx="50%" cy="100%" r="4" fill="#2563eb" />
        </svg>

        <!-- Action/Message -->
        <ScenarioAction />
      </div>
      <div class="col-span-4 pt-20">
        <ScenarioParams />
      </div>
      <div class="col-span-full flex justify-center items-center">
        <button
          v-if="triggerStore.triggerSelected && messageStore.content.length > 0"
          @click="handle"
          class="text-white bg-blue-600 hover:bg-blue-600/70 rounded-md shadow-md text-md py-3 px-5 transition-all duration-300 ease-in-out"
        >
          Créer ce scénario
        </button>
      </div>
    </section>
    <!-- Alerte d'erreur -->
    <div v-if="isAlertOpen">
      <AlertModal title="Erreur" type="error" @close-alert="closeErrorAlert">
        <template #message>
          <p>
            {{ errorMessage }}
          </p>
        </template>
      </AlertModal>
    </div>

    <div v-if="isSuccessOpen">
      <AlertModal
        title="scénario crée"
        type="success"
        @close-alert="closeSuccessAlert"
      >
        <template #message>
          <p>Votre scénario a été créé avec succès.</p>
        </template>
      </AlertModal>
    </div>
  </section>
</template>

<script setup>
definePageMeta({
  middleware: ["auth","is-entreprise"],
  alias: "/scenario/creer-scenario",
});
useHead({
  title:
    "Findora scenario -  Créez vos scénarios d et laissez l'automatisation faire le reste ! ✨",
});
import { useTrigger } from "@/stores/scenario/trigger";
import { useParams } from "@/stores/scenario/params";
import { useMessage } from "@/stores/scenario/message";
import { useWhatsapp } from "@/stores/whatsapp";

const triggerStore = useTrigger();
const paramsStore = useParams();
const messageStore = useMessage();
const whatsappStore = useWhatsapp();

const supabase = useSupabaseClient();
const user = useSupabaseUser();

const isRequestInProgress = ref(false);
const errorMessage = ref("");
const isAlertOpen = ref(false);
let closeErrorAlert = () => {
  isAlertOpen.value = false;
};
const isSuccessOpen = ref(false);
let closeSuccessAlert = () => {
  isSuccessOpen.value = false;
};

let handle = async () => {
  isRequestInProgress.value = true;

  console.log(triggerStore.data.id);
  console.log(triggerStore.triggerSelected);
  console.log(messageStore.content);
  console.log(paramsStore.paramsCustomer);
  
  try {
    if (whatsappStore.whatsapp_backlogs == null) {
      errorMessage.value =
        "Vous devez d'abord connecter votre WhatsApp. Pour cela, cliquez sur le bouton Intégration, puis sélectionnez WhatsApp.";
      isAlertOpen.value = true;
      isRequestInProgress.value = false;
      return;
    }

    const { data, error } = await supabase
      .from("scenarios")
      .insert([
        {
          created_by: user.value.id,
          trigger_id: triggerStore.data.id,
          trigger_on: triggerStore.triggerSelected,
          params:
            triggerStore.triggerSelected === "customer"
              ? paramsStore.paramsCustomer
              : {},
          message: messageStore.content,
          is_active: true,
        },
      ])
      .select();
      

    if (error) {
      console.log( error)
      if (error.code === "23505") {
        errorMessage.value = "Une erreur est survenue";
      } else {
        errorMessage.value = error.message;
      }
      isAlertOpen.value = true;
      isRequestInProgress.value = false;
    } else {
      isSuccessOpen.value = true;
      isRequestInProgress.value = false;
      triggerStore.$reset();
      paramsStore.$reset();
      messageStore.$reset();
    }
  } catch (err) {
    console.log( err)
    isRequestInProgress.value = false;
  }
};
</script>
<style scoped>
.bg-dotted-pattern {
  background-image: radial-gradient(circle, #0f111415 1px, transparent 1px);
  background-size: 16px 16px; /* Taille de la grille */
  background-position: center;
}
</style>
