/**
 * @file user.routes.js
 * @description User routes for profile management, password change, and avatar handling.
 * All routes require authentication.
 */
import express from 'express';
import multer from 'multer';
import userController from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  updateProfileValidation,
  changePasswordValidation,
  getUserObservationsValidation
} from '../validators/user.validator.js';

const router = express.Router();

// Multer configuration for avatar uploads
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max for avatar
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          'Type de fichier non autorisé. Types acceptés: JPEG, PNG, WebP'
        ),
        false
      );
    }
  }
});

/**
 * @swagger
 * /api/v1/users/me:
 *   get:
 *     summary: Récupère le profil complet de l'utilisateur connecté
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me', authenticate, userController.getProfile);

/**
 * @swagger
 * /api/v1/users/me/stats:
 *   get:
 *     summary: Récupère les statistiques de l'utilisateur connecté
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     observationsCount:
 *                       type: integer
 *                       example: 42
 *                     commentsCount:
 *                       type: integer
 *                       example: 127
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/me/stats', authenticate, userController.getUserStats);

/**
 * @swagger
 * /api/v1/users/me:
 *   put:
 *     summary: Met à jour le profil de l'utilisateur connecté
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 example: Jean Dupont
 *               email:
 *                 type: string
 *                 format: email
 *                 example: jean.dupont@example.com
 *     responses:
 *       200:
 *         description: Profil mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profil mis à jour avec succès
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/me',
  authenticate,
  updateProfileValidation,
  validate,
  userController.updateProfile
);

/**
 * @swagger
 * /api/v1/users/me/password:
 *   patch:
 *     summary: Change le mot de passe de l'utilisateur connecté
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: ancien_mot_de_passe
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: nouveau_mot_de_passe
 *     responses:
 *       200:
 *         description: Mot de passe changé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Mot de passe changé avec succès
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Mot de passe actuel incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  '/me/password',
  authenticate,
  changePasswordValidation,
  validate,
  userController.changePassword
);

/**
 * @swagger
 * /api/v1/users/me:
 *   delete:
 *     summary: Supprime le compte de l'utilisateur connecté
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compte supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Compte supprimé avec succès
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/me', authenticate, userController.deleteAccount);

/**
 * @swagger
 * /api/v1/users/me/observations:
 *   get:
 *     summary: Récupère les observations de l'utilisateur connecté
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre d'observations par page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, updatedAt, title]
 *           default: createdAt
 *         description: Champ de tri
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordre de tri
 *     responses:
 *       200:
 *         description: Observations récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     observations:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Observation'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         limit:
 *                           type: integer
 *                           example: 10
 *                         total:
 *                           type: integer
 *                           example: 45
 *                         pages:
 *                           type: integer
 *                           example: 5
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/me/observations',
  authenticate,
  getUserObservationsValidation,
  validate,
  userController.getUserObservations
);

/**
 * @swagger
 * /api/v1/users/me/avatar:
 *   post:
 *     summary: Upload ou met à jour l'avatar de l'utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image de l'avatar (JPEG, PNG, WebP) - Max 5MB
 *     responses:
 *       200:
 *         description: Avatar mis à jour avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Avatar mis à jour avec succès
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: https://res.cloudinary.com/xxx/image/upload/v123/phenom/avatars/userId_123.jpg
 *                     publicId:
 *                       type: string
 *                       example: phenom/avatars/userId_123456789
 *       400:
 *         description: Aucune image fournie ou format invalide
 *       401:
 *         description: Non authentifié
 */
router.post(
  '/me/avatar',
  authenticate,
  avatarUpload.single('avatar'),
  userController.uploadAvatar
);

/**
 * @swagger
 * /api/v1/users/me/avatar:
 *   delete:
 *     summary: Supprime l'avatar de l'utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Avatar supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Avatar supprimé avec succès
 *       400:
 *         description: Aucun avatar à supprimer
 *       401:
 *         description: Non authentifié
 */
router.delete('/me/avatar', authenticate, userController.deleteAvatar);

// Endpoint pour mettre à jour la position courante (pour alertes de proximité)
router.post('/me/location', authenticate, userController.updateLocation);

export default router;
