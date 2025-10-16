import express from 'express';
import observationController from '../controllers/observation.controller.js';
import { authenticate } from '../middleware/auth.js';
import { isOwnerOrAdmin } from '../middleware/authorize.js';
import { validate } from '../middleware/validate.js';
import {
  createObservationValidation,
  updateObservationValidation,
  getObservationsValidation,
  idParamValidation,
  nearbyObservationsValidation,
  imageIdParamValidation
} from '../validators/observation.validator.js';
import { createLimiter } from '../middleware/rateLimiter.js';
import observationService from '../services/observation.service.js';
import upload from '../config/multer.js';

const router = express.Router();

/**
 * @swagger
 * /api/v1/observations/nearby:
 *   get:
 *     summary: Recherche d'observations à proximité
 *     tags: [Observations]
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -90
 *           maximum: 90
 *         description: Latitude (WGS84)
 *         example: 46.5197
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *           minimum: -180
 *           maximum: 180
 *         description: Longitude (WGS84)
 *         example: 6.6323
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 10000
 *         description: Rayon de recherche en mètres (défaut 10km)
 *         example: 5000
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Nombre maximum d'observations à retourner
 *     responses:
 *       200:
 *         description: Observations à proximité trouvées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Observation'
 *                       - type: object
 *                         properties:
 *                           distance:
 *                             type: number
 *                             description: Distance en mètres
 *                             example: 1234.56
 *       400:
 *         description: Paramètres invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/nearby',
  nearbyObservationsValidation,
  validate,
  observationController.getNearbyObservations
);

/**
 * @swagger
 * /api/v1/observations/stats:
 *   get:
 *     summary: Récupère les statistiques publiques des observations
 *     tags: [Observations]
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
 *                     total:
 *                       type: integer
 *                       example: 1234
 *                     lastWeek:
 *                       type: integer
 *                       example: 42
 *                     lastMonth:
 *                       type: integer
 *                       example: 156
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/stats',
  observationController.getObservationStats
);

/**
 * @swagger
 * /api/v1/observations:
 *   get:
 *     summary: Récupère la liste des observations avec filtres
 *     tags: [Observations]
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
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Recherche dans le titre et la description
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
 *                           example: 234
 *                         pages:
 *                           type: integer
 *                           example: 24
 *       400:
 *         description: Paramètres invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/',
  getObservationsValidation,
  validate,
  observationController.getObservations
);

/**
 * @swagger
 * /api/v1/observations:
 *   post:
 *     summary: Crée une nouvelle observation
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - location
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: OVNI triangulaire au-dessus de Lausanne
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 example: J'ai observé un objet triangulaire lumineux se déplaçant silencieusement
 *               location:
 *                 type: object
 *                 required:
 *                   - type
 *                   - coordinates
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                     example: Point
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     minItems: 2
 *                     maxItems: 2
 *                     example: [6.6323, 46.5197]
 *                     description: "[longitude, latitude] au format WGS84"
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *                 example: https://example.com/image.jpg
 *     responses:
 *       201:
 *         description: Observation créée avec succès
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
 *                   example: Observation créée avec succès
 *                 data:
 *                   $ref: '#/components/schemas/Observation'
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
 *       429:
 *         description: Trop de créations (rate limit)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  authenticate,
  createLimiter,
  createObservationValidation,
  validate,
  observationController.createObservation
);

/**
 * @swagger
 * /api/v1/observations/{id}:
 *   get:
 *     summary: Récupère une observation par son ID
 *     tags: [Observations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'observation (MongoDB ObjectId)
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Observation récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Observation'
 *       400:
 *         description: ID invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Observation non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get(
  '/:id',
  idParamValidation,
  validate,
  observationController.getObservationById
);

/**
 * @swagger
 * /api/v1/observations/{id}:
 *   put:
 *     summary: Met à jour une observation
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'observation
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: OVNI triangulaire (mis à jour)
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *                 example: Description mise à jour de l'observation
 *               location:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [Point]
 *                   coordinates:
 *                     type: array
 *                     items:
 *                       type: number
 *                     minItems: 2
 *                     maxItems: 2
 *               imageUrl:
 *                 type: string
 *                 format: uri
 *     responses:
 *       200:
 *         description: Observation mise à jour avec succès
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
 *                   example: Observation mise à jour avec succès
 *                 data:
 *                   $ref: '#/components/schemas/Observation'
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
 *       403:
 *         description: Non autorisé (pas propriétaire ni admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Observation non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  '/:id',
  authenticate,
  updateObservationValidation,
  validate,
  isOwnerOrAdmin(async (req) => {
    return await observationService.getObservationOwnerId(req.params.id);
  }),
  observationController.updateObservation
);

/**
 * @swagger
 * /api/v1/observations/{id}:
 *   delete:
 *     summary: Supprime une observation
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'observation
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Observation supprimée avec succès
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
 *                   example: Observation supprimée avec succès
 *       400:
 *         description: ID invalide
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
 *       403:
 *         description: Non autorisé (pas propriétaire ni admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Observation non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:id',
  authenticate,
  idParamValidation,
  validate,
  isOwnerOrAdmin(async (req) => {
    return await observationService.getObservationOwnerId(req.params.id);
  }),
  observationController.deleteObservation
);

/**
 * @swagger
 * /api/v1/observations/{id}/images:
 *   post:
 *     summary: Ajoute une image à une observation
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'observation
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Fichier image (JPEG, PNG, WebP, max 10MB)
 *     responses:
 *       200:
 *         description: Image ajoutée avec succès
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
 *                   example: Image ajoutée avec succès
 *                 data:
 *                   $ref: '#/components/schemas/Observation'
 *       400:
 *         description: Fichier invalide ou manquant
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
 *       403:
 *         description: Non autorisé (pas propriétaire ni admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Observation non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       413:
 *         description: Fichier trop volumineux (>10MB)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/:id/images',
  authenticate,
  idParamValidation,
  validate,
  isOwnerOrAdmin(async (req) => {
    return await observationService.getObservationOwnerId(req.params.id);
  }),
  upload.single('image'),
  observationController.addImage
);

/**
 * @swagger
 * /api/v1/observations/{id}/images/{imageId}:
 *   delete:
 *     summary: Supprime une image d'une observation
 *     tags: [Observations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'observation
 *         example: 507f1f77bcf86cd799439011
 *       - in: path
 *         name: imageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'image
 *         example: 507f1f77bcf86cd799439012
 *     responses:
 *       200:
 *         description: Image supprimée avec succès
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
 *                   example: Image supprimée avec succès
 *       400:
 *         description: ID invalide
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
 *       403:
 *         description: Non autorisé (pas propriétaire ni admin)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Observation ou image non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete(
  '/:id/images/:imageId',
  authenticate,
  imageIdParamValidation,
  validate,
  isOwnerOrAdmin(async (req) => {
    return await observationService.getObservationOwnerId(req.params.id);
  }),
  observationController.deleteImage
);

export default router;
