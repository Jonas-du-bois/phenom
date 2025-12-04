/**
 * Utilitaires pour les sightings (observations)
 * Compatible avec le format Phenom Search API
 */

import { CREDIBILITY_SCALE, STRANGENESS_SCALE } from "./constants";
import { getObserverTypeLabel } from "../constants/observerTypes";
import { getUfoShapeLabel } from "../constants/ufoShapes";
import { getPhenomenonLabel } from "../constants/phenomena";

// ========================================
// Formatage de date/heure
// ========================================

/**
 * Parse une date au format Phenom Search (ex: "6/24/1947")
 * @param {string} dateStr - Date au format M/D/YYYY ou MM/DD/YYYY
 * @returns {Date|null} Objet Date ou null si invalide
 */
export const parseSightingDate = (dateStr) => {
  if (!dateStr) return null;

  // Format attendu: M/D/YYYY ou MM/DD/YYYY
  const parts = dateStr.split("/");
  if (parts.length !== 3) return null;

  const month = parseInt(parts[0], 10) - 1; // Les mois JS sont 0-indexés
  const day = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(month) || isNaN(day) || isNaN(year)) return null;

  return new Date(year, month, day);
};

/**
 * Formate une date pour l'affichage
 * @param {string} dateStr - Date au format Phenom Search
 * @param {string} locale - Locale pour le formatage (défaut: fr-FR)
 * @returns {string} Date formatée ou chaîne vide
 */
export const formatSightingDate = (dateStr, locale = "fr-FR") => {
  const date = parseSightingDate(dateStr);
  if (!date) return dateStr || "";

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Formate une date en format court
 * @param {string} dateStr - Date au format Phenom Search
 * @returns {string} Date formatée (ex: "24 juin 1947")
 */
export const formatSightingDateShort = (dateStr, locale = "fr-FR") => {
  const date = parseSightingDate(dateStr);
  if (!date) return dateStr || "";

  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Formate l'heure pour l'affichage
 * @param {string} timeStr - Heure au format HH:MM ou HH:MM:SS
 * @returns {string} Heure formatée
 */
export const formatSightingTime = (timeStr) => {
  if (!timeStr) return "";

  // Extraire HH:MM
  const parts = timeStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }

  return timeStr;
};

/**
 * Combine date et heure pour affichage
 * @param {string} dateStr - Date au format Phenom Search
 * @param {string} timeStr - Heure
 * @returns {string} Date et heure combinées
 */
export const formatDateTime = (dateStr, timeStr) => {
  const formattedDate = formatSightingDate(dateStr);
  const formattedTime = formatSightingTime(timeStr);

  if (formattedDate && formattedTime) {
    return `${formattedDate} à ${formattedTime}`;
  }

  return formattedDate || formattedTime || "";
};

// ========================================
// Formatage de durée
// ========================================

/**
 * Formate la durée en texte lisible
 * @param {number} seconds - Durée en secondes
 * @returns {string} Durée formatée
 */
export const formatDuration = (seconds) => {
  if (seconds === null || seconds === undefined) return "Durée inconnue";
  if (seconds === 0) return "Instantané";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}min`);
  }
  if (secs > 0 && hours === 0) {
    parts.push(`${secs}s`);
  }

  return parts.join(" ") || "Instantané";
};

/**
 * Formate la durée en version courte
 * @param {number} seconds - Durée en secondes
 * @returns {string} Durée formatée courte
 */
export const formatDurationShort = (seconds) => {
  if (seconds === null || seconds === undefined) return "?";
  if (seconds === 0) return "0s";

  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}min`;
  return `${Math.round(seconds / 3600)}h`;
};

// ========================================
// Crédibilité et Étrangeté
// ========================================

/**
 * Obtient le niveau de crédibilité
 * @param {number} value - Valeur de crédibilité (0-15)
 * @returns {Object} Niveau avec label et couleur
 */
export const getCredibilityLevel = (value) => {
  if (value === null || value === undefined) {
    return CREDIBILITY_SCALE.LEVELS.NONE;
  }

  for (const level of Object.values(CREDIBILITY_SCALE.LEVELS)) {
    if (value >= level.min && value <= level.max) {
      return level;
    }
  }

  return CREDIBILITY_SCALE.LEVELS.NONE;
};

/**
 * Obtient le libellé de crédibilité
 * @param {number} value - Valeur de crédibilité
 * @returns {string} Libellé
 */
export const getCredibilityLabel = (value) => {
  return getCredibilityLevel(value).label;
};

/**
 * Obtient la couleur de crédibilité
 * @param {number} value - Valeur de crédibilité
 * @returns {string} Nom de couleur
 */
export const getCredibilityColor = (value) => {
  return getCredibilityLevel(value).color;
};

/**
 * Obtient le niveau d'étrangeté
 * @param {number} value - Valeur d'étrangeté (0-10)
 * @returns {Object} Niveau avec label et couleur
 */
export const getStrangenessLevel = (value) => {
  if (value === null || value === undefined) {
    return { label: "Non évalué", color: "gray", min: 0, max: 0 };
  }

  for (const level of Object.values(STRANGENESS_SCALE.LEVELS)) {
    if (value >= level.min && value <= level.max) {
      return level;
    }
  }

  return { label: "Non évalué", color: "gray", min: 0, max: 0 };
};

/**
 * Obtient le libellé d'étrangeté
 * @param {number} value - Valeur d'étrangeté
 * @returns {string} Libellé
 */
export const getStrangenessLabel = (value) => {
  return getStrangenessLevel(value).label;
};

/**
 * Obtient la couleur d'étrangeté
 * @param {number} value - Valeur d'étrangeté
 * @returns {string} Nom de couleur
 */
export const getStrangenessColor = (value) => {
  return getStrangenessLevel(value).color;
};

// ========================================
// Localisation
// ========================================

/**
 * Formate la localisation complète
 * @param {Object} sighting - Objet sighting
 * @returns {string} Localisation formatée
 */
export const formatLocation = (sighting) => {
  const parts = [];

  if (sighting.location) {
    parts.push(sighting.location);
  }

  if (sighting.state) {
    parts.push(sighting.state);
  }

  if (sighting.country) {
    parts.push(sighting.country);
  }

  return parts.join(", ") || "Lieu inconnu";
};

/**
 * Formate la localisation courte (pays seulement si disponible)
 * @param {Object} sighting - Objet sighting
 * @returns {string} Localisation courte
 */
export const formatLocationShort = (sighting) => {
  if (sighting.location && sighting.country) {
    return `${sighting.location}, ${sighting.country}`;
  }

  return sighting.location || sighting.country || "Lieu inconnu";
};

/**
 * Vérifie si un sighting a des coordonnées valides
 * @param {Object} sighting - Objet sighting
 * @returns {boolean}
 */
export const hasValidCoordinates = (sighting) => {
  return (
    sighting?.coordinates?.lat != null && sighting?.coordinates?.lng != null
  );
};

/**
 * Formate les coordonnées pour affichage
 * @param {Object} coordinates - { lat, lng }
 * @returns {string} Coordonnées formatées
 */
export const formatCoordinates = (coordinates) => {
  if (!coordinates?.lat || !coordinates?.lng) {
    return "Coordonnées inconnues";
  }

  const lat = coordinates.lat.toFixed(4);
  const lng = coordinates.lng.toFixed(4);
  const latDir = coordinates.lat >= 0 ? "N" : "S";
  const lngDir = coordinates.lng >= 0 ? "E" : "O";

  return `${Math.abs(lat)}°${latDir}, ${Math.abs(lng)}°${lngDir}`;
};

// ========================================
// Formatage des listes de codes
// ========================================

/**
 * Formate une liste de types d'observateurs
 * @param {string[]} codes - Liste de codes
 * @returns {string} Labels séparés par virgule
 */
export const formatObserverTypes = (codes) => {
  if (!codes || codes.length === 0) return "Non spécifié";
  return codes.map((code) => getObserverTypeLabel(code)).join(", ");
};

/**
 * Formate une liste de formes d'OVNI
 * @param {string[]} codes - Liste de codes
 * @returns {string} Labels séparés par virgule
 */
export const formatUfoShapes = (codes) => {
  if (!codes || codes.length === 0) return "Non spécifié";
  return codes.map((code) => getUfoShapeLabel(code)).join(", ");
};

/**
 * Formate une liste de phénomènes
 * @param {string[]} codes - Liste de codes
 * @returns {string} Labels séparés par virgule
 */
export const formatPhenomena = (codes) => {
  if (!codes || codes.length === 0) return "Non spécifié";
  return codes.map((code) => getPhenomenonLabel(code)).join(", ");
};

// ========================================
// Résumé et extraction
// ========================================

/**
 * Extrait l'année d'une date
 * @param {string} dateStr - Date au format Phenom Search
 * @returns {number|null} Année ou null
 */
export const extractYear = (dateStr) => {
  const date = parseSightingDate(dateStr);
  return date ? date.getFullYear() : null;
};

/**
 * Génère un résumé court du sighting
 * @param {Object} sighting - Objet sighting
 * @param {number} maxLength - Longueur max (défaut: 100)
 * @returns {string} Résumé
 */
export const getSightingSummary = (sighting, maxLength = 100) => {
  if (!sighting) return "";

  const location = formatLocationShort(sighting);
  const date = formatSightingDateShort(sighting.date);
  const shapes = sighting.ufoShapes?.length
    ? formatUfoShapes(sighting.ufoShapes)
    : null;

  let summary = `${location}`;
  if (date) summary += ` - ${date}`;
  if (shapes) summary += ` (${shapes})`;

  if (summary.length > maxLength) {
    return summary.substring(0, maxLength - 3) + "...";
  }

  return summary;
};

/**
 * Génère un titre pour un sighting (pour l'affichage)
 * @param {Object} sighting - Objet sighting
 * @returns {string} Titre généré
 */
export const generateSightingTitle = (sighting) => {
  if (!sighting) return "Observation inconnue";

  const parts = [];

  // Forme(s) si disponible
  if (sighting.ufoShapes?.length) {
    const shapes = sighting.ufoShapes.slice(0, 2).map(getUfoShapeLabel);
    parts.push(shapes.join(" & "));
  } else {
    parts.push("Observation");
  }

  // Localisation
  if (sighting.location || sighting.country) {
    parts.push("à");
    parts.push(sighting.location || sighting.country);
  }

  return parts.join(" ");
};

// ========================================
// Validation
// ========================================

/**
 * Valide une date au format Phenom Search
 * @param {string} dateStr - Date à valider
 * @returns {boolean}
 */
export const isValidSightingDate = (dateStr) => {
  return parseSightingDate(dateStr) !== null;
};

/**
 * Valide une valeur de crédibilité
 * @param {number} value - Valeur à valider
 * @returns {boolean}
 */
export const isValidCredibility = (value) => {
  return (
    typeof value === "number" &&
    value >= CREDIBILITY_SCALE.MIN &&
    value <= CREDIBILITY_SCALE.MAX
  );
};

/**
 * Valide une valeur d'étrangeté
 * @param {number} value - Valeur à valider
 * @returns {boolean}
 */
export const isValidStrangeness = (value) => {
  return (
    typeof value === "number" &&
    value >= STRANGENESS_SCALE.MIN &&
    value <= STRANGENESS_SCALE.MAX
  );
};

// ========================================
// Export par défaut
// ========================================

export default {
  // Date/heure
  parseSightingDate,
  formatSightingDate,
  formatSightingDateShort,
  formatSightingTime,
  formatDateTime,
  extractYear,

  // Durée
  formatDuration,
  formatDurationShort,

  // Crédibilité/Étrangeté
  getCredibilityLevel,
  getCredibilityLabel,
  getCredibilityColor,
  getStrangenessLevel,
  getStrangenessLabel,
  getStrangenessColor,

  // Localisation
  formatLocation,
  formatLocationShort,
  hasValidCoordinates,
  formatCoordinates,

  // Listes de codes
  formatObserverTypes,
  formatUfoShapes,
  formatPhenomena,

  // Résumé
  getSightingSummary,
  generateSightingTitle,

  // Validation
  isValidSightingDate,
  isValidCredibility,
  isValidStrangeness,
};
