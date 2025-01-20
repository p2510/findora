<template>
  <div class="grid grid-cols-12 gap-5">
    <SkeletonCard
      class="col-span-6 lg:col-span-4 xl:col-span-3"
      v-if="customerCount == null"
    />
    <div
      v-else
      class="col-span-6 lg:col-span-4 xl:col-span-3 rounded-3xl p-3 bg-[#f3c775] text-white shadow-md relative overflow-hidden"
    >
      <div class="absolute inset-0 z-0 opacity-10 transform rotate-45">
        <span
          class="text-[28rem] font-bold text-white absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        >
          N
        </span>
      </div>

      <p class="pb-3 flex justify-between items-center z-10">
        <span class="text-slate-950"> Total client</span>
        <span
          class="p-2 bg-slate-950/20 rounded-full flex items-center justify-center"
        >
          <UIcon name="i-heroicons-user-group" class="w-5 h-5 text-white" />
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
const supabase = useSupabaseClient();
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
onMounted(fetchCustomers);
</script>
