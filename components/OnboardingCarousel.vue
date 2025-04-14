<template>
  <div>
    <!-- Modal d'onboarding qui apparaît seulement quand showOnboarding est true -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showOnboarding" class="onboarding-overlay">
          <div class="onboarding-modal">
            <div class="onboarding-header">
              <h2 class="onboarding-title">Bienvenue sur votre dashboard</h2>
              <button @click="skipOnboarding" class="onboarding-close">
                <UIcon name="i-heroicons-x-mark" class="w-5 h-5" />
              </button>
            </div>
            
            <div class="onboarding-carousel">
              <!-- Indicateurs de progression -->
              <div class="onboarding-indicators">
                <div 
                  v-for="(_, index) in slides" 
                  :key="index"
                  :class="['indicator', { active: currentSlide === index }]"
                  @click="currentSlide = index"
                ></div>
              </div>
              
              <!-- Container des slides avec transition -->
              <div class="onboarding-slides-container">
                <div 
                  class="onboarding-slides"
                  :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
                >
                  <!-- Slide 1: Gestion des contacts -->
                  <div class="onboarding-slide">
                    <div class="slide-icon contacts-icon">
                      <UIcon name="i-heroicons-users" class="w-16 h-16" />
                    </div>
                    <h3 class="slide-title">Gestion des contacts</h3>
                    <p class="slide-description">
                      Organisez et catégorisez efficacement tous vos contacts WhatsApp.
                      Créez des groupes personnalisés pour mieux cibler vos communications.
                    </p>
                    <div class="slide-features">
                      <div class="feature-item">
                        <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
                        <span>Liste complète des contacts</span>
                      </div>
                      <div class="feature-item">
                        <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
                        <span>Catégorisation avancée</span>
                      </div>
                      <div class="feature-item">
                        <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
                        <span>Import/Export facile</span>
                      </div>
                    </div>
                  </div> 
                  
                  <!-- Slide 2: Agent IA WhatsApp -->
                  <div class="onboarding-slide">
                    <div class="slide-icon ai-icon">
                      <UIcon name="i-heroicons-rectangle-group" class="w-16 h-16" />
                    </div>
                    <h3 class="slide-title">Agent IA WhatsApp</h3>
                    <p class="slide-description">
                      Automatisez vos conversations WhatsApp grâce à notre agent IA intelligent.
                      Offrez un support client 24/7 sans intervention humaine.
                    </p>
                    <div class="slide-features">
                      <div class="feature-item">
                        <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
                        <span>Réponses automatiques intelligentes</span>
                      </div>
                      <div class="feature-item">
                        <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
                        <span>Support client 24/7</span>
                      </div>
                      <div class="feature-item">
                        <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
                        <span>Possibilité de prendre le relais</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Slide 3: WhatsApp Marketing -->
                  <div class="onboarding-slide">
                    <div class="slide-icon marketing-icon">
                      <UIcon name="i-heroicons-paper-airplane" class="w-16 h-16" />
                    </div>
                    <h3 class="slide-title">WhatsApp Marketing</h3>
                    <p class="slide-description">
                      Envoyez des messages ciblés à grande échelle pour vos campagnes marketing.
                      Suivez les performances et optimisez vos communications.
                    </p>
                    <div class="slide-features">
                      <div class="feature-item">
                        <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
                        <span>Campagnes de masse personnalisées</span>
                      </div>
                      <div class="feature-item">
                        <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
                        <span>Planification des envois</span>
                      </div>
                      <div class="feature-item">
                        <UIcon name="i-heroicons-check-circle" class="w-5 h-5" />
                        <span>Statistiques détaillées</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Navigation du carrousel -->
              <div class="onboarding-nav">
                <button 
                  v-if="currentSlide > 0" 
                  @click="prevSlide" 
                  class="onboarding-btn prev-btn"
                >
                  <UIcon name="i-heroicons-arrow-left" class="w-4 h-4 mr-2" />
                  Précédent
                </button>
                <button 
                  @click="skipOnboarding" 
                  class="onboarding-btn skip-btn"
                >
                  Ignorer
                </button>
                <button 
                  v-if="currentSlide < slides.length - 1" 
                  @click="nextSlide" 
                  class="onboarding-btn next-btn"
                >
                  Suivant
                  <UIcon name="i-heroicons-arrow-right" class="w-4 h-4 ml-2" />
                </button>
                <button 
                  v-else 
                  @click="completeOnboarding" 
                  class="onboarding-btn complete-btn"
                >
                  Commencer
                  <UIcon name="i-heroicons-check" class="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
          
          <!-- Animation de confettis -->
          <div v-if="showConfetti" class="confetti-container">
            <div 
              v-for="n in 50" 
              :key="n" 
              class="confetti"
              :class="`confetti-${n % 5}`"
              :style="getRandomConfettiStyle(n)"
            ></div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import { useUser } from "@/stores/user";
import { useDayjs } from '#dayjs';

const dayjs = useDayjs();
const user = useUser();
const supabase = useSupabaseClient();

// État du onboarding
const showOnboarding = ref(false);
const currentSlide = ref(0);
const showConfetti = ref(false);

// Définition des slides
const slides = [
  { title: "Gestion des contacts", icon: "users" },
  { title: "Agent IA WhatsApp", icon: "cpu-chip" },
  { title: "WhatsApp Marketing", icon: "megaphone" }
];

// Fonction pour créer un style aléatoire pour chaque confetti
const getRandomConfettiStyle = (index) => {
  const randomLeft = Math.random() * 100;
  const randomDelay = Math.random() * 3;
  const randomDuration = 3 + Math.random() * 4;
  const randomSize = 5 + Math.random() * 10;
  const randomRotation = Math.random() * 360;
  
  return {
    left: `${randomLeft}%`,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`,
    width: `${randomSize}px`,
    height: `${randomSize}px`,
    transform: `rotate(${randomRotation}deg)`
  };
};

// Fonction pour lancer l'effet de confettis
const triggerConfetti = () => {
  showConfetti.value = true;
  setTimeout(() => {
    showConfetti.value = false;
  }, 3000); // Arrête l'effet après 3 secondes
};

// Vérifier si l'utilisateur a déjà complété l'onboarding
const checkOnboardingStatus = async () => {
  try {
    // Vérifier si l'utilisateur est connecté
    if (!user.info?.id) return;
    
    const { data, error } = await supabase
      .from('users')
      .select('onboarding_done')
      .eq('id', user.info.id)
      .single();
      
    if (error) throw error;
    
    // Afficher l'onboarding seulement si onboarding_done est false
    showOnboarding.value = !data.onboarding_done;
  } catch (error) {
    console.error('Erreur lors de la vérification du statut onboarding:', error);
  }
};

// Marquer l'onboarding comme terminé
const markOnboardingAsDone = async () => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ onboarding_done: true })
      .eq('id', user.info.id);
      
    if (error) throw error;
    
    // Fermer l'onboarding
    showOnboarding.value = false;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut onboarding:', error);
    // Fermer quand même l'onboarding même en cas d'erreur pour ne pas bloquer l'utilisateur
    showOnboarding.value = false;
  }
};

// Navigation des slides avec effet de confettis
const nextSlide = () => {
  if (currentSlide.value < slides.length - 1) {
    triggerConfetti(); // Déclenche l'effet de confettis
    currentSlide.value++;
  }
};

const prevSlide = () => {
  if (currentSlide.value > 0) {
    currentSlide.value--;
  }
};

// Ignorer l'onboarding
const skipOnboarding = () => {
  markOnboardingAsDone();
};

// Terminer l'onboarding (après avoir vu tous les slides)
const completeOnboarding = () => {
  triggerConfetti(); // Déclenche l'effet de confettis pour la complétion
  markOnboardingAsDone();
};

// Vérifier le statut d'onboarding au chargement du composant
onMounted(() => {
  checkOnboardingStatus();
});
</script>

<style scoped>
/* Overlay du modal */
.onboarding-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  overflow: hidden;
}

/* Modal */
.onboarding-modal {
  background-color: white;
  border-radius: 0.75rem;
  width: 90%;
  max-width: 700px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  position: relative;
  z-index: 10000;
}

/* En-tête du modal */
.onboarding-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.onboarding-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.onboarding-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  border-radius: 50%;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.onboarding-close:hover {
  background-color: #f3f4f6;
  color: #1f2937;
}

/* Carrousel */
.onboarding-carousel {
  position: relative;
  overflow: hidden;
}

/* Indicateurs de progression */
.onboarding-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin: 1rem 0;
}

.indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  background-color: #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background-color: #ffbd59;
  transform: scale(1.2);
}

/* Container des slides */
.onboarding-slides-container {
  overflow: hidden;
}

.onboarding-slides {
  display: flex;
  transition: transform 0.5s ease;
}

/* Style des slides */
.onboarding-slide {
  min-width: 100%;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.slide-icon {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  color: white;
}

.contacts-icon {
  background-color: #1d4ed8;
}

.ai-icon {
  background-color: #7c3aed;
}

.marketing-icon {
  background-color: #db2777;
}

.slide-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.slide-description {
  color: #4b5563;
  margin-bottom: 1.5rem;
  max-width: 500px;
}

.slide-features {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-start;
  width: 100%;
  max-width: 400px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
}

.feature-item .i-heroicons-check-circle {
  color: #10b981;
}

/* Navigation du carousel */
.onboarding-nav {
  display: flex;
  justify-content: space-between;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.onboarding-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.skip-btn {
  background-color: #f3f4f6;
  color: #6b7280;
  border: none;
}

.skip-btn:hover {
  background-color: #e5e7eb;
  color: #4b5563;
}

.prev-btn {
  background-color: white;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.prev-btn:hover {
  background-color: #f9fafb;
}

.next-btn, .complete-btn {
  background-color: #ffbd59;
  color: white;
  border: none;
}

.next-btn:hover, .complete-btn:hover {
  background-color: #e5a64c;
}

/* Animation de transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Animation de confettis */
.confetti-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9998;
  overflow: hidden;
}

.confetti {
  position: absolute;
  top: -20px;
  animation: confetti-fall linear forwards;
  opacity: 0.8;
}

/* Différentes couleurs de confettis */
.confetti-0 {
  background-color: #ffbd59; /* Jaune/orange - couleur principale */
}
.confetti-1 {
  background-color: #1d4ed8; /* Bleu - comme l'icône de contacts */
}
.confetti-2 {
  background-color: #7c3aed; /* Violet - comme l'icône d'IA */
}
.confetti-3 {
  background-color: #db2777; /* Rose - comme l'icône de marketing */
}
.confetti-4 {
  background-color: #10b981; /* Vert - comme les check circles */
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}
</style>