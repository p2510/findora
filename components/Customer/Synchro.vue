<script setup>
import { ref, defineEmits } from "vue";
import { useCustomer } from "@/stores/customer";
import { useWhatsapp } from "@/stores/whatsapp";
import { useStat } from "@/stores/stat";
import { useUser } from "@/stores/user";

const stat = useStat();
const customerStore = useCustomer();
const whatsappStore = useWhatsapp();
const userStore = useUser();
const isOpen = ref(false);
const isRequestInProgress = ref(false);
const errorMessage = ref("");
const isAlertOpen = ref(false);
const emit = defineEmits(["submit"]);

let synchronize = async () => {
  isRequestInProgress.value = true;
  const url = `${useRuntimeConfig().public.url_base}/api/customer/synchro`;
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        token: whatsappStore.whatsapp_backlogs.token,
        userId: userStore.info.uuid,
      }),
    });
    if (!response.ok) {
      isRequestInProgress.value = false;
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    if (json && json.success) {
      isRequestInProgress.value = false;
      alert("Synchronisation réussie");
      customerStore.updatecustomers();
      isOpen.value = false;
    } else {
      isRequestInProgress.value = false;
      errorMessage.value = json.message;
      isAlertOpen.value = true;
    }
  } catch {
    isRequestInProgress.value = false;
    errorMessage.value = error.message;
    isAlertOpen.value = true;
  }
};
</script>

<template>
  <div>
    <div
      @click="isOpen = true"
      class="cursor-pointer border-[1.8px] border-neutral-200 dark:border-slate-700 rounded-md col-span-6 lg:col-span-4 xl:col-span-3 p-3 bg-transparent dark:bg-neutral-900 relative overflow-hidden transition-colors"
    >
      <div>
        <p class="pb-3 flex justify-between items-center z-10">
          <span class="text-sm text-slate-950 dark:text-white font-[500]">
            Synchroniser les contacts
          </span>
          <button
            class="flex items-center justify-center rounded-full p-2 text-slate-800 dark:text-white bg-[#ffbd59]/10 dark:bg-[#ffbd59]/20 transition duration-300 ease-in-out hover:bg-[#ffbd59]/20 dark:hover:bg-[#ffbd59]/30"
          >
            <UIcon name="i-heroicons-arrow-up-right" />
          </button>
        </p>
        <p class="text-xs text-slate-700 dark:text-slate-300 font-[300]">
          Migrer tous vos contacts whatsapp vers Findora en un seul clic.
        </p>
      </div>
    </div>

    <UModal v-model="isOpen">
      <UCard class="dark:bg-neutral-900 dark:text-white">
        <template #header>
          <div>
            <h5>
              <UBadge color="gray" variant="soft" size="lg"
                >Synchronisation</UBadge
              >
            </h5>
            <span class="text-gray-500 dark:text-gray-300 text-sm">
              Migrer tous vos contacts whatsapp vers Findora
            </span>
          </div>
        </template>

        <div class="flex justify-center">
          <UButton
            :loading="isRequestInProgress"
            @click="synchronize"
            size="lg"
            variant="soft"
            color="emerald"
          >
            Synchroniser maintenant
          </UButton>
        </div>
      </UCard>
    </UModal>

    <div v-if="isAlertOpen">
      <AlertModal title="Erreur" type="error" @close-alert="closeErrorAlert">
        <template #message>
          <p>{{ errorMessage }}</p>
        </template>
      </AlertModal>
    </div>
  </div>
</template>

<style scoped>
.error {
  color: red;
}
</style>
