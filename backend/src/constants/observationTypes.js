/**
 * UFO/Phenomena observation types
 * Each type has a code, a French label, and an English description
 * Used to categorize and filter UFO sightings in the application
 */
export const OBSERVATION_TYPES = {
  WAV: {
    code: 'WAV',
    label: 'Vague/cluster/flap',
    description: 'Wave/cluster/flap'
  },
  TCH: {
    code: 'TCH',
    label: 'Nouveaux détails/indices techniques',
    description: 'New technical details/clues'
  },
  HST: {
    code: 'HST',
    label: 'Compte historique',
    description: 'Historical account'
  },
  SND: {
    code: 'SND',
    label: 'Sons d\'OVNI entendus/enregistrés',
    description: 'UFO sounds heard or recorded'
  },
  ODD: {
    code: 'ODD',
    label: 'Atypique/Forteana/Paranormal',
    description: 'Atypical/Forteana/paranormal'
  },
  LND: {
    code: 'LND',
    label: 'Atterrissage d\'OVNI',
    description: 'UFO landing or any part touches ground'
  },
  SUB: {
    code: 'SUB',
    label: 'Submersible',
    description: 'Rises from or submerges into water'
  },
  OBS: {
    code: 'OBS',
    label: 'Véhicules d\'observation/poursuite',
    description: 'Observation/chasing vehicles'
  },
  RAY: {
    code: 'RAY',
    label: 'Lumière bizarre/projecteur/faisceau',
    description: 'Odd light/searchlight/beam/laser-like'
  },
  SIG: {
    code: 'SIG',
    label: 'Signaux/réponses/communications',
    description: 'Signals/responses to/from/between UFO\'s'
  },
  ANI: {
    code: 'ANI',
    label: 'Animaux affectés ou blessés',
    description: 'Animals affected or injuries/marks'
  },
  HUM: {
    code: 'HUM',
    label: 'Humains affectés',
    description: 'Humans affected: Injury/burns/marks/abduction/death'
  },
  INJ: {
    code: 'INJ',
    label: 'Blessures/maladie/mort/mutilations',
    description: 'Injuries, illness/death, mutilations'
  },
  VEH: {
    code: 'VEH',
    label: 'Véhicule affecté',
    description: 'Vehicle affected: Marks/damage/EME effects'
  },
  BLD: {
    code: 'BLD',
    label: 'Bâtiment/structure artificielle',
    description: 'Building/man-made structure/roads/power lines'
  },
  DRT: {
    code: 'DRT',
    label: 'Traces de terre/sol',
    description: 'Dirt/soil traces/marks/footprints etc.'
  },
  VEG: {
    code: 'VEG',
    label: 'Plantes affectées',
    description: 'Plants affected or sampled/crop circles'
  },
  PHT: {
    code: 'PHT',
    label: 'Photos/films/vidéos prises',
    description: 'Photos/movies/videos taken'
  },
  RDA: {
    code: 'RDA',
    label: 'Radiation détectée',
    description: 'Radiation/high energy fields detected'
  },
  TRC: {
    code: 'TRC',
    label: 'Traces physiques',
    description: 'Physical traces'
  },
  NOC: {
    code: 'NOC',
    label: 'Aucune entité vue',
    description: 'No entity/occupant seen by observer(s)'
  },
  CMF: {
    code: 'CMF',
    label: 'Camouflage/déguisement',
    description: 'Camouflage/disguise'
  },
  MID: {
    code: 'MID',
    label: 'Probable mésidentification',
    description: 'Likely mis-identification'
  },
  CNT: {
    code: 'CNT',
    label: 'Relation contactée',
    description: 'Contactee related'
  },
  OID: {
    code: 'OID',
    label: 'Humanoïde',
    description: 'Humanoid: Small alien or "Grey"'
  },
  COV: {
    code: 'COV',
    label: 'Indication de dissimulation',
    description: 'Indication of coverup'
  },
  OGA: {
    code: 'OGA',
    label: 'Agences gouvernementales',
    description: 'Non-Covert Government Agencies'
  }
};

/**
 * Array of all valid observation type codes
 * Used for validation purposes
 */
export const OBSERVATION_TYPE_CODES = Object.keys(OBSERVATION_TYPES);

export default OBSERVATION_TYPES;
