/**
 * Observer Types - Compatible with Phenom Search API
 *
 * Defines the types of observers who can report UFO/phenomenon sightings.
 * Each observer type has a 3-letter code, French label, and emoji icon.
 *
 * @module constants/observerTypes
 *
 * Observer Categories:
 * - GND: Ground-based observers (civilians on the ground)
 * - MIL: Military observers (armed forces personnel)
 * - CIV: Civilian observers (general public)
 * - HQO: Highly qualified observers (pilots, air traffic controllers)
 * - SCI: Scientists (researchers, academics)
 * - CST: Coastal zone observers (beaches, ports)
 * - SEA: Maritime observers (ships, boats)
 * - NWS: News/Media (journalists, reporters)
 */

// ============================================================================
// OBSERVER TYPES DEFINITION
// ============================================================================

export const OBSERVER_TYPES = [
  { code: "GND", label: "Observateurs au sol", icon: "👁️" }, // Ground observers
  { code: "MIL", label: "Observateurs militaires", icon: "🎖️" }, // Military observers
  { code: "CIV", label: "Observateurs civils", icon: "👤" }, // Civilian observers
  { code: "HQO", label: "Observateurs qualifiés", icon: "✈️" }, // Highly qualified (pilots)
  { code: "SCI", label: "Scientifiques", icon: "🔬" }, // Scientists
  { code: "CST", label: "Zone côtière", icon: "🏖️" }, // Coastal zone
  { code: "SEA", label: "En mer", icon: "🚢" }, // At sea (maritime)
  { code: "NWS", label: "Médias", icon: "📰" }, // News/Media
];

// ============================================================================
// LOOKUP MAP AND UTILITIES
// ============================================================================

// Hash map for O(1) lookup by code
const OBSERVER_TYPES_MAP = Object.fromEntries(
  OBSERVER_TYPES.map((t) => [t.code, t]),
);

/** Array of all observer type codes */
export const OBSERVER_TYPE_CODES = OBSERVER_TYPES.map((t) => t.code);

/**
 * Get full observer type object by code
 * @param {string} code - 3-letter observer type code
 * @returns {Object|null} Observer type object or null if not found
 */
export const getObserverTypeByCode = (code) => OBSERVER_TYPES_MAP[code] || null;

/**
 * Get observer type label by code
 * @param {string} code - 3-letter observer type code
 * @returns {string} French label or the code itself if not found
 */
export const getObserverTypeLabel = (code) =>
  OBSERVER_TYPES_MAP[code]?.label || code;

export default OBSERVER_TYPES;
