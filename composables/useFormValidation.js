// useFormValidation.js
import { ref } from 'vue'

// Définir les messages d'erreur génériques
const errorMessages = {
  name_length: "Le nom doit comporter entre 3 et 50 caractères.",
  email_format: "L'email doit avoir un format valide.",
  phone_format: "Le numéro de téléphone doit commencer par 01, 05 ou 07 et contenir 10 chiffres.",
  required_field: "Ce champ est requis. Veuillez le remplir.",
  unique_constraint: "Cette valeur existe déjà. Veuillez vérifier les données.",
  generic_error: "Une erreur inattendue est survenue. Veuillez réessayer."
}

// Fonction pour gérer les erreurs
export function useFormValidation() {
  // Etat réactif pour les erreurs de formulaire
  const errors = ref({
    name: [],
    email: [],
    phone: [],
    global: []
  })

  // Fonction pour valider un champ en fonction des contraintes
  const validateField = (value, constraints) => {
    const fieldErrors = []

    // Vérification des contraintes
    if (constraints.required && !value) {
      fieldErrors.push(errorMessages.required_field)
    }

    if (constraints.minLength && value.length < constraints.minLength) {
      fieldErrors.push(`Ce champ doit comporter au moins ${constraints.minLength} caractères.`)
    }

    if (constraints.maxLength && value.length > constraints.maxLength) {
      fieldErrors.push(`Ce champ ne peut pas dépasser ${constraints.maxLength} caractères.`)
    }

    if (constraints.pattern && !constraints.pattern.test(value)) {
      fieldErrors.push(constraints.patternMessage || "Format invalide.")
    }

    return fieldErrors
  }

  // Fonction pour valider tout le formulaire
  const validateForm = (formData) => {
    // Réinitialiser les erreurs
    errors.value = {
      name: [],
      email: [],
      phone: [],
      global: []
    }

    // Validation de chaque champ
    errors.value.name = validateField(formData.name, { required: true, minLength: 3, maxLength: 50 })
    errors.value.email = validateField(formData.email, { required: true, pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, patternMessage: "L'email est invalide." })
    errors.value.phone = validateField(formData.phone, { required: true, pattern: /^(01|05|07)\d{8}$/, patternMessage: "Le téléphone doit commencer par 01, 05, ou 07 et comporter 10 chiffres." })

    // Vérification globale des erreurs
    if (errors.value.name.length || errors.value.email.length || errors.value.phone.length) {
      errors.value.global.push("Veuillez corriger les erreurs ci-dessus.")
    }

    return errors.value
  }

  // Fonction pour gérer les erreurs provenant du serveur (par exemple Supabase)
  const handleServerErrors = (error) => {
    if (error.code === '23505') {
      errors.value.global.push(errorMessages.unique_constraint)  // Erreur de contrainte unique
    } else {
      errors.value.global.push(errorMessages.generic_error)  // Erreur générique
    }
  }

  // Retourner les erreurs et la fonction de validation
  return {
    errors,
    validateForm,
    handleServerErrors
  }
}
