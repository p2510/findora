<template>
  <div></div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
definePageMeta({
  middleware: "auth",
});
const supabase = useSupabaseClient();
const user = useSupabaseUser();

</script>
