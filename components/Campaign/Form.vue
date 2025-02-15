<template>
  <div>
    <form class="grid grid-cols-12 gap-4 pt-6">
      <div class="col-span-full flex items-end gap-4">
        <CampaignCustomerSelection v-model="formData.customers" />
      </div>

      <div class="col-span-full space-y-[1px]">
        <label for="name" class="text-gray-500 text-sm"
          >Message (160 Caratères maximum)</label
        >

        <textarea
          v-model="formData.content"
          class="text-sm hover:shadow-sm p-2 rounded-lg bg-white outline-none border-2 border-solid focus:rounded-lg transition duration-300 ease-in-out text-slate-800/80 w-full focus:border-[#f3c775]"
          maxlength="160"
          rows="7"
        ></textarea>
        <span v-if="formData.content.length > 0" class="text-xs opacity-40"
          >Caratères : {{ formData.content.length }}
        </span>
        <div v-if="errors.content.length" class="error">
          <ul>
            <li v-for="error in errors.content" :key="error">
              {{ error }}
            </li>
          </ul>
        </div>
      </div>
      <h5 class="flex col-span-full items-center">
        <label class="text-gray-500 text-sm"
          >Choisir un ou des cannaux :
        </label>
        <div class="flex">
          <div class="pl-4" v-if="subscriptions == null">
            <SkeletonButton />
          </div>
          <div
            class="pl-4 flex gap-3"
            v-else-if="subscriptions?.subscription_type === 'ultra'"
          >
            <UChip
              color="amber"
              size="xl"
              v-for="{ name, selected } in channels"
              :key="name"
              :show="selected"
            >
              <img
                @click="channels[0].selected = !channels[0].selected"
                v-if="name == 'sms'"
                src="~/assets/img/sms.png"
                alt=""
                class="w-10 hover:opacity-80 transition ease-in-out duration-300 cursor-pointer"
              />

              <img
                @click="channels[1].selected = !channels[1].selected"
                v-if="name == 'whatsapp'"
                src="~/assets/img/whatsapp.png"
                alt=""
                class="w-10 hover:opacity-80 transition ease-in-out duration-300 cursor-pointer"
              />
            </UChip>
          </div>
          <div class="pl-4 flex gap-3" v-else>
            <UChip color="amber" size="xl" :show="channels[0].selected">
              <img
                @click="channels[0].selected = !channels[0].selected"
                src="~/assets/img/sms.png"
                alt=""
                class="w-10 hover:opacity-80 transition ease-in-out duration-300 cursor-pointer"
              />
            </UChip>
            <img
              src="~/assets/img/whatsapp.png"
              alt=""
              class="w-10 opacity-30"
            />
          </div>
        </div>
      </h5>

      <!-- Bouton de soumission -->
      <div class="col-span-full space-y-[1px] flex gap-4">
        <UButton
          @click="AddCampaign"
          :loading="isRequestInProgress"
          type="button"
          size="lg"
          variant="solid"
          color="emerald"
        >
          Envoyer maintenant
        </UButton>
        <UButton
          @click="openScheduleModal"
          :loading="isRequestSchedule"
          type="button"
          size="lg"
          variant="solid"
          color="yellow"
        >
          Programmer
        </UButton>
      </div>
    </form>
    <UModal v-model="isScheduleModalOpen" @prevent-close="closeScheduleModal">
      <section class="bg-white p-4 rounded-xl space-y-6">
        <h5>
          <UBadge color="gray" variant="soft" size="lg"
            >Programmer l'envoi</UBadge
          >
        </h5>

        <div>
          <label for="send_date" class="text-gray-500 text-sm"
            >Date et heure d'envoi</label
          >
          <input
            type="date"
            v-model="formData.send_date"
            class="w-full mt-2 p-2 border rounded-lg"
          />
        </div>

        <UButton
          @click="scheduleCampaign"
          color="blue"
          variant="soft"
          size="lg"
        >
          Programmer
        </UButton>
      </section>
    </UModal>
    <div v-if="isSuccessOpen">
      <AlertModal
        title="Campagne effectué"
        type="success"
        @close-alert="closeSuccessAlert"
      >
        <template #message>
          <p>Votre campagne a été effectuée avec succès .</p>
        </template>
      </AlertModal>
    </div>
    <div v-if="isAlertOpen">
      <AlertModal
        title="Informations incorrectes"
        type="error"
        @close-alert="closeErrorAlert"
      >
        <template #message>
          <p>
            {{ errorMessage }}
          </p>
        </template>
      </AlertModal>
    </div>
  </div>
</template>

<script setup>

</script>
