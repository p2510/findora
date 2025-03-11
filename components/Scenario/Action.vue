<template>
  <div>
    <ScenarioMessageDefault
      v-if="
        !triggerStore.triggerSelected ||
        triggerStore.triggerSelected == 'payment'
      "
    />
    <ScenarioMessageCustomer
      v-if="triggerStore.triggerSelected == 'customer'"
    />
  </div>
</template>
<script setup>
import { useTrigger } from "@/stores/scenario/trigger";
const triggerStore = useTrigger();
</script>
