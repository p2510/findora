<template>
  <form @submit.prevent="confirm">
    <p class="text-sm text-slate-950">
      Paramètre <span class="text-slate-500">Optionnel</span>
    </p>
    <section>
      <div>
        <div class="grid grid-cols-12 gap-2 items-center p-2">
          <label class="text-xs text-slate-700 col-span-3">
            La date d'ajout
          </label>
          <div class="col-span-5 flex justify-center w-full">
            <USelectMenu
              searchable
              searchable-placeholder="Trouvez une condition"
              class="w-full"
              v-model="formData.created_at.condition"
              placeholder="Condition"
              :options="[
                { id: 0, name: 'Est supérieur à' },
                { id: 1, name: 'Est inférieur à' },
                { id: 2, name: 'Égal à' },
              ]"
              option-attribute="name"
              size="xs"
              color="black"
              variant="none"
              :ui="{
                base: 'hover:shadow-sm rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-blue-600',
              }"
            />
          </div>
          <div class="col-span-4 flex justify-center w-full">
            <input
              v-model="formData.created_at.value"
              type="date"
              class="text-xs p-[4px] w-full rounded-md hover:shadow-sm bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 focus:border-blue-600"
            />
          </div>
        </div>
        <div v-if="errors.created_at.length" class="error text-xs pl-2">
          {{ errors.created_at[0] }}
        </div>


        <div class="flex justify-center pt-4 gap-2">
          <UButton
            :loading="isRequestInProgress"
            type="submit"
            size="lg"
            variant="soft"
            color="blue"
          >
            Confirmer
          </UButton>
          <UButton
            type="button"
            size="lg"
            variant="soft"
            color="slate"
            @click="reset"
          >
            Réinitialiser
          </UButton>
        </div>
      </div>
    </section>
    <div v-if="isSuccessOpen">
      <AlertModal
        title="Déclencheur"
        type="success"
        @close-alert="closeSuccessAlert"
      >
        <template #message>
          <p>Vos paramètres ont été enregistrés avec succès.</p>
        </template>
      </AlertModal>
    </div>
  </form>
</template>

<script setup>
import { ref } from "vue";
import { useCustomer1 } from "@/composables/Scenario/useCustomer1";
const { errors, validateForm } = useCustomer1();
import { useParams } from "@/stores/scenario/params";
const paramsStore = useParams();
const { paramsCustomer } = paramsStore;

let formData = ref({
  created_at: paramsCustomer?.created_at
    ? { ...paramsCustomer.created_at }
    : { condition: "", value: "" },
  
});
let isSuccessOpen = ref(false);
let closeSuccessAlert = () => {
  isSuccessOpen.value = false;
};
const isRequestInProgress = ref(false);

const confirm = () => {
  isRequestInProgress.value = true;
  
  const validationErrors = validateForm({
    created_at: formData.value.created_at.value,
  });
  if (validationErrors.global.length > 0) {
    isRequestInProgress.value = false;
    return;
  }
  paramsStore.updateParamsCustomer(formData.value);
  isRequestInProgress.value = false;
  isSuccessOpen.value = true;
};
const reset = () => {
  formData.value.created_at = {
    condition: null,
    value: null,
  };
  paramsStore.updateParamsCustomer(formData.value);
};
</script>
<style scoped>
.error {
  color: red;
}
</style>
