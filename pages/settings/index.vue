<template>
  <div class="mt-14 space-y-4 pr-4">
    <h2 class="col-span-full text-4xl text-slate-900 pb-4">
      {{ $t("setting.manage_account") }}
    </h2>
    <div class="grid grid-cols-12 gap-4 h-96 xl:h-none overflow-y-auto">
      <UpdateUserForm class="col-span-full xl:col-span-6" />
      <UpdateInfoForm class="col-span-full xl:col-span-6" />
    </div>
  </div>
</template>
<script setup>
import { useI18n } from "vue-i18n";
import { ref, computed, onMounted } from "vue";
const { t } = useI18n();

definePageMeta({
  middleware: "auth",
  alias: "/parametre",
});
useHead({
  title: t("setting.findora_setting"),
});
</script>

<style scoped>
.error {
  color: red;
}
</style>
