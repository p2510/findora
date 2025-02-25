<template>
  <div class="mt-14 space-y-4 pr-4">
    <h2 class="col-span-full text-4xl text-slate-900 pb-4">Gérer mon compte</h2>
    <div class="grid grid-cols-12 gap-4">
      <UpdateUserForm class="col-span-full xl:col-span-6" />
      <UpdateInfoForm class="col-span-full xl:col-span-6" />

      <div class="col-span-full">
        <section class="grid grid-cols-12 items-center gap-6">

          <div class="col-span-full lg:col-span-4 h-full">
            <div
              class="rounded-lg p-3 bg-gradient-to-br from-slate-800/5 to-slate-800/10 space-y-2"
            >
              <p class="text- lg:text-md text-slate-950 pb-3">
                Nom d'envoi SMS
              </p>

              <div>
                <div class="space-y-2">
                  <div
                    class="flex items-center justify-between bg-white p-2 rounded-md"
                  >
                    <p class="flex flex-col space-y-2">
                      <span
                        class="text-sm text-slate-950 py-2 px-4 rounded-md bg-slate-800/5"
                        v-if="user.sms_backlogs"
                      >
                        {{ user.sms_backlogs?.sender_name }}
                      </span>
                      <span
                        class="text-sm text-slate-950 py-2 px-4 rounded-md bg-slate-800/5"
                        v-else
                      >
                        Aucun nom
                      </span>
                    </p>
                    <a
                      href="https://wa.me/2250797966331?text=Je veux changer mon nom d'envoi"
                      target="_blank"
                      class="text-white p-2 text-sm rounded-md bg-slate-800"
                      >Changer</a
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="col-span-full lg:col-span-8">
            <h2 class="flex justify-between items-center w-full pb-4">
              <p
                class="text-slate-800 text-md lg:text-xl"
                id="plus-de-sms"
                v-if="!user.subscription.is_partner"
              >
                Rechargez votre stock de SMS
              </p>
              <p
                class="text-slate-800 text-md lg:text-xl"
                id="plus-de-sms"
                v-else
              >
                Seulement pour les partenaires
              </p>
            </h2>

            <PurchaseSms :is-partner="user.subscription.is_partner" />
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
definePageMeta({
  middleware: "auth",
  alias: "/parametre",
});
useHead({
  title: "Findora - Paramètre",
});
import { useUser } from "@/stores/user";
const user = useUser();


</script>
<style scoped>
.error {
  color: red;
}
</style>
