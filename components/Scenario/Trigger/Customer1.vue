<template>
  <div>
    <div class="grid grid-cols-12 gap-2 items-center p-2">
      <label class="text-xs text-slate-700 col-span-3"> La date d'ajout </label>
      <div class="col-span-5 flex justify-center w-full">
        <USelectMenu
          searchable
          searchable-placeholder="Trouvez une condition"
          class="w-full"
          v-model="formData.created_at"
          placeholder="Condition"
          :options="[
            { id: 0, name: 'Est supérieur à' },
            { id: 1, name: 'Est inférieur à  ' },
            { id: 2, name: 'Égal à' },
          ]"
          option-attribute="name"
          size="xs"
          color="black"
          variant="none"
          :ui="{
            base: 'hover:shadow-sm rounded-lg hover:shadow-sm  rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-blue-600',
          }"
        >
        </USelectMenu>
      </div>
      <div class="col-span-4 flex justify-center w-full">
        <input
          type="date"
          class="text-xs p-[4px] w-full rounded-md hover:shadow-sm bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 focus:border-blue-600"
        />
      </div>
    </div>
    <div class="grid grid-cols-12 gap-2 items-center p-2">
      <label class="text-xs text-slate-700 col-span-3"> Le numéro </label>
      <div class="col-span-5 flex justify-center w-full">
        <USelectMenu
          searchable
          searchable-placeholder="Trouvez une condition"
          class="w-full"
          v-model="formData.phone_is"
          placeholder="Condition"
          :options="[
            { id: 0, name: 'Est différent de ' },
            { id: 1, name: 'Est égal à' },
          ]"
          option-attribute="name"
          size="xs"
          color="black"
          variant="none"
          :ui="{
            base: 'hover:shadow-sm rounded-lg hover:shadow-sm  rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-blue-600',
          }"
        >
        </USelectMenu>
      </div>
      <div class="col-span-4 flex justify-center w-full">
        <input
          type="text"
          class="text-xs p-[4px] w-full rounded-md hover:shadow-sm bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 focus:border-blue-600"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
let formData = ref({
  created_at: null,
  phone_is: null,
});
</script>
