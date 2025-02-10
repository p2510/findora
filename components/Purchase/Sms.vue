<script setup>
import { ref, computed, onMounted } from "vue";

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const props = defineProps({
  isPartner: Boolean,
});
let isOpen = ref(false);
const close = () => {
  isOpen.value = false;
  check.value = false;
};

const paidArray = ref([
  {
    id: 0,
    title: "STARTER",
    price: "2.000",
  },
  {
    id: 1,
    title: "BOOST",
    price: "7.500",
  },
  {
    id: 2,
    title: "ULTRA",
    price: "12.000",
  },
  {
    id: 3,
    title: "Tarif partenaire",
    price: "8",
  },
]);

const selectedPaid = ref({
  id: null,
  title: null,
  price: null,
});
let paid = async (val) => {
  isOpen.value = true;
  const { id, title, price } = paidArray.value[val];
  selectedPaid.value = { id, title, price };
};
const check = ref(false);
let validePaid = async () => {
  check.value = true;
  const { data, error } = await supabase
    .from("sms_purchase")
    .insert([
      {
        type: selectedPaid.value.title,
        status: "pending",
        user_id: user.value.id,
      },
    ])
    .select();
};
</script>

<template>
  <div>
    <ul class="space-y-2 px-4" v-if="!isPartner">
      <li>
        <div
          class="flex justify-between p-2 rounded-md bg-white shadow-md hover:bg-white hover:shadow-md transition duration-300 ease-in-out"
        >
          <div class="flex gap-2 items-center">
            <p class="p-4 lg:p-6 bg-slate-950/5 rounded-lg animate-pulse"></p>

            <p class="flex flex-col space-y-2">
              <span class="text-sm p-2 rounded-md bg-slate-950/5"
                >Starter | 100 SMS</span
              >
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="text-slate-950 p-2 rounded-md bg-slate-800/5 text-sm font-semibold"
              >2.000 FCFA</span
            >
            <button
              @click="paid(0)"
              class="cursor-pointer text-white p-2 flex items-center justify-center rounded-md bg-[#f3c775] text-sm hover:bg-opacity-80 transition ease-in-out duration-300"
            >
              Payer
            </button>
          </div>
        </div>
      </li>
      <li>
        <div
          class="flex justify-between p-2 rounded-md bg-white shadow-md hover:bg-white hover:shadow-md transition duration-300 ease-in-out"
        >
          <div class="flex gap-2 items-center">
            <p class="p-4 lg:p-6 bg-slate-950/5 rounded-lg animate-pulse"></p>
            <p class="flex flex-col space-y-2">
              <span class="text-sm p-2 rounded-md bg-slate-950/5"
                >Boost | 500 SMS</span
              >
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="text-slate-950 p-2 rounded-md bg-slate-800/5 text-sm font-semibold"
              >7.500 FCFA</span
            >
            <button
              @click="paid(1)"
              class="cursor-pointer text-white p-2 flex items-center justify-center rounded-md bg-[#f3c775] text-sm hover:bg-opacity-80 transition ease-in-out duration-300"
            >
              Payer
            </button>
          </div>
        </div>
      </li>
      <li>
        <div
          class="flex justify-between p-2 rounded-md bg-white shadow-md hover:bg-white hover:shadow-md transition duration-300 ease-in-out"
        >
          <div class="flex gap-2 items-center">
            <p class="p-4 lg:p-6 bg-slate-950/5 rounded-lg animate-pulse"></p>

            <p class="flex flex-col space-y-2">
              <span class="text-sm p-2 rounded-md bg-slate-950/5"
                >Ultra | 1.000 SMS</span
              >
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="text-slate-950 p-2 rounded-md bg-slate-800/5 text-sm font-semibold"
              >12.000 FCFA</span
            >
            <button
              @click="paid(2)"
              class="cursor-pointer text-white p-2 flex items-center justify-center rounded-md bg-[#f3c775] text-sm hover:bg-opacity-80 transition ease-in-out duration-300"
            >
              Payer
            </button>
          </div>
        </div>
      </li>
    </ul>
    <ul class="space-y-2 px-4" v-else>
      <li>
        <div
          class="flex justify-between p-2 rounded-md bg-white shadow-md hover:bg-white hover:shadow-md transition duration-300 ease-in-out"
        >
          <div class="flex gap-2 items-center">
            <p class="p-4 lg:p-6 bg-slate-950/5 rounded-lg animate-pulse"></p>

            <p class="flex flex-col space-y-2">
              <span class="text-sm p-2 rounded-md bg-slate-950/5"
                >8 F / SMS</span
              >
            </p>
          </div>
          <div class="flex items-center gap-2">
            <span
              class="text-slate-950 p-2 rounded-md bg-slate-800/5 text-sm font-semibold"
              >8 F / SMS</span
            >
            <button
              @click="paid(3)"
              class="cursor-pointer text-white p-2 flex items-center justify-center rounded-md bg-[#f3c775] text-sm hover:bg-opacity-80 transition ease-in-out duration-300"
            >
              Payer
            </button>
          </div>
        </div>
      </li>
    </ul>
    <UModal v-model="isOpen" prevent-close>
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800',
        }"
      >
        <template #header>
          <div class="flex justify-between items-center ">
            <div>
              <h3 class="font-semibold text-gray-800 text-md">
                Rechargez vos SMS via WAVE.
              </h3>
              <span class="text-sm text-slate-600">
                Scannez pour effectuer le paiement directement.
              </span>
            </div>
            <div>
              <UButton
                color="gray"
                variant="ghost"
                icon="i-heroicons-x-mark-20-solid"
                class="-my-1"
                @click="close"
              />
            </div>
          </div>
        </template>

        <section class="space-y-3" v-if="!check">
          <div class="flex gap-3 items-center">
            <span>{{ selectedPaid.title }}</span>
            <UBadge color="primary" variant="soft" size="lg"
              >{{ selectedPaid.price }} F</UBadge
            >
          </div>
          <div class="py-3 flex justify-center">
            <PrimaryButton @click="validePaid"
              >Cliquez pour effectuer le paiement</PrimaryButton
            >
          </div>
        </section>
        <section class="space-y-3" v-else>
          <div class="flex gap-3 items-center">
            <span>{{ selectedPaid.title }}</span>
            <UBadge color="primary" variant="soft" size="lg"
              >{{ selectedPaid.price }} F</UBadge
            >
          </div>
          <div class="bg-[#1DC8FF] py-3">
            <div class="flex justify-center">
              <img
                src="~/assets/img/wave/payez-avec-wave-stacked.svg"
                alt="icone wave"
              />
            </div>
            <div class="flex justify-center">
              <div class="rounded-xl p-4 bg-white shadow-md">
                <img
                  v-if="selectedPaid.id == 0"
                  src="~/assets/img/wave/starter_sms.png"
                  alt="sms starter"
                />
                <img
                  v-else-if="selectedPaid.id == 1"
                  src="~/assets/img/wave/boost_sms.png"
                  alt="sms starter"
                />
                <img
                  v-else-if="selectedPaid.id == 2"
                  src="~/assets/img/wave/ultra_sms.png"
                  alt="sms starter"
                />
                <img
                  v-else-if="selectedPaid.id == 3"
                  src="~/assets/img/wave/partner_sms.png"
                  alt="sms starter"
                />
              </div>
            </div>
          </div>
        </section>

        <template #footer>
          <div class="flex gap-2 items-center">
            <UIcon
              name="i-heroicons-information-circle"
              class="w-5 h-5 text-emerald-600"
            />
            <span class="text-sm text-slate-600 w-full">
              Une fois votre paiement effectué, il sera traité dans un délai
              maximal d'une (1) heure.
            </span>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<style scoped>
.error {
  color: red;
}
</style>
