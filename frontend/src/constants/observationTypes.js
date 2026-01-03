/**
 * Observation Types - UFO/Phenomenon Type Codes with Colors
 *
 * Comprehensive list of observation type codes used to categorize UFO sightings.
 * Each type has a 3-letter code, French label, English description, color, and icon.
 *
 * @module constants/observationTypes
 *
 * These codes are compatible with the Phenom Search API and cover:
 * - Event types (WAV, HST, LND, SUB, OBS)
 * - Evidence types (TCH, SND, RAY, SIG, PHT, RDA, TRC)
 * - Effect types (ANI, HUM, INJ, VEH, BLD, VEG)
 * - Entity types (NOC, OID, CNT)
 * - Special types (ODD, CMF, MID, COV, OGA)
 */

// ============================================================================
// OBSERVATION TYPES DEFINITION
// ============================================================================
export const OBSERVATION_TYPES = {
  WAV: {
    code: "WAV",
    label: "Vague/cluster/flap",
    description: "Wave/cluster/flap",
    color: "#7B3FF2",
    icon: "🌊",
  },
  TCH: {
    code: "TCH",
    label: "Détails techniques",
    description: "New technical details/clues",
    color: "#3B82F6",
    icon: "🔧",
  },
  HST: {
    code: "HST",
    label: "Compte historique",
    description: "Historical account",
    color: "#8B5CF6",
    icon: "📜",
  },
  SND: {
    code: "SND",
    label: "Sons d'OVNI",
    description: "UFO sounds heard or recorded",
    color: "#F59E0B",
    icon: "🔊",
  },
  ODD: {
    code: "ODD",
    label: "Atypique/Paranormal",
    description: "Atypical/Forteana/paranormal",
    color: "#EC4899",
    icon: "❓",
  },
  LND: {
    code: "LND",
    label: "Atterrissage",
    description: "UFO landing or any part touches ground",
    color: "#10B981",
    icon: "🛬",
  },
  SUB: {
    code: "SUB",
    label: "Submersible",
    description: "Rises from or submerges into water",
    color: "#06B6D4",
    icon: "💧",
  },
  OBS: {
    code: "OBS",
    label: "Observation/Poursuite",
    description: "Observation/chasing vehicles",
    color: "#7B3FF2",
    icon: "👁️",
  },
  RAY: {
    code: "RAY",
    label: "Lumière bizarre",
    description: "Odd light/searchlight/beam/laser-like",
    color: "#FBBF24",
    icon: "💡",
  },
  SIG: {
    code: "SIG",
    label: "Signaux/Communications",
    description: "Signals/responses to/from/between UFO's",
    color: "#3B82F6",
    icon: "📡",
  },
  ANI: {
    code: "ANI",
    label: "Animaux affectés",
    description: "Animals affected or injuries/marks",
    color: "#F59E0B",
    icon: "🐾",
  },
  HUM: {
    code: "HUM",
    label: "Humains affectés",
    description: "Humans affected: Injury/burns/marks/abduction/death",
    color: "#EF4444",
    icon: "🚑",
  },
  INJ: {
    code: "INJ",
    label: "Blessures/Mutilations",
    description: "Injuries, illness/death, mutilations",
    color: "#DC2626",
    icon: "⚠️",
  },
  VEH: {
    code: "VEH",
    label: "Véhicule affecté",
    description: "Vehicle affected: Marks/damage/EME effects",
    color: "#8B5CF6",
    icon: "🚗",
  },
  BLD: {
    code: "BLD",
    label: "Bâtiment/Structure",
    description: "Building/man-made structure/roads/power lines",
    color: "#6B7280",
    icon: "🏢",
  },
  DRT: {
    code: "DRT",
    label: "Traces au sol",
    description: "Dirt/soil traces/marks/footprints etc.",
    color: "#92400E",
    icon: "👣",
  },
  VEG: {
    code: "VEG",
    label: "Plantes affectées",
    description: "Plants affected or sampled/crop circles",
    color: "#10B981",
    icon: "🌾",
  },
  PHT: {
    code: "PHT",
    label: "Photos/Vidéos",
    description: "Photos/movies/videos taken",
    color: "#3B82F6",
    icon: "📸",
  },
  RDA: {
    code: "RDA",
    label: "Radiation détectée",
    description: "Radiation/high energy fields detected",
    color: "#EF4444",
    icon: "☢️",
  },
  TRC: {
    code: "TRC",
    label: "Traces physiques",
    description: "Physical traces",
    color: "#8B5CF6",
    icon: "🔍",
  },
  NOC: {
    code: "NOC",
    label: "Aucune entité vue",
    description: "No entity/occupant seen by observer(s)",
    color: "#6B7280",
    icon: "👤",
  },
  CMF: {
    code: "CMF",
    label: "Camouflage",
    description: "Camouflage/disguise",
    color: "#059669",
    icon: "🎭",
  },
  MID: {
    code: "MID",
    label: "Mésidentification",
    description: "Likely mis-identification",
    color: "#9CA3AF",
    icon: "🤔",
  },
  CNT: {
    code: "CNT",
    label: "Contacté",
    description: "Contactee related",
    color: "#3B82F6",
    icon: "🤝",
  },
  OID: {
    code: "OID",
    label: "Humanoïde",
    description: 'Humanoid: Small alien or "Grey"',
    color: "#06B6D4",
    icon: "👽",
  },
  COV: {
    code: "COV",
    label: "Dissimulation",
    description: "Indication of coverup",
    color: "#374151",
    icon: "🔒",
  },
  OGA: {
    code: "OGA",
    label: "Agences gouv.",
    description: "Non-Covert Government Agencies",
    color: "#6B7280",
    icon: "🏛️",
  },
};

// ============================================================================
// DROPDOWN OPTIONS FOR SELECTORS
// ============================================================================

// Array format for use in dropdown/select components
export const OBSERVATION_TYPE_OPTIONS = Object.entries(OBSERVATION_TYPES).map(
  ([code, data]) => ({
    value: code,
    label: `${code} - ${data.label}`,
    description: data.description,
    color: data.color,
    icon: data.icon,
  })
);

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert an observation code (3 letters) to its full label
 * @param {string} code - 3-letter code (e.g., "WAV")
 * @returns {string} Full French label or the code if unknown
 * @example
 * getObservationLabel('WAV') // "Vague/cluster/flap"
 * getObservationLabel('TCH') // "Détails techniques"
 * getObservationLabel('XXX') // "XXX" (unknown code)
 */
export const getObservationLabel = (code) => {
  return OBSERVATION_TYPES[code]?.label || code;
};

/**
 * Convert an observation code to its full description
 * @param {string} code - 3-letter code
 * @returns {string} English description or the code if unknown
 * @example
 * getObservationDescription('WAV') // "Wave/cluster/flap"
 */
export const getObservationDescription = (code) => {
  return OBSERVATION_TYPES[code]?.description || code;
};

/**
 * Get the color associated with an observation type
 * @param {string} code - 3-letter code
 * @returns {string} Hex color code (defaults to gray)
 * @example
 * getObservationColor('WAV') // "#7B3FF2"
 */
export const getObservationColor = (code) => {
  return OBSERVATION_TYPES[code]?.color || "#6B7280";
};

/**
 * Check if an observation code is valid
 * @param {string} code - Code to verify
 * @returns {boolean} true if the code exists in OBSERVATION_TYPES
 * @example
 * isValidObservationType('WAV') // true
 * isValidObservationType('XXX') // false
 */
export const isValidObservationType = (code) => {
  return code in OBSERVATION_TYPES;
};

export default OBSERVATION_TYPES;
