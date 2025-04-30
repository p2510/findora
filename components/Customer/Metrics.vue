<template>
  <div class="grid grid-cols-12 gap-5">
    <CustomerImport
      @submit="fetchCustomers"
      class="col-span-6 lg:col-span-4 2xl:col-span-3"
    />
    <CustomerSynchro
      @submit="fetchCustomers"
      class="col-span-6 lg:col-span-4 2xl:col-span-3"
    />

    <div
      @click="isOpen = true"
      class="cursor-pointer border-[1.8px] border-neutral-200 dark:border-neutral-700 rounded-md col-span-6 lg:col-span-4 2xl:col-span-3 p-3 bg-transparent dark:bg-neutral-900 relative overflow-hidden"
    >
      <div>
        <p class="pb-3 flex justify-between items-center z-10">
          <span class="text-sm text-slate-950 dark:text-white font-[500]">
            Gérer un groupe
          </span>
          <button
            class="flex items-center justify-center rounded-full p-2 text-slate-800 dark:text-white bg-[#ffbd59]/10 dark:bg-[#ffbd59]/20 transition duration-300 ease-in-out hover:bg-[#ffbd59]/20 dark:hover:bg-[#ffbd59]/30"
          >
            <UIcon name="i-heroicons-plus" />
          </button>
        </p>
        <p class="text-xs text-slate-700 dark:text-slate-300 font-[300]">
          Créer plusieurs groupes de contacts pour mieux cibler dans vos
          campagnes
        </p>
      </div>
    </div>

    <UModal v-model="isOpen">
      <div class="p-4 bg-white dark:bg-neutral-900 rounded-md">
        <h3 class="text-slate-700 dark:text-white text-sm pb-2">
          Créer un Nouveau Groupe
        </h3>
        <form class="space-y-2" @submit.prevent="addGroup">
          <InputFieldSimple
            v-model="formData.name"
            type="text"
            custom-class="hover:shadow-sm bg-[#dfb260]/30 dark:bg-[#dfb260]/20 p-2 rounded-md text-slate-700 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-300"
            placeholder="Nom du groupe"
          />
          <div v-if="errors.name.length" class="error text-red-500 text-xs">
            {{ errors.name[0] }}
          </div>
          <div class="col-span-full space-y-[1px]">
            <UButton
              :loading="isRequestInProgress"
              type="submit"
              size="sm"
              variant="solid"
              color="emerald"
            >
              Nouveau Groupe
            </UButton>
          </div>
        </form>

        <h3 class="text-slate-700 dark:text-white text-md font-[500] pt-5 pb-2">
          Vos Groupes
        </h3>
        <div class="grid grid-cols-12 gap-2">
          <span
            v-for="item in customerStore.groups"
            :key="item.id"
            class="flex items-center justify-between col-span-3 text-center p-2 rounded-md font-semibold text-sm text-slate-800 dark:text-white bg-slate-950/5 dark:bg-slate-200/5"
          >
            <i class="not-italic">{{ item.name }}</i>
            <UIcon
              @click="deleteGroups(item.id)"
              name="i-heroicons-x-mark"
              class="cursor-pointer text-red-700 w-3 h-3 hover:opacity-80 transition ease-in-out duration-300"
            />
          </span>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStat } from "@/stores/stat";
import { useCustomer } from "@/stores/customer";
const stat = useStat();
const customerStore = useCustomer();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { errors, validateForm, handleServerErrors } = useFormValidationGroup();

let isOpen = ref(false);
let isRequestInProgress = ref(false);
const formData = ref({
  name: "",
});

let ajouterGroupe = async () => {
  isRequestInProgress.value = true;
  const validationErrors = validateForm({
    name: formData.value.name,
  });
  if (validationErrors.global.length > 0) {
    isRequestInProgress.value = false;
    return;
  }
  try {
    const { data, error } = await supabase
      .from("groups")
      .insert([
        {
          name: formData.value.name,
          created_by: user.value.id,
        },
      ])
      .select();

    if (error) {
      if (error.code === "23505") {
        errorMessage.value =
          "Le nom du groupe doit être unique. Veuillez choisir un autre nom.";
      } else {
        handleServerErrors(error);
        errorMessage.value = error.message;
      }
      isRequestInProgress.value = false;
    } else {
      // Réinitialisation des champs si la soumission a réussi
      customerStore.updateGroup();
      formData.value.name = "";
      isRequestInProgress.value = false;
    }
  } catch (err) {
    handleServerErrors({ code: "23514", message: "Erreur serveur" });
    isRequestInProgress.value = false;
  }
};

const supprimerGroupes = async (id) => {
  const { error } = await supabase.from("groups").delete().eq("id", id);
  if (!error) {
    customerStore.updateGroup();
  }
};

onMounted(() => {
  customerStore.fetchCustomers();
  customerStore.fetchGroups();
});
</script>

<style scoped>
.error {
  color: red;
}
/* Effet de lumière */
.shine-effect {
  content: "";
  position: absolute;
  top: 0;
  left: -150%;
  width: 150%;
  height: 100%;
  background: linear-gradient(
    to right,
    transparent,
    rgba(255, 255, 255, 0.6),
    transparent
  );
  animation: shine 2.5s infinite;
  pointer-events: none; /* Empêche l'effet d'interférer avec les clics */
}

@keyframes shine {
  from {
    left: -150%;
  }
  to {
    left: 150%;
  }
}
</style>
