<template>
  <div class="space-y-5 pb-2">
    <div class="px-8  bg-neutral-100 ">
  
      <div class="sm:h-full lg:h-[40vh] 2xl:h-[52vh] grid grid-cols-12 pt-4 gap-4   ">
        <div
          class="h-full  overflow-y-scroll col-span-full bg-white text-slate-800 rounded-md shadow-md hover:shadow-lg transition duration-300 ease-in-out"
        >
          <p class="pl-5 py-3 text-lg font-semibold text-neutral-800">
            Calendrier de campagne
          </p>
          <hr />
          <section class="py-3">
            <!-- Ici commence le calendrier -->
            <div class="calendar-container">
              <div class="calendar-header">
                <h2 class="calendar-title">{{ getFormattedCurrentMonth() }}</h2>
                <div class="calendar-nav">
                  <button class="calendar-nav-btn" @click="previousMonth">
                    <UIcon name="i-heroicons-chevron-left" class="w-4 h-4" />
                  </button>
                  <button class="calendar-nav-today" @click="goToToday">
                    Aujourd'hui
                  </button>
                  <button class="calendar-nav-btn" @click="nextMonth">
                    <UIcon name="i-heroicons-chevron-right" class="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div class="calendar-grid">
                <div
                  class="calendar-weekday"
                  v-for="day in weekdays"
                  :key="day"
                >
                  {{ day }}
                </div>
              </div>
              <div class="calendar-days">
                <div
                  v-for="(day, index) in calendarDays"
                  :key="index"
                  :class="[
                    'calendar-day',
                    { 'other-month': !day.isCurrentMonth },
                    { today: day.isToday },
                  ]"
                >
                  <div class="calendar-day-number">{{ day.date.date() }}</div>
                  <div
                    v-if="
                      getCampaignsForDay(day).length === 0 && day.isCurrentMonth
                    "
                    class="empty-day"
                  >
                    Aucune campagne
                  </div>
                  <div
                    v-for="campaign in getCampaignsForDay(day)"
                    :key="campaign.id"
                    class="campaign-event"
                  >
                    <div>{{ truncateText(campaign.content, 25) }}</div>
                    <div class="campaign-count">
                      {{ campaign.customers.length }} contacts
                    </div>
                    <div class="campaign-details">
                      <div>
                        <strong>Date d'envoi:</strong>
                        {{ formatDateTime(campaign.send_date) }}
                      </div>
                      <div>
                        <strong>Message:</strong> {{ campaign.content }}
                      </div>
                      <div>
                        <strong>Contacts:</strong>
                        {{ campaign.customers.length }}
                      </div>
                      <div class="customer-list">
                        <div
                          v-for="customer in campaign.customers.slice(0, 5)"
                          :key="customer.id"
                          class="customer-item"
                        >
                          <div class="customer-icon">
                            {{ getInitials(customer.name) }}
                          </div>
                          <div>{{ customer.name }} ({{ customer.phone }})</div>
                        </div>
                        <div
                          v-if="campaign.customers.length > 5"
                          class="customer-item"
                        >
                          Et {{ campaign.customers.length - 5 }} autres
                          contacts...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="legend">
                <div class="legend-item">
                  <div
                    class="legend-color"
                    style="background-color: #ffbd59"
                  ></div>
                  <span>Campagne programmée</span>
                </div>
                <div class="legend-item">
                  <div
                    class="legend-color"
                    style="background-color: rgba(255, 189, 89, 0.2)"
                  ></div>
                  <span>Aujourd'hui</span>
                </div>
              </div>
            </div>
            <!-- Fin du calendrier -->
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useUser } from "@/stores/user";
import { useWhatsapp } from "@/stores/whatsapp";
import { ref, computed, onMounted } from "vue";
// Modification ici: utilisation de useDayjs au lieu de l'import direct
import { useDayjs } from "#dayjs";
const supabase = useSupabaseClient();

// Configuration de dayjs avec le nouveau système d'importation
const dayjs = useDayjs();
dayjs.locale("fr");
// Remarque: si vous avez besoin d'extensions, vous pouvez les ajouter comme ceci:
// dayjs.extend(...)

const user = useUser();
const whatsappStore = useWhatsapp();

// Calendrier
const currentDate = ref(dayjs());
const weekdays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const campaigns = ref([]);

// Récupération des campagnes depuis Supabase
const fetchCampaigns = async () => {
  try {
    // Remplacer cette partie par votre code d'accès à Supabase
    const { data, error } = await supabase
      .from("whatsapp_campaigns_schedule")
      .select("*");

    if (error) throw error;

    campaigns.value = data;
  } catch (error) {
    console.error("Erreur lors de la récupération des campagnes:", error);
  }
};

const calendarDays = computed(() => {
  const firstDayOfMonth = currentDate.value.startOf("month");
  const lastDayOfMonth = currentDate.value.endOf("month");

  // Début du calendrier (lundi de la semaine contenant le premier jour du mois)
  let startDay =
    firstDayOfMonth.day() === 0
      ? firstDayOfMonth.subtract(6, "day")
      : firstDayOfMonth.subtract(firstDayOfMonth.day() - 1, "day");

  // Fin du calendrier (dimanche de la semaine contenant le dernier jour du mois)
  let endDay =
    lastDayOfMonth.day() === 0
      ? lastDayOfMonth
      : lastDayOfMonth.add(7 - lastDayOfMonth.day(), "day");

  const days = [];
  let currentDay = startDay;

  while (currentDay.isBefore(endDay) || currentDay.isSame(endDay, "day")) {
    days.push({
      date: currentDay,
      isCurrentMonth: currentDay.month() === currentDate.value.month(),
      isToday: currentDay.format("YYYY-MM-DD") === dayjs().format("YYYY-MM-DD"),
    });
    currentDay = currentDay.add(1, "day");
  }

  return days;
});

const getCampaignsForDay = (day) => {
  return campaigns.value.filter((campaign) => {
    const campaignDate = dayjs(campaign.send_date);
    return campaignDate.format("YYYY-MM-DD") === day.date.format("YYYY-MM-DD");
  });
};

const getFormattedCurrentMonth = () => {
  return (
    currentDate.value.format("MMMM YYYY").charAt(0).toUpperCase() +
    currentDate.value.format("MMMM YYYY").slice(1)
  );
};

const previousMonth = () => {
  currentDate.value = currentDate.value.subtract(1, "month");
};

const nextMonth = () => {
  currentDate.value = currentDate.value.add(1, "month");
};

const goToToday = () => {
  currentDate.value = dayjs();
};

const formatDateTime = (dateTime) => {
  return dayjs(dateTime).format("DD/MM/YYYY HH:mm");
};

const truncateText = (text, length) => {
  return text.length > length ? text.substring(0, length) + "..." : text;
};

const getInitials = (name) => {
  return name
    ? name
        .split(" ")
        .map((n) => n.charAt(0))
        .join("")
        .toUpperCase()
    : "?";
};

// Chargement initial des données
onMounted(() => {
  fetchCampaigns();
});
</script>

<style scoped>
.calendar-container {
  border-radius: 0.375rem;
  overflow: hidden;
  background-color: white;
  margin: 0 1rem;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background-color: white;
  border-bottom: 1px solid #e5e7eb;
}

.calendar-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.calendar-nav {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.calendar-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  border: none;
  background-color: #f3f4f6;
  color: #1f2937;
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-nav-btn:hover {
  background-color: rgba(255, 189, 89, 0.2);
  color: #ffbd59;
}

.calendar-nav-today {
  font-size: 0.875rem;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background-color: #ffbd59;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.calendar-nav-today:hover {
  background-color: #d6b77c;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-bottom: 1px solid #e5e7eb;
}

.calendar-weekday {
  padding: 0.75rem;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  background-color: #f3f4f6;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-auto-rows: minmax(6rem, auto);
}

.calendar-day {
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  padding: 0.5rem;
  position: relative;
}

.calendar-day:nth-child(7n) {
  border-right: none;
}

.calendar-day-number {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.calendar-day.other-month .calendar-day-number {
  color: #9ca3af;
}

.calendar-day.today {
  background-color: rgba(255, 189, 89, 0.2);
}

.calendar-day.today .calendar-day-number {
  background-color: #ffbd59;
  color: white;
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
}

.campaign-event {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background-color: rgba(255, 189, 89, 0.2);
  border-left: 3px solid #ffbd59;
  margin-bottom: 0.25rem;
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.campaign-event:hover {
  background-color: rgba(255, 189, 89, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.campaign-count {
  color: #ffbd59;
  font-weight: 600;
}

.campaign-details {
  position: absolute;
  z-index: 10;
  background-color: white;
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  min-width: 16rem;
  max-width: 24rem;
  top: 100%;
  left: 0;
  display: none;
}

.campaign-event:hover .campaign-details {
  display: block;
}

.customer-list {
  max-height: 10rem;
  overflow-y: auto;
  margin-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
  padding-top: 0.5rem;
}

.customer-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
  font-size: 0.75rem;
}

.customer-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 9999px;
  background-color: rgba(255, 189, 89, 0.2);
  color: #ffbd59;
}

.empty-day {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #9ca3af;
  font-size: 0.75rem;
  font-style: italic;
}

.legend {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: #f3f4f6;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.legend-color {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 0.25rem;
}
</style>
