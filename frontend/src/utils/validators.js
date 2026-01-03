/**
 * Form Validation Utilities
 *
 * Provides validation functions for form inputs.
 * All functions return { valid: boolean, error: string|null }
 * Error messages are in French for UI consistency.
 *
 * @module utils/validators
 *
 * Validators:
 * - validateEmail: Email format validation
 * - validatePassword: Password strength validation
 * - validatePasswordMatch: Password confirmation matching
 * - validateName: Username/name validation
 * - validateText: Generic text validation
 * - validateTag: Tag format validation
 * - validateCoordinates: GPS coordinates validation
 * - validateDate: Date validation
 * - validateForm: Multi-field form validation
 */

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

/**
 * Validate an email address
 * @param {string} email - Email to validate
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

// ============================================================================
// PASSWORD VALIDATION
// ============================================================================

/**
 * Validate a password with configurable strength requirements
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length (default: 6)
 * @param {boolean} options.requireUppercase - Require uppercase letter
 * @param {boolean} options.requireLowercase - Require lowercase letter
 * @param {boolean} options.requireNumber - Require digit
 * @param {boolean} options.requireSpecialChar - Require special character
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
 * Validate that two passwords match (for confirmation)
 * @param {string} password - Original password
 * @param {string} confirmPassword - Confirmation password
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

// ============================================================================
// NAME AND TEXT VALIDATION
// ============================================================================

/**
 * Validate a username or display name
 * @param {string} name - Name to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length (default: 2)
 * @param {number} options.maxLength - Maximum length (default: 50)
 * @param {boolean} options.required - Whether field is required (default: true)
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
 * Validate generic text (descriptions, comments, etc.)
 * @param {string} text - Text to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length (default: 1)
 * @param {number} options.maxLength - Maximum length (default: 1000)
 * @param {boolean} options.required - Whether field is required (default: true)
 * @param {string} options.fieldName - Field name for error messages
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
 * Validate a tag
 * Note: Error messages are in French for end-user display
 * @param {string} tag - Tag to validate
 * @param {Array<string>} existingTags - Existing tags
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

  // Check for invalid characters
  if (!/^[a-zA-Z0-9À-ÿ\s-_]+$/.test(trimmedTag)) {
    return { valid: false, error: "Le tag contient des caractères invalides" };
  }

  return { valid: true, error: null, tag: trimmedTag };
};

/**
 * Validate GPS coordinates
 * Note: Error messages are in French for end-user display
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
 * Validate a date
 * Note: Error messages are in French for end-user display
 * @param {string|Date} date - Date to validate
 * @param {Object} options - Validation options
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
 * Validate a complete form
 * @param {Object} formData - Form data
 * @param {Object} validationRules - Validation rules { field: validator }
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
