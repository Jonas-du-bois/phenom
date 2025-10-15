/**
 * Utilitaires pour le formatage des coordonnées
 */

/**
 * Formate des coordonnées en DMS (Degrees, Minutes, Seconds)
 */
export function formatCoordinates(lat, lng) {
  // Conversion en DMS
  return `${lat.toFixed(4)}°, ${lng.toFixed(4)}°`
}

/**
 * Calcule la distance entre deux points (Haversine)
 */
export function calculateDistance(coord1, coord2) {
  // Formule de Haversine
  return 0
}

/**
 * Vérifie si des coordonnées sont valides
 */
export function validateCoordinates(lat, lng) {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180
}
