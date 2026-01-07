import { body, query, param } from 'express-validator';

// Valid codes for Phenom Search compatibility
const OBSERVER_TYPES = ['GND', 'MIL', 'CIV', 'HQO', 'SCI', 'CST', 'SEA', 'NWS'];
const UFO_SHAPES = ['SCR', 'CIG', 'DLT', 'NLT', 'FBL', 'FIG', 'PRB', 'NFO'];
const PHENOMENA = [
  'WAV',
  'TCH',
  'HST',
  'SND',
  'ODD',
  'MID',
  'RAY',
  'SIG',
  'LND',
  'SUB',
  'OBS',
  'VEH',
  'TRC',
  'DRT',
  'VEG',
  'PHT',
  'RDA',
  'BLD',
  'OID',
  'NOC',
  'ANI',
  'HUM',
  'INJ'
];
const LOCALE_TYPES = [
  'Town & City',
  'Rural',
  'Mountains',
  'Farmlands',
  'Coastal',
  'Desert',
  'Forest',
  'Lake/River',
  'Ocean',
  'Airport',
  'Military Base',
  'Unknown'
];

/**
 * Validation for creating an observation (Phenom Search compatible format)
 */
export const createObservationValidation = [
  body('date')
    .trim()
    .notEmpty()
    .withMessage('La date est requise')
    .isLength({ max: 50 })
    .withMessage('La date ne peut pas dépasser 50 caractères'),

  body('time')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('L\'heure ne peut pas dépasser 20 caractères'),

  body('location')
    .trim()
    .notEmpty()
    .withMessage('Le lieu est requis')
    .isLength({ max: 200 })
    .withMessage('Le lieu ne peut pas dépasser 200 caractères'),

  body('country')
    .trim()
    .notEmpty()
    .withMessage('Le pays est requis')
    .isLength({ max: 100 })
    .withMessage('Le pays ne peut pas dépasser 100 caractères'),

  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La région ne peut pas dépasser 100 caractères'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('La description est requise')
    .isLength({ min: 10, max: 5000 })
    .withMessage('La description doit contenir entre 10 et 5000 caractères'),

  body('credibility')
    .optional()
    .isInt({ min: 0, max: 15 })
    .withMessage('La crédibilité doit être entre 0 et 15'),

  body('strangeness')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('L\'étrangeté doit être entre 0 et 10'),

  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La durée doit être un entier positif (en secondes)'),

  body('locale')
    .optional()
    .isIn(LOCALE_TYPES)
    .withMessage('Type de lieu invalide'),

  body('coordinates.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitude doit être entre -90 et 90'),

  body('coordinates.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitude doit être entre -180 et 180'),

  body('observerTypes')
    .optional()
    .isArray()
    .withMessage('observerTypes doit être un tableau')
    .custom((types) => {
      if (!Array.isArray(types)) return false;
      return types.every((t) => OBSERVER_TYPES.includes(t));
    })
    .withMessage(
      `Types d'observateurs invalides. Valeurs valides: ${OBSERVER_TYPES.join(
        ', '
      )}`
    ),

  body('ufoShapes')
    .optional()
    .isArray()
    .withMessage('ufoShapes doit être un tableau')
    .custom((shapes) => {
      if (!Array.isArray(shapes)) return false;
      return shapes.every((s) => UFO_SHAPES.includes(s));
    })
    .withMessage(`Formes invalides. Valeurs valides: ${UFO_SHAPES.join(', ')}`),

  body('phenomena')
    .optional()
    .isArray()
    .withMessage('phenomena doit être un tableau')
    .custom((phenom) => {
      if (!Array.isArray(phenom)) return false;
      return phenom.every((p) => PHENOMENA.includes(p));
    })
    .withMessage(
      `Phénomènes invalides. Valeurs valides: ${PHENOMENA.join(', ')}`
    ),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Les tags doivent être un tableau')
    .custom((tags) => {
      if (!Array.isArray(tags)) return false;
      return tags.every(
        (tag) => typeof tag === 'string' && tag.length >= 2 && tag.length <= 30
      );
    })
    .withMessage('Chaque tag doit contenir entre 2 et 30 caractères')
];

/**
 * Validation for updating an observation
 */
export const updateObservationValidation = [
  param('id').isMongoId().withMessage('ID invalide'),

  body('date')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La date ne peut pas être vide')
    .isLength({ max: 50 })
    .withMessage('La date ne peut pas dépasser 50 caractères'),

  body('time')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('L\'heure ne peut pas dépasser 20 caractères'),

  body('location')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Le lieu ne peut pas être vide')
    .isLength({ max: 200 })
    .withMessage('Le lieu ne peut pas dépasser 200 caractères'),

  body('country')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Le pays ne peut pas être vide')
    .isLength({ max: 100 })
    .withMessage('Le pays ne peut pas dépasser 100 caractères'),

  body('state')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La région ne peut pas dépasser 100 caractères'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('La description ne peut pas être vide')
    .isLength({ min: 10, max: 5000 })
    .withMessage('La description doit contenir entre 10 et 5000 caractères'),

  body('credibility')
    .optional()
    .isInt({ min: 0, max: 15 })
    .withMessage('La crédibilité doit être entre 0 et 15'),

  body('strangeness')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('L\'étrangeté doit être entre 0 et 10'),

  body('duration')
    .optional()
    .isInt({ min: 0 })
    .withMessage('La durée doit être un entier positif (en secondes)'),

  body('locale')
    .optional()
    .isIn(LOCALE_TYPES)
    .withMessage('Type de lieu invalide'),

  body('coordinates.lat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitude doit être entre -90 et 90'),

  body('coordinates.lng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitude doit être entre -180 et 180'),

  body('observerTypes')
    .optional()
    .isArray()
    .withMessage('observerTypes doit être un tableau')
    .custom((types) => {
      if (!Array.isArray(types)) return false;
      return types.every((t) => OBSERVER_TYPES.includes(t));
    })
    .withMessage('Types d\'observateurs invalides'),

  body('ufoShapes')
    .optional()
    .isArray()
    .withMessage('ufoShapes doit être un tableau')
    .custom((shapes) => {
      if (!Array.isArray(shapes)) return false;
      return shapes.every((s) => UFO_SHAPES.includes(s));
    })
    .withMessage('Formes invalides'),

  body('phenomena')
    .optional()
    .isArray()
    .withMessage('phenomena doit être un tableau')
    .custom((phenom) => {
      if (!Array.isArray(phenom)) return false;
      return phenom.every((p) => PHENOMENA.includes(p));
    })
    .withMessage('Phénomènes invalides'),

  body('tags')
    .optional()
    .isArray()
    .withMessage('Les tags doivent être un tableau')
    .custom((tags) => {
      if (!Array.isArray(tags)) return false;
      return tags.every(
        (tag) => typeof tag === 'string' && tag.length >= 2 && tag.length <= 30
      );
    })
    .withMessage('Chaque tag doit contenir entre 2 et 30 caractères')
];

/**
 * Validation for observation list filters
 */
export const getObservationsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un entier positif'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('La limite doit être entre 1 et 500'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La recherche ne peut pas dépasser 100 caractères'),

  query('country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Le pays ne peut pas dépasser 100 caractères'),

  query('minCredibility')
    .optional()
    .isInt({ min: 0, max: 15 })
    .withMessage('minCredibility doit être entre 0 et 15'),

  query('maxCredibility')
    .optional()
    .isInt({ min: 0, max: 15 })
    .withMessage('maxCredibility doit être entre 0 et 15'),

  query('minStrangeness')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('minStrangeness doit être entre 0 et 10'),

  query('maxStrangeness')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('maxStrangeness doit être entre 0 et 10')
];

/**
 * Validation for parameter ID
 */
export const idParamValidation = [
  param('id').isMongoId().withMessage('ID invalide')
];

/**
 * Validation for nearby observations search
 */
export const nearbyObservationsValidation = [
  query('latitude')
    .notEmpty()
    .withMessage('La latitude est requise')
    .isFloat({ min: -90, max: 90 })
    .withMessage('La latitude doit être entre -90 et 90')
    .toFloat(),

  query('longitude')
    .notEmpty()
    .withMessage('La longitude est requise')
    .isFloat({ min: -180, max: 180 })
    .withMessage('La longitude doit être entre -180 et 180')
    .toFloat(),

  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 1000 })
    .withMessage('Le rayon doit être entre 0.1 et 1000 km')
    .toFloat(),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un entier positif')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage('La limite doit être entre 1 et 1000')
    .toInt()
];
