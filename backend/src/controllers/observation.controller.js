import observationService from '../services/observation.service.js';
import { successResponse, createdResponse } from '../utils/response.js';
import { paginatedResponse } from '../utils/pagination.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Contrôleur des observations
 */
class ObservationController {
  /**
   * Récupère la liste des observations
   * GET /observations
   */
  getObservations = asyncHandler(async (req, res) => {
    const { observations, pagination } = await observationService.getObservations(req.query);
    return res.status(200).json(
      paginatedResponse(observations, pagination.total, pagination.page, pagination.limit)
    );
  });

  /**
   * Récupère une observation par son ID
   * GET /observations/:id
   */
  getObservationById = asyncHandler(async (req, res) => {
    const observation = await observationService.getObservationById(req.params.id);
    return successResponse(res, observation);
  });

  /**
   * Crée une nouvelle observation
   * POST /observations
   */
  createObservation = asyncHandler(async (req, res) => {
    const observation = await observationService.createObservation(req.body, req.user._id);
    return createdResponse(res, observation, 'Observation créée avec succès');
  });

  /**
   * Met à jour une observation
   * PUT /observations/:id
   */
  updateObservation = asyncHandler(async (req, res) => {
    // Whitelist des champs modifiables (userId ne doit pas être modifiable)
    const allowedFields = ['title', 'description', 'date', 'location', 'type', 'tags', 'images'];
    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const observation = await observationService.updateObservation(req.params.id, updateData);
    return successResponse(res, observation, 'Observation mise à jour avec succès');
  });

  /**
   * Supprime une observation
   * DELETE /observations/:id
   */
  deleteObservation = asyncHandler(async (req, res) => {
    const observationId = req.params.id;
    await observationService.deleteObservation(observationId);
    return successResponse(res, {}, 'Observation supprimée avec succès');
  });

  /**
   * Recherche d'observations à proximité
   * GET /observations/nearby
   */
  getNearbyObservations = asyncHandler(async (req, res) => {
    const { latitude, longitude, radius = 10 } = req.query;

    const result = await observationService.getNearbyObservations(
      latitude,
      longitude,
      radius,
      req.query
    );

    return res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  });

  /**
   * Récupère les statistiques publiques des observations
   * GET /observations/stats
   */
  getObservationStats = asyncHandler(async (req, res) => {
    const stats = await observationService.getObservationStats();
    return successResponse(res, stats);
  });

  /**
   * Récupère les types d'observations les plus populaires
   * GET /observations/popular-types
   */
  getPopularTypes = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 6;
    const popularTypes = await observationService.getPopularObservationTypes(limit);
    return successResponse(res, popularTypes);
  });
}

export default new ObservationController();
