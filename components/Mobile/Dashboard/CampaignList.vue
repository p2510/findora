<!-- components/MobileCampaignList.vue -->
<template>
  <div>
    <!-- Loading State -->
    <div v-if="isLoading" class="p-8 text-center">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#ffbd59] mx-auto"
      ></div>
    </div>

    <!-- Campaign List -->
    <div
      v-else-if="campaigns.length > 0"
      class="divide-y divide-gray-200 dark:divide-slate-700"
    >
      <div
        v-for="campaign in latestCampaigns"
        :key="campaign.id"
        @click="navigateTo(`/whatsapp`)"
        class="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
      >
        <div class="flex items-start justify-between gap-3">
          <!-- Campaign Info -->
          <div class="flex-1 min-w-0">
            <h4
              class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2"
            >
              {{ truncateText(campaign.content || campaign.message, 60) }}
            </h4>
            <div class="flex items-center gap-3 mt-1">
              <p
                class="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1"
              >
                <UIcon name="i-heroicons-calendar" class="w-3 h-3" />
                {{ formatDate(campaign.display_date, campaign.type) }}
              </p>
              <p
                class="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1"
              >
                <UIcon name="i-heroicons-users" class="w-3 h-3" />
                {{ campaign.customers?.length || 0 }}
                {{ t("dashboard.contacts") }}
              </p>
            </div>
          </div>

          <!-- Status Badge -->
          <div class="flex flex-col items-end gap-1">
            <div class="flex items-center gap-1">
              <!-- Campaign Type Icon -->
              <UIcon
                :name="
                  campaign.type === 'scheduled'
                    ? 'i-heroicons-clock'
                    : 'i-heroicons-check-circle'
                "
                :class="[
                  'w-3 h-3',
                  campaign.type === 'scheduled'
                    ? 'text-blue-600'
                    : 'text-green-600',
                ]"
              />
              <span
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  getStatusClass(campaign.status),
                ]"
              >
                {{ getStatusLabel(campaign.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="p-12 text-center">
      <div
        class="w-20 h-20 bg-gradient-to-br from-[#ffbd59]/20 to-[#f3c775]/20 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <UIcon
          name="i-heroicons-paper-airplane"
          class="w-10 h-10 text-[#ffbd59]"
        />
      </div>
      <h3 class="text-base font-medium text-gray-900 dark:text-white mb-2">
        {{ t("dashboard.create_first_campaign") }}
      </h3>
      <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
        {{ t("dashboard.send_personalized_messages") }}
      </p>
      <NuxtLink
        to="/whatsapp"
        class="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#ffbd59] to-[#f3c775] text-white font-medium rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
      >
        <UIcon name="i-heroicons-plus" class="w-5 h-5" />
        {{ t("dashboard.new_campaign") }}
      </NuxtLink>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from "vue";
import { useDayjs } from "#dayjs";
import { useI18n } from "vue-i18n";
const { t, locale } = useI18n();

const dayjs = useDayjs();
const supabase = useSupabaseClient();
const { $router } = useNuxtApp();

// State
const campaigns = ref([]);
const isLoading = ref(true);

// Computed - Get only the 4 latest campaigns
const latestCampaigns = computed(() => {
  return campaigns.value
    .sort((a, b) => new Date(b.send_date) - new Date(a.send_date))
    .slice(0, 4);
});

// Fetch campaigns from both tables
const fetchCampaigns = async () => {
  isLoading.value = true;
  try {
    const { data: scheduledData, error: scheduledError } = await supabase
      .from("whatsapp_campaigns_schedule")
      .select(`id, content, send_date, is_sent, created_at, customers`)
      .order("send_date", { ascending: false })
      .limit(10);
    if (scheduledError) throw scheduledError;

    const { data: directData, error: directError } = await supabase
      .from("whatsapp_campaigns")
      .select(`id, content, created_at, customers`)
      .order("created_at", { ascending: false })
      .limit(10);
    if (directError) throw directError;

    const scheduled = (scheduledData || []).map((campaign) => ({
      ...campaign,
      type: "scheduled",
      display_date: campaign.send_date,
      status: campaign.is_sent === true ? "completed" : "scheduled",
      customers: parseCustomers(campaign.customers),
    }));

    const direct = (directData || []).map((campaign) => ({
      ...campaign,
      type: "direct",
      status: "completed",
      display_date: campaign.created_at,
      send_date: campaign.created_at,
      success_rate:
        campaign.total_count > 0
          ? Math.round((campaign.success_count / campaign.total_count) * 100)
          : 0,
      customers: parseCustomers(campaign.customers),
    }));

    campaigns.value = [...scheduled, ...direct].sort(
      (a, b) => new Date(b.display_date) - new Date(a.display_date)
    );
  } catch (error) {
    console.error("Erreur lors de la récupération des campagnes:", error);
    campaigns.value = [];
  } finally {
    isLoading.value = false;
  }
};

const parseCustomers = (customers) => {
  if (Array.isArray(customers)) return customers;
  if (customers) {
    try {
      return JSON.parse(customers);
    } catch {
      return [];
    }
  }
  return [];
};

const navigateTo = (path) => {
  $router.push(path);
};

const formatDate = (date, type) => {
  if (!date) return t("dashboard.unknown_date");

  const campaignDate = dayjs(date);
  const now = dayjs();
  const diffDays = campaignDate.diff(now, "day");

  if (type === "direct") {
    if (campaignDate.isSame(now, "day")) {
      return t("dashboard.sent_today_at", { time: campaignDate.format("HH:mm") });
    }
    if (campaignDate.isSame(now.subtract(1, "day"), "day")) {
      return t("dashboard.sent_yesterday_at", { time: campaignDate.format("HH:mm") });
    }
    if (diffDays > -7) {
      return t("dashboard.sent_on_day", { day: campaignDate.format("dddd"), time: campaignDate.format("HH:mm") });
    }
    return t("dashboard.sent_on_date", { date: campaignDate.format("DD MMM"), time: campaignDate.format("HH:mm") });
  }

  if (campaignDate.isSame(now, "day")) {
    return t("dashboard.today_at", { time: campaignDate.format("HH:mm") });
  }
  if (campaignDate.isSame(now.subtract(1, "day"), "day")) {
    return t("dashboard.yesterday_at", { time: campaignDate.format("HH:mm") });
  }
  if (campaignDate.isSame(now.add(1, "day"), "day")) {
    return t("dashboard.tomorrow_at", { time: campaignDate.format("HH:mm") });
  }
  if (Math.abs(diffDays) < 7) {
    return t("dashboard.on_day_at", { day: campaignDate.format("dddd"), time: campaignDate.format("HH:mm") });
  }

  return t("dashboard.on_date_at", { date: campaignDate.format("DD MMM"), time: campaignDate.format("HH:mm") });
};

const truncateText = (text, length) => {
  if (!text) return t("dashboard.default_campaign_message");
  return text.length > length ? text.substring(0, length) + "..." : text;
};

const getStatusClass = (status) => {
  const classes = {
    scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400",
    completed: "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400",
  };
  return classes[status] || classes["scheduled"];
};

const getStatusLabel = (status) => {
  const labels = {
    scheduled: t("dashboard.status.scheduled"),
    completed: t("dashboard.status.completed"),
  };
  return labels[status] || t("dashboard.status.scheduled");
};

onMounted(() => {
  fetchCampaigns();
});
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
