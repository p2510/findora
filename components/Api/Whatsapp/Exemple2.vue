<template>
          <pre class="text-xs text-slate-500 p-4 rounded-lg bg-gray-900 overflow-x-auto shadow-md">
  <span class="text-slate-500">// Exemple d'utilisation de l'API pour programmer un message</span> <br>
  fetch('https://api.myfindora.com/api/message/send-schedule', { 
    <span class="text-yellow-400">method</span>: <span class="text-green-400">'POST'</span>, 
    <span class="text-yellow-400">headers</span>: { 
      <span class="text-red-400">'Authorization'</span>: <span class="text-green-400">`Bearer \${apiKey}`</span>, 
      <span class="text-red-400">'Content-Type'</span>: <span class="text-green-400">'application/json'</span> 
    }, 
    <span class="text-yellow-400">body</span>: JSON.stringify({ 
      <span class="text-red-400">phone</span>: <span class="text-green-400">['+1234567890', '+2250160485654']</span>, 
      <span class="text-red-400">message</span>: <span class="text-green-400">"Votre message programmé."</span>, 
      <span class="text-red-400">send_at</span>: <span class="text-green-400">'2025-03-28'</span>  
    }) 
  }) 
  <span class="text-blue-400">.then</span>(response => response.json()) 
  <span class="text-blue-400">.then</span>(data => console.log(data)) 
  <span class="text-blue-400">.catch</span>(error => console.error(<span class="text-green-400">'Erreur:'</span>, error)); 
</pre>

</template>