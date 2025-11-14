import { uploadImage, deleteImage, deleteImages, getImageUrl } from '../config/cloudinary.js';
import imageCompressor from '../utils/compress-image.js';

/**
 * Service de gestion des images avec Cloudinary
 * Remplace GridFS pour plus de performance et simplicité
 */
class ImageService {
  /**
   * Upload une image sur Cloudinary (avec compression automatique)
   */
  async uploadImage(buffer, filename, mimetype, observationId) {
    try {
      const compressed = await imageCompressor.compress(buffer, mimetype);

      const result = await uploadImage(compressed.buffer, {
        folder: 'phenom/observations',
        public_id: `${observationId}_${Date.now()}`,
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 85
      });

      return {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        observationId,
        compression: {
          originalSize: compressed.metadata.originalSize,
          compressedSize: compressed.metadata.compressedSize,
          ratio: compressed.metadata.compressionRatio,
          savedBytes: compressed.metadata.savedBytes
        }
      };
    } catch (error) {
      throw new Error(`Erreur lors de l'upload: ${error.message}`);
    }
  }

  /**
   * Supprime une image de Cloudinary
   */
  async deleteImage(publicId) {
    try {
      const result = await deleteImage(publicId);

      if (result.result !== 'ok' && result.result !== 'not found') {
        throw new Error('IMAGE_DELETE_FAILED');
      }
    } catch (error) {
      if (error.message === 'IMAGE_DELETE_FAILED') {
        throw error;
      }
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  /**
   * Supprime plusieurs images
   */
  async deleteMultipleImages(publicIds) {
    try {
      if (!publicIds || publicIds.length === 0) {
        return 0;
      }

      const result = await deleteImages(publicIds);
      return result.deleted ? Object.keys(result.deleted).length : 0;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression multiple: ${error.message}`);
    }
  }

  /**
   * Génère une URL optimisée
   */
  getImageUrl(publicId, options = {}) {
    return getImageUrl(publicId, options);
  }
}

export default new ImageService();
