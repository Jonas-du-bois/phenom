/**
 * Utilitaires pour la validation des formulaires
 */

/**
 * Valide un email
 */
export function validateEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return regex.test(email)
}

/**
 * Valide un mot de passe
 */
export function validatePassword(password) {
  // Min 8 caractères, au moins une majuscule, un chiffre
  return password.length >= 8
}

/**
 * Valide un username
 */
export function validateUsername(username) {
  return username.length >= 3 && username.length <= 20
}

/**
 * Valide une description
 */
export function validateDescription(description, minLength = 10) {
  return description.length >= minLength
}
