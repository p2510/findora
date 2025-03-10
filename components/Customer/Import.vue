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

const closeErrorAlert = () => {
  isAlertOpen.value = false;
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (file) {
    fileData.value = file;
    await processFile(file);
  }
};

const processFile = async (file) => {
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

      await addCustomers(jsonData);
    };
  } catch (error) {
    errorMessage.value = "Erreur lors du traitement du fichier.";
    isAlertOpen.value = true;
  }
};

const addCustomers = async (customers) => {
  isRequestInProgress.value = true;
  try {
    const formattedData = customers.map((item) => ({
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
    formattedData.forEach((customer) => {
      customerStore.incrementcustomerParticular(
        customer.customer_type === "Entreprise"
      );
    });
    isOpen.value = false;
  } catch (error) {
    errorMessage.value = "Votre fichier n'est pas compatible";
    isAlertOpen.value = true;
  } finally {
    isRequestInProgress.value = false;
  }
};
</script>

<template>
  <div>
    <button
      @click="isOpen = true"
      class="text-white hover:text-slate-50 bg-slate-800 hover:bg-slate-950 rounded-md shadow-md text-md p-3 transition-all duration-300 ease-in-out"
    >
      Importer
    </button>

    <UModal v-model="isOpen">
      <UCard>
        <template #header>
          <div>
            <h5>
              <UBadge color="gray" variant="soft" size="lg">Importation</UBadge>
            </h5>
            <span class="text-gray-500 text-sm"
              >Votre fichier doit être au format Excel</span
            >
          </div>
        </template>

        <form class="grid grid-cols-12 gap-4" @submit.prevent>
          <div class="col-span-full flex items-center justify-center gap-4">
            <p>
              <span class="text-gray-500 text-xs">
                Pour des raisons de compatibilité, nous avons préparé un
                exemple.
                <a href="/image/exemple_excel.png" target="blank" class="rounded-md bg"
                  ><UBadge color="emerald" variant="solid" size="sm"
                    >Cliquez ici</UBadge
                  ></a
                >
                .
              </span>
            </p>
          </div>
          <div class="col-span-full">
            <label for="file" class="text-gray-500 font-semibold"
              >Votre fichier</label
            >
            <InputFiled
              type="file"
              accept=".xlsx, .xls"
              class="p-2 rounded-lg"
              @change="handleFileChange"
            />
          </div>

          <div class="col-span-full">
            <UButton
              :loading="isRequestInProgress"
              size="lg"
              variant="solid"
              color="black"
              >Importer</UButton
            >
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
