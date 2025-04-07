<template>
  <section class="mt-14">
    <AgentNav />
    <div class="h-screen">
      <div
        class="2xl:h-3/4  grid grid-cols-12 pt-10 h-full"
      >
        <!-- Liste des conversations -->
        <div
          class="col-span-4 2xl:col-span-3 h-full rounded-3xl px-5 pb-3 space-y-2 bg-transparent overflow-y-auto relative"
        >
          <div class="flex justify-center sticky top-0 z-10 shadow-sm mb-4">
            <ul
              class="flex justify-center gap-4 items-center bg-slate-800 rounded-lg py-2 px-4 w-full"
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
                Tout
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
                Ouvert
              </li>
            </ul>
          </div>

          <ol class="flex flex-col gap-2 divide-y-[1px]">
            <li
              v-for="conversation in chatStore.filteredConversations"
              :key="conversation.id"
              @click="chatStore.selectConversation(conversation)"
              class="cursor-pointer"
              :class="[
                chatStore.selectedConversation?.id === conversation.id
                  ? 'transition-all duration-200 bg-slate-100 scale-[1.02]'
                  : '',
              ]"
            >
              <div class="px-5 py-3 space-y-2">
                <p class="flex justify-start items-center text-sm text-white">
                  <img
                    :src="
                      'https://ui-avatars.com/api/?name=' +
                      conversation.name +
                      '&background=1d4ed8&color=ffffff'
                    "
                    alt=""
                    class="w-8 h-8 rounded-full"
                  />
                  <span class="px-3 py-[2px] text-slate-950 rounded-full">
                    {{ conversation.name }}
                  </span>
                </p>
                <p
                  v-if="conversation.last_response"
                  class="text-slate-700 text-xs"
                >
                  {{ chatStore.truncateText(conversation.last_response) }}
                </p>
                <p v-else class="text-slate-700 text-xs">
                  {{ chatStore.truncateText(conversation.last_content) }}
                </p>

                <div
                  class="flex items-center justify-between text-white gap-2 pt-4"
                >
                  <span class="text-sm px-3 py-[2px] rounded-full inline">
                  </span>
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
              class="w-6 h-6 animate-spin text-blue-700"
            />
          </div>
        </div>

        <!-- Zone d'affichage des messages -->
        <div
          v-if="chatStore.selectedConversation"
          class="col-span-8 2xl:col-start-4 2xl:col-end-10 bg-transparent p-5"
        >
          <h2 class="text-lg flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <p class="rounded-full bg-slate-200 p-2 mr-2">
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
                <span class="text-sm text-slate-600"
                  >+{{ chatStore.selectedConversation.phone }}</span
                >
              </p>
            </div>

            <!-- Date et Statut -->
            <div class="flex items-center gap-2">
              <span class="text-sm text-slate-600">{{
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
                    ? "Terminé"
                    : "Active"
                }}
              </span>
            </div>
          </h2>
          <div
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
                <p class="rounded-full bg-white p-2 mr-2">
                  <img
                    src="/public/image/user.svg"
                    alt="User Avatar"
                    class="w-4 h-4 rounded-full"
                  />
                </p>
                <div class="flex flex-col gap-[2px] w-3/4">
                  <div
                    class="p-3 rounded-lg bg-white text-slate-900 rounded-tl-none"
                  >
                    <p class="text-sm">{{ message.content }}</p>
                  </div>
                  <span class="text-slate-600 text-xs">{{
                    chatStore.formatTime(message.created_at)
                  }}</span>
                </div>
              </div>

              <!-- Réponse automatique (alignée à droite) -->
              <div v-if="message.response" class="flex justify-end items-start">
                <div class="flex flex-col gap-[2px] w-3/4">
                  <div
                    class="p-3 rounded-lg bg-blue-700 text-white rounded-tr-none"
                  >
                    <p class="text-sm">{{ message.response }}</p>
                  </div>
                  <p class="text-right">
                    <span class="text-slate-600 text-xs">{{
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
        <div v-if="chatStore.selectedConversation" class="hidden 2xl:block 2xl:col-span-3 p-5">
          <div class="bg-slate-100 rounded-xl p-5">
            <h3 class="text-sm 2xl:text-md mb-4">Détails conversations</h3>
            <!-- Stats de la conversation -->
            <div class="space-y-4 mb-6">
              <div class="flex items-center justify-between">
                <span class="text-xs 2xl:text-sm text-slate-700">Messages client</span>
                <span class="text-xs 2xl:text-sm text-slate-800">{{
                  chatStore.messages.length
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs 2xl:text-sm text-slate-700">Premier contact</span>
                <span class="text-xs 2xl:text-sm text-slate-800">{{
                  chatStore.messages.length
                    ? chatStore.formatDate(chatStore.messages[0]?.created_at)
                    : "N/A"
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-xs 2xl:text-sm text-slate-700">Dernier contact</span>
                <span class="text-xs 2xl:text-sm text-slate-800">{{
                  chatStore.formatDateHuman(
                    chatStore.selectedConversation.last_message_at
                  )
                }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="space-y-3 mt-6">
              <a
                :href="'tel:+' + chatStore.selectedConversation.phone"
                class="text-white bg-blue-600 hover:bg-blue-700 transition-all duration-300 ease-in-out w-full py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <UIcon name="i-heroicons-phone" class="w-4 h-4 text-white" />
                Appeler</a
              >
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
                Prendre le relais
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted } from "vue";
import { useChatStore } from "@/stores/agent/chat";

definePageMeta({
  middleware:  ["auth","is-entreprise"],
  alias: "/agent/chat",
});

useHead({
  title:
    "Findora Agent IA Whatsapp - Économisez des heures avec notre agent IA intelligent.",
});

// Utiliser le store Pinia
const chatStore = useChatStore();
// Fonction pour gérer la prise de relais
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

// Charger les conversations au montage du composant
onMounted(() => {
  chatStore.fetchConversations();
});
</script>
