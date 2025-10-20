import { body, query, param } from 'express-validator';

/**
 * Validation pour créer une observation
 */
export const createObservationValidation = [
  body('title')
    .trim()
    .escape() // Échapper HTML pour prévenir XSS
    .notEmpty().withMessage('Le titre est requis')
    .isLength({ min: 3, max: 100 }).withMessage('Le titre doit contenir entre 3 et 100 caractères'),

  body('description')
    .trim()
    .escape() // Échapper HTML pour prévenir XSS
    .notEmpty().withMessage('La description est requise')
    .isLength({ min: 10, max: 2000 }).withMessage('La description doit contenir entre 10 et 2000 caractères'),

  body('location.coordinates')
    .isArray({ min: 2, max: 2 }).withMessage('Les coordonnées doivent être un tableau [longitude, latitude]'),

  body('location.coordinates.0')
    .isFloat({ min: -180, max: 180 }).withMessage('La longitude doit être entre -180 et 180'),

  body('location.coordinates.1')
    .isFloat({ min: -90, max: 90 }).withMessage('La latitude doit être entre -90 et 90')
];

/**
 * Validation pour mettre à jour une observation
 */
export const updateObservationValidation = [
  param('id')
    .isMongoId().withMessage('ID invalide'),

  body('title')
    .optional()
    .trim()
    .escape() // Échapper HTML pour prévenir XSS
    .isLength({ min: 3, max: 100 }).withMessage('Le titre doit contenir entre 3 et 100 caractères'),

  body('description')
    .optional()
    .trim()
    .escape() // Échapper HTML pour prévenir XSS
    .isLength({ min: 10, max: 2000 }).withMessage('La description doit contenir entre 10 et 2000 caractères')
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
