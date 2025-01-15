<template>
  <UModal v-model="isOpen">
    <section class="bg-white p-4 rounded-xl space-y-6">
       <div class="flex justify-between items-center">
        <UBadge color="gray" variant="soft" size="lg">{{title}}</UBadge>
         <UIcon name="i-heroicons-x-mark" class="w-5 h-5 opacity-70 hover:opacity-80 cursor-pointer" @click="$emit('closeAlert')" />
       </div> 
      <div
        :class="[
          'p-4 rounded-lg border text-white flex justify-between items-center',
          type === 'success' &&
            'bg-green-400',
          type === 'warning' &&
            'bg-yellow-400 ',
          type === 'error' && 'bg-red-400 ',
        ]"
      >
        <div class="">
            <slot name="message"></slot>
        </div>
        
      </div>
    </section>
  </UModal>
</template>

<script setup>
import { computed, ref ,defineProps, defineEmits} from "vue";
const isOpen = ref(true);

// Props
defineProps({

  title: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "", // Types possibles : 'error', 'success', 'warning'
  },
});




</script>
