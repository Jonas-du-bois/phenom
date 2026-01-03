/**
 * Phenomena Types - Compatible with Phenom Search API
 *
 * Defines associated phenomena that can occur during UFO sightings.
 * Each phenomenon has a 3-letter code, French label, color, icon, and category.
 *
 * @module constants/phenomena
 *
 * Categories:
 * - event: Types of sighting events (waves, landings, etc.)
 * - evidence: Physical or recorded evidence (photos, traces, radiation)
 * - effect: Effects on environment (vehicles, vegetation, buildings)
 * - entity: Entity/occupant sightings (humanoids, no entity)
 * - special: Special classifications (paranormal, misidentification)
 */

// ============================================================================
// PHENOMENA DEFINITION
// ============================================================================

export const PHENOMENA = [
  {
    code: "WAV",
    label: "Vague/Cluster", // Wave/cluster of sightings
    color: "#7B3FF2",
    icon: "🌊",
    category: "event",
  },
  {
    code: "TCH",
    label: "Détails techniques",
    color: "#3B82F6",
    icon: "🔧",
    category: "evidence",
  },
  {
    code: "HST",
    label: "Compte historique",
    color: "#8B5CF6",
    icon: "📜",
    category: "event",
  },
  {
    code: "SND",
    label: "Sons",
    color: "#F59E0B",
    icon: "🔊",
    category: "evidence",
  },
  {
    code: "ODD",
    label: "Paranormal",
    color: "#EC4899",
    icon: "❓",
    category: "special",
  },
  {
    code: "MID",
    label: "Mésidentification",
    color: "#6B7280",
    icon: "🤔",
    category: "special",
  },
  {
    code: "RAY",
    label: "Faisceau lumineux",
    color: "#FBBF24",
    icon: "💡",
    category: "evidence",
  },
  {
    code: "SIG",
    label: "Signaux",
    color: "#3B82F6",
    icon: "📡",
    category: "evidence",
  },
  {
    code: "LND",
    label: "Atterrissage",
    color: "#10B981",
    icon: "🛬",
    category: "event",
  },
  {
    code: "SUB",
    label: "Submersible",
    color: "#06B6D4",
    icon: "💧",
    category: "event",
  },
  {
    code: "OBS",
    label: "Observation/Poursuite",
    color: "#7B3FF2",
    icon: "👁️",
    category: "event",
  },
  {
    code: "VEH",
    label: "Véhicule affecté",
    color: "#8B5CF6",
    icon: "🚗",
    category: "effect",
  },
  {
    code: "TRC",
    label: "Traces physiques",
    color: "#10B981",
    icon: "👣",
    category: "evidence",
  },
  {
    code: "DRT",
    label: "Traces au sol",
    color: "#92400E",
    icon: "🌍",
    category: "evidence",
  },
  {
    code: "VEG",
    label: "Végétation affectée",
    color: "#059669",
    icon: "🌿",
    category: "effect",
  },
  {
    code: "PHT",
    label: "Photos/Vidéos",
    color: "#3B82F6",
    icon: "📷",
    category: "evidence",
  },
  {
    code: "RDA",
    label: "Radiation",
    color: "#EF4444",
    icon: "☢️",
    category: "evidence",
  },
  {
    code: "BLD",
    label: "Bâtiment affecté",
    color: "#6B7280",
    icon: "🏢",
    category: "effect",
  },
  {
    code: "OID",
    label: "Humanoïde",
    color: "#8B5CF6",
    icon: "👽",
    category: "entity",
  },
  {
    code: "NOC",
    label: "Aucune entité",
    color: "#6B7280",
    icon: "🚫",
    category: "entity",
  },
  {
    code: "ANI",
    label: "Animaux affectés",
    color: "#F59E0B",
    icon: "🐾",
    category: "effect",
  },
  {
    code: "HUM",
    label: "Humains affectés",
    color: "#EF4444",
    icon: "🚑",
    category: "effect",
  },
  {
    code: "INJ",
    label: "Blessures",
    color: "#DC2626",
    icon: "⚠️",
    category: "effect",
  },
];

const PHENOMENA_MAP = Object.fromEntries(PHENOMENA.map((p) => [p.code, p]));

// Default color for unknown phenomena
const DEFAULT_COLOR = "#6B7280";

// ============================================================================
// EXPORTS AND UTILITIES
// ============================================================================

/** Array of all phenomenon codes */
export const PHENOMENA_CODES = PHENOMENA.map((p) => p.code);

/**
 * Category labels for grouping phenomena (French labels)
 */
export const PHENOMENA_CATEGORIES = {
  event: "Événements", // Event types
  evidence: "Preuves", // Evidence types
  effect: "Effets", // Effect types
  entity: "Entités", // Entity types
  special: "Spécial", // Special categories
};

/**
 * Get full phenomenon object by code
 * @param {string} code - 3-letter phenomenon code
 * @returns {Object|null} Phenomenon object or null if not found
 */
export const getPhenomenonByCode = (code) => PHENOMENA_MAP[code] || null;

/**
 * Get phenomenon label by code
 * @param {string} code - 3-letter phenomenon code
 * @returns {string} French label or the code itself if not found
 */
export const getPhenomenonLabel = (code) => PHENOMENA_MAP[code]?.label || code;

/**
 * Get phenomenon color by code
 * @param {string} code - 3-letter phenomenon code
 * @returns {string} Hex color code (defaults to gray)
 */
export const getPhenomenonColor = (code) =>
  PHENOMENA_MAP[code]?.color || DEFAULT_COLOR;

/**
 * Get all phenomena in a specific category
 * @param {string} category - Category name (event, evidence, effect, entity, special)
 * @returns {Array} Array of phenomena objects in that category
 */
export const getPhenomenaByCategory = (category) =>
  PHENOMENA.filter((p) => p.category === category);

export default PHENOMENA;
