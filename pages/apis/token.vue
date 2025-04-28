<template>
  <section class="mt-14 h-[45rem] md:h-screen overflow-y-auto">
    <ApiNav />
    <section
      class="bg-gradient-to-br from-slate-300/5 to-slate-300/20 mt-8 p-5 rounded-2xl dark:bg-gradient-to-br dark:from-slate-700/5 dark:to-slate-700/20"
    >
      <h4 class="text-md text-slate-950 dark:text-slate-100">Votre API Key</h4>
      <p class="text-xs text-slate-500 dark:text-slate-300">
        Cette clé vous permet de vous authentifier et d'effectuer des actions.
        Elle est confidentielle et sensible. <br />
        Veuillez ne pas la partager ou la rendre publique.
      </p>
      <div
        class="bg-slate-300/40 mt-5 px-4 py-2 rounded-xl space-y-4 dark:bg-slate-700/40"
      >
        <div class="flex justify-between">
          <p class="text-slate-800 text-sm dark:text-slate-200">Votre clé</p>
          <div
            class="flex gap-2 divide-x-2 divide-slate-500 items-center dark:divide-slate-400"
          >
            <button @click="showToken = !showToken" class="flex items-center">
              <UIcon
                :name="showToken ? 'i-heroicons-eye' : 'i-heroicons-eye-slash'"
                class="w-4 h-4"
              />
            </button>
            <button class="flex items-center gap-2 pl-2" @click="copy">
              <UIcon name="i-heroicons-clipboard" class="w-4 h-4" />
              <span
                class="text-sm text-slate-800 hover:text-slate-600 transition duration-300 ease-in-out dark:text-slate-200 dark:hover:text-slate-400"
                v-if="!isCopied"
              >
                Copier
              </span>
              <span
                class="text-sm text-green-600 hover:text-green-500 transition duration-300 ease-in-out dark:text-green-500 dark:hover:text-green-400"
                v-else
              >
                Copié !
              </span>
            </button>
          </div>
        </div>
        <input
          ref="apiKeyRef"
          class="text-left text-xs text-slate-700 w-5/6 bg-transparent focus-none outline-none dark:text-slate-300"
          :value="apiKey"
          :type="showToken ? 'text' : 'password'"
          readonly
        />
      </div>
      <div class="mt-5 flex justify-center">
        <button v-if="!apiKey" @click="generateApiKey">
          <span
            class="text-center flex items-center justify-center w-full gap-2 rounded-lg transition-all duration-200 ease-in-out py-3 pl-4 pr-10 text-white bg-gray-900 hover:bg-gray-800 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            <i
              class="text-sm xl:text-md not-italic text-center"
              :class="isGenerate ? 'animate-pulse' : ''"
              >Générer une clé API</i
            >
          </span>
        </button>
        <button v-if="apiKey" @click="revokeApiKey">
          <span
            class="text-center flex items-center justify-center w-full gap-2 rounded-lg transition-all duration-200 ease-in-out py-3 pl-4 pr-10 text-white bg-red-900 hover:bg-red-800 dark:bg-red-800 dark:hover:bg-red-700"
          >
            <i class="text-sm xl:text-md not-italic text-center"
              >Révoquer la clé API</i
            >
          </span>
        </button>
      </div>
    </section>

    <section
      class="bg-gradient-to-br from-slate-300/5 to-slate-300/20 mt-8 p-5 rounded-2xl dark:bg-gradient-to-br dark:from-slate-700/5 dark:to-slate-700/20"
    >
      <h4 class="text-md text-slate-950 dark:text-slate-100">
        Utilisation de votre clé API
      </h4>
      <p class="text-xs text-slate-500 dark:text-slate-300">
        Pour toutes vos requêtes API, vous devez inclure votre clé
        d'authentification dans les en-têtes de vos demandes. Cela vous permet
        d'effectuer des actions sécurisées sur l'API. Voici un exemple de
        comment ajouter la clé dans les en-têtes :
      </p>
      <div
        class="bg-slate-300/40 mt-5 px-4 py-2 rounded-xl space-y-4 dark:bg-slate-700/40"
      >
        <pre
          class="text-xs text-slate-500 p-4 rounded-lg bg-gray-900 overflow-x-auto shadow-md dark:bg-gray-800 dark:text-slate-400"
        >
  <span class="text-slate-500">// Exemple d'utilisation du token dans une requête API en Javascript</span> <br>
  fetch('https://api.myfindora.com/endpoint', {
    <span class="text-yellow-400">method</span>: <span class="text-green-400">'GET'</span>,
    <span class="text-yellow-400">headers</span>: {
      <span class="text-red-400">'Authorization'</span>: <span class="text-green-400">Bearer \${apiKey}</span>,
      <span class="text-red-400">'Content-Type'</span>: <span class="text-green-400">'application/json'</span>
    }
  })
  <span class="text-blue-400">.then</span>(response => response.json())
  <span class="text-blue-400">.then</span>(data => console.log(data))
  <span class="text-blue-400">.catch</span>(error => console.error(<span class="text-green-400">'Erreur:'</span>, error));
</pre>

        <p class="text-xs text-slate-500 dark:text-slate-300">
          Remplacez <code>\${apiKey.value}</code> par votre clé API personnelle
          pour chaque requête.
        </p>
      </div>
    </section>
  </section>
</template>

<script setup>
import { onMounted } from "vue";
import { useUser } from "@/stores/user";
const users = useUser();
definePageMeta({
  middleware: ["auth", "is-ultra"],
  alias: "/api/jeton",
});
useHead({
  title:
    "Findora APIs - Intégrez nos endpoints dans votre SaaS ou avec vos propres solutions.",
});
const showToken = ref(false);
const isCopied = ref(false);
const apiKeyRef = ref(null);
const supabase = useSupabaseClient();
const apiKey = ref(""); // Initialisation de la clé API

const copy = async () => {
  try {
    await navigator.clipboard.writeText(apiKey.value);
    isCopied.value = true;
    setTimeout(() => (isCopied.value = false), 2000);
  } catch (err) {
    console.error("Erreur lors de la copie :");
  }
};

let isGenerate = ref(false);

// Fonction pour générer la clé API
const generateApiKey = async () => {
  isGenerate.value = true;
  const url = `${useRuntimeConfig().public.url_base}/api/token/generate`;
  const userToken = await supabase.auth.getSession();
  const token = userToken.data?.session?.access_token;
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        user_id: users.info.uuid,
        token: token,
      }),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    if (json) {
      isGenerate = false;
      apiKey.value = json.token;
      return json;
    }
  } catch (error) {
    isGenerate = false;
    console.error("Erreur:");
  }
};

// Fonction pour révoquer la clé API
const revokeApiKey = async () => {
  const url = `${useRuntimeConfig().public.url_base}/api/token/revoke`;
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        user_id: users.info.uuid,
        token: apiKey.value,
      }),
    });

    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const json = await response.json();
    if (json) {
      apiKey.value = "";
      return json;
    }
  } catch (error) {
    console.error("Erreur:");
  }
};

onMounted(async () => {
  const { data, error } = await supabase.from("api_keys").select("*").single();
  if (data) {
    apiKey.value = data?.key;
  }
});
</script>
