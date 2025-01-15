import { defineEventHandler } from "h3"; // Utilisation de h3 pour Nuxt 3
import { serverSupabaseClient } from "#supabase/server"; // Si tu veux utiliser Supabase pour autre chose
import { MailtrapClient } from "mailtrap";
export default defineEventHandler(async (event) => {

  // Looking to send emails in production? Check out our Email API/SMTP product!
  const TOKEN = "93ee75277c7d12de359629e0c3495b7e";

  const client = new MailtrapClient({
    token: TOKEN,
    testInboxId: 2094641,
  });

  const sender = {
    email: "hello@example.com",
    name: "Mailtrap Test",
  };
  const recipients = [
    {
      email: "poupoinaka03@gmail.com",
    },
  ];

  client.testing
    .send({
      from: sender,
      to: recipients,
      subject: "You are awesome!",
      text:'cc fr ',
      category: "Integration Test",
    })
    .then(console.log, console.error);
  return "good";
});
