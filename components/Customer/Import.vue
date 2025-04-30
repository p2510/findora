<script setup>
import { ref, defineEmits } from "vue";
import { read, utils } from "xlsx";
import { useCustomer } from "@/stores/customer";
import { useStat } from "@/stores/stat";


const stat = useStat();
const customerStore = useCustomer();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { errors, validateForm, handleServerErrors } = useFormValidation();
const isOpen = ref(false);
const isRequestInProgress = ref(false);
const errorMessage = ref("");
const isAlertOpen = ref(false);
const fileData = ref(null);
const emit = defineEmits(["submit"]);

const fermerAlerteErreur = () => {
  isAlertOpen.value = false;
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    fileData.value = file;
    await traiterFichier(file);
  }
};

const traiterFichier = async (file) => {
  try {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = utils.sheet_to_json(sheet);

      if (jsonData.length === 0) {
        errorMessage.value = "Le fichier est vide ou mal formaté.";
        isAlertOpen.value = true;
        return;
      }

      await ajouterClients(jsonData);
    };
  } catch (error) {
    errorMessage.value = "Erreur lors du traitement du fichier.";
    isAlertOpen.value = true;
  }
};

const ajouterClients = async (contacts) => {
  isRequestInProgress.value = true;
  try {
    const formattedData = contacts.map((item) => ({
      ...item,
      created_by: user.value.id,
      customer_type:
        item.customer_type &&
        ["Entreprise", "Particulier"].includes(item.customer_type)
          ? item.customer_type
          : "Particulier",
      email: "",
      address: "",
    }));

    const { data, error } = await supabase
      .from("customers")
      .insert(formattedData);
    if (error) throw error;
    emit("submit");
    customerStore.updatecustomers();
    stat.incrementCustomer(formattedData.length);

    isOpen.value = false;
  } catch (error) {
    errorMessage.value = "Votre fichier n'est pas compatible.";
    isAlertOpen.value = true;
  } finally {
    isRequestInProgress.value = false;
  }
};
</script>

<template>
  <div>
    <div
      @click="isOpen = true"
      class="cursor-pointer border-[1.8px] border-neutral-200 dark:border-slate-700 rounded-md col-span-6 lg:col-span-4 xl:col-span-3 p-3 bg-transparent dark:bg-neutral-900 relative overflow-hidden transition-colors"
    >
      <div>
        <p class="pb-3 flex justify-between items-center z-10">
          <span class="text-sm text-slate-950 dark:text-white font-[500]">
            Importer des contacts via Excel
          </span>
          <button
            class="flex items-center justify-center rounded-full p-2 text-slate-800 dark:text-white bg-[#ffbd59]/10 dark:bg-[#ffbd59]/20 transition duration-300 ease-in-out hover:bg-[#ffbd59]/20 dark:hover:bg-[#ffbd59]/30"
          >
            <UIcon name="i-heroicons-arrow-up-right" />
          </button>
        </p>
        <p class="text-xs text-slate-700 dark:text-slate-300 font-[300]">
          Importez vos contacts depuis vos fichiers Excel en un seul clic.
        </p>
      </div>
    </div>

    <UModal v-model="isOpen">
      <UCard class="dark:bg-neutral-900 dark:text-white">
        <template #header>
          <div>
            <h5>
              <UBadge color="gray" variant="soft" size="lg">Importation</UBadge>
            </h5>
            <span class="text-gray-500 dark:text-gray-300 text-sm">
              Votre fichier doit être au format Excel
            </span>
          </div>
        </template>

        <form class="grid grid-cols-12 gap-4" @submit.prevent>
          <div class="col-span-full flex items-center justify-center gap-4">
            <p>
              <span class="text-gray-500 dark:text-gray-300 text-xs">
                Pour des raisons de compatibilité, nous avons préparé un
                exemple.
                <a
                  href="/image/example_excel.png"
                  target="_blank"
                  class="rounded-md"
                >
                  <UBadge color="emerald" variant="solid" size="sm">
                    Cliquez ici
                  </UBadge> </a
                >.
              </span>
            </p>
          </div>

          <div class="col-span-full">
            <label
              for="file"
              class="text-gray-500 dark:text-gray-300 font-semibold"
            >
              Votre fichier
            </label>
            <InputFiled
              type="file"
              accept=".xlsx, .xls"
              class="p-2 rounded-lg bg-white dark:bg-neutral-800 dark:text-white"
              @change="handleFileChange"
            />
          </div>

          <div class="col-span-full">
            <UButton
              :loading="isRequestInProgress"
              size="lg"
              variant="solid"
              color="black"
            >
              Importer
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <div v-if="isAlertOpen">
      <AlertModal title="Erreur" type="error" @close-alert="closeErrorAlert">
        <template #message>
          <p>{{ errorMessage }}</p>
        </template>
      </AlertModal>
    </div>
  </div>
</template>

<style scoped>
.error {
  color: red;
}
</style>
