import { body, param, query } from 'express-validator';

/**
 * Validation pour créer un commentaire
 */
export const createCommentValidation = [
  param('id')
    .isMongoId().withMessage('ID d\'observation invalide'),
  
  body('text')
    .trim()
    .notEmpty().withMessage('Le texte du commentaire est requis')
    .isLength({ min: 1, max: 500 }).withMessage('Le commentaire doit contenir entre 1 et 500 caractères')
];

/**
 * Validation pour mettre à jour un commentaire
 */
export const updateCommentValidation = [
  param('id')
    .isMongoId().withMessage('ID de commentaire invalide'),
  
  body('text')
    .trim()
    .notEmpty().withMessage('Le texte du commentaire est requis')
    .isLength({ min: 1, max: 500 }).withMessage('Le commentaire doit contenir entre 1 et 500 caractères')
];

/**
 * Validation pour récupérer les commentaires
 */
export const getCommentsValidation = [
  param('id')
    .isMongoId().withMessage('ID d\'observation invalide'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('La page doit être un entier positif'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('La limite doit être entre 1 et 100')
];

/**
 * Validation pour l'ID de commentaire
 */
export const commentIdValidation = [
  param('id')
    .isMongoId().withMessage('ID de commentaire invalide')
];
