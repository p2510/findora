<template>
 <pre class="text-xs text-slate-500 p-4 rounded-lg bg-gray-900 overflow-x-auto shadow-md">
  <span class="text-slate-500">// Exemple d'utilisation de l'API pour récupérer les messages programmés</span> <br>
  fetch('https://api.myfindora.com/api/message/get-schedule', { 
    <span class="text-yellow-400">method</span>: <span class="text-green-400">'GET'</span>, 
    <span class="text-yellow-400">headers</span>: { 
      <span class="text-red-400">'Authorization'</span>: <span class="text-green-400">`Bearer \${apiKey}`</span>, 
      <span class="text-red-400">'Content-Type'</span>: <span class="text-green-400">'application/json'</span> 
    } 
  }) 
  <span class="text-blue-400">.then</span>(response => response.json()) 
  <span class="text-blue-400">.then</span>(data => console.log(data)) 
  <span class="text-blue-400">.catch</span>(error => console.error(<span class="text-green-400">'Erreur:'</span>, error)); 
</pre>


</template>