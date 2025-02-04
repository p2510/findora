<template>
  <div class="mt-14 space-y-4 pr-4">
    <h2 class="col-span-full text-4xl text-slate-900 pb-4">Gérer mon compte</h2>
    <div class="grid grid-cols-12 gap-4">
      <UpdateUserForm class="col-span-full xl:col-span-6" />
      <UpdateInfoForm class="col-span-full xl:col-span-6" />
      <div class="col-span-full">
        <section class="grid grid-cols-12 items-center gap-6">
          <div class="col-span-full lg:col-span-8">
            <h2 class="flex justify-between items-center w-full pb-4">
              <p
                class="text-slate-800 text-md lg:text-xl"
                id="plus-de-sms"
                v-if="!subscriptions?.is_partner"
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

            <ul class="space-y-2 px-4" v-if="!subscriptions?.is_partner">
              <li>
                <div
                  class="flex justify-between p-2 rounded-md bg-white shadow-md hover:bg-white hover:shadow-md transition duration-300 ease-in-out"
                >
                  <div class="flex gap-2 items-center">
                    <p
                      class="p-4 lg:p-6 bg-slate-950/5 rounded-lg animate-pulse"
                    ></p>

                    <p class="flex flex-col space-y-2">
                      <span class="text-sm p-2 rounded-md bg-slate-950/5"
                        >Starter | 100 SMS</span
                      >
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="text-slate-950 p-2 rounded-md bg-slate-800/5 text-sm font-semibold"
                      >2.000 FCFA</span
                    >
                    <a
                      href="https://wa.me/2250160485654?text=starter"
                      target="_blank"
                      class="cursor-pointer text-white p-2 flex items-center justify-center rounded-md bg-[#f3c775] text-sm hover:bg-opacity-80 transition ease-in-out duration-300"
                      >Payer</a
                    >
                  </div>
                </div>
              </li>
              <li>
                <div
                  class="flex justify-between p-2 rounded-md bg-white shadow-md hover:bg-white hover:shadow-md transition duration-300 ease-in-out"
                >
                  <div class="flex gap-2 items-center">
                    <p
                      class="p-4 lg:p-6 bg-slate-950/5 rounded-lg animate-pulse"
                    ></p>
                    <p class="flex flex-col space-y-2">
                      <span class="text-sm p-2 rounded-md bg-slate-950/5"
                        >Boost | 500 SMS</span
                      >
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="text-slate-950 p-2 rounded-md bg-slate-800/5 text-sm font-semibold"
                      >7.500 FCFA</span
                    >
                    <a
                      href="https://wa.me/2250160485654?text=boost"
                      target="_blank"
                      class="cursor-pointer text-white p-2 flex items-center justify-center rounded-md bg-[#f3c775] text-sm hover:bg-opacity-80 transition ease-in-out duration-300"
                      >Payer</a
                    >
                  </div>
                </div>
              </li>
              <li>
                <div
                  class="flex justify-between p-2 rounded-md bg-white shadow-md hover:bg-white hover:shadow-md transition duration-300 ease-in-out"
                >
                  <div class="flex gap-2 items-center">
                    <p
                      class="p-4 lg:p-6 bg-slate-950/5 rounded-lg animate-pulse"
                    ></p>

                    <p class="flex flex-col space-y-2">
                      <span class="text-sm p-2 rounded-md bg-slate-950/5"
                        >Ultra | 1.000 SMS</span
                      >
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="text-slate-950 p-2 rounded-md bg-slate-800/5 text-sm font-semibold"
                      >12.000 FCFA</span
                    >
                    <a
                      href="https://wa.me/2250160485654?text=ultra"
                      target="_blank"
                      class="cursor-pointer text-white p-2 flex items-center justify-center rounded-md bg-[#f3c775] text-sm hover:bg-opacity-80 transition ease-in-out duration-300"
                      >Payer</a
                    >
                  </div>
                </div>
              </li>
            </ul>
            <ul class="space-y-2 px-4" v-else>
              <li>
                <div
                  class="flex justify-between p-2 rounded-md bg-white shadow-md hover:bg-white hover:shadow-md transition duration-300 ease-in-out"
                >
                  <div class="flex gap-2 items-center">
                    <p
                      class="p-4 lg:p-6 bg-slate-950/5 rounded-lg animate-pulse"
                    ></p>

                    <p class="flex flex-col space-y-2">
                      <span class="text-sm p-2 rounded-md bg-slate-950/5"
                        >8 F / SMS</span
                      >
                    </p>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      class="text-slate-950 p-2 rounded-md bg-slate-800/5 text-sm font-semibold"
                      >8 F / SMS</span
                    >
                    <a
                      href="https://wa.me/2250160485654?text=starter"
                      target="_blank"
                      class="cursor-pointer text-white p-2 flex items-center justify-center rounded-md bg-[#f3c775] text-sm hover:bg-opacity-80 transition ease-in-out duration-300"
                      >Payer</a
                    >
                  </div>
                </div>
              </li>
            </ul>
          </div>
          <div class="col-span-6 lg:col-span-4">
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
                        v-if="SmsBacklogs"
                      >
                        {{ SmsBacklogs?.sender_name }}
                      </span>
                    </p>
                    <a
                      href="https://wa.me/2250160485654?text=Nom d'envoi"
                      target="_blank"
                      class="text-white p-2 text-sm rounded-md bg-slate-800"
                      >Changer</a
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!--
          <div class="col-span-6 lg:col-span-3">
            <div
              class="rounded-lg p-3 bg-gradient-to-br from-slate-800/5 to-slate-800/10 space-y-2"
            >
              <p class="text- lg:text-md text-slate-950 pb-3">
                Code Partenanire
              </p>

              <div>
                <div class="space-y-2">
                  <div
                    class="flex items-center justify-between bg-white p-2 rounded-md gap-3"
                  >
                    <p class="basis-1/2 flex flex-col space-y-2">
                      <span 
                        class="text-xs text-slate-950 py-2 px-4 rounded-md bg-slate-800/5"
                      >
                        55FTGj
                      </span>
                    </p>
                    <p 
                      href="https://wa.me/2250160485654?text=Nom d'envoi"
                      target="_blank"
                      class="basis-1/2 text-white p-2 text-xs rounded-md bg-slate-800"
                    >
                      CashBack : 0 F
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          -->
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
const supabase = useSupabaseClient();

let { data: SmsBacklogs, error } = await supabase
  .from("sms_backlogs")
  .select("sender_name")
  .single();
let subscriptions = ref(null);
onMounted(async () => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .single();

  if (data) {
    subscriptions.value = data;
  }
});
</script>
<style scoped>
.error {
  color: red;
}
</style>
