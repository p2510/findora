<template>
  <div class="mt-14 space-y-4 pr-4">
    <ReminderMetrics />
    <SkeletonNotFound
      v-if="reminderStore.reminders?.length == 0"
      title="Aucune relance détectée"
      subtitle="actuellement"
      label-btn=" Créer une nouvelle relance"
      to="/paiement"
      custom-css="text-xl lg:text-2xl xl:text-4xl "
    />
    <div v-else class="grid grid-cols-12 gap-2">
      <section
      
        class="col-span-4 lg:col-span-4 2xl:col-span-3 bg-transparent border-[1px] border-slate-200 h-screen rounded-xl"
      >
        <div class="flex items-center justify-between p-3">
          <h2 class="">
            <p class="text-sm text-slate-500">Relances</p>
            <p class="font-bold text-lg text-slate-800/95">programmée(s)</p>
          </h2>
          <span
            class="rounded-full p-2 border-[1px] flex justify-center items-center hover:bg-slate-100 transition ease-in-out duration-300"
          >
            <UIcon name="i-heroicons-bolt" />
          </span>
        </div>
        <div>
          <ul class="p-2 space-y-2 overflow-y-scroll h-[75vh] pb-32">
            <ReminderItem
              v-for="reminder in reminderStore.reminders"
              :key="reminder.id"
              :date="reminder.send_date"
              :amount="reminder.amount"
              :status="
                new Date(reminder.send_date) < new Date()
                  ? 'Envoyé'
                  : 'Programmé'
              "
              :client="reminder.customers.name"
              :isHighlighted="selectedReminderId === reminder.id"
              @click="updateReminderId(reminder.id)"
            />
          </ul>
        </div>
      </section>
      <section
        v-if="selectedReminder"
        class="col-span-8 lg:col-span-8 2xl:col-span-9 h-screen bg-dotted-pattern border border-slate-200 rounded-xl relative"
      >
        <UModal v-model="showMessage">
          <div class="p-4 text-sm">
            {{ selectedReminder.message }}
          </div>
        </UModal>
        <!-- Conteneur des éléments -->
        <div
          class="flex justify-between items-center px-8 absolute top-1/3 w-full"
        >
          <!-- Premier élément -->
          <div
            class="border-2 border-[#f3c775] rounded-lg bg-[#f3c775]/20 px-8 py-4 text-center flex flex-col gap-2"
          >
            <span class="text-slate-600 text-sm">Client</span>
            <span class="text-slate-950 text-md truncate">{{
              selectedReminder.customers.name
            }}</span>
          </div>

          <!-- Ligne entre 1er et 2e élément -->
          <svg class="h-2 w-1/4 relative" xmlns="http://www.w3.org/2000/svg">
            <!-- Ligne -->
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="#f3c775"
              stroke-width="2"
            />
            <!-- Cercle début -->
            <circle cx="0" cy="50%" r="4" fill="#f3c775" />
            <!-- Cercle fin -->
            <circle cx="100%" cy="50%" r="4" fill="#f3c775" />
          </svg>

          <!-- Deuxième élément -->
          <div
            class="border-2 border-[#f3c775] rounded-lg bg-[#f3c775]/20 px-8 py-4 text-center flex flex-col gap-2"
          >
            <span class="text-slate-600 text-sm">Message</span>
            <span
              class="gap-2 text-slate-100 text-sm bg-slate-800 rounded-md hover:bg-slate-700 transition ease-in-out duration-300 p-2 cursor-pointer"
              @click="showMessage = true"
            >
              Regarder
            </span>
          </div>

          <!-- Ligne entre 2e et 3e élément -->
          <svg class="h-2 w-1/4 relative" xmlns="http://www.w3.org/2000/svg">
            <!-- Ligne -->
            <line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="#f3c775"
              stroke-width="2"
            />
            <!-- Cercle début -->
            <circle cx="0" cy="50%" r="4" fill="#f3c775" />
            <!-- Cercle fin -->
            <circle cx="100%" cy="50%" r="4" fill="#f3c775" />
          </svg>

          <!-- Troisième élément -->
          <div
            class="border-2 border-[#f3c775] rounded-lg bg-[#f3c775]/20 px-8 py-4 text-center flex flex-col gap-2"
          >
            <span class="text-slate-600 text-sm">Date</span>
            <span class="text-slate-950 text-md truncate">{{
              new Date(selectedReminder.send_date).toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })
            }}</span>
          </div>
        </div>
        <div class="flex justify-center absolute bottom-1/4 w-full">
          <button
            class="bg-slate-600 text-white rounded-full hover:bg-red-800 px-6 py-2 text-sm hover:shadow-md transition duration-300 ease-in-out"
            @click="deleteReminder(selectedReminderId)"
          >
            Supprimer
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useStat } from "@/stores/stat";
const stat = useStat();
definePageMeta({
  middleware: "auth",
  alias: "/relance",
});
useHead({
  title: "Findora - Relance",
});
import { useReminder } from "@/stores/reminder";
const reminderStore = useReminder();
const supabase = useSupabaseClient();
const status = ref("idle");
let selectedReminderId = ref(null);

const fetchReminders = async () => {
  status.value = "pending";
  const { data, error } = await supabase
    .from("reminders")
    .select(
      `
    id,message,send_date,
    customers(
      id,name
    ),payments(
      amount
    )
  `
    )
    .eq("is_sent", false)
    .gt("send_date", new Date().toISOString())
    .order("send_date", { ascending: false });
  if (error) {
    status.value = "error";
  } else {
    reminderStore.reminders = data;
    if (data.length > 0) {
      const index = data.findIndex((reminder) => reminder.id);
      selectedReminderId.value = index !== -1 ? data[index].id : null;
    }
    status.value = "success";
  }
};

let updateReminderId = (id) => {
  selectedReminderId.value = id;
};
const selectedReminder = computed(() => {
  if (selectedReminderId.value === null) {
    return null; // Si aucun rappel n'est sélectionné, retourner null
  }
  return (
    reminderStore.reminders.find(
      (reminder) => reminder.id === selectedReminderId.value
    ) || null
  );
});
let showMessage = ref(false);
onMounted(async () => {
  if (reminderStore.reminders == null) {
    fetchReminders();
  }
  if (reminderStore.reminders?.length > 0) {
    const index = reminderStore.reminders.findIndex((reminder) => reminder.id);
    selectedReminderId.value =
      index !== -1 ? reminderStore.reminders[index].id : null;
  }
});

// delete
let deleteReminder = async () => {
  const { error } = await supabase
    .from("reminders")
    .delete()
    .eq("id", selectedReminderId.value);
  if (!error) {
    reminderStore.updateReminders();
    stat.decrementReminder();
    
  }
};
</script>
<style scoped>
.error {
  color: red;
}
.bg-dotted-pattern {
  background-image: radial-gradient(circle, #0f111415 1px, transparent 1px);
  background-size: 16px 16px; /* Taille de la grille */
  background-position: center;
}
/* Styles de la scrollbar */
::-webkit-scrollbar {
  width: 10px; /* Largeur de la scrollbar */
  height: 10px; /* Hauteur (pour le scroll horizontal) */
}

::-webkit-scrollbar-track {
  background: #f1f1f1; /* Couleur de l'arrière-plan */
}

::-webkit-scrollbar-thumb {
  background: #888; /* Couleur de la "poignée" */
  border-radius: 5px; /* Arrondi */
}

::-webkit-scrollbar-thumb:hover {
  background: #555; /* Couleur au survol */
}
</style>
