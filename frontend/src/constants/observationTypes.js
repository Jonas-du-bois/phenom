/**
 * Types d'observations OVNI/Phénomènes
 */
export const OBSERVATION_TYPES_LEGACY = {
  WAV: {
    code: "WAV",
    label: "Vague/cluster/flap",
    description: "Wave/cluster/flap",
  },
  TCH: {
    code: "TCH",
    label: "Détails techniques",
    description: "New technical details/clues",
  },
  HST: {
    code: "HST",
    label: "Compte historique",
    description: "Historical account",
  },
  SND: {
    code: "SND",
    label: "Sons d'OVNI",
    description: "UFO sounds heard or recorded",
  },
  ODD: {
    code: "ODD",
    label: "Atypique/Paranormal",
    description: "Atypical/Forteana/paranormal",
  },
  LND: {
    code: "LND",
    label: "Atterrissage",
    description: "UFO landing or any part touches ground",
  },
  SUB: {
    code: "SUB",
    label: "Submersible",
    description: "Rises from or submerges into water",
  },
  OBS: {
    code: "OBS",
    label: "Observation/Poursuite",
    description: "Observation/chasing vehicles",
  },
  RAY: {
    code: "RAY",
    label: "Lumière bizarre",
    description: "Odd light/searchlight/beam/laser-like",
  },
  SIG: {
    code: "SIG",
    label: "Signaux/Communications",
    description: "Signals/responses to/from/between UFO's",
  },
  ANI: {
    code: "ANI",
    label: "Animaux affectés",
    description: "Animals affected or injuries/marks",
  },
  HUM: {
    code: "HUM",
    label: "Humains affectés",
    description: "Humans affected: Injury/burns/marks/abduction/death",
  },
  INJ: {
    code: "INJ",
    label: "Blessures/Mutilations",
    description: "Injuries, illness/death, mutilations",
  },
  VEH: {
    code: "VEH",
    label: "Véhicule affecté",
    description: "Vehicle affected: Marks/damage/EME effects",
  },
  BLD: {
    code: "BLD",
    label: "Bâtiment/Structure",
    description: "Building/man-made structure/roads/power lines",
  },
  DRT: {
    code: "DRT",
    label: "Traces au sol",
    description: "Dirt/soil traces/marks/footprints etc.",
  },
  VEG: {
    code: "VEG",
    label: "Plantes affectées",
    description: "Plants affected or sampled/crop circles",
  },
  PHT: {
    code: "PHT",
    label: "Photos/Vidéos",
    description: "Photos/movies/videos taken",
  },
  RDA: {
    code: "RDA",
    label: "Radiation détectée",
    description: "Radiation/high energy fields detected",
  },
  TRC: {
    code: "TRC",
    label: "Traces physiques",
    description: "Physical traces",
  },
  NOC: {
    code: "NOC",
    label: "Aucune entité vue",
    description: "No entity/occupant seen by observer(s)",
  },
  CMF: { code: "CMF", label: "Camouflage", description: "Camouflage/disguise" },
  MID: {
    code: "MID",
    label: "Mésidentification",
    description: "Likely mis-identification",
  },
  CNT: { code: "CNT", label: "Contacté", description: "Contactee related" },
  OID: {
    code: "OID",
    label: "Humanoïde",
    description: 'Humanoid: Small alien or "Grey"',
  },
  COV: {
    code: "COV",
    label: "Dissimulation",
    description: "Indication of coverup",
  },
  OGA: {
    code: "OGA",
    label: "Agences gouv.",
    description: "Non-Covert Government Agencies",
  },
};

// Simplified types for new UI
export const OBSERVATION_TYPES = [
  { value: "ufo", label: "OVNI", icon: "🛸" },
  { value: "entity", label: "Entité", icon: "👽" },
  { value: "light", label: "Lumière", icon: "💡" },
  { value: "sound", label: "Son", icon: "🔊" },
  { value: "trace", label: "Trace", icon: "👣" },
  { value: "other", label: "Autre", icon: "❓" },
];

export const OBSERVATION_TYPE_OPTIONS = Object.entries(
  OBSERVATION_TYPES_LEGACY,
).map(([code, data]) => ({
  value: code,
  label: `${code} - ${data.label}`,
  description: data.description,
}));

/**
 * Convertit un code d'observation (3 lettres) en label complet
 * @param {string} code - Code à 3 lettres (ex: "WAV")
 * @returns {string} Label complet ou le code si inconnu
 * @example
 * getObservationLabel('WAV') // "Vague/cluster/flap"
 * getObservationLabel('TCH') // "Détails techniques"
 * getObservationLabel('XXX') // "XXX" (code inconnu)
 */
export const getObservationLabel = (code) => {
  return OBSERVATION_TYPES_LEGACY[code]?.label || code;
};

/**
 * Convertit un code d'observation en description complète
 * @param {string} code - Code à 3 lettres
 * @returns {string} Description ou le code si inconnu
 * @example
 * getObservationDescription('WAV') // "Wave/cluster/flap"
 */
export const getObservationDescription = (code) => {
  return OBSERVATION_TYPES[code]?.description || code;
};

/**
 * Vérifie si un code d'observation est valide
 * @param {string} code - Code à vérifier
 * @returns {boolean} true si le code existe
 * @example
 * isValidObservationType('WAV') // true
 * isValidObservationType('XXX') // false
 */
export const isValidObservationType = (code) => {
  return code in OBSERVATION_TYPES;
};

export default OBSERVATION_TYPES;
