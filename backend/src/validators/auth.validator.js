import { body } from 'express-validator';

/**
 * Validation pour l'inscription
 */
export const signupValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Le nom est requis')
    .isLength({ min: 2, max: 50 }).withMessage('Le nom doit contenir entre 2 et 50 caractères'),
  
  body('email')
    .trim()
    .notEmpty().withMessage("L'email est requis")
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
    .isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères')
];

/**
 * Validation pour la connexion
 */
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage("L'email est requis")
    .isEmail().withMessage('Email invalide')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Le mot de passe est requis')
];
