<template>
  <div>
    <form class="grid grid-cols-12 gap-4 pt-6">
      <div class="col-span-full flex items-end gap-4">
        <CampaignCustomerSelection v-model="formData.customers" />
      </div>

      <div class="col-span-full space-y-[1px]">
        <label for="name" class="text-gray-500 text-sm"
          >Message (160 Caratères maximum)</label
        >

        <textarea
          v-model="formData.content"
          class="text-sm hover:shadow-sm p-2 rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-[#f3c775]"
          maxlength="160"
          rows="7"
        ></textarea>
        <span v-if="formData.content.length > 0" class="text-xs opacity-40"
          >Caratères : {{ formData.content.length }}
        </span>
        <div v-if="errors.content.length" class="error">
          <ul>
            <li v-for="error in errors.content" :key="error">
              {{ error }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Bouton de soumission -->
      <div class="col-span-full space-y-[1px] flex gap-4">
        <UButton
          @click="AddCampaign"
          :loading="isRequestInProgress"
          type="button"
          size="lg"
          variant="solid"
          color="emerald"
        >
          Envoyer maintenant
        </UButton>
        <UButton
          @click="openScheduleModal"
          :loading="isRequestSchedule"
          type="button"
          size="lg"
          variant="solid"
          color="yellow"
        >
          Programmer
        </UButton>
      </div>
    </form>

    <UModal v-model="isScheduleModalOpen" @prevent-close="closeScheduleModal">
      <section class="bg-white p-4 rounded-xl space-y-6">
        <h5>
          <UBadge color="gray" variant="soft" size="lg"
            >Programmer l'envoi</UBadge
          >
        </h5>
        <div>
          <label for="send_date" class="text-gray-500 text-sm"
            >Date et heure d'envoi</label
          >
          <input
            type="date"
            v-model="formData.send_date"
            class="w-full mt-2 p-2 border rounded-lg"
          />
        </div>

        <UButton
          @click="scheduleCampaign"
          color="blue"
          variant="soft"
          size="lg"
        >
          Programmer
        </UButton>
      </section>
    </UModal>
    <div v-if="isSuccessOpen">
      <AlertModal
        title="Campagne effectué"
        type="success"
        @close-alert="closeSuccessAlert"
      >
        <template #message>
          <p>Votre campagne a été effectuée avec succès .</p>
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
import { sendSMS } from "@/utils/campaign/smsUtils";
const supabase = useSupabaseClient();
const user = useSupabaseUser();
import { useUser } from "@/stores/user";
const users = useUser();

const { errors, validateForm, handleServerErrors } =
  useFormValidationCampaignNow();
const isScheduleModalOpen = ref(false);
const openScheduleModal = () => {
  isScheduleModalOpen.value = true;
};
const closeScheduleModal = () => {
  isScheduleModalOpen.value = false;
};
const isOpen = ref(false);
const isRequestInProgress = ref(false);
const isRequestSchedule = ref(false);
const errorMessage = ref("");
const isAlertOpen = ref(false);
let closeErrorAlert = () => {
  isAlertOpen.value = false;
};
const isSuccessOpen = ref(false);
let closeSuccessAlert = () => {
  isSuccessOpen.value = false;
};

const formData = ref({
  customers: [],
  content: "",
  send_date: null,
});

let AddCampaign = async () => {
  isRequestInProgress.value = true;

  const validationErrors = validateForm({
    content: formData.value.content,
  });
  if (validationErrors.global.length > 0) {
    isRequestInProgress.value = false;
    return;
  }
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .insert(
        formData.value.customers.map((customer) => ({
          send_date: formData.value.send_date || null,
          message: formData.value.content,
          phone: customer.phone,
          created_by: user.value.id,
          is_sent: true,
        }))
      )
      .select();

    if (error) {
      if (error.code === "23505") {
        errorMessage.value = "Une erreur est survenue";
      } else {
        errorMessage.value = error.message;
      }
      isAlertOpen.value = true;
      isRequestInProgress.value = false;
      isOpen.value = false;
    } else {
      await sendSMS(
        users.sms_backlogs,
        formData.value.customers,
        formData.value.content,
        user.value.id
      )
        .then((response) => {
          isSuccessOpen.value = true;
          formData.value.send_date = null;
          formData.value.content = "";
          formData.value.customers = [];
        })
        .catch((err) => {
          console.log(err);
          isRequestInProgress.value = false;
        })
        .finally(() => {
          isRequestInProgress.value = false;
        });

      isOpen.value = false;
    }
  } catch (err) {
    isRequestInProgress.value = false;
  }
};

const scheduleCampaign = async () => {
  if (!formData.value.send_date) {
    errorMessage.value = "Veuillez sélectionner une date d'envoi.";
    isAlertOpen.value = true;
    return;
  }

  isRequestSchedule.value = true;
  const validationErrors = validateForm({
    content: formData.value.content,
  });
  if (validationErrors.global.length > 0) {
    isRequestSchedule.value = false;
    return;
  }
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .insert(
        formData.value.customers.map((customer) => ({
          send_date: formData.value.send_date,
          message: formData.value.content,
          phone: customer.phone,
          created_by: user.value.id,
          is_sent: false,
        }))
      )
      .select();

    if (error) {
      if (error.code === "23505") {
        errorMessage.value = "Une erreur est survenue";
      } else {
        errorMessage.value = error.message;
      }
      closeScheduleModal();
      isAlertOpen.value = true; // Affichage de l'alerte
      isRequestSchedule.value = false;
      isOpen.value = false;
    } else {
      closeScheduleModal();
      isOpen.value = false;
      isSuccessOpen.value = true;
      isRequestSchedule.value = false;
      formData.value.send_date = null;
      formData.value.content = "";
    }
  } catch (err) {
    closeScheduleModal();
    isRequestSchedule.value = false;
  }
};
</script>
<style scoped>
.error {
  color: red;
}
</style>
