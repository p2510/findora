<template>
  <div class="w-full flex justify-end">
    <form
      class="flex gap-2 items-center w-2/3 2xl:w-1/2"
      @submit.prevent="assignGroup"
    >
      <div class="basis-3/4">
        <USelectMenu
          searchable
          searchable-placeholder="Choisir un groupe..."
          v-model="formDataGroup.group_id"
          placeholder="Choisir un groupe"
          :options="groups"
          option-attribute="name"
          size="sm"
          color="black"
          variant="none"
          :ui="{
            base: ' hover:shadow-sm rounded-lg hover:shadow-sm  rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-[#f3c775]',
          }"
        >
        </USelectMenu>
      </div>
      <UButton
        :loading="isRequestInProgress"
        type="submit"
        size="sm"
        variant="solid"
        color="black"
        :disabled="props.customers.length == 0"
        class="rounded-md basis-1/4 flex justify-center"

        >Intégrer</UButton
      >
    </form>
    <div v-if="isSuccessOpen">
      <AlertModal
        title="Campagne effectué"
        type="success"
        @close-alert="closeSuccessAlert"
      >
        <template #message>
          <p>Client(s) ajouté(s) au groupe avec succès.</p>
        </template>
      </AlertModal>
    </div>
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

let groups = ref([]);
const supabase = useSupabaseClient();
const user = useSupabaseUser();
let formDataGroup = ref({
  group_id: null,
});
let isRequestInProgress = ref(false);
const fetchGroups = async () => {
  const { data, error } = await supabase.from("groups").select("*");
  if (error) {
  } else {
    groups.value = data || [];
  }
};
const props = defineProps({
  customers: Array,
});
const errorMessage = ref("");
const isAlertOpen = ref(false);
let closeErrorAlert = () => {
  isAlertOpen.value = false;
};
const isSuccessOpen = ref(false);
let closeSuccessAlert = () => {
  isSuccessOpen.value = false;
};

let assignGroup = async () => {
  //isRequestInProgress.value = true;
  const formattedCustomers = props.customers.map((customer) => ({
    customers_id: customer.id, // Prend uniquement l'ID du customer
    groups_id: formDataGroup.value.group_id?.id, // Ajoute l'ID du groupe
    created_by: user.value.id, // Ajoute l'utilisateur qui a créé l'entrée
  }));

  try {
    const { data, error } = await supabase
      .from("groups_customers")
      .insert(formattedCustomers)
      .select();

    if (error) {
      if (error.code === "23505") {
        errorMessage.value = "Ce client appartient déjà à ce groupe";
      } else {
        handleServerErrors(error);
        errorMessage.value = error.message;
      }
      isAlertOpen.value = true; // Affichage de l'alerte
      isRequestInProgress.value = false;
    } else {
      // Réinitialisation des champs si la soumission a réussi
      formDataGroup.value.group_id = null;
      isRequestInProgress.value = false;
      isSuccessOpen.value = true;
      emit("submit"); // Émettre un événement pour informer que le client a été créé
    }
  } catch (err) {
    handleServerErrors({ code: "23514", message: "Erreur serveur" });
    isRequestInProgress.value = false;
  }
};
onMounted(() => {
  fetchGroups();
});
</script>
