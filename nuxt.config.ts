// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: "2024-04-03",
  devtools: { enabled: false },
  debug: false,
  modules: [
    "@nuxtjs/supabase",
    "@nuxt/ui",
    "maz-ui/nuxt",
    "@pinia/nuxt",
    "nuxt-module-hotjar",
    "dayjs-nuxt",
    "@nuxtjs/i18n",
  ],
  hotjar: {
    hotjarId: 5242761,
    scriptVersion: 6,
    debug: false,
  },

  pinia: {
    storesDirs: ["./stores/**"],
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
  runtimeConfig: {
    supabase_secret_key: process.env.SUPABASE_SECRET_KEY,
    openai_api_key: process.env.OPENAI_API_KEY,
    whapi_api_secret: process.env.WHAPI_API_SECRET,
    public: {
      url_base: process.env.URL_BASE,
      api_base: process.env.API_BASE,
      supabase_url: process.env.PROJECT_URL,
      supabase_public_key: process.env.SUPABASE_KEY,
    },
  },
  i18n: {
    locales: [
      { code: "en", language: "en-US", file: "en.json" },
      { code: "fr", language: "fr-FR", file: "fr.json" },
    ],
    strategy: "no_prefix",
    defaultLocale: "fr",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root", 
    },
    lazy: true,
  },
});
