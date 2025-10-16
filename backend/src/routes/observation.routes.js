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
 * @route   GET /api/v1/observations/nearby
 * @desc    Recherche d'observations à proximité
 * @access  Public
 */
router.get(
  '/nearby',
  nearbyObservationsValidation,
  validate,
  observationController.getNearbyObservations
);

/**
 * @route   GET /api/v1/observations/stats
 * @desc    Récupère les statistiques publiques des observations
 * @access  Public
 */
router.get(
  '/stats',
  observationController.getObservationStats
);

/**
 * @route   GET /api/v1/observations
 * @desc    Récupère la liste des observations avec filtres
 * @access  Public
 */
router.get(
  '/',
  getObservationsValidation,
  validate,
  observationController.getObservations
);

/**
 * @route   POST /api/v1/observations
 * @desc    Crée une nouvelle observation
 * @access  Private
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
 * @route   GET /api/v1/observations/:id
 * @desc    Récupère une observation par son ID
 * @access  Public
 */
router.get(
  '/:id',
  idParamValidation,
  validate,
  observationController.getObservationById
);

/**
 * @route   PUT /api/v1/observations/:id
 * @desc    Met à jour une observation
 * @access  Private (Propriétaire ou Admin)
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
 * @route   DELETE /api/v1/observations/:id
 * @desc    Supprime une observation
 * @access  Private (Propriétaire ou Admin)
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
 * @route   POST /api/v1/observations/:id/images
 * @desc    Ajoute une image à une observation
 * @access  Private (Propriétaire ou Admin)
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
 * @route   DELETE /api/v1/observations/:id/images/:imageId
 * @desc    Supprime une image d'une observation
 * @access  Private (Propriétaire ou Admin)
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
