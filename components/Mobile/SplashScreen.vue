<!-- components/SplashScreen.vue -->
<template>
  <div 
    class="splash-screen"
    :class="{ 'fade-out': isHiding }"
  >
    <!-- Background avec gradient animé -->
    <div class="animated-background"></div>
    
    <!-- Logo et contenu -->
    <div class="logo-container">
      <!-- Logo SVG de Findora -->
      <div class="logo-wrapper">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="120"
          height="120"
          viewBox="0 0 120 120"
          class="logo"
        >
          <g>
            <!-- Cercle de fond -->
            <circle cx="60" cy="60" r="60" fill="#ffbd59" />
            
            <!-- Design interne basé sur votre logo -->
            <circle cx="80" cy="60" r="20" fill="white" />
            <path d="M30 60 L75 60" stroke="white" stroke-width="6" stroke-linecap="round" />
          </g>
        </svg>
      </div>
      
      <h1 class="app-name">Findora</h1>
      <p class="tagline">Déléguez vos conversations WhatsApp</p>
    </div>

    <!-- Loader animé -->
    <div class="loader">
      <div class="loader-bar"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isHiding = ref(false)
const emit = defineEmits(['complete'])

onMounted(() => {
  // Durée d'affichage du splash screen
  setTimeout(() => {
    isHiding.value = true
    // Attendre la fin de l'animation de fade-out
    setTimeout(() => {
      emit('complete')
    }, 300)
  }, 2500) // 2.5 secondes
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffbd59;
  transition: opacity 0.3s ease-out;
}

.splash-screen.fade-out {
  opacity: 0;
}

/* Background animé */
.animated-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #ffbd59 0%, #f3a847 50%, #ffbd59 100%);
  background-size: 200% 200%;
  animation: gradientShift 4s ease infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* Logo et texte */
.logo-container {
  position: relative;
  z-index: 1;
  text-align: center;
  animation: fadeInUp 0.8s ease-out;
}

.logo-wrapper {
  display: inline-block;
  margin-bottom: 24px;
  filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.1));
}

.logo {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.app-name {
  font-size: 3rem;
  font-weight: bold;
  color: white;
  margin: 0 0 12px 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  letter-spacing: -1px;
}

.tagline {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.95);
  margin: 0;
  font-weight: 500;
}

/* Loader */
.loader {
  position: absolute;
  bottom: 100px;
  width: 250px;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
}

.loader-bar {
  height: 100%;
  background-color: white;
  border-radius: 2px;
  animation: loading 2.5s ease-out;
}

@keyframes loading {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .logo-wrapper svg {
    width: 100px;
    height: 100px;
  }
  
  .app-name {
    font-size: 2.5rem;
  }
  
  .tagline {
    font-size: 1rem;
    padding: 0 20px;
  }
  
  .loader {
    width: 200px;
    bottom: 80px;
  }
}

/* Support for safe areas on iOS */
@supports (padding-top: env(safe-area-inset-top)) {
  .splash-screen {
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
  }
}
</style>