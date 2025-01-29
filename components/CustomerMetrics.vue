<template>
  <div class="grid grid-cols-12 gap-5">
    <SkeletonCard
      class="col-span-6 lg:col-span-4 xl:col-span-3"
      v-if="customerCount == null"
    />
    <div
      v-else
      class="col-span-6 lg:col-span-4 xl:col-span-3 rounded-3xl p-3 bg-white text-white shadow-md relative overflow-hidden"
    >
      <p class="pb-3 flex justify-between items-center z-10">
        <span class="text-slate-950"> Total client</span>
        <span
          class="p-2 bg-[#f3c775]/10 rounded-full flex items-center justify-center"
        >
          <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-[#f3c775]" />
        </span>
      </p>

      <ul class="flex gap-4 w-full">
        <li class="space-y-3 w-full">
          <span class="font-semibold text-5xl text-slate-950">{{
            customerCount
          }}</span>
          <div class="flex justify-between items-center gap-[1px]">
            <p
              class="text-xs space-x-[1px] rounded-full px-3 py-[1px] text-slate-700"
            >
              <span>{{ currentMonthCount }} client(s) ce mois</span>
              <UIcon
                name="i-heroicons-arrow-up-right"
                class="w-4 h-4 text-slate-700"
              />
            </p>
          </div>
        </li>
      </ul>
    </div>
    <SkeletonCard
      class="col-span-6 lg:col-span-4 xl:col-span-3"
      v-if="customerCount == null"
    />
    <div
      v-else
      class="col-span-6 lg:col-span-4 xl:col-span-3 rounded-3xl p-3 bg-white shadow-md relative overflow-hidden"
    >
      <p class="pb-3 flex justify-between items-center z-10 text-slate-900/60">
        <span> Client(s) entreprise</span>
        <span
          class="p-2 bg-[#f3c775]/10 rounded-full flex items-center justify-center"
        >
          <UIcon
            name="i-heroicons-building-office-2"
            class="w-5 h-5 bg-[#f3c775]"
          />
        </span>
      </p>

      <ul class="flex gap-4 w-full">
        <li class="space-y-3 w-full">
          <span class="font-semibold text-5xl text-slate-900">{{
            (customerCount - customerParticulierCount).toLocaleString("fr-FR")
          }}</span>
        </li>
      </ul>
    </div>
    <SkeletonCard
      class="col-span-6 lg:col-span-4 xl:col-span-3"
      v-if="customerParticulierCount == null"
    />
    <div
      v-else
      class="col-span-12 lg:col-span-4 xl:col-span-3 rounded-3xl p-3 bg-white shadow-md relative overflow-hidden"
    >
      <p class="pb-3 flex justify-between items-center z-10 text-slate-900/60">
        <span> Client(s) particulier</span>
        <span
          class="p-2 bg-[#f3c775]/10 rounded-full flex items-center justify-center"
        >
          <UIcon name="i-heroicons-users" class="w-5 h-5 bg-[#f3c775]" />
        </span>
      </p>

      <ul class="flex gap-4 w-full">
        <li class="space-y-3 w-full">
          <span class="font-semibold text-5xl text-slate-900">{{
            customerParticulierCount.toLocaleString("fr-FR")
          }}</span>
        </li>
      </ul>
    </div>

    <div
      @click="isOpen = true"
      class="cursor-pointer hover:bg-[#dfb260] transition duration-300 ease-in-out col-span-6 lg:col-span-4 xl:col-span-3 rounded-3xl p-3 bg-[#f3c775] text-white shadow-md relative overflow-hidden"
    >
      <div class="absolute inset-0 z-0 opacity-10 transform rotate-45">
        <span
          class="text-[28rem] font-bold text-white absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          N
        </span>
      </div>

      <p class="pb-3 flex justify-between items-center z-10">
        <span class="text-slate-950" v-if="groups.length == 0">
          Créer votre premier groupe</span
        >
        <span class="text-slate-950" v-else>
          {{ groups.length }} groupe(s) Ouvert(s)</span
        >
      </p>

      <ul class="flex gap-4 w-full">
        <li
          class="space-y-3 w-full flex justify-between items-center gap-3 py-2 pr-2 rounded-full"
        >
          <span class="font-semibold text-4xl text-slate-950">Groupes</span>
          <span
            class="p-2 bg-slate-950/20 rounded-full flex items-center justify-center"
          >
            <UIcon
              name="i-heroicons-arrow-long-right"
              class="w-5 h-5 text-white"
            />
          </span>
        </li>
      </ul>
    </div>
    <UModal v-model="isOpen">
      <div class="p-4">
        <h3 class="text-slate-700 text-sm pb-2">Créer un nouveau groupe</h3>
        <form class="space-y-2" @submit.prevent="addGroup">
          <InputFiled
            v-model="formData.name"
            type="text"
            custom-class="hover:shadow-sm bg-[#dfb260]/30  p-2 rounded-md text-slate-700 "
            placeholder="Nom du groupe"
          />
          <div v-if="errors.name.length" class="error">
            {{ errors.name[0] }}
          </div>
          <div class="col-span-full space-y-[1px]">
            <UButton
              :loading="isRequestInProgress"
              type="submit"
              size="sm"
              variant="solid"
              color="yellow"
              >Nouveau groupe</UButton
            >
          </div>
        </form>
        <h3 class="text-slate-700 text-lg font-semibold pt-5 pb-2">
          Vos groupes
        </h3>
        <div class="grid grid-cols-12 gap-2">
          <span
            v-for="item in groups"
            :key="item.id"
            class="flex items-center justify-between col-span-3 text-center p-2 rounded-md font-semibold text-sm text-slate-800 bg-slate-950/5"
            ><i class="not-italic">{{ item.name }}</i
            ><UIcon
              @click="deleteGroups(item.id)"
              name="i-heroicons-x-mark"
              class="cursor-pointer text-red-700 w-3 h-3 hover:opacity-80 transition ease-in-out duration-300"
          /></span>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { errors, validateForm, handleServerErrors } = useFormValidationGroup();
let customerCount = ref(null);
let currentMonthCount = ref(null);
let customerParticulierCount = ref(null);
const fetchCustomers = async () => {
  const { data, error, count } = await supabase
    .from("customers")
    .select("*", { count: "exact" });
  customerCount.value = count.toLocaleString("fr-FR");
  const currentDate = new Date();
  const startOfCurrentMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).toISOString();
  const startOfNextMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    1
  ).toISOString();
  const { count: currentMonth, error: currentMonthError } = await supabase
    .from("customers")
    .select("*", { count: "exact" })
    .gte("created_at", startOfCurrentMonth)
    .lt("created_at", startOfNextMonth);
  currentMonthCount.value = currentMonth;

  const { data: particulierData, error: particulierError } = await supabase
    .from("customers")
    .select("*", { count: "exact" })
    .eq("customer_type", "Particulier");
  customerParticulierCount.value = particulierData.length;
};
let isOpen = ref(false);
let isRequestInProgress = ref(false);
const formData = ref({
  name: "",
});
let groups = ref([]);
let addGroup = async () => {
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
      formData.value.name = "";
      isRequestInProgress.value = false;
      fetchGroups();
    }
  } catch (err) {
    console.error(err);
    handleServerErrors({ code: "23514", message: "Erreur serveur" });
    isRequestInProgress.value = false;
  }
};
const fetchGroups = async () => {
  const { data, error } = await supabase.from("groups").select("*");
  if (error) {
    console.error("Error fetching groups:", error);
  } else {
    groups.value = data || [];
  }
};
const deleteGroups = async (id) => {
  const { error } = await supabase.from("groups").delete().eq("id", id);
  if (!error) {
    fetchGroups();
  }
};
onMounted(() => {
  fetchCustomers();
  fetchGroups();
});
</script>

<style scoped>
.error {
  color: red;
}
</style>
