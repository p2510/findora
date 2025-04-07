// stores/chatStore.js
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useUser } from "@/stores/user";

export const useChatStore = defineStore(
  "chat",
  () => {
    // État
    const conversations = ref([]);
    const selectedConversation = ref(null);
    const messages = ref([]);
    const filterStatus = ref("all");
    const isLoading = ref(false);
    const users = useUser();

    // Getters
    const filteredConversations = computed(() => {
      if (filterStatus.value === "active") {
        return conversations.value.filter(
          (conv) => conv.status.toLowerCase() === "active"
        );
      }
      return conversations.value;
    });

    // Actions
    async function fetchConversations() {
      try {
        isLoading.value = true;
        const response = await fetch(
          `/api/agent/chat/list?user_id=${users.info.uuid}`
        );
        if (!response.ok)
          throw new Error(`Response status: ${response.status}`);
        const data = await response.json();
        conversations.value = data;

        // Sélectionner automatiquement la première conversation
        if (data.length > 0 && !selectedConversation.value) {
          selectConversation(data[0]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des conversations", error);
      } finally {
        isLoading.value = false;
      }
    }

    async function fetchMessages(conversationId) {
      try {
        isLoading.value = true;
        const response = await fetch(
          `/api/agent/chat/messages/${conversationId}`
        );
        if (!response.ok)
          throw new Error(`Response status: ${response.status}`);
        const data = await response.json();
        messages.value = data;
      } catch (error) {
        console.error("Erreur lors du chargement des messages", error);
      } finally {
        isLoading.value = false;
      }
    }

    function selectConversation(conversation) {
      selectedConversation.value = conversation;
      fetchMessages(conversation.id);
    }

    function setFilter(status) {
      filterStatus.value = status;
    }
    async function takeOver(conversationId, phone) {
      try {
        isLoading.value = true;

        // Mettre à jour le statut de la conversation à "terminated"
        const response = await fetch(
          `/api/agent/chat/update-status/${conversationId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ status: "terminated" }),
          }
        );

        if (!response.ok)
          throw new Error(`Response status: ${response.status}`);

        // Mettre à jour localement
        if (
          selectedConversation.value &&
          selectedConversation.value.id === conversationId
        ) {
          selectedConversation.value.status = "terminated";
        }

        // Trouver et mettre à jour dans la liste des conversations
        const conversationIndex = conversations.value.findIndex(
          (conv) => conv.id === conversationId
        );
        if (conversationIndex !== -1) {
          conversations.value[conversationIndex].status = "terminated";
        }

        // Ouvrir WhatsApp
        const whatsappUrl = `https://wa.me/${phone.replace(/\+/g, "")}`;
        window.open(whatsappUrl, "_blank");

        return true;
      } catch (error) {
        console.error("Erreur lors de la prise de relais", error);
        return false;
      } finally {
        isLoading.value = false;
      }
    }

    // Formatage de dates
    function formatDate(dateString) {
      if (!dateString) return "Aucune date";
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }

    function formatTime(dateString) {
      const date = new Date(dateString);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }

    function formatDateHuman(dateString) {
      const date = new Date(dateString);
      const now = new Date();

      const diffTime = now - date;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Aujourd'hui";
      if (diffDays === 1) return "Hier";
      if (diffDays < 7) return `Il y a ${diffDays} jours`;
      if (diffDays < 14) return "Il y a une semaine";

      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }

    function truncateText(text, maxLength = 50) {
      if (!text) return "";
      return text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
    }
    const $reset = () => {
      conversations.value = [];
      selectedConversation.value = null;
      messages.value = [];
      filterStatus.value = "all";
      isLoading.value = false;
    };

    return {
      conversations,
      selectedConversation,
      messages,
      filterStatus,
      isLoading,
      filteredConversations,
      fetchConversations,
      fetchMessages,
      selectConversation,
      setFilter,
      takeOver,
      formatDate,
      formatTime,
      formatDateHuman,
      truncateText,
      $reset,
    };
  },
  {
    persist: true,
  }
);
