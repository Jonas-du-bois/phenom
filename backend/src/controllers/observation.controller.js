import observationService from '../services/observation.service.js';
import imageService from '../services/image.service.js';
import { successResponse, createdResponse, errorResponse } from '../utils/response.js';
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
   *
   * Supporte le paramètre optionnel `generateAiImage` (boolean) :
   * - Si true et aucune image fournie, génère une illustration via l'IA Gemini
   * - L'image générée sera marquée avec source: 'ai' dans la réponse
   */
  createObservation = asyncHandler(async (req, res) => {
    const { generateAiImage, ...observationData } = req.body;

    // Créer l'observation
    let observation = await observationService.createObservation(observationData, req.user._id);

    // Si demandé, générer une image IA (uniquement si aucune image n'est déjà présente)
    if (generateAiImage === true && (!observation.images || observation.images.length === 0)) {
      try {
        console.log(`🎨 Génération d'image IA demandée pour l'observation ${observation._id}`);

        const aiImage = await imageService.generateAiImage(observationData, observation._id.toString());

        // Ajouter l'image à l'observation
        observation = await observationService.updateObservation(observation._id, {
          images: [aiImage]
        });

        console.log(`✅ Image IA ajoutée à l'observation ${observation._id}`);
      } catch (aiError) {
        // Log l'erreur mais ne bloque pas la création de l'observation
        console.error('⚠️ Échec génération image IA (observation créée sans image):', aiError.message);
      }
    }

    return createdResponse(res, observation, 'Observation créée avec succès');
  });

  /**
   * Génère une image IA pour une observation existante
   * POST /observations/:id/generate-ai-image
   *
   * Nécessite d'être propriétaire de l'observation ou admin
   */
  generateAiImage = asyncHandler(async (req, res) => {
    const observationId = req.params.id;

    // Récupérer l'observation
    const observation = await observationService.getObservationById(observationId);

    if (!observation) {
      return errorResponse(res, 'Observation non trouvée', 404);
    }

    console.log(`🎨 Génération d'image IA demandée pour l'observation ${observationId}`);

    try {
      // Générer l'image IA
      const aiImage = await imageService.generateAiImage(
        {
          title: observation.title,
          description: observation.description,
          type: observation.type,
          tags: observation.tags,
          location: observation.location
        },
        observationId
      );

      // Ajouter l'image à la liste des images existantes
      const updatedImages = [...(observation.images || []), aiImage];

      const updatedObservation = await observationService.updateObservation(observationId, {
        images: updatedImages
      });

      console.log(`✅ Image IA générée et ajoutée à l'observation ${observationId}`);

      return successResponse(res, updatedObservation, 'Image IA générée avec succès');
    } catch (error) {
      console.error('❌ Échec génération image IA:', error.message);
      return errorResponse(res, `Échec de la génération d'image IA: ${error.message}`, 500);
    }
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
