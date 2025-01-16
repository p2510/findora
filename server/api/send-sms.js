import { serverSupabaseClient } from "#supabase/server"; // Si tu veux utiliser Supabase pour autre chose
export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const { data, error } = await client
    .from("test-tables")
    .insert([
      {
        name: Math.random() + "julie",
      },
    ])
    .select();
  return data;
});
