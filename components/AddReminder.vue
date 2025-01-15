<template>
  <div>
    <button
      @click="isOpen = true"
      class="group flex items-center gap-1.5 w-full text-sm rounded-md text-white bg-slate-800 hover:bg-slate-700 transition ease-in-out duration-300 p-2"
    >
      <UIcon name="i-heroicons-bolt" class="flex-shrink-0 w-4 h-4 text-white" />
      <span class="truncate text-xs">Relancer</span>
    </button>
    <UModal v-model="isOpen">
      <div class="p-4">
        <div class="space-y-6">
          <h4
            class="text-slate-800 text-lg font-semibold pb-2 flex justify-between"
          >
            <span> Programmer une relance</span>
          </h4>
          <form class="grid grid-cols-12 gap-4" @submit.prevent="AddReminder">
            <div class="col-span-full space-y-[1px]">
              <label for="payment_date" class="text-gray-500 font-semibold"
                >Date et heure</label
              >

              <InputFiled
                v-model="formData.send_date"
                type="datetime-local"
                custom-class="hover:shadow-sm p-2 rounded-lg"
              />
              <div v-if="errors.send_date.length" class="error">
                <ul>
                  <li v-for="error in errors.send_date" :key="error">
                    {{ error }}
                  </li>
                </ul>
              </div>
            </div>
            <div class="col-span-full space-y-[1px]">
              <label for="name" class="text-gray-500 font-semibold"
                >Choisir depuis un template (Optionnel)</label
              >
              <USelectMenu
                searchable
                searchable-placeholder="Trouver un template..."
                class="w-full"
                v-model="template_selected"
                placeholder="Choisir un template"
                :options="templates"
                option-attribute="name"
                size="lg"
                color="black"
                variant="none"
                :ui="{
                  base: 'hover:shadow-sm rounded-lg hover:shadow-sm  rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-[#f3c775]',
                }"
              >
              </USelectMenu>
            </div>
            <div class="col-span-full space-y-[1px]">
              <label for="content" class="text-gray-500 font-semibold"
                >Contenu de votre message</label
              >
              <textarea
                v-model="formData.message"
                class="text-sm hover:shadow-sm p-2 rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-[#f3c775]"
                rows="7"
              ></textarea>
              <div v-if="errors.message.length" class="error">
                <ul>
                  <li v-for="error in errors.message" :key="error">
                    {{ error }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="col-span-full space-y-[1px]">
              <UButton
                :loading="isRequestInProgress"
                type="submit"
                size="lg"
                variant="solid"
                color="yellow"
                class="flex justify-around items-center gap-2"
              >
                <UIcon name="i-heroicons-clock" class="h-4 w-4" />
                <span>Programmer </span>
              </UButton>
            </div>
          </form>
        </div>
      </div>
    </UModal>
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
        title="Relance programméé"
        type="success"
        @close-alert="closeSuccessAlert"
      >
        <template #message>
          <p>Votre relance a été programmée avec succès .</p>
        </template>
      </AlertModal>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { errors, validateForm } = useFormValidationReminder();
const isOpen = ref(false);
const props = defineProps({
  paymentId: {
    type: Number,
    default: 0,
  },
  customerId: {
    type: Number,
    default: 0,
  },
});
const templates = ref([]);
const template_selected = ref({
  content: "",
});
// fech template
const template_content = computed(() => template_selected.value?.content);
const status = ref("idle");
const fetchTemplateSms = async () => {
  status.value = "pending";
  const { data, error } = await supabase.from("templates").select("*");
  if (error) {
    console.error("Error fetching templates:", error);
    status.value = "error";
  } else {
    templates.value = data || [];
    status.value = "success";
  }
};

// send reminder
const formData = ref({
  send_date: null,
  message: template_content,
});
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

let AddReminder = async () => {
  isRequestInProgress.value = true;
  const validationErrors = validateForm({
    send_date: formData.value.send_date,
    message: formData.value.message,
  });

  if (validationErrors.global.length > 0) {
    isRequestInProgress.value = false;
    return;
  }

  try {
    const { data, error } = await supabase
      .from("reminders")
      .insert([
        {
          send_date: formData.value.send_date,
          message: formData.value.message,
          customers_id: props.customerId,
          payments_id: props.paymentId,
          created_by: user.value.id,
        },
      ])
      .select();

    if (error) {
      if (error.code === "23505") {
        errorMessage.value = "Une erreur est survenue";
      }
      isAlertOpen.value = true; // Affichage de l'alerte
      isRequestInProgress.value = false;
      isOpen.value = false;
    } else {
      // Réinitialisation des champs si la soumission a réussi
      isOpen.value = false;
      isSuccessOpen.value = true;
      formData.value.send_date = null;
      formData.value.message = "";
      template_selected.value.content = "";
      isRequestInProgress.value = false;

      emit("submit");
    }
  } catch (err) {
    console.error(err);
    isRequestInProgress.value = false;
  }
};
onMounted(() => {
  fetchTemplateSms();
});
</script>

<style scoped>
.error {
  color: red;
}
</style>
