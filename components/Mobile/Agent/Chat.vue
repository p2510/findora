<!-- components/MobileAgentChat.vue -->
<template>
  <div class="flex flex-col" style="height: calc(100vh - 14rem);">
    <!-- Filtres et liste des conversations -->
    <div v-if="!chatStore.selectedConversation" class="flex flex-col h-full pb-24">
      <!-- Barre de filtres -->
      <div class="px-4 pb-3 flex-shrink-0">
        <div class="bg-slate-800 dark:bg-slate-700 rounded-lg p-1 flex items-center gap-1">
          <button
            @click="chatStore.setFilter('all')"
            :class="[
              'flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all',
              chatStore.filterStatus === 'all'
                ? 'bg-slate-400/40 text-white'
                : 'text-slate-400 hover:text-white'
            ]"
          >
            {{ $t("agent.chat.all") }}
          </button>
          
          <button
            @click="chatStore.setFilter('active')"
            :class="[
              'flex-1 py-2 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1',
              chatStore.filterStatus === 'active'
                ? 'bg-slate-400/40 text-white'
                : 'text-slate-400 hover:text-white'
            ]"
          >
            <span>{{ $t("agent.chat.open") }}</span>
            <span v-if="chatStore.pollingActive" class="relative flex h-1.5 w-1.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
            </span>
          </button>
          
          <button
            @click="toggleSound"
            :class="[
              'p-2 rounded-md transition-all',
              soundNotification.isEnabled() ? 'text-blue-400' : 'text-slate-400'
            ]"
            :title="$t('agent.chat.sound_notifications')"
          >
            <UIcon
              :name="soundNotification.isEnabled() ? 'i-heroicons-speaker-wave' : 'i-heroicons-speaker-x-mark'"
              class="w-4 h-4"
            />
          </button>
        </div>
      </div>

      <!-- Liste des conversations -->
      <div 
        ref="conversationListContainer"
        @scroll="handleScroll"
        class="flex-1 overflow-y-auto px-4 pb-20"
      >
        <div v-if="chatStore.isLoading && displayedConversations.length === 0" class="flex justify-center py-8">
          <UIcon name="i-heroicons-arrow-path" class="w-6 h-6 animate-spin text-gray-400" />
        </div>
        
        <div v-else-if="sortedFilteredConversations.length === 0 && !chatStore.isLoading" class="text-center py-12">
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t("agent.chat.no_conversations") }}
          </p>
        </div>
        
        <div v-else class="space-y-2">
          <div
            v-for="conversation in displayedConversations"
            :key="conversation.id"
            @click="chatStore.selectConversation(conversation)"
            class="bg-white dark:bg-slate-800 rounded-xl p-3 border border-gray-200 dark:border-slate-700 cursor-pointer hover:shadow-md transition-all"
          >
            <div class="flex items-start gap-3">
              <img
                :src="`https://ui-avatars.com/api/?name=${conversation.name}&background=1d4ed8&color=ffffff`"
                alt="Avatar"
                class="w-10 h-10 rounded-full flex-shrink-0"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-medium text-gray-900 dark:text-white truncate">
                    {{ conversation.name }}
                  </h3>
                  <span class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                    {{ chatStore.formatDateHuman(conversation.last_message_at) }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                  {{ conversation.last_response || conversation.last_content }}
                </p>
              </div>
            </div>
          </div>
          
          <!-- Indicateur de chargement en bas -->
          <div v-if="isLoadingMore" class="flex justify-center py-4">
            <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin text-gray-400" />
            <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">Chargement...</span>
          </div>
          
          <!-- Message quand toutes les conversations sont chargées -->
          <div v-else-if="allConversationsLoaded && displayedConversations.length > 0" class="text-center py-4">
            <p class="text-xs text-gray-500 dark:text-gray-400">
              Toutes les conversations sont chargées
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Vue de conversation -->
    <div v-else class="relative flex-1 flex flex-col pb-40">
      <!-- Header de conversation -->
      <div class="z-50 sticky top-10  bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 py-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <button
              @click="chatStore.selectedConversation = null"
              class="p-1 -ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <UIcon name="i-heroicons-arrow-left" class="w-5 h-5" />
            </button>
            <img
              :src="`https://ui-avatars.com/api/?name=${chatStore.selectedConversation.name}&background=1d4ed8&color=ffffff`"
              alt="Avatar"
              class="w-8 h-8 rounded-full"
            />
            <div>
              <h3 class="font-medium text-gray-900 dark:text-white text-sm">
                {{ chatStore.selectedConversation.name }}
              </h3>
              <p class="text-xs text-gray-500 dark:text-gray-400">
                +{{ chatStore.selectedConversation.phone }}
              </p>
            </div>
          </div>
          
          <span
            :class="[
              'px-2 py-1 rounded-full text-xs font-medium',
              chatStore.selectedConversation.status === 'active'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            ]"
          >
            {{ chatStore.selectedConversation.status === 'terminated' 
              ? $t("agent.chat.terminated") 
              : $t("agent.chat.active") 
            }}
          </span>
        </div>
      </div>

      <!-- Messages -->
      <div
        ref="chatContainer"
        class="z-10 flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-slate-900/50"
        style="background-image: url('https://www.transparenttextures.com/patterns/grey-sandbag.png');"
      >
        <div v-if="sortedMessages.length === 0" class="text-center py-8">
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {{ $t("agent.chat.no_messages") }}
          </p>
        </div>
        
        <div v-else class="space-y-3">
          <div v-for="message in sortedMessages" :key="message.id" class="space-y-2">
            <!-- Message utilisateur -->
            <div class="flex items-end gap-2">
              <img
                src="/image/user.svg"
                alt="User"
                class="w-6 h-6 rounded-full bg-white dark:bg-slate-700 p-1"
              />
              <div class="flex-1 max-w-[80%]">
                <div class="bg-white dark:bg-slate-700 rounded-2xl rounded-bl-md p-3 shadow-sm">
                  <p class="text-sm text-gray-900 dark:text-white">{{ message.content }}</p>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-2">
                  {{ chatStore.formatTime(message.created_at) }}
                </p>
              </div>
            </div>

            <!-- Réponse automatique -->
            <div v-if="message.response" class="flex items-end gap-2 justify-end">
              <div class="flex-1 max-w-[80%]">
                <div class="bg-blue-600 dark:bg-blue-700 rounded-2xl rounded-br-md p-3 shadow-sm ml-auto">
                  <p class="text-sm text-white">{{ message.response }}</p>
                </div>
                <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 mr-2 text-right">
                  {{ chatStore.formatTime(message.created_at) }}
                </p>
              </div>
              <div class="w-6 h-6 bg-blue-600 dark:bg-blue-700 rounded-full flex items-center justify-center">
                <UIcon name="i-heroicons-bolt" class="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions en bas -->
      <div class="fixed w-full bottom-28 bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-3 flex gap-2">
        <a
          :href="'tel:+' + chatStore.selectedConversation.phone"
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors"
        >
          <UIcon name="i-heroicons-phone" class="w-4 h-4" />
          <span class="text-sm font-medium">{{ $t("agent.chat.call") }}</span>
        </a>
        
        <button
          @click="handleTakeOver"
          :disabled="chatStore.isLoading || chatStore.selectedConversation.status === 'terminated'"
          :class="[
            'flex-1 rounded-lg py-2.5 flex items-center justify-center gap-2 transition-colors',
            chatStore.selectedConversation.status === 'terminated'
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          ]"
        >
          <UIcon name="i-heroicons-chat-bubble-left-right" class="w-4 h-4" />
          <span class="text-sm font-medium">{{ $t("agent.chat.take_over") }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, onBeforeUnmount, computed } from "vue";
import { useChatStore } from "@/stores/agent/chat";
import { SoundNotification } from "@/utils/soundNotification";

const chatStore = useChatStore();
const soundNotification = ref(new SoundNotification());
const chatContainer = ref(null);
const conversationListContainer = ref(null);
const lastMessageCount = ref({});

// Variables pour le chargement infini
const ITEMS_PER_PAGE = 10;
const currentPage = ref(1);
const isLoadingMore = ref(false);
const allConversationsLoaded = ref(false);

// Trier les conversations par date (plus récent en premier)
const sortedFilteredConversations = computed(() => {
  return [...chatStore.filteredConversations].sort((a, b) => {
    const dateA = new Date(a.last_message_at);
    const dateB = new Date(b.last_message_at);
    return dateB - dateA; // Plus récent en premier
  });
});

// Conversations affichées avec pagination
const displayedConversations = computed(() => {
  const endIndex = currentPage.value * ITEMS_PER_PAGE;
  return sortedFilteredConversations.value.slice(0, endIndex);
});

// Trier les messages par date (plus ancien en premier pour l'affichage chronologique)
const sortedMessages = computed(() => {
  return [...chatStore.messages].sort((a, b) => {
    const dateA = new Date(a.created_at);
    const dateB = new Date(b.created_at);
    return dateA - dateB; // Plus ancien en premier pour un affichage chronologique
  });
});

// Vérifier si toutes les conversations sont chargées
watch([() => displayedConversations.value.length, () => sortedFilteredConversations.value.length], ([displayed, total]) => {
  allConversationsLoaded.value = displayed >= total;
});

// Réinitialiser la pagination quand le filtre change
watch(() => chatStore.filterStatus, () => {
  currentPage.value = 1;
  allConversationsLoaded.value = false;
  if (conversationListContainer.value) {
    conversationListContainer.value.scrollTop = 0;
  }
});

// Fonction pour gérer le scroll et charger plus de conversations
const handleScroll = async (event) => {
  const container = event.target;
  const scrollPosition = container.scrollTop + container.clientHeight;
  const scrollHeight = container.scrollHeight;
  
  // Si on est proche du bas (100px) et qu'on ne charge pas déjà
  if (scrollPosition >= scrollHeight - 100 && !isLoadingMore.value && !allConversationsLoaded.value) {
    await loadMoreConversations();
  }
};

// Charger plus de conversations
const loadMoreConversations = async () => {
  if (isLoadingMore.value || allConversationsLoaded.value) return;
  
  isLoadingMore.value = true;
  
  // Simuler un délai de chargement pour une meilleure UX
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Augmenter la page pour afficher plus de conversations
  const totalAvailable = sortedFilteredConversations.value.length;
  const currentlyDisplayed = currentPage.value * ITEMS_PER_PAGE;
  
  if (currentlyDisplayed < totalAvailable) {
    currentPage.value++;
  }
  
  isLoadingMore.value = false;
};

// Fonction pour faire défiler vers le bas
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

// Fonction pour gérer la prise de relais
const handleTakeOver = async () => {
  if (!chatStore.selectedConversation || chatStore.selectedConversation.status === "terminated") {
    return;
  }

  await chatStore.takeOver(
    chatStore.selectedConversation.id,
    chatStore.selectedConversation.phone
  );
};

// Fonction pour activer/désactiver les notifications sonores
const toggleSound = () => {
  soundNotification.value.setEnabled(!soundNotification.value.isEnabled());
};

// Vérifier les nouveaux messages
const checkNewMessages = () => {
  chatStore.conversations.forEach((conversation) => {
    const convId = conversation.id;

    if (!lastMessageCount.value[convId]) {
      lastMessageCount.value[convId] = {
        timestamp: conversation.last_message_at,
        content: conversation.last_content,
      };
      return;
    }

    const lastCheck = lastMessageCount.value[convId];

    if (
      new Date(conversation.last_message_at) > new Date(lastCheck.timestamp) ||
      conversation.last_content !== lastCheck.content
    ) {
      const isNotCurrentConversation =
        !chatStore.selectedConversation ||
        chatStore.selectedConversation.id !== convId;

      if (isNotCurrentConversation || !document.hasFocus()) {
        soundNotification.value.play();
      }

      lastMessageCount.value[convId] = {
        timestamp: conversation.last_message_at,
        content: conversation.last_content,
      };
    }
  });
};

// Lifecycle
onMounted(() => {
  soundNotification.value.preload();
  chatStore.fetchConversations();

  if (chatStore.filterStatus === "active") {
    chatStore.startRealTimePolling();
  }

  watch(
    () => [...chatStore.conversations],
    () => {
      checkNewMessages();
    },
    { deep: true }
  );

  nextTick(() => {
    scrollToBottom();
  });
});

watch(
  () => chatStore.messages.length,
  () => {
    nextTick(() => {
      scrollToBottom();
    });
  }
);

onBeforeUnmount(() => {
  chatStore.stopRealTimePolling();
});
</script>