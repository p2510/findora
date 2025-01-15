<template>
  <li
    class="rounded-xl p-4 bg-[#eeeff0]/50 hover:shadow-md transition duration-500 ease-in-out"
    
  >
    <div class="flex justify-between items-center gap-2">
      <p class="flex gap-2">
        <span
          class="items-center flex gap-2 bg-slate-800/20 text-xs py-2 px-3 rounded-md text-slate-800"
        >
          <UIcon name="i-heroicons-calendar-days" class="w-4 h-4" />
          <i class="not-italic">{{
            new Date(created_at).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          }}</i>
        </span>
      </p>
      <UDropdown
        :items="items"
        :popper="{ placement: 'bottom-start' }"
        class=""
      >
        <UIcon name="i-heroicons-ellipsis-vertical" class="w-6 h-6" />
      </UDropdown>
    </div>
    <h4 class="pt-4 pb-[1px]">{{ name }}</h4>
    <p class="text-sm text-slate-900/80">{{ content.slice(0, 50) }} ...</p>
    <UModal v-model="isOpen">
      <div class="p-4">
        <p class="text-sm text-slate-900/80">{{ content }}</p>
      </div>
    </UModal>
  </li>
</template>

<script setup>
import { ref, defineProps,defineEmits } from "vue";
const supabase = useSupabaseClient();
let isOpen = ref(false);
const props = defineProps({
  id: {
    type: Number,
    default: null,
  },
  name: {
    type: String,
    default: "",
  },
  content: {
    type: String,
    default: "",
  },
  created_at: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(['templateDelete'])
const items = [
  [
    {
      label: "Lire tout",
      icon: "i-heroicons-eye",
      click: () => {
        isOpen.value = true;
      },
    },
    {
      label: "Supprimer",
      icon: "i-heroicons-trash",
      click: () => {
        emit('templateDelete',props.id)
      },
    },
  ],
];

</script>
