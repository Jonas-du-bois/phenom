import express from 'express';
import adminController from '../controllers/admin.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  getUsersValidation,
  updateUserRoleValidation,
  idParamValidation
} from '../validators/admin.validator.js';

const router = express.Router();

// Toutes les routes admin nécessitent authentification et rôle admin
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @route   GET /api/v1/admin/users
 * @desc    Récupère la liste des utilisateurs
 * @access  Admin
 */
router.get(
  '/users',
  getUsersValidation,
  validate,
  adminController.getUsers
);

/**
 * @route   PUT /api/v1/admin/users/:id/role
 * @desc    Change le rôle d'un utilisateur
 * @access  Admin
 */
router.put(
  '/users/:id/role',
  updateUserRoleValidation,
  validate,
  adminController.updateUserRole
);

/**
 * @route   GET /api/v1/admin/stats
 * @desc    Récupère les statistiques globales
 * @access  Admin
 */
router.get(
  '/stats',
  adminController.getStats
);

/**
 * @route   DELETE /api/v1/admin/observations/:id
 * @desc    Supprime une observation
 * @access  Admin
 */
router.delete(
  '/observations/:id',
  idParamValidation,
  validate,
  adminController.deleteObservation
);

/**
 * @route   DELETE /api/v1/admin/comments/:id
 * @desc    Supprime un commentaire
 * @access  Admin
 */
router.delete(
  '/comments/:id',
  idParamValidation,
  validate,
  adminController.deleteComment
);

/**
 * @route   GET /api/v1/admin/observations
 * @desc    Récupère toutes les observations avec filtres
 * @access  Admin
 */
router.get(
  '/observations',
  validate,
  adminController.getAllObservations
);

/**
 * @route   POST /api/v1/admin/observations/:id/approve
 * @desc    Approuve une observation signalée
 * @access  Admin
 */
router.post(
  '/observations/:id/approve',
  idParamValidation,
  validate,
  adminController.approveObservation
);

/**
 * @route   POST /api/v1/admin/observations/:id/reject
 * @desc    Rejette une observation avec motif
 * @access  Admin
 */
router.post(
  '/observations/:id/reject',
  idParamValidation,
  validate,
  adminController.rejectObservation
);

/**
 * @route   POST /api/v1/admin/users/:id/suspend
 * @desc    Suspend un utilisateur
 * @access  Admin
 */
router.post(
  '/users/:id/suspend',
  idParamValidation,
  validate,
  adminController.suspendUser
);

/**
 * @route   POST /api/v1/admin/users/:id/activate
 * @desc    Réactive un utilisateur suspendu
 * @access  Admin
 */
router.post(
  '/users/:id/activate',
  idParamValidation,
  validate,
  adminController.activateUser
);

/**
 * @route   GET /api/v1/admin/comments
 * @desc    Récupère tous les commentaires
 * @access  Admin
 */
router.get(
  '/comments',
  validate,
  adminController.getAllComments
);

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Récupère les détails d'un utilisateur
 * @access  Admin
 */
router.get(
  '/users/:id',
  idParamValidation,
  validate,
  adminController.getUserDetails
);

export default router;
