import { ref } from "vue";

export function useFormValidationReminder() {
  const errorMessages = {
    required_field: "Ce champ est requis. Veuillez le remplir.",
    invalid_date: "La date doit être aujourd'hui ou une date future.",
    min_length: "Le message doit comporter au moins 4 caractères.",
  };

  const errors = ref({
    send_date: [],
    message: [],
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

    if (constraints.minLength && value.length < constraints.minLength) {
      fieldErrors.push(errorMessages.min_length);
    }

    return fieldErrors;
  };

  // Fonction pour valider tout le formulaire
  const validateForm = (formData) => {
    // Réinitialiser les erreurs
    errors.value = {
      send_date: [],
      message: [],
      global: [],
    };

    // Validation de chaque champ
    errors.value.send_date = validateField(formData.send_date, {
      required: true,
      dateFuture: true,
    });

    errors.value.message = validateField(formData.message, {
      required: true,
      minLength: 4,
    });
    // Si l'un des champs contient des erreurs, ajouter un message global
    if (errors.value.send_date.length > 0 || errors.value.message.length > 0) {
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
