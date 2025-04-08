<template>
  <div class="mt-14">
    <div
      class="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
    >
      <div
        class="bg-white p-6 md:p-8 rounded-2xl shadow-2xl max-w-lg w-full text-center relative animate-fadeIn"
      >
        <div class="flex justify-center mb-4 text-red-500">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12" />
        </div>
        <h2 class="text-2xl font-semibold mb-2">Accès réservé</h2>
        <p class="text-gray-600 mb-6" v-if="name == 'entreprise'">
          Cette fonctionnalité est uniquement disponible pour les
          <strong>les abonnements entreprise</strong>. Passez à un abonnement
          entreprise pour débloquer cette option.
        </p>
        <p class="text-gray-600 mb-6" v-else-if="name == 'ultra'">
          Cette fonctionnalité est uniquement disponible pour les
          <strong>les abonnements entreprise ou ultra</strong>. Passez à un
          abonnement entreprise ou ultra pour débloquer cette option.
        </p>
        <NuxtLink
          to="/dashboard"
          class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-medium transition"
        >
          Retourner au Dashboard
        </NuxtLink>
      </div>
    </div>

    <section class="blur-sm">
      <ApiNav />
      <section
        class="bg-gradient-to-br from-slate-300/5 to-slate-300/20 mt-8 p-5 rounded-2xl"
      >
        <h4 class="text-md text-slate-950">Votre API Key</h4>
        <p class="text-xs text-slate-500">
          Cette clé vous permet de vous authentifier et d'effectuer des actions.
          Elle est confidentielle et sensible. <br />
          Veuillez ne pas la partager ou la rendre publique.
        </p>
        <div class="bg-slate-300/40 mt-5 px-4 py-2 rounded-xl space-y-4">
          <div class="flex justify-between">
            <p class="text-slate-800 text-sm">Votre clé</p>
            <div class="flex gap-2 divide-x-2 divide-slate-500 items-center">
              <button class="flex items-center">
                <UIcon name="i-heroicons-eye" class="w-4 h-4" />
              </button>
              <button class="flex items-center gap-2 pl-2">
                <UIcon name="i-heroicons-clipboard" class="w-4 h-4" />
                <span
                  class="text-sm text-slate-800 hover:text-slate-600 transition duration-300 ease-in-out"
                >
                  Copier
                </span>
              </button>
            </div>
          </div>
          <input
            class="text-left text-xs text-slate-700 w-5/6 bg-transparent focus-none outline-none"
            value="apiKeysdfsdgdqsgfgdgfdsfgsdgdfsgdsfhsdfhdfghdfhdfhdfhdfgfhdgdfghdf dgjfghjfgjf jfg fgjkfgkfkf kfkf"
            type="password"
            readonly
          />
        </div>
        <div class="mt-5 flex justify-center">
          <button>
            <span
              class="text-center flex items-center justify-center w-full gap-2 rounded-lg transition-all duration-200 ease-in-out py-3 pl-4 pr-10 text-white bg-gray-900 hover:bg-gray-800"
            >
              <i class="animate-pulse text-sm xl:text-md not-italic text-center"
                >Générer une clé API</i
              >
            </span>
          </button>
        </div>
      </section>
      <section
        class="bg-gradient-to-br from-slate-300/5 to-slate-300/20 mt-8 p-5 rounded-2xl"
      >
        <h4 class="text-md text-slate-950">Utilisation de votre clé API</h4>
        <p class="text-xs text-slate-500">
          Pour toutes vos requêtes API, vous devez inclure votre clé
          d'authentification dans les en-têtes de vos demandes. Cela vous permet
          d'effectuer des actions sécurisées sur l'API. Voici un exemple de
          comment ajouter la clé dans les en-têtes :
        </p>
        <div class="bg-slate-300/40 mt-5 px-4 py-2 rounded-xl space-y-4">
          <pre
            class="text-xs text-slate-500 p-4 rounded-lg bg-gray-900 overflow-x-auto shadow-md"
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

          <p class="text-xs text-slate-500">
            Remplacez <code>\${apiKey.value}</code> par votre clé API
            personnelle pour chaque requête.
          </p>
        </div>
      </section>
    </section>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ["auth"],
});
const route = useRoute();
const name = route.params.name;
</script>
<style scoped>
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
</style>
