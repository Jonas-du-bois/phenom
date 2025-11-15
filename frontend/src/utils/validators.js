/**
 * Utilitaires pour la validation de formulaires
 */

/**
 * Valide une adresse email
 * @param {string} email - Email à valider
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, error: "L'email est requis" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Format d'email invalide" };
  }

  return { valid: true, error: null };
};

/**
 * Valide un mot de passe
 * @param {string} password - Mot de passe à valider
 * @param {Object} options - Options de validation
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validatePassword = (password, options = {}) => {
  const {
    minLength = 6,
    requireUppercase = false,
    requireLowercase = false,
    requireNumber = false,
    requireSpecialChar = false,
  } = options;

  if (!password) {
    return { valid: false, error: "Le mot de passe est requis" };
  }

  if (password.length < minLength) {
    return {
      valid: false,
      error: `Le mot de passe doit contenir au moins ${minLength} caractères`,
    };
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return {
      valid: false,
      error: "Le mot de passe doit contenir au moins une majuscule",
    };
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return {
      valid: false,
      error: "Le mot de passe doit contenir au moins une minuscule",
    };
  }

  if (requireNumber && !/\d/.test(password)) {
    return {
      valid: false,
      error: "Le mot de passe doit contenir au moins un chiffre",
    };
  }

  if (requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return {
      valid: false,
      error: "Le mot de passe doit contenir au moins un caractère spécial",
    };
  }

  return { valid: true, error: null };
};

/**
 * Valide la correspondance de deux mots de passe
 * @param {string} password - Mot de passe
 * @param {string} confirmPassword - Confirmation du mot de passe
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!password || !confirmPassword) {
    return { valid: false, error: "Tous les champs sont requis" };
  }

  if (password !== confirmPassword) {
    return { valid: false, error: "Les mots de passe ne correspondent pas" };
  }

  return { valid: true, error: null };
};

/**
 * Valide un nom d'utilisateur
 * @param {string} name - Nom à valider
 * @param {Object} options - Options de validation
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateName = (name, options = {}) => {
  const { minLength = 2, maxLength = 50, required = true } = options;

  if (required && !name) {
    return { valid: false, error: "Le nom est requis" };
  }

  if (!required && !name) {
    return { valid: true, error: null };
  }

  if (name.length < minLength) {
    return {
      valid: false,
      error: `Le nom doit contenir au moins ${minLength} caractères`,
    };
  }

  if (name.length > maxLength) {
    return {
      valid: false,
      error: `Le nom ne peut pas dépasser ${maxLength} caractères`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Valide un texte (description, commentaire, etc.)
 * @param {string} text - Texte à valider
 * @param {Object} options - Options de validation
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateText = (text, options = {}) => {
  const {
    minLength = 1,
    maxLength = 1000,
    required = true,
    fieldName = "Le texte",
  } = options;

  if (required && !text) {
    return { valid: false, error: `${fieldName} est requis` };
  }

  if (!required && !text) {
    return { valid: true, error: null };
  }

  if (text.length < minLength) {
    return {
      valid: false,
      error: `${fieldName} doit contenir au moins ${minLength} caractère${minLength > 1 ? "s" : ""}`,
    };
  }

  if (text.length > maxLength) {
    return {
      valid: false,
      error: `${fieldName} ne peut pas dépasser ${maxLength} caractères`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Valide un tag
 * @param {string} tag - Tag à valider
 * @param {Array<string>} existingTags - Tags déjà existants
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateTag = (tag, existingTags = []) => {
  if (!tag) {
    return { valid: false, error: "Le tag ne peut pas être vide" };
  }

  const trimmedTag = tag.trim();

  if (trimmedTag.length < 2) {
    return {
      valid: false,
      error: "Le tag doit contenir au moins 2 caractères",
    };
  }

  if (trimmedTag.length > 30) {
    return { valid: false, error: "Le tag ne peut pas dépasser 30 caractères" };
  }

  if (existingTags.includes(trimmedTag)) {
    return { valid: false, error: "Ce tag existe déjà" };
  }

  // Vérifier les caractères invalides
  if (!/^[a-zA-Z0-9À-ÿ\s-_]+$/.test(trimmedTag)) {
    return { valid: false, error: "Le tag contient des caractères invalides" };
  }

  return { valid: true, error: null, tag: trimmedTag };
};

/**
 * Valide des coordonnées GPS
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateCoordinates = (latitude, longitude) => {
  if (
    latitude === null ||
    latitude === undefined ||
    longitude === null ||
    longitude === undefined
  ) {
    return { valid: false, error: "Les coordonnées GPS sont requises" };
  }

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return { valid: false, error: "Les coordonnées doivent être des nombres" };
  }

  if (latitude < -90 || latitude > 90) {
    return { valid: false, error: "La latitude doit être entre -90 et 90" };
  }

  if (longitude < -180 || longitude > 180) {
    return { valid: false, error: "La longitude doit être entre -180 et 180" };
  }

  return { valid: true, error: null };
};

/**
 * Valide une date
 * @param {string|Date} date - Date à valider
 * @param {Object} options - Options de validation
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateDate = (date, options = {}) => {
  const {
    required = false,
    minDate = null,
    maxDate = null,
    fieldName = "La date",
  } = options;

  if (required && !date) {
    return { valid: false, error: `${fieldName} est requise` };
  }

  if (!required && !date) {
    return { valid: true, error: null };
  }

  const dateObj = new Date(date);

  if (isNaN(dateObj.getTime())) {
    return { valid: false, error: `${fieldName} est invalide` };
  }

  if (minDate && dateObj < new Date(minDate)) {
    return {
      valid: false,
      error: `${fieldName} ne peut pas être antérieure au ${new Date(minDate).toLocaleDateString("fr-FR")}`,
    };
  }

  if (maxDate && dateObj > new Date(maxDate)) {
    return {
      valid: false,
      error: `${fieldName} ne peut pas être postérieure au ${new Date(maxDate).toLocaleDateString("fr-FR")}`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Valide un formulaire complet
 * @param {Object} formData - Données du formulaire
 * @param {Object} validationRules - Règles de validation { field: validator }
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateForm = (formData, validationRules) => {
  const errors = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(validationRules)) {
    const result = validator(formData[field], formData);

    if (!result.valid) {
      errors[field] = result.error;
      isValid = false;
    }
  }

  return { valid: isValid, errors };
};
