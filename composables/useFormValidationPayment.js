import { ref } from 'vue'

// Définir les messages d'erreur génériques
const errorMessages = {
  name_length: "Le nom doit comporter entre 3 et 50 caractères.",
  email_format: "L'email doit avoir un format valide.",
  phone_format: "Le numéro de téléphone doit commencer par 01, 03 ou 05 et contenir 10 chiffres.",
  required_field: "Ce champ est requis. Veuillez le remplir.",
  unique_constraint: "Cette valeur existe déjà. Veuillez vérifier les données.",
  generic_error: "Une erreur inattendue est survenue. Veuillez réessayer.",
  invalid_date: "La date doit être valide.",
  amount_positive: "Le montant ne peut pas être nul ou négatif.",
  invalid_status: "Le statut doit être 'payé', 'non-payé' ou 'en attente'.",
  date_of_issue_before_payment: "La date d'émission ne peut pas être supérieure à la date d'échéance'."
}

// Fonction pour gérer les erreurs
export function useFormValidationPayment() {
  // Etat réactif pour les erreurs de formulaire
  const errors = ref({
    payment_date: [],
    date_of_issue: [],
    customers_id: [],
    amount: [],
    status: [],
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

    // Vérification des autres contraintes spécifiques
    if (constraints.date && isNaN(Date.parse(value))) {
      fieldErrors.push(errorMessages.invalid_date)
    }

    if (constraints.amount && value <= 0) {
      fieldErrors.push(errorMessages.amount_positive)
    }

    if (constraints.status && !['payé', 'non-payé', 'en-attente'].includes(value)) {
      fieldErrors.push(errorMessages.invalid_status)
    }

    if (constraints.dateComparison && constraints.dateComparison.before) {
      const paymentDate = new Date(value)
      const issueDate = new Date(constraints.dateComparison.before)
      if (paymentDate < issueDate) {
        fieldErrors.push(errorMessages.date_of_issue_before_payment)
      }
    }

    return fieldErrors
  }

  // Fonction pour valider tout le formulaire
  const validateForm = (formData) => {
    // Réinitialiser les erreurs
    errors.value = {
      payment_date: [],
      date_of_issue: [],
      customers_id: [],
      amount: [],
      status: [],
      global: []
    }

    // Validation de chaque champ
    errors.value.payment_date = validateField(formData.payment_date, { required: true, date: true })
    errors.value.date_of_issue = validateField(formData.date_of_issue, { required: true, date: true })
    errors.value.customers_id = validateField(formData.customers_id, { required: true })
    errors.value.amount = validateField(formData.amount, { required: true, amount: true })
    errors.value.status = validateField(formData.status, { required: true, status: true })

    // Vérification de la contrainte date d'émission < date de paiement
    if (formData.date_of_issue && formData.payment_date) {
      const date_of_issue = new Date(formData.date_of_issue)
      const payment_date = new Date(formData.payment_date)
      if (date_of_issue > payment_date) {
        errors.value.date_of_issue.push(errorMessages.date_of_issue_before_payment)
      }
    }

    // Vérification globale des erreurs
    if (
      errors.value.payment_date.length ||
      errors.value.date_of_issue.length ||
      errors.value.customers_id.length ||
      errors.value.amount.length ||
      errors.value.status.length
    ) {
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
