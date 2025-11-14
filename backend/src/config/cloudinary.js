import { v2 as cloudinary } from 'cloudinary';

/**
 * Configuration Cloudinary pour le stockage des images
 * Remplace GridFS pour plus de performance et simplicité
 */

// Fonction d'initialisation de la configuration
const initCloudinary = () => {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error('CLOUDINARY_URL non défini dans .env');
  }

  // Parser l'URL Cloudinary (format: cloudinary://api_key:api_secret@cloud_name)
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);

  if (!match) {
    throw new Error('Format CLOUDINARY_URL invalide. Format attendu: cloudinary://api_key:api_secret@cloud_name');
  }

  const [, api_key, api_secret, cloud_name] = match;

  // Configuration avec les credentials extraits
  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true // Toujours utiliser HTTPS
  });

  console.log('✅ Cloudinary configuré avec succès');
  console.log('   Cloud Name:', cloud_name);
  console.log('   API Key:', api_key ? `${api_key.substring(0, 6)}...` : 'MANQUANT');
};

// Variable pour tracker si déjà initialisé
let isInitialized = false;

// Fonction pour s'assurer que Cloudinary est initialisé
const ensureInitialized = () => {
  if (!isInitialized && process.env.CLOUDINARY_URL) {
    initCloudinary();
    isInitialized = true;
  } else if (!process.env.CLOUDINARY_URL) {
    throw new Error('CLOUDINARY_URL non défini - impossible d\'initialiser Cloudinary');
  }
};

// Initialiser automatiquement si CLOUDINARY_URL est déjà défini
if (process.env.CLOUDINARY_URL) {
  initCloudinary();
  isInitialized = true;
}

/**
 * Upload une image sur Cloudinary
 * @param {Buffer} buffer - Buffer de l'image
 * @param {Object} options - Options d'upload
 * @returns {Promise<Object>} Résultat de l'upload
 */
export const uploadImage = async (buffer, options = {}) => {
  ensureInitialized(); // S'assurer que Cloudinary est configuré

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'phenom/observations',
        public_id: options.public_id,
        transformation: [
          {
            width: options.maxWidth || 1920,
            height: options.maxHeight || 1920,
            crop: 'limit',
            quality: options.quality || 85,
            fetch_format: 'auto' // Format optimal automatique
          }
        ],
        resource_type: 'image'
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Supprime une image de Cloudinary
 * @param {string} publicId - Public ID de l'image
 * @returns {Promise<Object>} Résultat de la suppression
 */
export const deleteImage = async (publicId) => {
  ensureInitialized(); // S'assurer que Cloudinary est configuré

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Erreur lors de la suppression: ${error.message}`);
  }
};

/**
 * Supprime plusieurs images de Cloudinary
 * @param {Array<string>} publicIds - Public IDs des images
 * @returns {Promise<Object>} Résultat de la suppression
 */
export const deleteImages = async (publicIds) => {
  ensureInitialized(); // S'assurer que Cloudinary est configuré

  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    throw new Error(`Erreur lors de la suppression multiple: ${error.message}`);
  }
};

/**
 * Génère une URL optimisée pour une image
 * @param {string} publicId - Public ID de l'image
 * @param {Object} options - Options de transformation
 * @returns {string} URL de l'image
 */
export const getImageUrl = (publicId, options = {}) => {
  ensureInitialized(); // S'assurer que Cloudinary est configuré

  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || 'fill',
    quality: options.quality || 'auto',
    fetch_format: 'auto',
    secure: true
  });
};

console.log('☁️  Cloudinary configuré avec succès');

export default cloudinary;
