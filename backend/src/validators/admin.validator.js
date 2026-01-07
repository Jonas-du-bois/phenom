import { param, query, body } from 'express-validator';

/**
 * Validation for user list
 */
export const getUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un entier positif'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('La recherche ne peut pas dépasser 100 caractères')
];

/**
 * Validation for changing a user's role
 */
export const updateUserRoleValidation = [
  param('id').isMongoId().withMessage('ID utilisateur invalide'),

  body('role')
    .notEmpty()
    .withMessage('Le rôle est requis')
    .isIn(['admin', 'viewer'])
    .withMessage('Le rôle doit être "admin" ou "viewer"')
];

/**
 * Validation for parameter ID
 */
export const idParamValidation = [
  param('id').isMongoId().withMessage('ID invalide')
];
