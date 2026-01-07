import observationService from '../services/observation.service.js';
import imageService from '../services/image.service.js';
import {
  successResponse,
  createdResponse,
  errorResponse
} from '../utils/response.js';
import { paginatedResponse } from '../utils/pagination.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Observation controller
 * Handles CRUD operations and queries for UFO/phenomena observations
 */
class ObservationController {
  /**
   * Retrieves the list of observations
   * GET /observations
   */
  getObservations = asyncHandler(async (req, res) => {
    const { data: observations, pagination } =
      await observationService.getObservations(req.query);
    return res
      .status(200)
      .json(
        paginatedResponse(
          observations,
          pagination.total,
          pagination.page || 1,
          pagination.limit
        )
      );
  });

  /**
   * Retrieves an observation by its ID
   * GET /observations/:id
   */
  getObservationById = asyncHandler(async (req, res) => {
    const observation = await observationService.getObservationById(
      req.params.id
    );
    return successResponse(res, observation);
  });

  /**
   * Creates a new observation
   * POST /observations
   *
   * Supports the optional `generateAiImage` parameter (boolean):
   * - If true and no image provided, generates an AI illustration via Gemini
   * - The generated image will be marked with source: 'ai' in the response
   */
  createObservation = asyncHandler(async (req, res) => {
    const { generateAiImage, ...observationData } = req.body;

    // Create the observation
    let observation = await observationService.createObservation(
      observationData,
      req.user._id
    );

    // If requested, generate an AI image (only if no image is already present)
    if (
      generateAiImage === true &&
      (!observation.images || observation.images.length === 0)
    ) {
      try {
        console.log(
          `🎨 Génération d'image IA demandée pour l'observation ${observation._id}`
        );

        const aiImage = await imageService.generateAiImage(
          observationData,
          observation._id.toString()
        );

        // Add the image to the observation
        observation = await observationService.updateObservation(
          observation._id,
          {
            images: [aiImage]
          }
        );

        console.log(`✅ Image IA ajoutée à l'observation ${observation._id}`);
      } catch (aiError) {
        // Log the error but don't block observation creation
        console.error(
          '⚠️ Échec génération image IA (observation créée sans image):',
          aiError.message
        );
      }
    }

    return createdResponse(res, observation, 'Observation créée avec succès');
  });

  /**
   * Generates an AI image for an existing observation
   * POST /observations/:id/generate-ai-image
   *
   * Requires being the observation owner or admin
   */
  generateAiImage = asyncHandler(async (req, res) => {
    const observationId = req.params.id;

    // Retrieve the observation
    const observation = await observationService.getObservationById(
      observationId
    );

    if (!observation) {
      return errorResponse(res, 'Observation non trouvée', 404);
    }

    console.log(
      `🎨 Génération d'image IA demandée pour l'observation ${observationId}`
    );

    try {
      // Generate the AI image
      const aiImage = await imageService.generateAiImage(
        {
          location: observation.location,
          description: observation.description,
          phenomena: observation.phenomena,
          ufoShapes: observation.ufoShapes,
          tags: observation.tags
        },
        observationId
      );

      // Add the image to the existing images list
      const updatedImages = [...(observation.images || []), aiImage];

      const updatedObservation = await observationService.updateObservation(
        observationId,
        {
          images: updatedImages
        }
      );

      console.log(
        `✅ Image IA générée et ajoutée à l'observation ${observationId}`
      );

      return successResponse(
        res,
        updatedObservation,
        'Image IA générée avec succès'
      );
    } catch (error) {
      console.error('❌ Échec génération image IA:', error.message);
      return errorResponse(
        res,
        `Échec de la génération d'image IA: ${error.message}`,
        500
      );
    }
  });

  /**
   * Updates an observation
   * PUT /observations/:id
   */
  updateObservation = asyncHandler(async (req, res) => {
    // Whitelist of editable fields (userId must not be editable)
    const allowedFields = [
      'date',
      'time',
      'location',
      'country',
      'state',
      'description',
      'credibility',
      'strangeness',
      'duration',
      'locale',
      'coordinates',
      'observerTypes',
      'ufoShapes',
      'phenomena',
      'tags',
      'images'
    ];
    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    const observation = await observationService.updateObservation(
      req.params.id,
      updateData
    );
    return successResponse(
      res,
      observation,
      'Observation mise à jour avec succès'
    );
  });

  /**
   * Deletes an observation
   * DELETE /observations/:id
   */
  deleteObservation = asyncHandler(async (req, res) => {
    const observationId = req.params.id;
    await observationService.deleteObservation(observationId);
    return successResponse(res, {}, 'Observation supprimée avec succès');
  });

  /**
   * Searches for nearby observations
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
   * Retrieves public observation statistics
   * GET /observations/stats
   */
  getObservationStats = asyncHandler(async (req, res) => {
    const stats = await observationService.getObservationStats();
    return successResponse(res, stats);
  });

  /**
   * Retrieves the most popular observation types
   * GET /observations/popular-types
   */
  getPopularTypes = asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit) || 6;
    const popularTypes = await observationService.getPopularObservationTypes(
      limit
    );
    return successResponse(res, popularTypes);
  });
}

export default new ObservationController();
