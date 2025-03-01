<script setup>
import { ref, computed, defineEmits, onMounted } from "vue";
import { usePayment } from "@/stores/payment";
import { useUser } from "@/stores/user";
const paymentStore = usePayment();
const userStore = useUser();

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { errors, validateForm, handleServerErrors } = useFormValidationPayment();
let customers = ref([]);
const isOpen = ref(false);
const isRequestInProgress = ref(false);
const errorMessage = ref("");
const isAlertOpen = ref(false);

let closeErrorAlert = () => {
  isAlertOpen.value = false;
};

const formData = ref({
  payment_date: null,
  date_of_issue: null,
  customers_id: null,
  amount: null,
  status: "en-attente",
});

const emit = defineEmits(["submit"]);

// Fonction de soumission du formulaire
let AddPayment = async () => {
  isRequestInProgress.value = true;
  const validationErrors = validateForm({
    payment_date: formData.value.payment_date,
    date_of_issue: formData.value.date_of_issue,
    customers_id: formData.value.customers_id,
    amount: formData.value.amount,
    status: formData.value.status,
  });

  if (validationErrors.global.length > 0) {
    isRequestInProgress.value = false;
    return;
  }

  try {
    formData.value.customers_id = formData.value.customers_id?.id;
    const { data, error } = await supabase
      .from("payments")
      .insert([
        {
          payment_date: formData.value.payment_date,
          date_of_issue: formData.value.date_of_issue,
          customers_id: formData.value.customers_id,
          amount: formData.value.amount,
          status: formData.value.status,
          created_by: user.value.id,
        },
      ])
      .select();

    if (error) {
      if (error.code === "23505") {
        errorMessage.value = "Ce client existe déjà avec cet adresse E-mail.";
      } else {
        handleServerErrors(error);
        errorMessage.value = error.message;
      }
      isAlertOpen.value = true; // Affichage de l'alerte
      isRequestInProgress.value = false;
      isOpen.value = false;
    } else {
      paymentStore.updatePaymentCustomer();
      paymentStore.updatePayments();
      // Réinitialisation des champs si la soumission a réussi
      formData.value.payment_date = null;
      formData.value.date_of_issue = null;
      formData.value.customers_id = null;
      formData.value.amount = null;
      formData.value.status = "en-attente";
      isRequestInProgress.value = false;
      isOpen.value = false;
      emit("submit"); // Émettre un événement pour informer que le client a été créé
    }
  } catch (err) {
    handleServerErrors({ code: "23514", message: "Erreur serveur" });
    isRequestInProgress.value = false;
  }
};

onMounted(async () => {
  const { data, error } = await supabase.from("customers").select("name,id");
  if (error) {
  } else {
    customers.value = data || [];
  }
});
</script>

<template>
  <div>
    <PrimaryButton @click="isOpen = true">Nouveau paiement</PrimaryButton>

    <UModal v-model="isOpen">
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="space-y-[1px]">
            <h5>
              <UBadge color="gray" variant="soft" size="lg"
                >Nouveau paiement</UBadge
              >
            </h5>

            <span class="text-gray-500 text-sm">
              Suivez vos clients en toute tranquillité.
            </span>
          </div>
        </template>

        <form class="grid grid-cols-12 gap-4" @submit.prevent="AddPayment">
          <div class="col-span-full space-y-[1px]">
            <label for="payment_date" class="text-gray-500 font-semibold"
              >Date d'émission</label
            >

            <InputFiled
              type="date"
              custom-class="hover:shadow-sm p-2 rounded-lg"
              v-model="formData.date_of_issue"
              name="payment_date"
            />
            <div v-if="errors.date_of_issue.length" class="error">
              <ul>
                <li v-for="error in errors.date_of_issue" :key="error">
                  {{ error }}
                </li>
              </ul>
            </div>
          </div>
          <div class="col-span-full space-y-[1px]">
            <label for="payment_date" class="text-gray-500 font-semibold"
              >Date d'échéance</label
            >

            <InputFiled
              type="date"
              custom-class="hover:shadow-sm p-2 rounded-lg"
              v-model="formData.payment_date"
            />
            <div v-if="errors.payment_date.length" class="error">
              <ul>
                <li v-for="error in errors.payment_date" :key="error">
                  {{ error }}
                </li>
              </ul>
            </div>
          </div>

          <div class="col-span-6 space-y-[1px]">
            <label for="customers_id" class="text-gray-500 font-semibold"
              >Client</label
            >
            <USelectMenu
              searchable
              searchable-placeholder="Trouver un client..."
              class="w-full lg:w-48"
              v-model="formData.customers_id"
              placeholder="Choisir un client"
              :options="customers"
              option-attribute="name"
              size="lg"
              color="black"
              variant="none"
              :ui="{
                base: 'hover:shadow-sm rounded-lg hover:shadow-sm  rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-[#f3c775]',
              }"
            >
            </USelectMenu>
            <div v-if="errors.customers_id.length" class="error">
              {{ errors.customers_id[0] }}
            </div>
          </div>

          <div class="col-span-6 space-y-[1px]">
            <label for="amount" class="text-gray-500 font-semibold"
              >Montant en {{ userStore.info.currency }}</label
            >
            <InputFiled
              type="number"
              custom-class="hover:shadow-sm p-2 rounded-lg"
              v-model="formData.amount"
            />
            <div v-if="errors.amount.length" class="error">
              <ul>
                <li v-for="error in errors.amount" :key="error">{{ error }}</li>
              </ul>
            </div>
          </div>

          <div class="col-span-full space-y-[1px]">
            <label for="status" class="text-gray-500 font-semibold"
              >Status</label
            >
            <select
              v-model="formData.status"
              class="hover:shadow-sm p-2 rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-[#f3c775]"
            >
              <option value="en-attente">En attente</option>
              <option value="payé">Payé</option>
              <option value="non-payé">Non payé</option>
            </select>
            <div v-if="errors.status.length" class="error">
              <ul>
                <li v-for="error in errors.status" :key="error">{{ error }}</li>
              </ul>
            </div>
          </div>

          <!-- Bouton de soumission -->
          <div class="col-span-full space-y-[1px]">
            <UButton
              :loading="isRequestInProgress"
              type="submit"
              size="lg"
              variant="soft"
              color="emerald"
            >
              Créer un paiement
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <!-- Alerte d'erreur -->
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

<style scoped>
.error {
  color: red;
}
</style>
