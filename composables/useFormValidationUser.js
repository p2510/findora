import { ref } from 'vue'

// Messages d'erreur centralisés
const errorMessages = {
  email_format: "L'email doit avoir un format valide.",
  required_field: "Ce champ est requis. Veuillez le remplir.",
  password_match: "Les mots de passe ne correspondent pas.",
  password_strength: "Le mot de passe doit comporter au moins 8 caractères.",
  unique_constraint: "Cette valeur existe déjà. Veuillez vérifier les données.",
  generic_error: "Une erreur inattendue est survenue. Veuillez réessayer."
}

// Hook de validation des formulaires
export function useFormValidationUser() {
  const errors = ref({
    email: [],
    password: [],
    confirm_password: [],
    global: []
  })

  // Valider un champ avec un tableau de règles
  const validateField = (value, rules = []) => {
    const fieldErrors = []

    rules.forEach(rule => {
      if (rule.type === 'required' && !value) {
        fieldErrors.push(rule.message || errorMessages.required_field)
      }
      if (rule.type === 'pattern' && value && !rule.pattern.test(value)) {
        fieldErrors.push(rule.message || errorMessages.email_format)
      }
      if (rule.type === 'minLength' && value && value.length < rule.value) {
        fieldErrors.push(
          rule.message || `Ce champ doit comporter au moins ${rule.value} caractères.`
        )
      }
    })

    return fieldErrors
  }

  // Valider l'ensemble du formulaire
  const validateForm = (formData) => {
    errors.value = {
      email: [],
      password: [],
      confirm_password: [],
      global: []
    }

    // Validation de l'email
    errors.value.email = validateField(formData.email, [
      { type: 'required' },
      {
        type: 'pattern',
        pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
        message: errorMessages.email_format
      }
    ])

    // Validation du mot de passe
    errors.value.password = validateField(formData.password, [
      { type: 'required' },
      {
        type: 'minLength',
        value: 8,
        message: errorMessages.password_strength
      }
    ])

    // Validation de la confirmation du mot de passe
    if (formData.password !== formData.confirm_password) {
      errors.value.confirm_password.push(errorMessages.password_match)
    }

    // Validation globale (si nécessaire)
    if (
      errors.value.email.length ||
      errors.value.password.length ||
      errors.value.confirm_password.length
    ) {
      errors.value.global.push("Veuillez corriger les erreurs ci-dessus.")
    }

    return errors.value
  }

  // Gestion des erreurs serveur
  const handleServerErrors = (error) => {
    if (error.code === '23505') {
      errors.value.global.push(errorMessages.unique_constraint)
    } else {
      errors.value.global.push(errorMessages.generic_error)
    }
  }

  return {
    errors,
    validateForm,
    handleServerErrors
  }
}
