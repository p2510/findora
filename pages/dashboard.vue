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
const fetchLibrary = async () => {
  const { libraries } = await $fetch("/api/send-sms");
  console.log(libraries);
};
onMounted(() => {
  fetchLibrary();
});
</script>
