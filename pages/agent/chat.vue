<!-- pages/agent/chat.vue -->
<template>
  <div>
    <!-- Version Desktop (originale) -->
    <section v-if="!isMobile" class="mt-14">
      <AgentNav />
      <div class="h-screen">
        <div class="sm:h-4/6 2xl:h-3/4 grid grid-cols-12 pt-10 h-full">
          <!-- Liste des conversations -->
          <div
            class="hidden md:block col-span-4 2xl:col-span-3 h-full rounded-3xl px-5 pb-3 space-y-2 bg-transparent overflow-y-auto relative dark:bg-slate-800 dark:text-white"
          >
            <div class="flex justify-center sticky top-0 z-10 shadow-sm mb-4">
              <ul
                class="flex justify-center gap-4 items-center bg-slate-800 rounded-lg py-2 px-4 w-full dark:bg-slate-700"
              >
                <!-- Bouton Tout -->
                <li
                  @click="chatStore.setFilter('all')"
                  :class="[
                    'cursor-pointer text-center flex items-center justify-center gap-2 rounded-lg transition-all duration-200 ease-in-out px-6 py-2 text-sm xl:text-md',
                    chatStore.filterStatus === 'all'
                      ? 'bg-slate-400/40 text-white'
                      : 'text-slate-500 hover:text-slate-400',
                  ]"
                >
                  {{ $t("agent.chat.all") }}
                </li>

                <!-- Bouton Ouvert -->
                <li
                  @click="chatStore.setFilter('active')"
                  :class="[
                    'cursor-pointer text-center flex items-center justify-center gap-2 rounded-lg transition-all duration-200 ease-in-out px-6 py-2 text-sm xl:text-md',
                    chatStore.filterStatus === 'active'
                      ? 'bg-slate-400/40 text-white'
                      : 'text-slate-500 hover:text-slate-400',
                  ]"
                >
                  <span>{{ $t("agent.chat.open") }}</span>
                  <!-- Indicateur de temps réel lorsque actif -->
                  <span
                    v-if="chatStore.pollingActive"
                    class="relative flex h-2 w-2"
                  >
                    <span
                      class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
                    ></span>
                    <span
                      class="relative inline-flex rounded-full h-2 w-2 bg-green-500"
                    ></span>
                  </span>
                </li>
                <!-- Bouton pour activer/désactiver les notifications sonores -->
                <li
                  @click="toggleSound"
                  class="cursor-pointer text-center flex items-center justify-center rounded-lg transition-all duration-200 ease-in-out px-2 py-2 text-sm"
                  :class="{
                    'text-blue-400': soundNotification.isEnabled(),
                    'text-slate-500': !soundNotification.isEnabled(),
                  }"
                  :title="$t('agent.chat.sound_notifications')"
                >
                  <UIcon
                    :name="
                      soundNotification.isEnabled()
                        ? 'i-heroicons-speaker-wave'
                        : 'i-heroicons-speaker-x-mark'
                    "
                    class="w-5 h-5"
                  />
                </li>
              </ul>
            </div>

            <ol class="flex flex-col gap-2 divide-y-[1px] dark:divide-slate-600">
              <li
                v-for="conversation in chatStore.filteredConversations"
                :key="conversation.id"
                @click="chatStore.selectConversation(conversation)"
                class="cursor-pointer"
                :class="[
                  chatStore.selectedConversation?.id === conversation.id
                    ? 'transition-all duration-200 bg-slate-100 scale-[1.02] dark:bg-slate-600'
                    : '',
                ]"
              >
                <div class="px-5 py-3 space-y-2">
                  <p class="flex justify-start items-center text-sm">
                    <img
                      :src="
                        'https://ui-avatars.com/api/?name=' +
                        conversation.name +
                        '&background=1d4ed8&color=ffffff'
                      "
                      alt=""
                      class="w-8 h-8 rounded-full"
                    />
                    <span
                      class="px-3 py-[2px] text-slate-950 rounded-full dark:text-white"
                    >
                      {{ conversation.name }}
                    </span>
                  </p>
                  <p
                    v-if="conversation.last_response"
                    class="text-slate-700 text-xs dark:text-slate-300"
                  >
                    {{ chatStore.truncateText(conversation.last_response) }}
                  </p>
                  <p v-else class="text-slate-700 text-xs dark:text-slate-300">
                    {{ chatStore.truncateText(conversation.last_content) }}
                  </p>

                  <div
                    class="flex items-center justify-between text-white gap-2 pt-4"
                  >
                    <span
                      class="text-sm px-3 py-[2px] rounded-full inline"
                    ></span>
                    <span
                      class="text-blue-700 text-xs px-3 py-[2px] rounded-full inline"
                    >
                      {{
                        chatStore.formatDateHuman(conversation.last_message_at)
                      }}
                    </span>
                  </div>
                </div>
              </li>
            </ol>

            <div v-if="chatStore.isLoading" class="text-center py-4">
              <UIcon
                name="i-heroicons-arrow-path"
                class="w-6 h-6 animate-spin text-blue-700 hidden"
              />
            </div>
          </div>

          <!-- Zone d'affichage des messages -->
          <div
            v-if="chatStore.selectedConversation"
            class="hidden md:block col-span-8 2xl:col-start-4 2xl:col-end-10 bg-transparent p-5 dark:bg-slate-800 dark:text-white"
          >
            <h2 class="text-lg flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <p class="rounded-full bg-slate-200 p-2 mr-2 dark:bg-slate-600">
                  <img
                    src="/public/image/user.svg"
                    alt="User Avatar"
                    class="w-10 h-10 rounded-full"
                  />
                </p>
                <p class="flex flex-col">
                  <span class="text-sm">
                    {{ chatStore.selectedConversation.name }}</span
                  >
                  <span class="text-sm text-slate-600 dark:text-slate-400"
                    >+{{ chatStore.selectedConversation.phone }}</span
                  >
                </p>
              </div>

              <!-- Date et Statut -->
              <div class="flex items-center gap-2">
                <span class="text-sm text-slate-600 dark:text-slate-400">{{
                  chatStore.formatDate(
                    chatStore.selectedConversation.last_message_at
                  )
                }}</span>

                <!-- Statut avec badge -->
                <span
                  :class="{
                    'bg-green-500 text-white':
                      chatStore.selectedConversation.status === 'active',
                    'bg-red-500 text-white':
                      chatStore.selectedConversation.status === 'terminated',
                  }"
                  class="px-3 py-1 rounded-lg text-xs"
                >
                  {{
                    chatStore.selectedConversation.status === "terminated"
                      ? $t("agent.chat.terminated")
                      : $t("agent.chat.active")
                  }}
                </span>
              </div>
            </h2>

            <div
              ref="chatContainer"
              class="space-y-2 overflow-y-auto h-96 p-4 rounded-2xl"
              style="
                background-color: #e2e8f030;
                background-image: url('https://www.transparenttextures.com/patterns/grey-sandbag.png');
              "
            >
              <div
                v-for="message in chatStore.messages"
                :key="message.id"
                class="flex flex-col space-y-2"
              >
                <!-- Message utilisateur (aligné à gauche) -->
                <div class="flex justify-start items-start">
                  <p class="rounded-full bg-white p-2 mr-2 dark:bg-slate-600">
                    <img
                      src="/public/image/user.svg"
                      alt="User Avatar"
                      class="w-4 h-4 rounded-full"
                    />
                  </p>
                  <div class="flex flex-col gap-[2px] w-3/4">
                    <div
                      class="p-3 rounded-lg bg-white text-slate-900 rounded-tl-none dark:bg-slate-700 dark:text-white"
                    >
                      <p class="text-sm">{{ message.content }}</p>
                    </div>
                    <span class="text-slate-600 text-xs dark:text-slate-400">{{
                      chatStore.formatTime(message.created_at)
                    }}</span>
                  </div>
                </div>

                <!-- Réponse automatique (alignée à droite) -->
                <div v-if="message.response" class="flex justify-end items-start">
                  <div class="flex flex-col gap-[2px] w-3/4">
                    <div
                      class="p-3 rounded-lg bg-blue-700 text-white rounded-tr-none dark:bg-blue-800"
                    >
                      <p class="text-sm">{{ message.response }}</p>
                    </div>
                    <p class="text-right">
                      <span class="text-slate-600 text-xs dark:text-slate-400">{{
                        chatStore.formatTime(message.created_at)
                      }}</span>
                    </p>
                  </div>
                  <p class="rounded-full bg-blue-700 px-2 pt-2 ml-2">
                    <UIcon
                      name="i-heroicons-bolt"
                      class="w-4 h-4 rounded-full text-white"
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Panel d'informations à droite -->
          <div
            v-if="chatStore.selectedConversation"
            class="hidden 2xl:block 2xl:col-span-3 p-5 dark:bg-slate-800 dark:text-white"
          >
            <div class="bg-slate-100 rounded-xl p-5 dark:bg-slate-700">
              <h3 class="text-sm 2xl:text-md mb-4 dark:text-white">
                {{ $t("agent.chat.conversation_details") }}
              </h3>

              <!-- Stats de la conversation -->
              <div class="space-y-4 mb-6">
                <div class="flex items-center justify-between">
                  <span
                    class="text-xs 2xl:text-sm text-slate-700 dark:text-slate-400"
                  >
                    {{ $t("agent.chat.contact_messages") }}
                  </span>
                  <span
                    class="text-xs 2xl:text-sm text-slate-800 dark:text-slate-300"
                  >
                    {{ chatStore.messages.length }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span
                    class="text-xs 2xl:text-sm text-slate-700 dark:text-slate-400"
                  >
                    {{ $t("agent.chat.first_exchange") }}
                  </span>
                  <span
                    class="text-xs 2xl:text-sm text-slate-800 dark:text-slate-300"
                  >
                    {{
                      chatStore.messages.length
                        ? chatStore.formatDate(chatStore.messages[0]?.created_at)
                        : "N/A"
                    }}
                  </span>
                </div>
                <div class="flex items-center justify-between">
                  <span
                    class="text-xs 2xl:text-sm text-slate-700 dark:text-slate-400"
                  >
                    {{ $t("agent.chat.last_contact") }}
                  </span>
                  <span
                    class="text-xs 2xl:text-sm text-slate-800 dark:text-slate-300"
                  >
                    {{
                      chatStore.formatDateHuman(
                        chatStore.selectedConversation.last_message_at
                      )
                    }}
                  </span>
                </div>
              </div>

              <!-- Actions -->
              <div class="space-y-3 mt-6">
                <a
                  :href="'tel:+' + chatStore.selectedConversation.phone"
                  class="text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 ease-in-out w-full py-2 rounded-lg flex items-center justify-center gap-2"
                >
                  <UIcon name="i-heroicons-phone" class="w-4 h-4 text-white" />
                  {{ $t("agent.chat.call") }}
                </a>
                <button
                  @click="handleTakeOver"
                  :disabled="
                    chatStore.isLoading ||
                    chatStore.selectedConversation.status === 'terminated'
                  "
                  class="text-white bg-green-600 hover:bg-green-700 transition-all duration-300 ease-in-out w-full py-2 rounded-lg flex items-center justify-center gap-2"
                  :class="{
                    'opacity-50 cursor-not-allowed':
                      chatStore.selectedConversation.status === 'terminated',
                  }"
                >
                  <UIcon
                    name="i-heroicons-chat-bubble-left-right"
                    class="w-4 h-4"
                  />
                  {{ $t("agent.chat.take_over") }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Version Mobile -->
    <MobileAgentView v-else>
      <MobileAgentChat />
    </MobileAgentView>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref, watch, nextTick } from "vue";
import { useChatStore } from "@/stores/agent/chat";
import { SoundNotification } from "@/utils/soundNotification";

const { t } = useI18n();
const isMobile = ref(false);

definePageMeta({
  middleware: ["auth", "is-ultra"],
  alias: "/agent/chat",
});

useHead({
  title: t("agent.chat.delegate_conversations"),
});

// Auto scroll vers le bas
const chatContainer = ref(null);
const scrollToBottom = () => {
  if (chatContainer.value) {
    chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
  }
};

const chatStore = useChatStore();

const soundNotification = ref(new SoundNotification());

const handleTakeOver = async () => {
  if (
    !chatStore.selectedConversation ||
    chatStore.selectedConversation.status === "terminated"
  ) {
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

// Variable pour suivre le dernier comptage de messages total
const lastMessageCount = ref({});

// Détecter les nouveaux messages en surveillant les conversations
const checkNewMessages = () => {
  chatStore.conversations.forEach((conversation) => {
    const convId = conversation.id;

    // Si c'est la première vérification pour cette conversation
    if (!lastMessageCount.value[convId]) {
      lastMessageCount.value[convId] = {
        timestamp: conversation.last_message_at,
        content: conversation.last_content,
      };
      return;
    }

    const lastCheck = lastMessageCount.value[convId];

    // Vérifier si le timestamp ou le contenu a changé
    if (
      new Date(conversation.last_message_at) > new Date(lastCheck.timestamp) ||
      conversation.last_content !== lastCheck.content
    ) {
      // Si la conversation n'est pas actuellement affichée ou si l'app n'est pas au premier plan
      const isNotCurrentConversation =
        !chatStore.selectedConversation ||
        chatStore.selectedConversation.id !== convId;

      // Jouer la notification si approprié
      if (isNotCurrentConversation || !document.hasFocus()) {
        soundNotification.value.play();

        // Tenter d'afficher une notification du navigateur si l'app n'est pas au premier plan
        if (!document.hasFocus() && "Notification" in window) {
          // Demander la permission si pas encore accordée
          if (Notification.permission === "default") {
            Notification.requestPermission();
          }

          // Afficher la notification si permission accordée
          if (Notification.permission === "granted") {
            new Notification(t("agent.chat.new_message"), {
              body: `${conversation.name}: ${
                conversation.last_content || conversation.last_response
              }`,
              icon: "/public/icon.png",
            });
          }
        }
      }

      // Mettre à jour le dernier état connu
      lastMessageCount.value[convId] = {
        timestamp: conversation.last_message_at,
        content: conversation.last_content,
      };
    }
  });
};

// Charger les conversations au montage du composant
onMounted(() => {
  // Détecter si mobile
  isMobile.value = window.innerWidth < 768;
  window.addEventListener('resize', () => {
    isMobile.value = window.innerWidth < 768;
  });

  // Desktop only
  if (!isMobile.value) {
    // Précharger le son de notification
    soundNotification.value.preload();

    // Charger toutes les conversations au départ
    chatStore.fetchConversations();

    // Si on est sur le filtre "active", démarrer le polling
    if (chatStore.filterStatus === "active") {
      chatStore.startRealTimePolling();
    }

    // Demander la permission pour les notifications du navigateur
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    // Observer les changements dans les conversations pour détecter les nouveaux messages
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
  }
});

// Watch les messages : scroll à chaque changement (desktop only)
watch(
  () => chatStore.messages.length,
  () => {
    if (!isMobile.value) {
      nextTick(() => {
        scrollToBottom();
      });
    }
  }
);

onBeforeUnmount(() => {
  if (!isMobile.value) {
    chatStore.stopRealTimePolling();
  }
});
</script>