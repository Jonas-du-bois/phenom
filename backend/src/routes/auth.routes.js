import express from 'express';
import authController from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { signupValidation, loginValidation } from '../validators/auth.validator.js';
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

export default router;
