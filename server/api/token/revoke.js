import { serverSupabaseClient } from "#supabase/server";
import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  // Récupérer l'utilisateur authentifié
  const supabaseUrl = useRuntimeConfig().public.supabase_url;
  const supabaseKey = useRuntimeConfig().supabase_secret_key
  const supabase = createClient(supabaseUrl, supabaseKey);
  const requestBody = await readBody(event);
  const { user_id, token } = JSON.parse(requestBody);

  try {
    // Vérifier si le token est valide
    if (!token) {
      return {
        success: false,
        message: "Token d'accès introuvable.",
      };
    }

    // Supprimer le token dans la table api_keys en fonction de l'utilisateur
    const { data, error } = await supabase
      .from("api_keys")
      .delete()
      .eq("user_id", user_id) // Identifier l'utilisateur
      .eq("key", token); // Identifier la clé spécifique

    if (error) {
      throw new Error(
        "Erreur lors de la suppression du token dans la base de données."
      );
    }

    // Retourner la réponse après la révocation
    return {
      success: true,
      message: "Le token a été révoqué avec succès.",
    };
  } catch (err) {
    return {
      success: false,
      message:
        "Erreur lors de la suppression du token ou de la révocation.",
      error: err.message,
    };
  }
});
