import { ref } from "vue";

export function useCustomer1() {
  const errorMessages = {
    invalid_date: "La date doit être aujourd'hui ou une date future.",
  };

  const errors = ref({
    created_at: [],
    global: [],
  });

  // Fonction de validation pour un champ individuel
  const validateField = (value, constraints) => {
    const fieldErrors = [];

    // Vérification des contraintes de base
    if (constraints.required && !value) {
      fieldErrors.push(errorMessages.required_field);
    }

    // Vérification des contraintes spécifiques
    if (constraints.dateFuture) {
      const today = new Date();
      const inputDate = new Date(value);
      if (inputDate < today.setHours(0, 0, 0, 0)) {
        fieldErrors.push(errorMessages.invalid_date);
      }
    }

    return fieldErrors;
  };

  // Fonction pour valider tout le formulaire
  const validateForm = (formData) => {
    // Réinitialiser les erreurs
    errors.value = {
      created_at: [],
      global: [],
    };

    // Validation de chaque champ
    errors.value.created_at = validateField(formData.created_at, {
      required: true,
      dateFuture: true,
    });

    // Si l'un des champs contient des erreurs, ajouter un message global
    if (errors.value.created_at.length > 0) {
      errors.value.global.push(
        "Veuillez corriger les erreurs dans le formulaire."
      );
    }

    // Retourner les erreurs
    return errors.value;
  };

  return {
    errors,
    validateForm,
  };
}
