/**
 * Types de localités - Compatible Phenom Search API
 */
export const LOCALE_TYPES = [
  { code: 'Town & City', label: 'Ville', icon: '🏙️' },
  { code: 'Rural', label: 'Rural', icon: '🌾' },
  { code: 'Mountains', label: 'Montagnes', icon: '⛰️' },
  { code: 'Farmlands', label: 'Terres agricoles', icon: '🚜' },
  { code: 'Coastal', label: 'Côtier', icon: '🏖️' },
  { code: 'Desert', label: 'Désert', icon: '🏜️' },
  { code: 'Forest', label: 'Forêt', icon: '🌲' },
  { code: 'Lake/River', label: 'Lac/Rivière', icon: '🌊' },
  { code: 'Ocean', label: 'Océan', icon: '🌊' },
  { code: 'Airport', label: 'Aéroport', icon: '✈️' },
  { code: 'Military Base', label: 'Base militaire', icon: '🎖️' },
  { code: 'Unknown', label: 'Inconnu', icon: '❓' }
];

const LOCALE_TYPES_MAP = Object.fromEntries(LOCALE_TYPES.map(l => [l.code, l]));

export const LOCALE_TYPE_CODES = LOCALE_TYPES.map(l => l.code);
export const getLocaleTypeByCode = (code) => LOCALE_TYPES_MAP[code] || null;
export const getLocaleTypeLabel = (code) => LOCALE_TYPES_MAP[code]?.label || code;

export default LOCALE_TYPES;
