/**
 * Image Handling Utilities for Cloudinary
 *
 * Provides functions for working with Cloudinary-hosted images.
 * Images are stored on Cloudinary with public URLs, eliminating
 * the need for authentication when loading images.
 *
 * @module utils/imageHelpers
 *
 * Features:
 * - Get image URLs with optional Cloudinary transformations
 * - Generate SVG placeholder images
 * - Validate image files before upload
 * - Create image previews from File objects
 * - Handle image loading errors gracefully
 */

import { countCachedImages } from "./avatarCache";

// ============================================================================
// CLOUDINARY IMAGE URL HANDLING
// ============================================================================

/**
 * Get a Cloudinary image URL with optional transformations
 * @param {Object} imageData - Image data object containing the Cloudinary URL
 * @param {Object} options - Transformation options
 * @param {number} options.width - Desired width
 * @param {number} options.height - Desired height
 * @param {string} options.crop - Crop mode (e.g., 'fill', 'fit', 'scale')
 * @returns {string} Cloudinary URL (possibly with transformations) or placeholder
 */
export const getImageUrl = (imageData, options = {}) => {
  // Si imageData est undefined/null, retourner placeholder
  if (!imageData) {
    return getPlaceholderImage("Image non disponible");
  }

  // Récupérer l'URL depuis les données de l'image
  const url = imageData?.url;

  if (!url) {
    return getPlaceholderImage("Image non disponible");
  }

  // Si des transformations sont demandées, modifier l'URL Cloudinary
  if (options.width || options.height) {
    const parts = url.split("/upload/");
    if (parts.length === 2) {
      const transforms = [];
      if (options.width) transforms.push(`w_${options.width}`);
      if (options.height) transforms.push(`h_${options.height}`);
      if (options.crop) transforms.push(`c_${options.crop}`);
      return `${parts[0]}/upload/${transforms.join(",")}/${parts[1]}`;
    }
  }

  return url;
};

/**
 * Load all images for an observation
 * With Cloudinary, URLs are already public - no API call needed!
 * This function is kept for backwards compatibility and logging.
 * @param {Object} observation - Observation containing images array
 * @returns {Promise<void>}
 */
export const loadImagesForObservation = async (observation) => {
  // Plus rien à faire, les URLs sont déjà publiques
  console.log(
    `📸 ${observation.images?.length || 0} images Cloudinary pour observation ${observation._id}`,
  );
};

// ============================================================================
// PLACEHOLDER IMAGES
// ============================================================================

/**
 * Generate an inline SVG placeholder image
 * Used when actual images fail to load or are unavailable
 * @param {string} text - Text to display in placeholder (default: "Image")
 * @param {number} width - Image width in pixels (default: 400)
 * @param {number} height - Image height in pixels (default: 300)
 * @returns {string} Data URL containing SVG placeholder
 */
export const getPlaceholderImage = (
  text = "Image",
  width = 400,
  height = 300,
) => {
  return `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><rect width="${width}" height="${height}" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%239ca3af">${encodeURIComponent(text)}</text></svg>`;
};

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Error handler for image loading failures
 * Replaces broken image with placeholder and adds visual indicator
 * @param {Event} event - Image error event
 */
export const handleImageError = (event) => {
  console.warn("❌ Image blob non disponible");
  event.target.src = getPlaceholderImage("Image non disponible");
  event.target.classList.add("opacity-50");
};

// ============================================================================
// FILE VALIDATION
// ============================================================================

/**
 * Validate an image file before upload
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @param {number} options.maxSize - Max file size in bytes (default: 10MB)
 * @param {string[]} options.allowedTypes - Allowed MIME types (default: jpeg, png, webp)
 * @returns {Object} { valid: boolean, error: string|null }
 */
export const validateImageFile = (file, options = {}) => {
  const {
    maxSize = 10 * 1024 * 1024, // 10 MB par défaut
    allowedTypes = ["image/jpeg", "image/png", "image/webp"],
  } = options;

  if (!file) {
    return { valid: false, error: "Aucun fichier sélectionné" };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Format non valide. Formats acceptés: ${allowedTypes.map((t) => t.split("/")[1].toUpperCase()).join(", ")}`,
    };
  }

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Fichier trop volumineux. Taille maximale: ${maxSizeMB} MB`,
    };
  }

  return { valid: true, error: null };
};

/**
 * Create a preview of a selected image file
 * Uses FileReader to generate a data URL for immediate display
 * @param {File} file - Image file to preview
 * @returns {Promise<string>} Data URL of the image
 */
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// ============================================================================
// CACHE UTILITIES
// ============================================================================

/**
 * Get the number of cached avatar images
 * Wraps the avatarCache countCachedImages with error handling
 * @returns {Promise<number>} Count of cached images (0 on error)
 */
export const getCachedImageCount = async () => {
  try {
    const n = await countCachedImages();
    return Number(n) || 0;
  } catch (err) {
    console.warn("Erreur lors du comptage du cache d'avatars:", err);
    return 0;
  }
};
