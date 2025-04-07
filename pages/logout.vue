<template>
  <div class="deconnexion-container">
    <nav class="py-2">Déconnexion</nav>
    <div v-if="isLoading" class="loader-container">
      <div class="loader"></div>
      <p class="mt-4">Déconnexion en cours...</p>
    </div>
    <div v-else-if="error" class="error-container">
      <p>Une erreur est survenue lors de la déconnexion.</p>
      <button @click="retryLogout" class="retry-btn">Réessayer</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { reset } from "@/utils/shared/resetStore";
import { useUser } from "@/stores/user";
import { useSupabaseClient } from "#imports";

const supabase = useSupabaseClient();
const isLoading = ref(true);
const error = ref(null);

const logout = async () => {
  try {
    isLoading.value = true;
    error.value = null;

    const { error: logoutError } = await supabase.auth.signOut();

    if (logoutError) {
      error.value = logoutError;
      return;
    }

    // Réinitialiser le store et rediriger vers la page d'accueil
    reset();
    return navigateTo("/");
  } catch (e) {
    error.value = e;
  } finally {
    isLoading.value = false;
  }
};

const retryLogout = () => {
  logout();
};

onMounted(() => {
  logout();
});
</script>

<style scoped>
.deconnexion-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loader-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
}

.loader {
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.error-container {
  text-align: center;
  color: #e74c3c;
  margin-top: 2rem;
}

.retry-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 1rem;
  cursor: pointer;
}

.retry-btn:hover {
  background-color: #2980b9;
}
</style>
