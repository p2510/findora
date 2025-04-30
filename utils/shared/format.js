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

export const formatPhone = (phoneNumber) => {
  if (!phoneNumber.startsWith("+")) return phoneNumber;

  const countryCode = phoneNumber.slice(1, 4); // "225"
  const remainingNumber = phoneNumber.slice(4); // Numéro sans l'indicatif

  if (countryCode === "225") {
    // Vérifier si les deux premiers chiffres après 225 sont "01"
    if (remainingNumber.startsWith("01")) {
      return countryCode + remainingNumber; // On garde le numéro entier
    }
    // Vérifier si le troisième et le quatrième chiffre après 225 sont "00"
    if (
      remainingNumber.length >= 4 &&
      remainingNumber[2] === "0" &&
      remainingNumber[3] === "0"
    ) {
      return countryCode + remainingNumber; // On garde le numéro entier
    }

    return countryCode + remainingNumber.slice(2); // Sinon, on slice
  } else {
    return phoneNumber.slice(1); // On enlève juste le "+"
  }
};

export const unformatPhone = (formattedNumber) => {
  if (!formattedNumber.startsWith("225")) return formattedNumber;

  const countryCode = "225";
  const remainingNumber = formattedNumber.slice(3); // Après "225"

  // Si ça commence déjà par "01" → on garde tel quel
  if (remainingNumber.startsWith("01")) {
    return `+${countryCode}${remainingNumber}`;
  }

  // Si la 3e et 4e position sont "00" → on garde aussi tel quel
  if (
    remainingNumber.length >= 4 &&
    remainingNumber[2] === "0" &&
    remainingNumber[3] === "0"
  ) {
    return `+${countryCode}${remainingNumber}`;
  }

  // Sinon, on ajoute "07" devant les 8 chiffres pour reconstruire
  const fullNumber = `07${remainingNumber}`;
  return `+${countryCode}${fullNumber}`;
};
