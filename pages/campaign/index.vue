<template>
  <div class="mt-14 space-y-4 pr-4">
    <div
      class="bg-gradient-to-r from-[#f3c775] to-[#c7a15a] w-full py-4 px-3 rounded-xl"
    >
      <h2 class="text-slate-800 text-lg">
        Lancer des campagnes vers vos clients
      </h2>
      <p class="text-sm text-slate-700">
        Partager des informations précises et pertinentes avec un ou plusieurs
        clients.
        <span class="underline">
          Actuellement, l'envoi de SMS est uniquement disponible pour les
          numéros en Côte d'Ivoire.</span
        >
      </p>
    </div>
    <form class="grid grid-cols-12 gap-4 pt-6">
      <div class="col-span-full flex items-end gap-4">
        <div class="space-y-[1px]">
          <label for="name" class="text-gray-500 text-sm">Client </label>
          <USelectMenu
            searchable
            searchable-placeholder="Trouver un client..."
            class="w-full lg:w-48"
            placeholder="Choisir un client"
            :options="customers"
            option-attribute="name"
            multiple
            v-model="formData.customers"
            size="lg"
            color="black"
            variant="none"
            :ui="{
              base: 'hover:shadow-sm rounded-lg hover:shadow-sm  rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-[#f3c775]',
            }"
          >
            <template #option-empty="{ query }">
              <q>{{ query }}</q> n'existe pas
            </template>
            <template #label>
              <span v-if="formData.customers.length" class="truncate"
                >{{ formData.customers.length }} Selectionné(s)</span
              >
              <span v-else>Selection client</span>
            </template>
          </USelectMenu>
        </div>
        <button
          @click="selectAll"
          type="button"
          class="bg-slate-800 text-white rounded-md px-3 py-2 hover:bg-slate-950 transition duration-300 ease-in-out"
        >
          Choisir tous les client
        </button>
        <div class="flex gap-4" v-if="list_group == null">
          <SkeletonButton />
          <SkeletonButton />
        </div>
        <button
          v-else
          v-for="group in list_group"
          :key="group.id"
          @click="selectByGroup(group.customers, group.name)"
          type="button"
          class="text-slate-800 rounded-md px-3 py-2 transition duration-300 ease-in-out"
          :class="
            group_select == group.name
              ? ' bg-[#f3c775] hover:bg-[#b99653]'
              : ' bg-[#f3c775]/50 hover:bg-[#b99653]'
          "
        >
          {{ group.name }}
        </button>
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
import { ref, computed, onMounted } from "vue";
definePageMeta({
  middleware: "auth",
  alias: "/campagne",
});
useHead({
  title: "Findora - Campagne",
});
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
let customers = ref([]);
const formData = ref({
  customers: [],
  content: "",
  send_date: null,
});
const channels = ref([
  {
    name: "sms",
    selected: true,
  },
  {
    name: "whatsapp",
    selected: true,
  },
]);
let selectAll = () => {
  formData.value.customers = customers.value;
  group_select.value = null;
};

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
      isAlertOpen.value = true; // Affichage de l'alerte
      isRequestInProgress.value = false;
      isOpen.value = false;
    } else {
      sendSMS();
      isOpen.value = false;
      formData.value.send_date = null;
      formData.value.content = "";
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

let list_group = ref(null);
const group_select = ref(null);
let selectByGroup = (customers, group) => {
  formData.value.customers = customers;
  group_select.value = group;
};
let subscriptions = ref(null);
onMounted(async () => {
  const { data: subscriptionData, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("*")
    .single();

  if (subscriptionData) {
    subscriptions.value = subscriptionData;
  }
  const { data, error } = await supabase
    .from("customers")
    .select("phone,name,id");
  if (error) {
  } else {
    customers.value = data || [];
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
  const { data: groups, error: groupsError } = await supabase
    .from("groups")
    .select("id,name");
  if (groups) {
    const { data: groupsCustomers, error: groupsCustomersError } =
      await supabase.from("groups_customers").select(
        `
       *,customers(
       phone,name,id
       )
      `
      );
    groupsCustomers.forEach((item) => {
      const targetGroup = groups.find((g) => g.id == item.groups_id);
      if (targetGroup) {
        if (!targetGroup.customers) {
          targetGroup.customers = [];
        }
        targetGroup.customers.push(item.customers);
      }
    });
    list_group.value = groups;
  }
});

async function sendSMS() {
  const url = "https://app.myfindora.com/api/send-campaign";
  //const url = "http://localhost:3000/api/send-campaign";
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        smsbacklogs: sms_backlogs.value,
        customers: formData.value.customers,
        content: formData.value.content,
        user_id: user.value.id,
      }),
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    if (json) {
      isRequestInProgress.value = false;
      isSuccessOpen.value = true;
    }
  } catch (error) {
    console.log(error);
    isRequestInProgress.value = false;
  }
}
</script>

<style scoped>
.error {
  color: red;
}
</style>
