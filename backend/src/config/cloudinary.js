import { v2 as cloudinary } from 'cloudinary';

/**
 * @file cloudinary.js
 * @description Cloudinary configuration for image storage.
 * Replaces GridFS for better performance and simplicity.
 */

/**
 * Initializes Cloudinary configuration.
 * Parses CLOUDINARY_URL environment variable.
 */
const initCloudinary = () => {
  if (!process.env.CLOUDINARY_URL) {
    throw new Error('CLOUDINARY_URL is not defined in .env');
  }

  // Parse Cloudinary URL (format: cloudinary://api_key:api_secret@cloud_name)
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  const match = cloudinaryUrl.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);

  if (!match) {
    throw new Error('Invalid CLOUDINARY_URL format. Expected: cloudinary://api_key:api_secret@cloud_name');
  }

  const [, api_key, api_secret, cloud_name] = match;

  // Configuration with extracted credentials
  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true // Always use HTTPS
  });

  console.log('✅ Cloudinary configured successfully');
  console.log('   Cloud Name:', cloud_name);
  console.log('   API Key:', api_key ? `${api_key.substring(0, 6)}...` : 'MISSING');
};

// Tracks initialization state
let isInitialized = false;

/**
 * Ensures Cloudinary is initialized before use.
 */
const ensureInitialized = () => {
  if (!isInitialized && process.env.CLOUDINARY_URL) {
    initCloudinary();
    isInitialized = true;
  } else if (!process.env.CLOUDINARY_URL) {
    throw new Error('CLOUDINARY_URL not defined - cannot initialize Cloudinary');
  }
};

// Automatically initialize if CLOUDINARY_URL is already defined
if (process.env.CLOUDINARY_URL) {
  initCloudinary();
  isInitialized = true;
}

/**
 * Uploads an image to Cloudinary.
 * @param {Buffer} buffer - Image buffer.
 * @param {Object} options - Upload options.
 * @returns {Promise<Object>} Upload result.
 */
export const uploadImage = async (buffer, options = {}) => {
  ensureInitialized();

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
            fetch_format: 'auto' // Optimal format automatic
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
 * Deletes an image from Cloudinary.
 * @param {string} publicId - Public ID of the image.
 * @returns {Promise<Object>} Deletion result.
 */
export const deleteImage = async (publicId) => {
  ensureInitialized();

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(`Error during deletion: ${error.message}`);
  }
};

/**
 * Deletes multiple images from Cloudinary.
 * @param {Array<string>} publicIds - Public IDs of the images.
 * @returns {Promise<Object>} Deletion result.
 */
export const deleteImages = async (publicIds) => {
  ensureInitialized();

  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    throw new Error(`Error during multiple deletion: ${error.message}`);
  }
};

/**
 * Generates an optimized URL for an image.
 * @param {string} publicId - Public ID of the image.
 * @param {Object} options - Transformation options.
 * @returns {string} Image URL.
 */
export const getImageUrl = (publicId, options = {}) => {
  ensureInitialized();

  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || 'fill',
    quality: options.quality || 'auto',
    fetch_format: 'auto',
    secure: true
  });
};

console.log('☁️  Cloudinary configured successfully');

export default cloudinary;
