import { body, param, query } from 'express-validator';

/**
 * Validation for creating a comment
 * Note: We do NOT use .escape() because it encodes apostrophes as &#x27;
 * XSS sanitization will be done on the frontend when displaying
 */
export const createCommentValidation = [
  param('id').isMongoId().withMessage('ID d\'observation invalide'),

  body('text')
    .trim()
    .notEmpty()
    .withMessage('Le texte du commentaire est requis')
    .isLength({ min: 1, max: 500 })
    .withMessage('Le commentaire doit contenir entre 1 et 500 caractères')
];

/**
 * Validation for updating a comment
 */
export const updateCommentValidation = [
  param('id').isMongoId().withMessage('ID de commentaire invalide'),

  body('text')
    .trim()
    .notEmpty()
    .withMessage('Le texte du commentaire est requis')
    .isLength({ min: 1, max: 500 })
    .withMessage('Le commentaire doit contenir entre 1 et 500 caractères')
];

/**
 * Validation for retrieving comments
 */
export const getCommentsValidation = [
  param('id').isMongoId().withMessage('ID d\'observation invalide'),

  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un entier positif'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100')
];

/**
 * Validation for comment ID
 */
export const commentIdValidation = [
  param('id').isMongoId().withMessage('ID de commentaire invalide')
];
