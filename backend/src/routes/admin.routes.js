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

export default router;
