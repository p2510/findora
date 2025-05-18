<script setup>
import { ref, defineEmits } from "vue";
import { read, utils } from "xlsx";
import { useCustomer } from "@/stores/customer";
import { useStat } from "@/stores/stat";
import { formatPhone } from "@/utils/shared/format";

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
const progressInfo = ref({
  isVisible: false,
  current: 0,
  total: 0,
  percentage: 0
});
const emit = defineEmits(["submit"]);

// Taille des lots pour l'importation
const BATCH_SIZE = 500;

const closeErrorAlert = () => {
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

      // Afficher un avertissement si le nombre de contacts est élevé
      if (jsonData.length > 1000) {
        if (!confirm(`Vous allez importer ${jsonData.length} contacts. Cette opération peut prendre du temps. Voulez-vous continuer?`)) {
          return;
        }
      }

      await ajouterClientsParLots(jsonData);
    };
  } catch (error) {
    console.error("Erreur lors du traitement du fichier:", error);
    errorMessage.value = "Erreur lors du traitement du fichier.";
    isAlertOpen.value = true;
  }
};

const formatterDonnees = (contacts) => {
  return contacts.map((item) => ({
    ...item,
    phone: item.phone ? formatPhone(item.phone) : "",
    created_by: user.value.id,
    customer_type:
      item.customer_type &&
      ["Entreprise", "Particulier"].includes(item.customer_type)
        ? item.customer_type
        : "Particulier",
    email: item.email || "",
    address: item.address || "",
  }));
};

const ajouterClientsParLots = async (contacts) => {
  isRequestInProgress.value = true;
  progressInfo.value = {
    isVisible: true,
    current: 0,
    total: contacts.length,
    percentage: 0
  };
  
  try {
    // Diviser les contacts en lots
    const batches = [];
    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      batches.push(contacts.slice(i, i + BATCH_SIZE));
    }
    
    let totalImported = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const formattedBatch = formatterDonnees(batch);
      
      // Insertion dans la base de données
      const { data, error } = await supabase
        .from("customers")
        .insert(formattedBatch);
      
      if (error) {
        console.error(`Erreur lors de l'importation du lot ${i+1}:`, error);
        throw error;
      }
      
      // Mettre à jour la progression
      totalImported += batch.length;
      progressInfo.value.current = totalImported;
      progressInfo.value.percentage = Math.floor((totalImported / contacts.length) * 100);
      
      // Pause courte entre les lots pour éviter de surcharger la base de données
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }
    }
    
    emit("submit");
    customerStore.updatecustomers();
    stat.incrementCustomer(contacts.length);
    
    isOpen.value = false;
    
    // Notification de succès
    alert(`${contacts.length} contacts ont été importés avec succès.`);
    
  } catch (error) {
    console.error("Erreur lors de l'importation:", error);
    errorMessage.value = "Une erreur est survenue lors de l'importation. Vérifiez que votre fichier est compatible.";
    isAlertOpen.value = true;
  } finally {
    isRequestInProgress.value = false;
    progressInfo.value.isVisible = false;
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
            {{ $t('contact.import_excel.import_title') }}
          </span>
          <button
            class="flex items-center justify-center rounded-full p-2 text-slate-800 dark:text-white bg-[#ffbd59]/10 dark:bg-[#ffbd59]/20 transition duration-300 ease-in-out hover:bg-[#ffbd59]/20 dark:hover:bg-[#ffbd59]/30"
          >
            <UIcon name="i-heroicons-arrow-up-right" />
          </button>
        </p>
        <p class="text-xs text-slate-700 dark:text-slate-300 font-[300]">
          {{ $t('contact.import_excel.import_description') }}
        </p>
      </div>
    </div>

    <UModal v-model="isOpen">
      <UCard class="dark:bg-neutral-900 dark:text-white">
        <template #header>
          <div>
            <h5>
              <UBadge color="gray" variant="soft" size="lg">
                {{ $t('contact.import_excel.import_badge') }}
              </UBadge>
            </h5>
            <span class="text-gray-500 dark:text-gray-300 text-sm">
              {{ $t('contact.import_excel.file_format_requirement') }}
            </span>
          </div>
        </template>

        <form class="grid grid-cols-12 gap-4" @submit.prevent>
          <div class="col-span-full flex items-center justify-center gap-4">
            <p>
              <span class="text-gray-500 dark:text-gray-300 text-xs">
                {{ $t('contact.import_excel.compatibility_note') }}
                <a
                  href="/image/exemple_excel.png"
                  target="_blank"
                  class="rounded-md"
                >
                  <UBadge color="emerald" variant="solid" size="sm">
                    {{ $t('contact.import_excel.click_here') }}
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
              {{ $t('contact.import_excel.file_label') }}
            </label>
            <InputFiled
              type="file"
              accept=".xlsx, .xls"
              class="p-2 rounded-lg bg-white dark:bg-neutral-800 dark:text-white"
              @change="handleFileChange"
            />
          </div>

          <!-- Progress bar -->
          <div v-if="progressInfo.isVisible" class="col-span-full">
            <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
              <div 
                class="bg-blue-600 h-2.5 rounded-full" 
                :style="{ width: progressInfo.percentage + '%' }"
              ></div>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-300 mt-1">
              {{ $t('contact.import_excel.progress_text', {
                current: progressInfo.current,
                total: progressInfo.total,
                percentage: progressInfo.percentage
              }) }}
            </p>
          </div>

          <div class="col-span-full">
            <UButton
              :loading="isRequestInProgress"
              size="lg"
              variant="solid"
              color="black"
              type="button"
              :disabled="!fileData"
            >
              {{ $t('contact.import_excel.import_button') }}
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <div v-if="isAlertOpen">
      <AlertModal 
        :title="$t('contact.import_excel.error_title')" 
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
<style scoped>
.error {
  color: red;
}
</style>