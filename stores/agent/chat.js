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
    const refreshInterval = ref(null); // Pour stocker l'intervalle de mise à jour
    const pollingActive = ref(false); // État du polling
    const lastKnownMessages = ref({}); // Pour stocker le nombre de messages connus par conversation

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
    async function fetchConversations(status = null) {
      try {
        isLoading.value = true;
        let url = `/api/agent/chat/list?user_id=${users.info.uuid}`;

        // Ajouter le paramètre de statut si fourni
        if (status) {
          url += `&status=${status}`;
        }

        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`Response status: ${response.status}`);
        const data = await response.json();

        // Vérifier s'il y a de nouveaux messages
        checkForNewMessages(data);

        // Si on demande uniquement les conversations actives
        if (status === "active") {
          // Mettre à jour uniquement les conversations actives
          const activeConversations = data;

          // Fusionner avec les conversations existantes en conservant les non-actives
          const nonActiveConversations = conversations.value.filter(
            (conv) => conv.status.toLowerCase() !== "active"
          );

          conversations.value = [
            ...activeConversations,
            ...nonActiveConversations,
          ];
        } else {
          // Sinon, mettre à jour toutes les conversations
          conversations.value = data;
        }

        // Sélectionner automatiquement la première conversation
        if (data.length > 0 && !selectedConversation.value) {
          selectConversation(data[data.length - 1]);
        }

        // Mettre à jour la conversation sélectionnée si elle existe dans les nouvelles données
        if (selectedConversation.value) {
          const updatedSelectedConvo = data.find(
            (conv) => conv.id === selectedConversation.value.id
          );
          if (updatedSelectedConvo) {
            selectedConversation.value = updatedSelectedConvo;
            // Si la conversation sélectionnée est mise à jour, rafraîchir ses messages
            await fetchMessages(selectedConversation.value.id);
          }
        }
      } catch (error) {
        console.error("Erreur lors du chargement des conversations", error);
      } finally {
        isLoading.value = false;
      }
    }

    /**
     * Vérifie s'il y a de nouveaux messages dans les conversations
     * @param {Array} updatedConversations - Les conversations mises à jour
     */
    function checkForNewMessages(updatedConversations) {
      updatedConversations.forEach((conversation) => {
        const convId = conversation.id;
        const lastMessageTime = conversation.last_message_at;

        // Si c'est la première fois qu'on voit cette conversation, juste enregistrer son état
        if (!lastKnownMessages.value[convId]) {
          lastKnownMessages.value[convId] = {
            lastTime: lastMessageTime,
            content: conversation.last_content,
            response: conversation.last_response,
          };
          return;
        }

        // Comparer avec le dernier état connu
        const knownState = lastKnownMessages.value[convId];

        // Si la date du dernier message a changé, c'est qu'il y a un nouveau message
        if (new Date(lastMessageTime) > new Date(knownState.lastTime)) {
          // Si le contenu ou la réponse est différent, jouer une notification
          if (
            conversation.last_content !== knownState.content ||
            conversation.last_response !== knownState.response
          ) {
            // Ne pas jouer de notification si c'est la conversation actuellement sélectionnée
            // et que l'utilisateur est déjà en train de la consulter
            const isCurrent =
              selectedConversation.value &&
              selectedConversation.value.id === convId;

            if (!isCurrent || !document.hasFocus()) {
              console.log("1");
              // Afficher une notification du navigateur si l'application n'est pas au premier plan
              if (
                !document.hasFocus() &&
                "Notification" in window &&
                Notification.permission === "granted"
              ) {
                console.log(2);
                new Notification("Nouveau message", {
                  body: `${conversation.name}: ${
                    conversation.last_content || conversation.last_response
                  }`,
                  icon: "/public/icon.png",
                });
              }
            }
          }

          // Mettre à jour l'état connu
          lastKnownMessages.value[convId] = {
            lastTime: lastMessageTime,
            content: conversation.last_content,
            response: conversation.last_response,
          };
        }
      });
    }

    // Fonction pour démarrer le polling des conversations actives
    function startRealTimePolling(interval = 5000) {
      if (pollingActive.value) return; // Ne pas démarrer si déjà actif

      pollingActive.value = true;

      // Créer un intervalle pour mettre à jour les conversations actives
      refreshInterval.value = setInterval(async () => {
        await fetchConversations("active");
      }, interval);

      // Immédiatement récupérer les conversations actives
      fetchConversations("active");
    }

    // Fonction pour arrêter le polling
    function stopRealTimePolling() {
      if (refreshInterval.value) {
        clearInterval(refreshInterval.value);
        refreshInterval.value = null;
      }
      pollingActive.value = false;
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

      // Si on filtre sur les conversations actives, démarrer le polling
      if (status === "active") {
        startRealTimePolling();
      } else {
        // Si on change pour un autre filtre, arrêter le polling
        stopRealTimePolling();
      }
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

        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }

        const result = await response.json();

        // La réponse de votre API a la structure { statusCode, body }
        const data = result.body || result;

        // Afficher une notification selon le résultat
        const { $toast } = useNuxtApp();

        if (data.creditDecremented) {
          $toast.success(`Prise de relais effectuée. ${data.message}`, {
            duration: 5000,
          });
        } else {
          $toast.info("Prise de relais effectuée", {
            duration: 3000,
          });
        }

        // Mettre à jour localement
        if (
          selectedConversation.value &&
          selectedConversation.value.id === conversationId
        ) {
          selectedConversation.value.status = "terminated";
          if (selectedConversation.value.metadata) {
            selectedConversation.value.metadata = {
              ...selectedConversation.value.metadata,
              manual_takeover: true,
              credit_decremented: data.creditDecremented,
            };
          }
        }

        // Trouver et mettre à jour dans la liste des conversations
        const conversationIndex = conversations.value.findIndex(
          (conv) => conv.id === conversationId
        );
        if (conversationIndex !== -1) {
          conversations.value[conversationIndex].status = "terminated";
          if (conversations.value[conversationIndex].metadata) {
            conversations.value[conversationIndex].metadata = {
              ...conversations.value[conversationIndex].metadata,
              manual_takeover: true,
              credit_decremented: data.creditDecremented,
            };
          }
        }

        // Ouvrir WhatsApp
        if (phone) {
          try {
            // Nettoyer le numéro de téléphone
            const cleanPhone = phone
              .replace(/[\+\s\-\(\)]/g, "") // Enlever +, espaces, tirets, parenthèses
              .replace(/^0+/, ""); // Enlever les zéros au début

            // S'assurer que le numéro commence par le code pays
            let formattedPhone = cleanPhone;
            if (!cleanPhone.startsWith("225") && cleanPhone.length === 10) {
              // Si c'est un numéro ivoirien sans le code pays
              formattedPhone = "225" + cleanPhone;
            }

            const whatsappUrl = `https://wa.me/${formattedPhone}`;
            console.log("🔗 Ouverture WhatsApp:", whatsappUrl);

            // Ouvrir WhatsApp
            window.open(whatsappUrl, "_blank");
          } catch (error) {
            console.error("Erreur lors de l'ouverture de WhatsApp:", error);
          }
        }

        return {
          success: true,
          creditDecremented: data.creditDecremented || false,
          newBalance: data.newBalance,
        };
      } catch (error) {
        console.error("Erreur lors de la prise de relais", error);

        const { $toast } = useNuxtApp();
        $toast.error("Erreur lors de la prise de relais", {
          duration: 5000,
        });

        return {
          success: false,
          error: error.message,
        };
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
      lastKnownMessages.value = {};
      stopRealTimePolling(); // Arrêter le polling lors de la réinitialisation
    };

    return {
      conversations,
      selectedConversation,
      messages,
      filterStatus,
      isLoading,
      pollingActive,
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
      startRealTimePolling,
      stopRealTimePolling,
      $reset,
    };
  },
  {
    persist: true,
  }
);
