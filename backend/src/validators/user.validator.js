import { body, query } from 'express-validator';

/**
 * Validation pour la mise à jour du profil
 * Note: On n'utilise PAS .escape() car cela encode les apostrophes en &#x27;
 * La protection XSS est gérée côté frontend à l'affichage
 */
export const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email invalide')
    .normalizeEmail(),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('La bio ne peut pas dépasser 500 caractères')
];

/**
 * Validation pour le changement de mot de passe
 */
export const changePasswordValidation = [
  body('currentPassword')
    .trim()
    .notEmpty()
    .withMessage('Le mot de passe actuel est requis'),
  body('newPassword')
    .trim()
    .isLength({ min: 6 })
    .withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('Le nouveau mot de passe doit être différent de l\'ancien');
      }
      return true;
    }),
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('La confirmation du mot de passe est requise')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Les mots de passe ne correspondent pas');
      }
      return true;
    })
];

/**
 * Validation pour la liste des observations de l'utilisateur
 */
export const getUserObservationsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('La page doit être un entier positif')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('La limite doit être entre 1 et 100')
    .toInt(),
  query('sort')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'title'])
    .withMessage('Le tri doit être createdAt, updatedAt ou title'),
  query('order')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('L\'ordre doit être asc ou desc')
];
