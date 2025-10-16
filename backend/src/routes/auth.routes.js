import express from 'express';
import authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { 
  signupValidation, 
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation 
} from '../validators/auth.validator.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * @route   POST /api/v1/auth/signup
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
router.post(
  '/signup',
  authLimiter,
  signupValidation,
  validate,
  authController.signup
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
router.post(
  '/login',
  authLimiter,
  loginValidation,
  validate,
  authController.login
);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Déconnexion d'un utilisateur
 * @access  Private
 */
router.post(
  '/logout',
  authenticate,
  authController.logout
);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Récupère le profil de l'utilisateur connecté
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  authController.getProfile
);

/**
 * @route   POST /api/v1/auth/refresh-token
 * @desc    Rafraîchit le token JWT avec un refresh token valide
 * @access  Public
 */
router.post(
  '/refresh-token',
  authController.refreshToken
);

/**
 * @route   POST /api/v1/auth/forgot-password
 * @desc    Demande de réinitialisation du mot de passe
 * @access  Public
 */
router.post(
  '/forgot-password',
  authLimiter,
  forgotPasswordValidation,
  validate,
  authController.forgotPassword
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Réinitialise le mot de passe avec un token
 * @access  Public
 */
router.post(
  '/reset-password',
  authLimiter,
  resetPasswordValidation,
  validate,
  authController.resetPassword
);

export default router;
