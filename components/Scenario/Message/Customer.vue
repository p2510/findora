<template>
  <div>
    <div
      @click="isOpen = true"
      class="rounded-2xl bg-slate-100 p-3 border-[1.7px] border-solid border-blue-600/20 hover:border-blue-600 hover:shadow-md transition duration-300 ease-in-out cursor-pointer"
    >
      <div class="rounded-2xl bg-white">
        <p class="text-slate-800 text-md p-2 bg-slate-200 rounded-t-2xl">
          Message
        </p>
        <div
          class="flex justify-center flex-col items-center text-slate-800/80 text-sm px-2 py-4 bg-white rounded-b-2xl space-y-2"
          v-if="messageStore.content"
        >
          <p>Vous avez déjà créé un message.</p>
          <p clas="flex justify-center text-center bg-red-500 w-full">
            <span class="bg-blue-100 rounded-xl py-2 px-3">Modifier</span>
          </p>
        </div>

        <p
          v-else
          class="text-slate-800/80 text-sm px-2 py-4 bg-white rounded-b-2xl"
        >
          Le message que vous souhaitez <br />
          envoyer. Clique pour créer
        </p>
      </div>
    </div>

    <!--Add déclencheur -->
    <UModal v-model="isOpen" :ui="{ width: 'sm:max-w-3xl' }">
      <UCard
        :ui="{
          ring: '',
          divide: 'divide-y divide-gray-100 dark:divide-gray-800  ',
        }"
      >
        <template #header>
          <div class="space-y-[1px]">
            <h5>
              <UBadge color="gray" variant="soft" size="lg">Message</UBadge>
            </h5>
            <span class="text-gray-500 text-sm">
              Configuration du message
            </span>
          </div>
        </template>
        <div class="gap-4 bg-blue-50 rounded-lg py-2 px-4 2xl:max-w-5xl">
          <p class="text-slate-800 text-md font-semibold">
            Paramètres utilisables
          </p>
          <ul class="flex items-center gap-x-2">
            <ol
              :class="
                messageContent.includes('#nom')
                  ? 'text-sm text-blue-700 font-semibold'
                  : 'text-sm text-slate-700'
              "
            >
              nom
            </ol>
            <ol class="size-2 rounded-full bg-slate-400"></ol>
            <ol
              :class="
                messageContent.includes('#telephone')
                  ? 'text-sm text-blue-700 font-semibold'
                  : 'text-sm text-slate-700'
              "
            >
              telephone
            </ol>
            <ol class="size-2 rounded-full bg-slate-400"></ol>
            <ol
              :class="
                messageContent.includes('#email')
                  ? 'text-sm text-blue-700 font-semibold'
                  : 'text-sm text-slate-700'
              "
            >
              email
            </ol>
            <ol class="size-2 rounded-full bg-slate-400"></ol>
            <ol
              :class="
                messageContent.includes('#adresse')
                  ? 'text-sm text-blue-700 font-semibold'
                  : 'text-sm text-slate-700'
              "
            >
              adresse
            </ol>
          </ul>
        </div>
        <form
          class="grid grid-cols-12 gap-4 pt-4"
          @submit.prevent="handleSubmit"
        >
          <div class="col-span-full space-y-3">
            <label for="content" class="text-gray-500 text-sm"
              >Créer le contenu
            </label>
            <textarea
              v-model="messageContent"
              autofocus
              class="border-2 border-slate-200 text-sm p-4 rounded-xl bg-slate-100/60 outline-none text-slate-800 w-full"
              rows="7"
              minlength="3"
              placeholder="Exemple : Bonjour #nom, cela fait un mois que vous êtes avec nous. Merci pour votre fidélité !"
            ></textarea>
          </div>
          <div class="col-span-full">
            <UButton type="submit" size="lg" variant="soft" color="blue">
              Confirmer
            </UButton>
          </div>
        </form>
      </UCard>
    </UModal>

    <div v-if="isSuccessOpen">
      <AlertModal
        title="Message"
        type="success"
        @close-alert="closeSuccessAlert"
      >
        <template #message>
          <p>Le message a été créé avec succès.</p>
        </template>
      </AlertModal>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useMessage } from "@/stores/scenario/message";
const messageStore = useMessage();
const isOpen = ref(false);
const messageContent = ref(messageStore.content);

let isSuccessOpen = ref(false);
let closeSuccessAlert = () => {
  isSuccessOpen.value = false;
};
const handleSubmit = () => {
  messageStore.updateContent(messageContent.value);
  isSuccessOpen.value = true;
};
</script>
