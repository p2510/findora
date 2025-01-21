import { ref } from "vue";

// Définir les messages d'erreur génériques
const errorMessages = {
  content_length: "Le message doit comporter entre 8 et 160 caractères.",
  required_field: "Ce champ est requis. Veuillez le remplir.",
  generic_error: "Une erreur inattendue est survenue. Veuillez réessayer.",
};

// Fonction pour gérer les erreurs
export function useFormValidationCampaignNow() {
  // Etat réactif pour les erreurs de formulaire
  const errors = ref({
    content: [],
    global: [],
  });

  // Fonction pour valider un champ en fonction des contraintes
  const validateField = (value, constraints) => {
    const fieldErrors = [];

    // Vérification des contraintes
    if (constraints.required && (!value || value.trim() === "")) {
      fieldErrors.push(errorMessages.required_field);
    }

    if (
      constraints.minLength &&
      value &&
      value.length < constraints.minLength
    ) {
      fieldErrors.push(
        `Ce champ doit comporter au moins ${constraints.minLength} caractères.`
      );
    }

    if (
      constraints.maxLength &&
      value &&
      value.length > constraints.maxLength
    ) {
      fieldErrors.push(
        `Ce champ ne peut pas dépasser ${constraints.maxLength} caractères.`
      );
    }

    return fieldErrors;
  };

  // Fonction pour valider tout le formulaire
  const validateForm = (formData) => {
    // Réinitialiser les erreurs
    errors.value = {
      content: [],
      global: []
    };
  
    // Validation de chaque champ (avec une valeur par défaut vide si indéfini)
    const contentValue = formData.content || ""; // Remplacez les valeurs null/undefined par une chaîne vide
    errors.value.content = validateField(contentValue, { required: true, minLength: 8, maxLength: 160 });
  
    // Vérification globale des erreurs
    if (errors.value.content.length) {
      errors.value.global.push("Veuillez corriger les erreurs ci-dessus.");
    }
  
    return errors.value;
  };
  

  // Fonction pour gérer les erreurs provenant du serveur (par exemple Supabase)
  const handleServerErrors = (error) => {
    if (error.code === "23505") {
      errors.value.global.push(errorMessages.unique_constraint); // Erreur de contrainte unique
    } else {
      errors.value.global.push(errorMessages.generic_error); // Erreur générique
    }
  };

  // Retourner les erreurs et la fonction de validation
  return {
    errors,
    validateForm,
    handleServerErrors,
  };
}
