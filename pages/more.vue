<!-- pages/more.vue -->
<template>
  <div class="min-h-screen bg-gray-50 dark:bg-slate-900">
    <!-- Header -->
    <div class="px-4 pt-4 pb-2">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        Plus d'options
      </h2>
    </div>

    <!-- User Profile Section -->
    <div class="mx-4 mt-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700">
      <div class="flex items-center gap-4">
        <img
          :src="`https://ui-avatars.com/api/?name=${user.info.email}&background=ffbd59&color=ffffff`"
          alt="Avatar"
          class="w-16 h-16 rounded-full"
        />
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900 dark:text-white">
            {{ user.info.name || user.info.email }}
          </h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            {{ user.info.email }}
          </p>
          <div class="flex items-center gap-2 mt-2">
            <span :class="[
              'px-2 py-1 text-xs font-medium rounded-full',
              getPlanClass(user.subscription.subscription_type)
            ]">
              Plan {{ user.subscription.subscription_type }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu Items -->
    <div class="mt-6 px-4 space-y-2">
      <!-- Main Options -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <MobileActionCard  
          to="/api/jeton"
          icon="i-heroicons-key"
          title="Gestion des APIs"
          subtitle="Tokens et intégrations"
          showArrow
        />
        
        <MobileActionCard  
          to="/abonnement"
          icon="i-heroicons-lifebuoy"
          title="Mon abonnement"
          :subtitle="getSubscriptionStatus()"
          showArrow
          :hasNotification="shouldShowSubscriptionAlert()"
        />
        
        <MobileActionCard  
          to="/parametre"
          icon="i-heroicons-cog-6-tooth"
          title="Paramètres"
          subtitle="Préférences et compte"
          showArrow
        />
      </div>

      <!-- Support Section -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <MobileActionCard  
          href="https://wa.me/2250797966331?text=Bonjour Findora"
          icon="i-heroicons-chat-bubble-left-right"
          title="Support WhatsApp"
          subtitle="Obtenez de l'aide"
          isExternal
        />
        
        <MobileActionCard  
          href="https://youtu.be/tFQJnCIQHxE"
          icon="i-heroicons-play-circle"
          title="Tutoriels vidéo"
          subtitle="Apprenez à utiliser Findora"
          isExternal
        />
      </div>

      <!-- App Info -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <MobileActionCard  
          to="/about"
          icon="i-heroicons-information-circle"
          title="À propos"
          subtitle="Version 2.0.1"
        />
        
        <MobileActionCard  
          @click="toggleTheme"
          icon="i-heroicons-moon"
          title="Thème"
          :subtitle="$colorMode.value === 'dark' ? 'Mode sombre' : 'Mode clair'"
          isButton
        />
      </div>

      <!-- Logout -->
      <div class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 overflow-hidden">
        <MobileActionCard  
          @click="logout"
          icon="i-heroicons-power"
          title="Déconnexion"
          iconColor="text-red-600 dark:text-red-400"
          isButton
        />
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-8 pb-8 px-4 text-center">
      <p class="text-xs text-gray-500 dark:text-gray-400">
        © 2024 Findora. Tous droits réservés.
      </p>
    </div>
  </div>  
</template>

<script setup>
import { useUser } from "@/stores/user";
import { reset } from "@/utils/shared/resetStore";

const user = useUser();
const supabase = useSupabaseClient();
const colorMode = useColorMode();

const toggleTheme = () => {
  colorMode.value = colorMode.value === 'dark' ? 'light' : 'dark';
};

const logout = async () => {
  const confirm = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
  if (confirm) {
    let { error } = await supabase.auth.signOut();
    if (!error) {
      reset();
      return navigateTo("/");
    }
  }
};

const getPlanClass = (plan) => {
  const classes = {
    'free': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    'ultra': 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
    'entreprise': 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
  };
  return classes[plan] || classes['free'];
};

const getSubscriptionStatus = () => {
  const plan = user.subscription.subscription_type;
  if (plan === 'free') return 'Plan gratuit';
  
  const endDate = new Date(user.subscription.start_at);
  endDate.setMonth(endDate.getMonth() + 1);
  
  if (endDate < new Date()) {
    return 'Expiré - Renouveler';
  }
  
  const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
  return `${daysLeft} jours restants`;
};

const shouldShowSubscriptionAlert = () => {
  if (user.subscription.subscription_type === 'free') return true;
  
  const endDate = new Date(user.subscription.start_at);
  endDate.setMonth(endDate.getMonth() + 1);
  
  return endDate < new Date();
};
</script>