import { ref } from 'vue'

// Messages d'erreur centralisés
const errorMessages = {
  required_field: "Ce champ est requis. Veuillez le remplir.",
  domain_format: "Le domaine doit être l'un des éléments de la liste.",
  name_format: "Le nom doit comporter uniquement des lettres et espaces.",
  generic_error: "Une erreur inattendue est survenue. Veuillez réessayer."
}

// Liste des domaines valides
const validDomains = [
  'Production agricole',
  'Agriculture durable',
  'Transformation alimentaire',
  'Énergie renouvelable',
  'Gestion des ressources naturelles',
  'Logistique et transport',
  'Consulting en management',
  'Développement web',
  'Design graphique',
  'Cybersécurité',
  'Marketing digital',
  'Gestion financière',
  'Services de formation',
  'Conseil juridique',
  'Développement mobile',
  'Réseautage et événements',
  'Gestion de projet',
  'Ressources humaines',
  'Innovation technologique',
  'Services à la personne',
  'Événementiel',
  'E-commerce',
  'Création de contenu',
  'Vente et distribution',
  'Communication visuelle'
]

// Hook de validation des formulaires
export function useFormValidationUserInfo() {
  const errors = ref({
    domain: [],
    name: [],
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
        fieldErrors.push(rule.message || "Le format est incorrect.")
      }
    })

    return fieldErrors
  }

  // Valider l'ensemble du formulaire
  const validateForm = (formData) => {
    errors.value = {
      domain: [],
      name: [],
      global: []
    }



    // Validation du domaine (doit être l'un des éléments de la liste)
    errors.value.domain = validateField(formData.domain, [
      { type: 'required' },
      {
        type: 'pattern',
        pattern: new RegExp(`^(${validDomains.join('|')})$`), // Vérifie si le domaine fait partie de la liste
        message: errorMessages.domain_format
      }
    ])

    // Validation du nom
    errors.value.name = validateField(formData.name, [
      { type: 'required' },
      {
        type: 'pattern',
        pattern: /^[a-zA-Z\s]+$/,
        message: errorMessages.name_format
      }
    ])

    // Validation globale (si nécessaire)
    if (
      errors.value.domain.length ||
      errors.value.name.length
    ) {
      errors.value.global.push("Veuillez corriger les erreurs ci-dessus.")
    }

    return errors.value
  }
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