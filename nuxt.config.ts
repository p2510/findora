// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/supabase',
    "@nuxt/ui",
    "maz-ui/nuxt",
    '@pinia/nuxt',
    "nuxt-module-hotjar",
  ],
  hotjar: {
    hotjarId: 5242761,
    scriptVersion: 6,
    debug: false
  },

  pinia: {
    storesDirs: ['./stores/**'],
    
  },
  supabase: {
    url: process.env.PROJECT_URL,
    key: process.env.SUPABASE_KEY,
    redirect: true,
    redirectOptions: {
      login: "/",
      callback: "/confirm",
      include: ["/"],
      exclude: ["/dashboard"],
      cookieRedirect: false,
    },
    cookieName: "sb-access-token",
    cookieOptions: {
      maxAge: 60 * 60 * 8,
      sameSite: "lax",
      secure: true,
    },
    clientOptions: {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: true,
        persistSession: true,
        autoRefreshToken: true,
      },
    },
  },
})