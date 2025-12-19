/**
 * Types d'observateurs - Compatible Phenom Search API
 */
export const OBSERVER_TYPES = [
  { code: "GND", label: "Observateurs au sol", icon: "👁️" },
  { code: "MIL", label: "Observateurs militaires", icon: "🎖️" },
  { code: "CIV", label: "Observateurs civils", icon: "👤" },
  { code: "HQO", label: "Observateurs qualifiés", icon: "✈️" },
  { code: "SCI", label: "Scientifiques", icon: "🔬" },
  { code: "CST", label: "Zone côtière", icon: "🏖️" },
  { code: "SEA", label: "En mer", icon: "🚢" },
  { code: "NWS", label: "Médias", icon: "📰" },
];

// Index par code pour accès O(1)
const OBSERVER_TYPES_MAP = Object.fromEntries(
  OBSERVER_TYPES.map((t) => [t.code, t]),
);

export const OBSERVER_TYPE_CODES = OBSERVER_TYPES.map((t) => t.code);

export const getObserverTypeByCode = (code) => OBSERVER_TYPES_MAP[code] || null;

export const getObserverTypeLabel = (code) =>
  OBSERVER_TYPES_MAP[code]?.label || code;

export default OBSERVER_TYPES;
