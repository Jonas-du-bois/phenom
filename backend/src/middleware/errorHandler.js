import { CustomError } from '../utils/errors.js';

/**
 * Centralized error handling middleware
 * Catches and formats all errors thrown in the application
 */
export const errorHandler = (err, req, res, _next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Handle custom errors
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error.message = 'Erreur de validation';
    return res.status(400).json({
      success: false,
      error: error.message,
      details: messages
    });
  }

  // Duplication error (unique key)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error.message = `${field} existe déjà`;
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  // Mongoose cast error (invalid ID)
  if (err.name === 'CastError') {
    error.message = 'Ressource non trouvée';
    return res.status(404).json({
      success: false,
      error: error.message
    });
  }

  // JWT error
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token invalide';
    return res.status(401).json({
      success: false,
      error: error.message
    });
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expiré';
    return res.status(401).json({
      success: false,
      error: error.message
    });
  }

  // Multer error (file upload)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error.message = 'Fichier trop volumineux';
    } else {
      error.message = 'Erreur lors de l\'upload du fichier';
    }
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  // Default error
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: error.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware for routes not found
 * Returns a 404 error for undefined routes
 */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route non trouvée: ${req.originalUrl}`
  });
};
