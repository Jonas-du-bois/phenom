import imageService from '../services/image.service.js';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response.js';

/**
 * Contrôleur pour la gestion des images
 */
class ImageController {
  /**
   * Upload une image pour une observation
   * POST /api/v1/observations/:observationId/images
   */
  async uploadImage(req, res, next) {
    try {
      const { observationId } = req.params;
      const userId = req.user._id;

      // Vérifier qu'un fichier a été uploadé
      if (!req.file) {
        return errorResponse(res, 'Aucune image fournie', 400);
      }

      // Vérifier que l'observation existe et appartient à l'utilisateur
      const Observation = (await import('../models/Observation.js')).default;
      const observation = await Observation.findById(observationId);

      if (!observation) {
        return notFoundResponse(res, 'Observation non trouvée');
      }

      if (observation.userId.toString() !== userId.toString()) {
        return errorResponse(res, 'Non autorisé', 403);
      }

      // Upload l'image
      const imageData = await imageService.uploadImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        observationId
      );

      // Ajouter l'ID de l'image à l'observation
      observation.images.push(imageData.id);
      await observation.save();

      return successResponse(res, {
        ...imageData,
        url: `/api/v1/images/${imageData.id}`
      }, 'Image uploadée avec succès', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Récupère une image
   * GET /api/v1/images/:imageId
   */
  async getImage(req, res, next) {
    try {
      const { imageId } = req.params;

      const { stream, contentType, filename } = await imageService.getImage(imageId);

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      
      stream.pipe(res);
    } catch (error) {
      if (error.message === 'IMAGE_NOT_FOUND') {
        return notFoundResponse(res, 'Image non trouvée');
      }
      next(error);
    }
  }

  /**
   * Supprime une image
   * DELETE /api/v1/observations/:observationId/images/:imageId
   */
  async deleteImage(req, res, next) {
    try {
      const { observationId, imageId } = req.params;
      const userId = req.user._id;

      // Vérifier que l'observation existe et appartient à l'utilisateur
      const Observation = (await import('../models/Observation.js')).default;
      const observation = await Observation.findById(observationId);

      if (!observation) {
        return notFoundResponse(res, 'Observation non trouvée');
      }

      if (observation.userId.toString() !== userId.toString()) {
        return errorResponse(res, 'Non autorisé', 403);
      }

      // Supprimer l'image
      await imageService.deleteImage(imageId, observationId);

      // Retirer l'ID de l'image de l'observation
      observation.images = observation.images.filter(id => id !== imageId);
      await observation.save();

      return res.status(204).send();
    } catch (error) {
      if (error.message === 'IMAGE_NOT_FOUND') {
        return notFoundResponse(res, 'Image non trouvée');
      }
      next(error);
    }
  }

  /**
   * Liste les images d'une observation
   * GET /api/v1/observations/:observationId/images
   */
  async listImages(req, res, next) {
    try {
      const { observationId } = req.params;

      // Vérifier que l'observation existe
      const Observation = (await import('../models/Observation.js')).default;
      const observation = await Observation.findById(observationId);

      if (!observation) {
        return notFoundResponse(res, 'Observation non trouvée');
      }

      const images = await imageService.listImagesForObservation(observationId);

      // Ajouter les URLs
      const imagesWithUrls = images.map(img => ({
        ...img,
        url: `/api/v1/images/${img.id}`
      }));

      return successResponse(res, imagesWithUrls);
    } catch (error) {
      next(error);
    }
  }
}

export default new ImageController();
