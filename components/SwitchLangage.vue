<template>
  <div class="relative">
    <button
      @click="toggleDropdown"
      class="main-button"
      :aria-expanded="isOpen.toString()"
      aria-haspopup="true"
    >
      <span class="flag" :class="`flag-${locale}`"></span>
      <span class="language-name">{{ currentLanguageName }}</span>
      <svg
        class="arrow-icon"
        :class="{ rotate: isOpen }"
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="6 9 12 15 18 9"></polyline>
      </svg>
    </button>

    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <button
          v-for="lang in otherLanguages"
          :key="lang.code"
          @click="switchLanguage(lang.code)"
          class="language-option"
          :aria-label="`Switch to ${lang.name}`"
        >
          <span class="flag" :class="`flag-${lang.code}`"></span>
          <span class="language-name">{{ lang.name }}</span>
          <svg
            class="check-icon"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
const { locale, setLocale } = useI18n();

const isOpen = ref(false);

const languages = [
  { code: "fr", name: "Français" },
  { code: "en", name: "English" },
];

// Langue affichée actuellement
const currentLanguageName = computed(() => {
  return languages.find((l) => l.code === locale.value)?.name || "";
});

// Langues autres que la langue courante
const otherLanguages = computed(() => {
  return languages.filter((l) => l.code !== locale.value);
});

// Changer de langue
const switchLanguage = (newLocale) => {
  setLocale(newLocale);
  isOpen.value = false;
};

// Ouvrir/fermer le menu
const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

// Fermer le menu quand on clique ailleurs
const clickOutside = (event) => {
  const container = event.target.closest(".relative");
  if (!container) isOpen.value = false;
};

onMounted(() => {
  document.addEventListener("click", clickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", clickOutside);
});
</script>

<style scoped>
.relative {
  position: relative;
  display: inline-block;
}

.main-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  font-size: 15px;
  font-weight: 500;
  color: #334155;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.main-button:hover {
  background-color: #f8fafc;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.main-button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.language-name {
  white-space: nowrap;
}

.arrow-icon {
  transition: transform 0.3s ease;
}

.arrow-icon.rotate {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  min-width: 160px;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 10;
  overflow: hidden;
}

.language-option {
  display: flex;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  gap: 8px;
  text-align: left;
  border: none;
  background-color: transparent;
  color: #334155;
  cursor: pointer;
  transition: background-color 0.2s;
}

.language-option:hover {
  background-color: #f1f5f9;
}

.language-option .check-icon {
  margin-left: auto;
  opacity: 0;
  transition: opacity 0.2s;
}

.language-option:hover .check-icon {
  opacity: 0.5;
}

/* Animations pour le dropdown */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.3s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Styles des drapeaux */
.flag {
  display: inline-block;
  width: 20px;
  height: 15px;
  background-size: cover;
  background-position: center;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.flag-fr {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2"><path fill="%23ED2939" d="M0 0h3v2H0z"/><path fill="%23fff" d="M0 0h2v2H0z"/><path fill="%23002395" d="M0 0h1v2H0z"/></svg>');
}

.flag-en {
  background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30"><path fill="%23012169" d="M0 0h60v30H0z"/><path fill="%23FFF" d="M0 0v3.75l27.5 13.75L0 26.25V30h6.25L35 16.25 58.75 30H60v-3.75L32.5 12.5 60 3.75V0h-6.25L25 13.75 1.25 0H0z"/><path stroke="%23FFF" stroke-width="1.25" d="M0 12.5h60m-60 5h60"/><path stroke="%23C8102E" stroke-width="2.5" d="M30 0v30m-15-30v30"/></svg>');
}
</style>
