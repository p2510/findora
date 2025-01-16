<template>
  <li
    :class="[
      'cursor-pointer rounded-3xl p-3 space-y-2',
      isHighlighted
        ? 'bg-gradient-to-bl to-neutral-600 from-neutral-950'
        : 'bg-slate-800/5',
    ]"
  >
    <p
      class="flex justify-between items-center text-sm"
      :class="isHighlighted ? 'text-white' : 'text-slate-600'"
    >
      <button
        class="flex items-center justify-center rounded-full p-2"
        :class="
          isHighlighted
            ? 'text-white bg-white/20 hover:bg-white/40'
            : 'text-slate-950 bg-slate-950/20 hover:bg-slate-950/40'
        "
      >
        <UIcon name="i-heroicons-arrow-up-right" />
      </button>
      <span>{{ formattedDate }}</span>
    </p>
    <div class="flex items-center justify-between pt-3">
      <span
        :class="isHighlighted ? 'text-md text-white' : 'text-md text-slate-950'"
      >
        {{ amount }}
      </span>
      <span class="text-xs rounded-md p-2" :class="statusClass">
        {{ status }}
      </span>
    </div>
    <div class="flex text-sm">
      <span :class="isHighlighted ? 'text-white' : 'text-slate-600'">{{
        client
      }}</span>
    </div>
  </li>
</template>

<script setup>
import { computed, ref } from "vue";
import { format } from "date-fns";
import { fr } from "date-fns/locale"; // Importation de la locale française

// Props
const props = defineProps({
  date: String,
  amount: String,
  status: String,
  client: String,
  isHighlighted: Boolean,
});

// Formater la date au format "08 févr. 2025"
const formattedDate = computed(() => {
  const reminderDate = new Date(props.date);
  return format(reminderDate, "dd MMM yyyy", { locale: fr });
});

// Définir la classe dynamique pour le statut
const statusClass = computed(() =>
  props.status === "Envoyé"
    ? props.isHighlighted
      ? "bg-white/20 text-white"
      : "bg-green-200 text-slate-800"
    : "bg-orange-200 text-slate-800"
);


</script>
