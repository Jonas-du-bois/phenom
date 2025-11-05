import multer from 'multer';
import { imageConfig } from './image.config.js';

/**
 * Configuration Multer simplifiée pour upload d'images
 * Stockage en mémoire → compression → GridFS
 */

// Validation du type MIME (exportée pour tests)
export const isImageTypeAllowed = (mimetype) => {
  return imageConfig.allowedFormats.includes(mimetype);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    isImageTypeAllowed(file.mimetype)
      ? cb(null, true)
      : cb(new Error(`Type non autorisé: ${file.mimetype}`), false);
  },
  limits: {
    fileSize: imageConfig.maxFileSize,
    files: 1
  }
});

export default upload;
