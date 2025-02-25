export const formatAmount = (amount) => {
  if (amount < 500000) {
    return amount.toLocaleString("fr-FR"); // Afficher le montant exact
  } else if (amount >= 500000 && amount <= 999999) {
    return `${(amount / 1000).toFixed(0)} k`; // Afficher en "k"
  } else if (amount >= 1000000 && amount <= 999999999) {
    return `${(amount / 1000000).toFixed(2)} M`; // Afficher en "M"
  } else {
    return `${(amount / 1000000000).toFixed(2)} Md`; // Afficher en "Md"
  }
};

export const formatDate = (currentDate) => {
  // Convertir la date d'entrée en objet Date
  const date = new Date(currentDate);
  // Retourner la date au format lisible (ex : "31 janvier 2025")
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};
