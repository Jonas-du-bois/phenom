import { body, query, param } from 'express-validator';

/**
 * Validation pour créer une observation
 */
export const createObservationValidation = [
  body('title')
    .trim()
    .escape()
    .notEmpty().withMessage('Le titre est requis')
    .isLength({ min: 3, max: 100 }).withMessage('Le titre doit contenir entre 3 et 100 caractères'),

  body('description')
    .trim()
    .escape()
    .notEmpty().withMessage('La description est requise')
    .isLength({ min: 10, max: 2000 }).withMessage('La description doit contenir entre 10 et 2000 caractères'),

  body('location.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Les coordonnées doivent être un tableau [longitude, latitude]'),

  body('location.coordinates.0')
    .isFloat({ min: -180, max: 180 }).withMessage('La longitude doit être entre -180 et 180'),

  body('location.coordinates.1')
    .isFloat({ min: -90, max: 90 }).withMessage('La latitude doit être entre -90 et 90'),

  body('date')
    .optional()
    .isISO8601().withMessage('Date invalide'),

  body('type')
    .optional()
    .isIn([
      'WAV', 'TCH', 'HST', 'SND', 'ODD', 'LND', 'SUB', 'OBS', 'RAY', 'SIG',
      'ANI', 'HUM', 'INJ', 'VEH', 'BLD', 'DRT', 'VEG', 'PHT', 'RDA', 'TRC',
      'NOC', 'CMF', 'MID', 'CNT', 'OID', 'COV', 'OGA'
    ])
    .withMessage('Type invalide'),

  body('tags')
    .optional()
    .isArray().withMessage('Les tags doivent être un tableau')
    .custom((tags) => {
      if (!Array.isArray(tags)) return false;
      return tags.every(tag => typeof tag === 'string' && tag.length >= 2 && tag.length <= 30);
    }).withMessage('Chaque tag doit contenir entre 2 et 30 caractères')
];

/**
 * Validation pour mettre à jour une observation
 */
export const updateObservationValidation = [
  param('id')
    .isMongoId().withMessage('ID invalide'),

  body('title')
    .optional({ values: 'falsy' })
    .trim()
    .escape()
    .notEmpty().withMessage('Le titre ne peut pas être vide')
    .isLength({ min: 3, max: 100 }).withMessage('Le titre doit contenir entre 3 et 100 caractères'),

  body('description')
    .optional({ values: 'falsy' })
    .trim()
    .escape()
    .notEmpty().withMessage('La description ne peut pas être vide')
    .isLength({ min: 10, max: 2000 }).withMessage('La description doit contenir entre 10 et 2000 caractères'),

  body('date')
    .optional({ values: 'falsy' })
    .notEmpty().withMessage('La date ne peut pas être vide')
    .isISO8601().withMessage('Date invalide'),

  body('type')
    .optional({ values: 'falsy' })
    .notEmpty().withMessage('Le type ne peut pas être vide')
    .isIn([
      'WAV', 'TCH', 'HST', 'SND', 'ODD', 'LND', 'SUB', 'OBS', 'RAY', 'SIG',
      'ANI', 'HUM', 'INJ', 'VEH', 'BLD', 'DRT', 'VEG', 'PHT', 'RDA', 'TRC',
      'NOC', 'CMF', 'MID', 'CNT', 'OID', 'COV', 'OGA'
    ])
    .withMessage('Type invalide'),

  body('tags')
    .optional({ values: 'falsy' })
    .isArray().withMessage('Les tags doivent être un tableau')
    .custom((tags) => {
      if (!Array.isArray(tags)) return false;
      return tags.every(tag => typeof tag === 'string' && tag.length >= 2 && tag.length <= 30);
    }).withMessage('Chaque tag doit contenir entre 2 et 30 caractères'),

  body('location.type')
    .optional({ values: 'falsy' })
    .notEmpty().withMessage('Le type de localisation ne peut pas être vide')
    .equals('Point').withMessage('Le type de localisation doit être "Point"'),

  body('location.coordinates')
    .optional({ values: 'falsy' })
    .isArray({ min: 2, max: 2 }).withMessage('Les coordonnées doivent être un tableau de 2 éléments')
    .custom((value) => {
      if (!Array.isArray(value) || value.length !== 2) return false;
      const [lng, lat] = value;
      return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
    }).withMessage('Coordonnées invalides. Format: [longitude, latitude]')
];

/**
 * Validation pour les filtres de liste d'observations
 */
export const getObservationsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La page doit être un entier positif'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('La limite doit être entre 1 et 100'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('La recherche ne peut pas dépasser 100 caractères'),

  query('lat')
    .optional()
    .isFloat({ min: -90, max: 90 }).withMessage('La latitude doit être entre -90 et 90'),

  query('lng')
    .optional()
    .isFloat({ min: -180, max: 180 }).withMessage('La longitude doit être entre -180 et 180'),

  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 10000 }).withMessage('Le rayon doit être entre 0.1 et 10000 km')
];

/**
 * Validation pour l'ID de paramètre
 */
export const idParamValidation = [
  param('id')
    .isMongoId().withMessage('ID invalide')
];

/**
 * Validation pour la recherche d'observations à proximité
 */
export const nearbyObservationsValidation = [
  query('latitude')
    .notEmpty().withMessage('La latitude est requise')
    .isFloat({ min: -90, max: 90 }).withMessage('La latitude doit être entre -90 et 90')
    .toFloat(),

  query('longitude')
    .notEmpty().withMessage('La longitude est requise')
    .isFloat({ min: -180, max: 180 }).withMessage('La longitude doit être entre -180 et 180')
    .toFloat(),

  query('radius')
    .optional()
    .isFloat({ min: 0.1, max: 1000 }).withMessage('Le rayon doit être entre 0.1 et 1000 km')
    .toFloat(),

  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La page doit être un entier positif')
    .toInt(),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('La limite doit être entre 1 et 100')
    .toInt()
];

/**
 * Validation pour l'ID d'image de paramètre
 */
export const imageIdParamValidation = [
  param('id')
    .isMongoId().withMessage('ID d\'observation invalide'),
  param('imageId')
    .notEmpty().withMessage('ID d\'image requis')
    .matches(/^img_[0-9]+_[a-z0-9]+$/).withMessage('ID d\'image invalide')
];
