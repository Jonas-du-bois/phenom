/**
 * Locale/Location Types - Compatible with Phenom Search API
 *
 * Defines the types of locations where UFO/phenomenon sightings can occur.
 * Each locale type has a code (English), French label, and emoji icon.
 *
 * @module constants/localeTypes
 *
 * Location Categories:
 * - Urban: Towns, cities
 * - Rural: Countryside, farmlands
 * - Natural: Mountains, forests, deserts
 * - Water: Coastal, lakes, rivers, oceans
 * - Special: Airports, military bases
 */

// ============================================================================
// LOCALE TYPES DEFINITION
// ============================================================================

export const LOCALE_TYPES = [
  { code: "Town & City", label: "Ville", icon: "🏙️" }, // Urban areas
  { code: "Rural", label: "Rural", icon: "🌾" }, // Countryside
  { code: "Mountains", label: "Montagnes", icon: "⛰️" }, // Mountainous regions
  { code: "Farmlands", label: "Terres agricoles", icon: "🚜" }, // Agricultural lands
  { code: "Coastal", label: "Côtier", icon: "🏖️" }, // Coastal areas
  { code: "Desert", label: "Désert", icon: "🏜️" }, // Desert regions
  { code: "Forest", label: "Forêt", icon: "🌲" }, // Forested areas
  { code: "Lake/River", label: "Lac/Rivière", icon: "🌊" }, // Freshwater bodies
  { code: "Ocean", label: "Océan", icon: "🌊" }, // Open ocean/sea
  { code: "Airport", label: "Aéroport", icon: "✈️" }, // Airport vicinity
  { code: "Military Base", label: "Base militaire", icon: "🎖️" }, // Military installations
  { code: "Unknown", label: "Inconnu", icon: "❓" }, // Unknown/unspecified
];

// ============================================================================
// LOOKUP MAP AND UTILITIES
// ============================================================================

// Hash map for O(1) lookup by code
const LOCALE_TYPES_MAP = Object.fromEntries(
  LOCALE_TYPES.map((l) => [l.code, l]),
);

/** Array of all locale type codes */
export const LOCALE_TYPE_CODES = LOCALE_TYPES.map((l) => l.code);

/**
 * Get full locale type object by code
 * @param {string} code - Locale type code
 * @returns {Object|null} Locale type object or null if not found
 */
export const getLocaleTypeByCode = (code) => LOCALE_TYPES_MAP[code] || null;

/**
 * Get locale type label by code
 * @param {string} code - Locale type code
 * @returns {string} French label or the code itself if not found
 */
export const getLocaleTypeLabel = (code) =>
  LOCALE_TYPES_MAP[code]?.label || code;

export default LOCALE_TYPES;
