<script setup>
import { ref, onMounted } from "vue";
import { useChatStore } from "@/stores/agent/chat";

const chatStore = useChatStore();

const notifSound = ref(null);
const soundEnabled = ref(true);

const playSound = () => {
  if (soundEnabled.value && notifSound.value) {
    notifSound.value.currentTime = 0;
    notifSound.value.play();
  }
};

const toggleSound = () => {
  soundEnabled.value = !soundEnabled.value;
  // Plus besoin d'appeler chatStore.toggleSoundNotifications
};

let x = ref(5)

onMounted(() => {
    setInterval(() => {
        playSound();
        console.log('jj')
    }, 1000);
    
});
</script>

<template>
  <!-- ... -->

 <div>
     <audio ref="notifSound" src="/sound/notification.mp3" preload="auto" />

  <li
    @click="toggleSound"
    class="cursor-pointer text-center flex items-center justify-center rounded-lg transition-all duration-200 ease-in-out px-2 py-2 text-sm"
    :class="{ 'text-blue-400': soundEnabled, 'text-slate-500': !soundEnabled }"
    title="Notifications sonores"
  >
    <UIcon :name="soundEnabled ? 'i-heroicons-speaker-wave' : 'i-heroicons-speaker-x-mark'" class="w-5 h-5" />
  </li>

 </div>
  <!-- ... -->
</template>
