<template>
  <section class="mt-14 h-screen overflow-y-auto">
    <ApiNav class="" />
    <section class="space-y-4 grid grid-cols-12 items-bottom gap-4 pt-8">
      <div class="col-span-full 2xl:col-span-8 space-y-4 overflow-y-auto">
        <MazAccordion class="w-full" @click="showExemple = 1">
          <template #title-1>
            <div class="flex items-center gap-3">
              <span class="bg-emerald-600 text-white px-4 py-[3px] rounded-md"
                >POST</span
              >
              <h5>
                <p class="text-sm lg:text-md text-slate-100">
                  Envoyer un message à un ou plusieurs numéros
                </p>
                <p class="text-xs lg:text-sm text-slate-400">
                  Permet d'envoyer un message à un ou plusieurs numéros de
                  téléphone à la fois.
                </p>
              </h5>
            </div>
          </template>
          <template #content-1>
            <div class="space-y-3">
              <ul>
                <li>
                  <p class="text-slate-200 text-md font-medium">URL</p>
                  <p class="text-slate-200 text-sm">
                    https://api.myfindora.com/api/message/send
                  </p>
                </li>
              </ul>
              <ul>
                <li>
                  <p class="text-slate-200 text-md font-medium">Body</p>
                </li>
                <ol class="flex gap-3">
                  <li class="text-slate-200 text-xs">phone : Array</li>
                  <li class="text-slate-200 text-xs">message : String</li>
                </ol>
              </ul>
              <ul>
                <li>
                  <p class="text-slate-200 text-md font-medium">Réponse</p>
                </li>
                <ol class="flex gap-3">
                  <li class="text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-emerald-700"></i> 200 :
                    Succès
                  </li>
                  <li class="text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 400 :
                    Mauvais body
                  </li>
                  <li class="text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 401 :
                    Authentification
                  </li>
                  <li class="text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 500 : Erreur
                    du serveur
                  </li>
                </ol>
              </ul>
            </div>
          </template>
        </MazAccordion>

        <MazAccordion class="w-full" @click="showExemple = 2">
          <template #title-1>
            <div class="flex items-center gap-3">
              <span class="bg-emerald-600 text-white px-4 py-[3px] rounded-md"
                >POST</span
              >
              <h5>
                <p class="text-sm lg:text-md text-slate-100">
                  Programmer un ou plusieurs messages
                </p>
                <p class="text-xs lg:text-sm text-slate-400">
                  Permet de planifier l'envoi d'un message à une date
                  ultérieure.
                </p>
              </h5>
            </div>
          </template>
          <template #content-1>
            <div class="space-y-3">
              <ul>
                <li>
                  <p class="text-slate-200 text-md font-medium">URL</p>
                  <p class="text-slate-200 text-sm">
                    https://api.myfindora.com/api/message/send-schedule
                  </p>
                </li>
              </ul>
              <ul>
                <li>
                  <p class="text-slate-200 text-md font-medium">Body</p>
                </li>
                <ol class="flex gap-3">
                  <li class="text-slate-200 text-xs">phone : Array</li>
                  <li class="text-slate-200 text-xs">message : String</li>
                  <li class="text-slate-200 text-xs">send_at : Date</li>
                </ol>
              </ul>
              <ul>
                <li>
                  <p class="text-slate-200 text-md font-medium">Réponse</p>
                </li>
                <ol class="flex gap-3">
                  <li class="text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-emerald-700"></i> 200 :
                    Succès
                  </li>
                  <li class="text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 400 :
                    Mauvais body
                  </li>
                  <li class="text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 401 :
                    Authentification
                  </li>
                  <li class="text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 500 : Erreur
                    du serveur
                  </li>
                </ol>
              </ul>
            </div>
          </template>
        </MazAccordion>

        <MazAccordion class="w-full" @click="showExemple = 3">
          <template #title-1>
            <div class="flex items-center gap-3">
              <span class="bg-emerald-600 text-white px-4 py-[3px] rounded-md"
                >GET</span
              >
              <h5>
                <p class="text-sm lg:text-md text-slate-100">
                  Récupérer les messages programmés
                </p>
                <p class="text-xs lg:text-sm text-slate-400">
                  Permet de récupérer tous les messages programmés pour une date
                  ultérieure.
                </p>
              </h5>
            </div>
          </template>
          <template #content-1>
            <div class="space-y-3">
              <ul>
                <li>
                  <p class="text-slate-200 text-md font-medium">URL</p>
                  <p class="text-slate-200 text-sm">
                    https://api.myfindora.com/api/message/get-schedule
                  </p>
                </li>
              </ul>
              <ul>
                <li>
                  <p class="text-slate-200 text-md font-medium">Body</p>
                </li>
                <ol class="flex gap-3">
                  <li class="text-slate-200 text-xs">Aucun</li>
                </ol>
              </ul>
              <ul>
                <li>
                  <p class="text-slate-200 text-md font-medium">Réponse</p>
                </li>
                <ol class="flex gap-3">
                  <li class="text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-emerald-700"></i> 200 :
                    Succès
                  </li>
                  <li class="text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 400 :
                    Mauvais body
                  </li>
                  <li class="text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 401 :
                    Authentification
                  </li>
                  <li class="text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 500 : Erreur
                    du serveur
                  </li>
                </ol>
              </ul>
            </div>
          </template>
        </MazAccordion>

        <MazAccordion class="w-full" @click="showExemple = 4">
          <template #title-1>
            <div class="flex items-center gap-3">
              <span class="bg-red-600 text-white px-4 py-[3px] rounded-md"
                >DELETE</span
              >
              <h5>
                <p class="text-sm lg:text-md text-slate-100">
                  Supprimer un message programmé
                </p>
                <p class="text-xs lg:text-sm text-slate-400">
                  Permet de supprimer un message programmé pour une date
                  ultérieure.
                </p>
              </h5>
            </div>
          </template>
          <template #content-1>
            <div class="space-y-3">
              <ul>
                <li>
                  <p class="text-slate-200 text-md font-medium">URL</p>
                  <p class="text-slate-200 text-sm">
                    https://api.myfindora.com/api/message/delete-schedule
                  </p>
                </li>
              </ul>
              <ul>
                <li>
                  <p class="text-slate-200 text-md font-medium">Body</p>
                </li>
                <ol class="flex gap-3">
                  <li class="text-slate-200 text-xs">id : Number</li>
                </ol>
              </ul>
              <ul>
                <li>
                  <p class="text-slate-200 text-md font-medium">Réponse</p>
                </li>
                <ol class="flex gap-3">
                  <li class="text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-emerald-700"></i> 200 :
                    Succès
                  </li>
                  <li class="text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 400 :
                    Mauvais body
                  </li>
                  <li class="text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 401 :
                    Authentification
                  </li>
                  <li class="text-slate-200 text-xs flex items-center gap-2">
                    <i class="w-2 h-2 rounded-full bg-red-700"></i> 500 : Erreur
                    du serveur
                  </li>
                </ol>
              </ul>
            </div>
          </template>
        </MazAccordion>
      </div>
      <div class="col-span-full 2xl:col-span-4">
        <section
          class="bg-gradient-to-br from-slate-300/5 to-slate-300/20 mt-8 p-5 rounded-2xl"
        >
          <h4 class="text-md text-slate-950">Exemple d'utilisation</h4>

          <div class="bg-slate-300/40 mt-5 px-4 py-2 rounded-xl space-y-4">
            <ApiWhatsappExemple1 v-if="showExemple == 1" />
            <ApiWhatsappExemple2 v-else-if="showExemple == 2" />
            <ApiWhatsappExemple3 v-else-if="showExemple == 3" />
            <ApiWhatsappExemple4 v-else-if="showExemple == 4" />
            <p class="text-xs text-slate-500">
              Pour éviter les spams, nous répartissons l'envoi des messages sur
              notre serveur en respectant des délais espacés.
            </p>
          </div>
        </section>
      </div>
    </section>
  </section>
</template>

<script setup>
import MazAccordion from "maz-ui/components/MazAccordion";
definePageMeta({
  middleware: ["auth", "is-ultra"],

  alias: "/api/whatsapp",
});
useHead({
  title:
    "Findora APIs -  Intégrez nos endpoints votre Saas ou avec vos propres solutions. ",
});

let showExemple = ref(1);
</script>

<style scoped></style>
