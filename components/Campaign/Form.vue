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
      <h5 class="flex col-span-full items-center">
        <label class="text-gray-500 text-sm">Choisir un ou des canaux : </label>
        <div class="flex">
          <div class="pl-4" v-if="subscriptions == null">
            <SkeletonButton />
          </div>
          <div
            class="pl-4 flex gap-3"
            v-else-if="subscriptions?.subscription_type === 'ultra'"
          >
            <UChip
              color="amber"
              size="xl"
              v-for="{ name, selected } in channels"
              :key="name"
              :show="selected"
            >
              <img
                @click="channels[0].selected = !channels[0].selected"
                v-if="name == 'sms'"
                src="~/assets/img/sms.png"
                alt=""
                class="w-10 hover:opacity-80 transition ease-in-out duration-300 cursor-pointer"
              />

              <img
                @click="channels[1].selected = !channels[1].selected"
                v-if="name == 'whatsapp'"
                src="~/assets/img/whatsapp.png"
                alt=""
                class="w-10 hover:opacity-80 transition ease-in-out duration-300 cursor-pointer"
              />
            </UChip>
          </div>
          <div class="pl-4 flex gap-3" v-else>
            <UChip color="amber" size="xl" :show="channels[0].selected">
              <img
                @click="channels[0].selected = !channels[0].selected"
                src="~/assets/img/sms.png"
                alt=""
                class="w-10 hover:opacity-80 transition ease-in-out duration-300 cursor-pointer"
              />
            </UChip>
            <img
              src="~/assets/img/whatsapp.png"
              alt=""
              class="w-10 opacity-30"
            />
          </div>
        </div>
      </h5>

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
import { sendWhatsapp } from "@/utils/campaign/whatsappUtils";
const supabase = useSupabaseClient();
const user = useSupabaseUser();

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
const channels = ref([
  {
    name: "sms",
    selected: false,
  },
  {
    name: "whatsapp",
    selected: false,
  },
]);

let AddCampaign = async () => {
  isRequestInProgress.value = true;
  // Vérification si au moins un canal est sélectionné
  const isAnyChannelSelected = channels.value.some(
    (channel) => channel.selected
  );
  if (!isAnyChannelSelected) {
    errorMessage.value =
      "Veuillez sélectionner au moins un canal pour envoyer la campagne. Il suffit de cliquer sur le canal ou plusieurs.";
    isAlertOpen.value = true;
    isRequestInProgress.value = false;
    return;
  }
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
          sms_channel: channels.value[0].selected,
          whatsapp_channel: channels.value[1].selected,
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
      // Envoi des WhatsApp si le canal WhatsApp est sélectionné
      /*
      if (channels.value[1].selected) {
        // Configurer les options pour la requête POST
        let customers = [
          { chatId: "2250797966331@c.us" },
          { chatId: "2250585711152@c.us" },
        ];
        try {
          const response = await $fetch("/api/send-campaign-whatsapp", {
            method: "POST",
            body: {
              customers: customers, // Passer tous les clients
              content: formData.value.content, // Passer le contenu du message
              linkPreview: false,
            },
          });

          if (response.success) {
            console.log(
              "Messages envoyés à tous les clients:",
              response.message
            );
          } else {
            console.error("Erreur:", response.error);
          }
        } catch (error) {
          console.error("Erreur lors de l'appel de l'API:", error);
        }
      }*/
      // Envoi des SMS si le canal SMS est sélectionné
      if (channels.value[0].selected) {
        await sendSMS(
          sms_backlogs.value,
          formData.value.customers,
          formData.value.content,
          user.value.id
        )
          .then((response) => {
            isRequestInProgress.value = false;
            isSuccessOpen.value = true;
            formData.value.send_date = null;
            formData.value.content = "";
            formData.value.customers = [];
          })
          .catch((err) => {
            console.log(err);
            isRequestInProgress.value = false;
          });
      }

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
let sms_backlogs = ref(null);
let subscriptions = ref(null);
onMounted(async () => {
  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("*")
    .single();

  if (subscriptionData) {
    subscriptions.value = subscriptionData;
  }
  const { data: smsBacklogs, error: smsBacklogsError } = await supabase
    .from("sms_backlogs")
    .select(
      `
       client_id,client_secret,sender_name
      `
    )
    .single();
  if (smsBacklogsError) {
  } else {
    sms_backlogs.value = smsBacklogs;
  }
});
</script>
<style scoped>
.error {
  color: red;
}
</style>
