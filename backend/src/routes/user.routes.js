import express from 'express';
import userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  updateProfileValidation,
  changePasswordValidation,
  getUserObservationsValidation
} from '../validators/user.validator.js';

const router = express.Router();

/**
 * @route   GET /api/v1/users/me
 * @desc    Récupère le profil complet de l'utilisateur connecté
 * @access  Private
 */
router.get(
  '/me',
  authenticate,
  userController.getProfile
);

/**
 * @route   PUT /api/v1/users/me
 * @desc    Met à jour le profil de l'utilisateur connecté
 * @access  Private
 */
router.put(
  '/me',
  authenticate,
  updateProfileValidation,
  validate,
  userController.updateProfile
);

/**
 * @route   PATCH /api/v1/users/me/password
 * @desc    Change le mot de passe de l'utilisateur connecté
 * @access  Private
 */
router.patch(
  '/me/password',
  authenticate,
  changePasswordValidation,
  validate,
  userController.changePassword
);

/**
 * @route   DELETE /api/v1/users/me
 * @desc    Supprime le compte de l'utilisateur connecté
 * @access  Private
 */
router.delete(
  '/me',
  authenticate,
  userController.deleteAccount
);

/**
 * @route   GET /api/v1/users/me/observations
 * @desc    Récupère les observations de l'utilisateur connecté
 * @access  Private
 */
router.get(
  '/me/observations',
  authenticate,
  getUserObservationsValidation,
  validate,
  userController.getUserObservations
);

export default router;
