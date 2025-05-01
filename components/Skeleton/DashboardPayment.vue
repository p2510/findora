<template>
  <section class="grid grid-cols-12 items-center gap-6">
    <div class="col-span-6 lg:col-span-8">
      <h2 class="flex justify-between items-center w-full pb-4">
        <p class="text-slate-800 text-md lg:text-xl">Paiements à venir</p>
        <NuxtLink
          to="/paiement"
          class="text-slate-800/60 hover:text-slate-800/80 transition duration-300 ease-in-out text-md lg:text-xl"
          >Mes paiements</NuxtLink
        >
      </h2>

      <ul class="space-y-2 px-4">
        <li>
          <div
            class="flex justify-between p-2 rounded-md bg-white shadow-md hover:bg-white hover:shadow-md transition duration-300 ease-in-out"
          >
            <div class="flex gap-2 items-center">
              <p class="p-4 lg:p-6 bg-slate-950/5 rounded-lg"></p>
              <p class="flex flex-col space-y-2 animate-pulse">
                <span
                  class="text-sm lg:text-md px-12 py-2 rounded-md bg-slate-950/5"
                ></span>
                <span
                  class="text-xs lg:text-sm bg-slate-950/5 px-16 py-2 rounded-md"
                ></span>
              </p>
            </div>
            <div class="flex items-center gap-2 animate-pulse">
              <span
                class="text-slate-950 px-12 lg:px-16 py-4 rounded-md bg-slate-800/5 text-sm lg:text-md font-semibold"
              ></span>
              <NuxtLink
                to="/paiement"
                class="cursor-pointer text-white p-3 flex items-center justify-center rounded-md bg-[#f3c775] text-md font-semibold hover:bg-opacity-80 transition ease-in-out duration-300"
                ><UIcon name="i-heroicons-arrow-up-right"
              /></NuxtLink>
            </div>
          </div>
        </li>
        <li>
          <div
            class="flex justify-between p-2 rounded-md bg-white shadow-md hover:bg-white hover:shadow-md transition duration-300 ease-in-out"
          >
            <div class="flex gap-2 items-center">
              <p class="p-4 lg:p-6 bg-slate-950/5 rounded-lg"></p>
              <p class="flex flex-col space-y-2 animate-pulse">
                <span
                  class="text-sm lg:text-md px-12 py-2 rounded-md bg-slate-950/5"
                ></span>
                <span
                  class="text-xs lg:text-sm bg-slate-950/5 px-16 py-2 rounded-md"
                ></span>
              </p>
            </div>
            <div class="flex items-center gap-2 animate-pulse">
              <span
                class="text-slate-950 px-12 lg:px-16 py-4 rounded-md bg-slate-800/5 text-sm lg:text-md font-semibold"
              ></span>
              <NuxtLink
                to="/paiement"
                class="cursor-pointer text-white p-3 flex items-center justify-center rounded-md bg-[#f3c775] text-md font-semibold hover:bg-opacity-80 transition ease-in-out duration-300"
                ><UIcon name="i-heroicons-arrow-up-right"
              /></NuxtLink>
            </div>
          </div>
        </li>
        <li>
          <div
            class="flex justify-between p-2 rounded-md bg-white shadow-md hover:bg-white hover:shadow-md transition duration-300 ease-in-out"
          >
            <div class="flex gap-2 items-center">
              <p class="p-4 lg:p-6 bg-slate-950/5 rounded-lg"></p>
              <p class="flex flex-col space-y-2 animate-pulse">
                <span
                  class="text-sm lg:text-md px-12 py-2 rounded-md bg-slate-950/5"
                ></span>
                <span
                  class="text-xs lg:text-sm bg-slate-950/5 px-16 py-2 rounded-md"
                ></span>
              </p>
            </div>
            <div class="flex items-center gap-2 animate-pulse">
              <span
                class="text-slate-950 px-12 lg:px-16 py-4 rounded-md bg-slate-800/5 text-sm lg:text-md font-semibold"
              ></span>
              <NuxtLink
                to="/paiement"
                class="cursor-pointer text-white p-3 flex items-center justify-center rounded-md bg-[#f3c775] text-md font-semibold hover:bg-opacity-80 transition ease-in-out duration-300"
                ><UIcon name="i-heroicons-arrow-up-right"
              /></NuxtLink>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <div class="col-span-6 lg:col-span-4">
      <div
        class="rounded-lg p-3 bg-gradient-to-br from-slate-800/5 to-slate-800/10 space-y-2"
      >
        <p class="text- lg:text-md text-slate-950 pb-3 font-semibold">
          Mon abonnement
        </p>

        <div>
          <div class="space-y-2">
            <div
              class="flex items-center justify-between bg-white p-2 rounded-md"
            >
              <p class="flex flex-col animate-pulse space-y-2">
                <span
                  class="text-slate-950 px-12 lg:px-16 py-2 rounded-md bg-slate-800/5"
                >
                </span>
                <span
                  class="text-slate-950 px-12 lg:px-16 py-2 rounded-md bg-slate-800/5"
                ></span>
              </p>
            </div>
            <div
              class="flex items-center justify-between bg-white p-2 rounded-md"
            >
              <p class="flex flex-col animate-pulse space-y-2">
                <span
                  class="text-slate-950 px-12 lg:px-16 py-2 rounded-md bg-slate-800/5"
                >
                </span>
                <span
                  class="text-slate-950 px-12 lg:px-16 py-2 rounded-md bg-slate-800/5"
                ></span>
              </p>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between bg-white p-2 rounded-md">
          <p class="flex flex-col animate-pulse space-y-2">
            <span
              class="text-slate-950 px-12 lg:px-16 py-2 rounded-md bg-slate-800/5"
            >
            </span>
            <span
              class="text-slate-950 px-12 lg:px-16 py-2 rounded-md bg-slate-800/5"
            ></span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
