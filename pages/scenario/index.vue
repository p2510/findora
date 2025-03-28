<template>
  <section class="mt-14">
    <ScenarioNav />
  </section>
</template>

<script setup>
definePageMeta({
 middleware: ["auth","is-entreprise"],
  alias: "/scenario",
});
useHead({
  title:
    "Findora scenario -  Créez vos scénarios de relance et laissez l'automatisation faire le reste ! ✨",
});
</script>


