import imageService from '../services/image.service.js';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response.js';

/**
 * Contrôleur pour la gestion des images avec Cloudinary
 */
class ImageController {
  /**
   * Upload une image pour une observation
   */
  async uploadImage(req, res, next) {
    try {
      const { observationId } = req.params;
      const userId = req.user._id;

      if (!req.file) {
        return errorResponse(res, 'Aucune image fournie', 400);
      }

      const Observation = (await import('../models/Observation.js')).default;
      const observation = await Observation.findById(observationId);

      if (!observation) {
        return notFoundResponse(res, 'Observation non trouvée');
      }

      if (observation.userId.toString() !== userId.toString()) {
        return errorResponse(res, 'Non autorisé', 403);
      }

      const imageData = await imageService.uploadImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        observationId
      );

      observation.images.push({
        publicId: imageData.publicId,
        url: imageData.url,
        size: imageData.size,
        format: imageData.format,
        width: imageData.width,
        height: imageData.height
      });
      await observation.save();

      return successResponse(res, imageData, 'Image uploadée avec succès', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Supprime une image
   */
  async deleteImage(req, res, next) {
    try {
      const { observationId } = req.params;
      const publicId = decodeURIComponent(req.params.publicId);
      const userId = req.user._id;
      const userRole = req.user.role;

      const Observation = (await import('../models/Observation.js')).default;
      const observation = await Observation.findById(observationId);

      if (!observation) {
        return notFoundResponse(res, 'Observation non trouvée');
      }

      if (observation.userId.toString() !== userId.toString() && userRole !== 'admin') {
        return errorResponse(res, 'Non autorisé', 403);
      }

      await imageService.deleteImage(publicId);

      observation.images = observation.images.filter(img => img.publicId !== publicId);
      await observation.save();

      return successResponse(res, {}, 'Image supprimée avec succès');
    } catch (error) {
      if (error.message === 'IMAGE_NOT_FOUND') {
        return notFoundResponse(res, 'Image non trouvée');
      }
      next(error);
    }
  }

  /**
   * Liste les images d'une observation
   */
  async listImages(req, res, next) {
    try {
      const { observationId } = req.params;

      const Observation = (await import('../models/Observation.js')).default;
      const observation = await Observation.findById(observationId);

      if (!observation) {
        return notFoundResponse(res, 'Observation non trouvée');
      }

      return successResponse(res, observation.images);
    } catch (error) {
      next(error);
    }
  }
}

export default new ImageController();
