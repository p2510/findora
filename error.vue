<template>
    <div>
      <div
        class="grid h-screen place-content-center bg-white px-4"
        v-if="error.statusCode == '404'"
      >
        <div class="text-center">
          <h1 class="text-9xl font-black text-gray-200">404</h1>
  
          <p class="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Oh-oh!
          </p>
  
          <p class="mt-4 text-gray-500">Nous ne trouvons pas cette page.</p>
  
          <NuxtLink
            to="/"
            class="mt-6 inline-block text-slate-700 hover:text-white bg-[#f3c775] hover:bg-[#99732c] rounded-md shadow-md text-md p-3 transition-all duration-300 ease-in-out"
          >
            Retourner
          </NuxtLink>
        </div>
      </div>
      <div class="grid h-screen place-content-center bg-white px-4" v-else>
        <div class="text-center">
          <h1 class="text-9xl font-black text-gray-200">Oups</h1>
  
          <p class="text-2xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Oh-oh!
          </p>
  
          <p class="mt-4 text-gray-500">
            Une erreur s'est produite, veuillez nous excuser.
          </p>
  
          <NuxtLink
            to="/"
            class="mt-6 inline-block text-slate-700 hover:text-white bg-[#f3c775] hover:bg-[#99732c] rounded-md shadow-md text-md p-3 transition-all duration-300 ease-in-out"
          >
            Retourner
          </NuxtLink>
        </div>
      </div>
    </div>
  </template>
  <script setup>
  const error = useError();
  
  </script>
  