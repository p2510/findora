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
          :options="customerStore.groups"
          option-attribute="name"
          size="sm"
          color="black"
          variant="none"
          :ui="{
            base: ' hover:shadow-sm rounded-lg hover:shadow-sm rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-[#f3c775]',
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
        :disabled="props.customers.length == 0 || !formDataGroup.group_id"
        class="rounded-md basis-1/4 flex justify-center"
      >
        Intégrer
      </UButton>
    </form>

    <!-- Modal de succès -->
    <div v-if="isSuccessOpen">
      <AlertModal
        title="Campagne réussie"
        type="success"
        @close-alert="closeSuccessAlert"
      >
        <template #message>
          <p>Le(s) contact(s) ont été ajoutés au groupe avec succès.</p>
        </template>
      </AlertModal>
    </div>

    <!-- Modal d'erreur -->
    <div v-if="isAlertOpen">
      <AlertModal
        title="Information incorrecte"
        type="error"
        @close-alert="closeErrorAlert"
      >
        <template #message>
          <p>{{ errorMessage }}</p>
        </template>
      </AlertModal>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useCustomer } from "@/stores/customer";
const customerStore = useCustomer();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
let formDataGroup = ref({
  group_id: null,
});
let isRequestInProgress = ref(false);

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
  const formattedCustomers = props.customers.map((customer) => ({
    customers_id: customer.id,
    groups_id: formDataGroup.value.group_id?.id,
    created_by: user.value.id,
  }));

  try {
    const { data, error } = await supabase
      .from("groups_customers")
      .insert(formattedCustomers)
      .select();

    if (error) {
      if (error.code === "23505") {
        errorMessage.value = "Ce contact est déjà dans ce groupe";
      } else {
        errorMessage.value = error.message;
      }
      isAlertOpen.value = true;
      isRequestInProgress.value = false;
    } else {
      formDataGroup.value.group_id = null;
      isRequestInProgress.value = false;
      isSuccessOpen.value = true;
      customerStore.fetchCustomers();

    }
  } catch (err) {
   
    errorMessage.value = "Erreur serveur";
    isRequestInProgress.value = false;
    isAlertOpen.value = true;
  }
};

onMounted(() => {});
</script>
