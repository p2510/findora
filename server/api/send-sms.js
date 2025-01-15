import { defineEventHandler } from "h3"; // Utilisation de h3 pour Nuxt 3
import { serverSupabaseClient } from "#supabase/server"; // Si tu veux utiliser Supabase pour autre chose
import { MailtrapClient } from "mailtrap";
export default defineEventHandler(async (event) => {
  return { merci: "cqsd" };
});
