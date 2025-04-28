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
 
    // Insérer le token dans la table api_keys avec l'ID de l'utilisateur connecté
    const { data, error } = await supabase
      .from("api_keys")
      .upsert({
        user_id: user_id, 
        key: token, // Le token d'accès de la session
      })
      .select();

    if (error) {
      throw new Error(
        "Erreur lors de l'enregistrement du token dans la base de données."
      );
    }

    // Retourner la réponse avec le token
    return {
      success: true,
      message: "Processus terminé.",
      token: token, // Retourne le token d'authentification actuel
    };
  } catch (err) {
    return {
      success: false,
      message:
        "Erreur lors de la récupération ou de l'enregistrement du token.",
      error: err.message,
    };
  }
});
