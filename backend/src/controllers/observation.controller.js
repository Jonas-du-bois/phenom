import observationService from '../services/observation.service.js';
import { successResponse, createdResponse, errorResponse, notFoundResponse } from '../utils/response.js';
import { paginatedResponse } from '../utils/pagination.js';

/**
 * Contrôleur des observations
 */
class ObservationController {
  /**
   * Récupère la liste des observations
   * GET /observations
   */
  async getObservations(req, res, next) {
    try {
      const { observations, pagination } = await observationService.getObservations(req.query);
      
      return res.status(200).json(
        paginatedResponse(observations, pagination.total, pagination.page, pagination.limit)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupère une observation par son ID
   * GET /observations/:id
   */
  async getObservationById(req, res, next) {
    try {
      const observation = await observationService.getObservationById(req.params.id);
      
      return successResponse(res, observation);
    } catch (error) {
      if (error.message === 'OBSERVATION_NOT_FOUND') {
        return notFoundResponse(res, 'Observation non trouvée');
      }
      next(error);
    }
  }

  /**
   * Crée une nouvelle observation
   * POST /observations
   */
  async createObservation(req, res, next) {
    try {
      const observation = await observationService.createObservation(req.body, req.user._id);
      
      return createdResponse(res, observation, 'Observation créée avec succès');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Met à jour une observation
   * PUT /observations/:id
   */
  async updateObservation(req, res, next) {
    try {
      const observation = await observationService.updateObservation(req.params.id, req.body);
      
      return successResponse(res, observation, 'Observation mise à jour avec succès');
    } catch (error) {
      if (error.message === 'OBSERVATION_NOT_FOUND') {
        return notFoundResponse(res, 'Observation non trouvée');
      }
      next(error);
    }
  }

  /**
   * Supprime une observation
   * DELETE /observations/:id
   */
  async deleteObservation(req, res, next) {
    try {
      await observationService.deleteObservation(req.params.id);
      
      return successResponse(res, null, 'Observation supprimée avec succès');
    } catch (error) {
      if (error.message === 'OBSERVATION_NOT_FOUND') {
        return notFoundResponse(res, 'Observation non trouvée');
      }
      next(error);
    }
  }

  /**
   * Ajoute une image à une observation
   * POST /observations/:id/images
   */
  async addImage(req, res, next) {
    try {
      if (!req.file) {
        return errorResponse(res, 'Aucun fichier fourni', 400);
      }

      const observationId = req.params.id;
      const imageData = await observationService.addImage(observationId, req.file);
      
      return createdResponse(res, imageData, 'Image ajoutée avec succès');
    } catch (error) {
      if (error.message === 'OBSERVATION_NOT_FOUND') {
        return notFoundResponse(res, 'Observation non trouvée');
      }
      next(error);
    }
  }

  /**
   * Supprime une image d'une observation
   * DELETE /observations/:id/images/:imageId
   */
  async deleteImage(req, res, next) {
    try {
      const { id: observationId, imageId } = req.params;
      await observationService.deleteImage(observationId, imageId);
      
      return successResponse(res, null, 'Image supprimée avec succès');
    } catch (error) {
      if (error.message === 'OBSERVATION_NOT_FOUND') {
        return notFoundResponse(res, 'Observation non trouvée');
      }
      if (error.message === 'IMAGE_NOT_FOUND') {
        return notFoundResponse(res, 'Image non trouvée');
      }
      next(error);
    }
  }

  /**
   * Recherche d'observations à proximité
   * GET /observations/nearby
   */
  async getNearbyObservations(req, res, next) {
    try {
      const { latitude, longitude, radius = 10 } = req.query;

      if (!latitude || !longitude) {
        return errorResponse(res, 'Latitude et longitude sont requises', 400);
      }

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
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupère les statistiques publiques des observations
   * GET /observations/stats
   */
  async getObservationStats(req, res, next) {
    try {
      const stats = await observationService.getObservationStats();
      
      return successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

export default new ObservationController();
