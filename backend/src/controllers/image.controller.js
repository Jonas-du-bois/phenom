import imageService from '../services/image.service.js';
import {
  successResponse,
  errorResponse,
  notFoundResponse
} from '../utils/response.js';
import { publishObservationEvent } from '../config/websocket.js';

/**
 * Controller for image management with Cloudinary
 * Handles upload, update, delete, and listing of observation images
 */
class ImageController {
  /**
   * Uploads one or more images for an observation
   * POST /observations/:id/images
   */
  async uploadImage(req, res, next) {
    try {
      const { observationId } = req.params;
      const userId = req.user._id;

      // Handle multiple files
      const files = req.files || (req.file ? [req.file] : []);

      if (!files || files.length === 0) {
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

      // Upload all images
      const uploadedImages = [];

      for (const file of files) {
        const imageData = await imageService.uploadImage(
          file.buffer,
          file.originalname,
          file.mimetype,
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

        uploadedImages.push(imageData);
      }

      await observation.save();

      // Publish a WebSocket event to notify that the observation was updated with an image
      const populatedObservation = await Observation.findById(
        observationId
      ).populate('userId', 'name email avatar');
      publishObservationEvent(
        'observation:updated',
        populatedObservation.toObject()
      );

      const message =
        uploadedImages.length === 1
          ? 'Image uploadée avec succès'
          : `${uploadedImages.length} images uploadées avec succès`;

      return successResponse(res, uploadedImages, message, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes an image
   * DELETE /observations/:id/images/:publicId
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

      if (
        observation.userId.toString() !== userId.toString() &&
        userRole !== 'admin'
      ) {
        return errorResponse(res, 'Non autorisé', 403);
      }

      await imageService.deleteImage(publicId);

      observation.images = observation.images.filter(
        (img) => img.publicId !== publicId
      );
      await observation.save();

      // Publish a WebSocket event to notify that the observation was updated (image deleted)
      const populatedObservation = await Observation.findById(
        observationId
      ).populate('userId', 'name email avatar');
      publishObservationEvent(
        'observation:updated',
        populatedObservation.toObject()
      );

      return successResponse(res, {}, 'Image supprimée avec succès');
    } catch (error) {
      if (error.message === 'IMAGE_NOT_FOUND') {
        return notFoundResponse(res, 'Image non trouvée');
      }
      next(error);
    }
  }

  /**
   * Modifies/replaces an existing image
   * PUT /observations/:id/images/:publicId
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

      // Verify that the old image exists
      const oldImageIndex = observation.images.findIndex(
        (img) => img.publicId === oldPublicId
      );
      if (oldImageIndex === -1) {
        return notFoundResponse(res, 'Image non trouvée');
      }

      // Delete the old image on Cloudinary
      await imageService.deleteImage(oldPublicId);

      // Upload the new image
      const newImageData = await imageService.uploadImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        observationId
      );

      // Replace the old image with the new one in the array
      observation.images[oldImageIndex] = {
        publicId: newImageData.publicId,
        url: newImageData.url,
        size: newImageData.size,
        format: newImageData.format,
        width: newImageData.width,
        height: newImageData.height
      };
      await observation.save();

      // Publish a WebSocket event to notify that the observation was updated
      const populatedObservation = await Observation.findById(
        observationId
      ).populate('userId', 'name email avatar');
      publishObservationEvent(
        'observation:updated',
        populatedObservation.toObject()
      );

      return successResponse(res, newImageData, 'Image modifiée avec succès');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Lists images of an observation
   * GET /observations/:id/images
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
