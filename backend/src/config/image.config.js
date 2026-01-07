/**
 * Configuration for image processing and compression
 *
 * This module exports settings for image upload, compression quality,
 * maximum dimensions, and format-specific options.
 */
export const imageConfig = {
  // Compression quality (0-100)
  // 85 = excellent quality/size compromise
  quality: parseInt(process.env.IMAGE_QUALITY) || 85,

  // Maximum dimensions (pixels)
  maxWidth: parseInt(process.env.IMAGE_MAX_WIDTH) || 1920,
  maxHeight: parseInt(process.env.IMAGE_MAX_HEIGHT) || 1920,

  // Maximum original file size (bytes)
  maxFileSize: parseInt(process.env.IMAGE_MAX_SIZE) || 10 * 1024 * 1024, // 10MB

  // Accepted MIME formats
  allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],

  // Compression options per format
  jpeg: {
    quality: parseInt(process.env.JPEG_QUALITY) || 85,
    progressive: true, // Progressive loading
    mozjpeg: true // Better compression algorithm
  },

  png: {
    quality: parseInt(process.env.PNG_QUALITY) || 85,
    compressionLevel: 9, // Maximum compression (0-9)
    adaptiveFiltering: true
  },

  webp: {
    quality: parseInt(process.env.WEBP_QUALITY) || 85,
    effort: 6 // Quality/speed balance (0-6)
  },

  // Resizing options
  resize: {
    fit: 'inside', // Preserves aspect ratio
    withoutEnlargement: true // Does not upscale small images
  },

  // Verbose logging (useful for debugging)
  verbose: process.env.IMAGE_VERBOSE === 'true' || false
};

export default imageConfig;
