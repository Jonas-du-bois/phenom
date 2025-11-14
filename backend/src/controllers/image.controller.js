import imageService from '../services/image.service.js';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response.js';
import { publishObservationEvent } from '../config/websocket.js';

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

      // Publier un événement WebSocket pour notifier que l'observation a été mise à jour avec une image
      const populatedObservation = await Observation.findById(observationId).populate('userId', 'name email');
      publishObservationEvent('observation:updated', populatedObservation.toObject());

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

      // Publier un événement WebSocket pour notifier que l'observation a été mise à jour (image supprimée)
      const populatedObservation = await Observation.findById(observationId).populate('userId', 'name email');
      publishObservationEvent('observation:updated', populatedObservation.toObject());

      return successResponse(res, {}, 'Image supprimée avec succès');
    } catch (error) {
      if (error.message === 'IMAGE_NOT_FOUND') {
        return notFoundResponse(res, 'Image non trouvée');
      }
      next(error);
    }
  }

  /**
   * Modifie/remplace une image existante
   */
  async updateImage(req, res, next) {
    try {
      const { observationId } = req.params;
      const oldPublicId = decodeURIComponent(req.params.publicId);
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

      // Vérifier que l'ancienne image existe
      const oldImageIndex = observation.images.findIndex(img => img.publicId === oldPublicId);
      if (oldImageIndex === -1) {
        return notFoundResponse(res, 'Image non trouvée');
      }

      // Supprimer l'ancienne image sur Cloudinary
      await imageService.deleteImage(oldPublicId);

      // Uploader la nouvelle image
      const newImageData = await imageService.uploadImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        observationId
      );

      // Remplacer l'ancienne image par la nouvelle dans le tableau
      observation.images[oldImageIndex] = {
        publicId: newImageData.publicId,
        url: newImageData.url,
        size: newImageData.size,
        format: newImageData.format,
        width: newImageData.width,
        height: newImageData.height
      };
      await observation.save();

      // Publier un événement WebSocket pour notifier que l'observation a été mise à jour
      const populatedObservation = await Observation.findById(observationId).populate('userId', 'name email');
      publishObservationEvent('observation:updated', populatedObservation.toObject());

      return successResponse(res, newImageData, 'Image modifiée avec succès');
    } catch (error) {
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
