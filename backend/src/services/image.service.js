import { Readable } from 'stream';
import { getGridFSBucket } from '../config/gridfs.js';
import { ObjectId } from 'mongodb';

/**
 * Service de gestion des images avec GridFS
 */
class ImageService {
  /**
   * Upload une image dans GridFS
   * @param {Buffer} buffer - Buffer de l'image
   * @param {string} filename - Nom du fichier
   * @param {string} mimetype - Type MIME
   * @param {string} observationId - ID de l'observation
   * @returns {Promise<Object>} Informations du fichier uploadé
   */
  async uploadImage(buffer, filename, mimetype, observationId) {
    try {
      const bucket = getGridFSBucket();
      
      // Créer un stream depuis le buffer
      const readableStream = new Readable();
      readableStream.push(buffer);
      readableStream.push(null);

      // Upload dans GridFS
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: mimetype,
        metadata: {
          observationId,
          uploadedAt: new Date()
        }
      });

      return new Promise((resolve, reject) => {
        readableStream
          .pipe(uploadStream)
          .on('error', reject)
          .on('finish', () => {
            resolve({
              id: uploadStream.id.toString(),
              filename: uploadStream.filename,
              contentType: mimetype,
              size: uploadStream.length,
              observationId
            });
          });
      });
    } catch (error) {
      throw new Error(`Erreur lors de l'upload: ${error.message}`);
    }
  }

  /**
   * Récupère une image depuis GridFS
   * @param {string} imageId - ID de l'image
   * @returns {Promise<Stream>} Stream de l'image
   */
  async getImage(imageId) {
    try {
      const bucket = getGridFSBucket();
      
      // Vérifier que l'image existe
      const files = await bucket.find({ _id: new ObjectId(imageId) }).toArray();
      
      if (!files || files.length === 0) {
        throw new Error('IMAGE_NOT_FOUND');
      }

      const file = files[0];
      const downloadStream = bucket.openDownloadStream(new ObjectId(imageId));

      return {
        stream: downloadStream,
        contentType: file.contentType || 'image/jpeg',
        filename: file.filename
      };
    } catch (error) {
      if (error.message === 'IMAGE_NOT_FOUND') {
        throw error;
      }
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }
  }

  /**
   * Supprime une image de GridFS
   * @param {string} imageId - ID de l'image
   * @param {string} observationId - ID de l'observation (pour vérification)
   * @returns {Promise<void>}
   */
  async deleteImage(imageId, observationId) {
    try {
      const bucket = getGridFSBucket();
      
      // Vérifier que l'image existe et appartient à l'observation
      const files = await bucket.find({ 
        _id: new ObjectId(imageId),
        'metadata.observationId': observationId
      }).toArray();
      
      if (!files || files.length === 0) {
        throw new Error('IMAGE_NOT_FOUND');
      }

      await bucket.delete(new ObjectId(imageId));
    } catch (error) {
      if (error.message === 'IMAGE_NOT_FOUND') {
        throw error;
      }
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  /**
   * Supprime toutes les images d'une observation
   * @param {string} observationId - ID de l'observation
   * @returns {Promise<number>} Nombre d'images supprimées
   */
  async deleteAllImagesForObservation(observationId) {
    try {
      const bucket = getGridFSBucket();
      
      // Trouver toutes les images de l'observation
      const files = await bucket.find({ 
        'metadata.observationId': observationId 
      }).toArray();

      // Supprimer chaque image
      for (const file of files) {
        await bucket.delete(file._id);
      }

      return files.length;
    } catch (error) {
      throw new Error(`Erreur lors de la suppression des images: ${error.message}`);
    }
  }

  /**
   * Liste les images d'une observation
   * @param {string} observationId - ID de l'observation
   * @returns {Promise<Array>} Liste des images
   */
  async listImagesForObservation(observationId) {
    try {
      const bucket = getGridFSBucket();
      
      const files = await bucket.find({ 
        'metadata.observationId': observationId 
      }).toArray();

      return files.map(file => ({
        id: file._id.toString(),
        filename: file.filename,
        contentType: file.contentType,
        size: file.length,
        uploadedAt: file.metadata.uploadedAt
      }));
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des images: ${error.message}`);
    }
  }
}

export default new ImageService();
