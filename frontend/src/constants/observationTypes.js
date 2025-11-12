/**
 * Types d'observations OVNI/Phénomènes
 */
export const OBSERVATION_TYPES = {
  WAV: { code: 'WAV', label: 'Vague/cluster/flap', description: 'Wave/cluster/flap' },
  TCH: { code: 'TCH', label: 'Détails techniques', description: 'New technical details/clues' },
  HST: { code: 'HST', label: 'Compte historique', description: 'Historical account' },
  SND: { code: 'SND', label: 'Sons d\'OVNI', description: 'UFO sounds heard or recorded' },
  ODD: { code: 'ODD', label: 'Atypique/Paranormal', description: 'Atypical/Forteana/paranormal' },
  LND: { code: 'LND', label: 'Atterrissage', description: 'UFO landing or any part touches ground' },
  SUB: { code: 'SUB', label: 'Submersible', description: 'Rises from or submerges into water' },
  OBS: { code: 'OBS', label: 'Observation/Poursuite', description: 'Observation/chasing vehicles' },
  RAY: { code: 'RAY', label: 'Lumière bizarre', description: 'Odd light/searchlight/beam/laser-like' },
  SIG: { code: 'SIG', label: 'Signaux/Communications', description: 'Signals/responses to/from/between UFO\'s' },
  ANI: { code: 'ANI', label: 'Animaux affectés', description: 'Animals affected or injuries/marks' },
  HUM: { code: 'HUM', label: 'Humains affectés', description: 'Humans affected: Injury/burns/marks/abduction/death' },
  INJ: { code: 'INJ', label: 'Blessures/Mutilations', description: 'Injuries, illness/death, mutilations' },
  VEH: { code: 'VEH', label: 'Véhicule affecté', description: 'Vehicle affected: Marks/damage/EME effects' },
  BLD: { code: 'BLD', label: 'Bâtiment/Structure', description: 'Building/man-made structure/roads/power lines' },
  DRT: { code: 'DRT', label: 'Traces au sol', description: 'Dirt/soil traces/marks/footprints etc.' },
  VEG: { code: 'VEG', label: 'Plantes affectées', description: 'Plants affected or sampled/crop circles' },
  PHT: { code: 'PHT', label: 'Photos/Vidéos', description: 'Photos/movies/videos taken' },
  RDA: { code: 'RDA', label: 'Radiation détectée', description: 'Radiation/high energy fields detected' },
  TRC: { code: 'TRC', label: 'Traces physiques', description: 'Physical traces' },
  NOC: { code: 'NOC', label: 'Aucune entité vue', description: 'No entity/occupant seen by observer(s)' },
  CMF: { code: 'CMF', label: 'Camouflage', description: 'Camouflage/disguise' },
  MID: { code: 'MID', label: 'Mésidentification', description: 'Likely mis-identification' },
  CNT: { code: 'CNT', label: 'Contacté', description: 'Contactee related' },
  OID: { code: 'OID', label: 'Humanoïde', description: 'Humanoid: Small alien or "Grey"' },
  COV: { code: 'COV', label: 'Dissimulation', description: 'Indication of coverup' },
  OGA: { code: 'OGA', label: 'Agences gouv.', description: 'Non-Covert Government Agencies' }
}

export const OBSERVATION_TYPE_OPTIONS = Object.entries(OBSERVATION_TYPES).map(([code, data]) => ({
  value: code,
  label: `${code} - ${data.label}`,
  description: data.description
}))

export default OBSERVATION_TYPES
