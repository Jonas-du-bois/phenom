/**
 * Configuration pour le traitement et la compression d'images
 */
export const imageConfig = {
  // Qualité de compression (0-100)
  // 85 = excellent compromis qualité/taille
  quality: parseInt(process.env.IMAGE_QUALITY) || 85,

  // Dimensions maximales (pixels)
  maxWidth: parseInt(process.env.IMAGE_MAX_WIDTH) || 1920,
  maxHeight: parseInt(process.env.IMAGE_MAX_HEIGHT) || 1920,

  // Taille maximale du fichier original (bytes)
  maxFileSize: parseInt(process.env.IMAGE_MAX_SIZE) || 10 * 1024 * 1024, // 10MB

  // Formats MIME acceptés
  allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],

  // Options de compression par format
  jpeg: {
    quality: parseInt(process.env.JPEG_QUALITY) || 85,
    progressive: true,      // Chargement progressif
    mozjpeg: true          // Meilleur algorithme de compression
  },

  png: {
    quality: parseInt(process.env.PNG_QUALITY) || 85,
    compressionLevel: 9,   // Maximum compression (0-9)
    adaptiveFiltering: true
  },

  webp: {
    quality: parseInt(process.env.WEBP_QUALITY) || 85,
    effort: 6              // Balance qualité/vitesse (0-6)
  },

  // Redimensionnement
  resize: {
    fit: 'inside',         // Garde le ratio d'aspect
    withoutEnlargement: true // N'agrandit pas les petites images
  },

  // Verbose logging (utile pour debug)
  verbose: process.env.IMAGE_VERBOSE === 'true' || false
};

export default imageConfig;
