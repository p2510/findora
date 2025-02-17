<template>
  <div>
    <div>
      <div v-if="stateInstance == null">
        <p
          class="px-8 lg:px-12 animate-pulse text-transparent bg-slate-950/20 rounded-lg py-4"
        ></p>
      </div>
      <div v-else>
        <!-- Statut autorisé -->
        <div v-if="stateInstance === 'authorized'">
          <span
            class="flex flex-col space-y-2 text-sm text-white py-2 px-4 rounded-md bg-[#075E54]"
          >
            Déjà connecté
          </span>
        </div>

        <!-- Autres cas -->
        <div v-else>
          <button
            v-if="imageUrl == null"
            @click="getGreenApiQrCode"
            class="flex flex-col space-y-2 text-sm text-white py-2 px-4 rounded-md bg-[#25D366] hover:bg-[#075E54] transition-all duration ease-in-out"
          >
            <span v-if="!isRequest"> Commencer </span>
            <span v-else> Chargement...</span>
          </button>
          <div>
            <div v-if="imageUrl" class="text-xs text-slate-950">
              <h2>Scannez le QR Code pour vous connecter</h2>
              <div class="flex justify-center w-full">
                <img :src="imageUrl" alt="Image Base64" class="w-40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
const supabase = useSupabaseClient();
const idInstance = ref(null);
const apiTokenInstance = ref(null);
const stateInstance = ref(null);
const whatsapp = ref(null);
let imageUrl = ref(null);
let isRequest = ref(false);

const getGreenApiQrCode = async () => {
  isRequest.value = true;

  const url = `https://7105.api.greenapi.com/waInstance${idInstance.value}/qr/${apiTokenInstance.value}`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    if (data.type === "qrCode") {
      const binaryString = atob(data.message);
      const byteArray = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        byteArray[i] = binaryString.charCodeAt(i);
      }
      const blob = new Blob([byteArray], { type: "image/png" });
      imageUrl.value = URL.createObjectURL(blob);
      isRequest.value = false;
    } else if (data.type === "alreadyLogged") {
      isRequest.value = false;
    } else {
      isRequest.value = false;
      throw new Error(`Erreur: ${data.message}`);
    }
  } catch (error) {
    isRequest.value = false;
    return null;
  }
};

const fetchWhatsapp = async () => {
  const { data, error } = await supabase
    .from("whatsapp_backlogs")
    .select("instance_id,api_token")
    .single();
  if (error) {
    console.error("Erreur lors de la récupération des données");
  } else {
    whatsapp.value = data || null;
    idInstance.value = data.instance_id;
    apiTokenInstance.value = data.api_token;
    getStateInstance();
  }
};

const getStateInstance = async () => {
  const url = `https://7105.api.greenapi.com/waInstance${idInstance.value}/getStateInstance/${apiTokenInstance.value}`;

  try {
    const response = await fetch(url, {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    if (data) {
      stateInstance.value = data.stateInstance;
    } else {
      throw new Error(`Erreur: ${data}`);
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération de l'état de l'instance",
      error
    );
  }
};

onMounted(() => {
  fetchWhatsapp();
});
</script>
