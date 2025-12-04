/**
 * Phénomènes associés - Compatible Phenom Search API
 */
export const PHENOMENA = [
  { code: 'WAV', label: 'Vague/Cluster', color: '#7B3FF2', icon: '🌊', category: 'event' },
  { code: 'TCH', label: 'Détails techniques', color: '#3B82F6', icon: '🔧', category: 'evidence' },
  { code: 'HST', label: 'Compte historique', color: '#8B5CF6', icon: '📜', category: 'event' },
  { code: 'SND', label: 'Sons', color: '#F59E0B', icon: '🔊', category: 'evidence' },
  { code: 'ODD', label: 'Paranormal', color: '#EC4899', icon: '❓', category: 'special' },
  { code: 'MID', label: 'Mésidentification', color: '#6B7280', icon: '🤔', category: 'special' },
  { code: 'RAY', label: 'Faisceau lumineux', color: '#FBBF24', icon: '💡', category: 'evidence' },
  { code: 'SIG', label: 'Signaux', color: '#3B82F6', icon: '📡', category: 'evidence' },
  { code: 'LND', label: 'Atterrissage', color: '#10B981', icon: '🛬', category: 'event' },
  { code: 'SUB', label: 'Submersible', color: '#06B6D4', icon: '💧', category: 'event' },
  { code: 'OBS', label: 'Observation/Poursuite', color: '#7B3FF2', icon: '👁️', category: 'event' },
  { code: 'VEH', label: 'Véhicule affecté', color: '#8B5CF6', icon: '🚗', category: 'effect' },
  { code: 'TRC', label: 'Traces physiques', color: '#10B981', icon: '👣', category: 'evidence' },
  { code: 'DRT', label: 'Traces au sol', color: '#92400E', icon: '🌍', category: 'evidence' },
  { code: 'VEG', label: 'Végétation affectée', color: '#059669', icon: '🌿', category: 'effect' },
  { code: 'PHT', label: 'Photos/Vidéos', color: '#3B82F6', icon: '📷', category: 'evidence' },
  { code: 'RDA', label: 'Radiation', color: '#EF4444', icon: '☢️', category: 'evidence' },
  { code: 'BLD', label: 'Bâtiment affecté', color: '#6B7280', icon: '🏢', category: 'effect' },
  { code: 'OID', label: 'Humanoïde', color: '#8B5CF6', icon: '👽', category: 'entity' },
  { code: 'NOC', label: 'Aucune entité', color: '#6B7280', icon: '🚫', category: 'entity' },
  { code: 'ANI', label: 'Animaux affectés', color: '#F59E0B', icon: '🐾', category: 'effect' },
  { code: 'HUM', label: 'Humains affectés', color: '#EF4444', icon: '🚑', category: 'effect' },
  { code: 'INJ', label: 'Blessures', color: '#DC2626', icon: '⚠️', category: 'effect' }
];

const PHENOMENA_MAP = Object.fromEntries(PHENOMENA.map(p => [p.code, p]));
const DEFAULT_COLOR = '#6B7280';

export const PHENOMENA_CODES = PHENOMENA.map(p => p.code);

export const PHENOMENA_CATEGORIES = {
  event: 'Événements',
  evidence: 'Preuves',
  effect: 'Effets',
  entity: 'Entités',
  special: 'Spécial'
};

export const getPhenomenonByCode = (code) => PHENOMENA_MAP[code] || null;
export const getPhenomenonLabel = (code) => PHENOMENA_MAP[code]?.label || code;
export const getPhenomenonColor = (code) => PHENOMENA_MAP[code]?.color || DEFAULT_COLOR;
export const getPhenomenaByCategory = (category) => PHENOMENA.filter(p => p.category === category);

export default PHENOMENA;
