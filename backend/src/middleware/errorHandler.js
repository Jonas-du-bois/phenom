/**
 * Middleware de gestion centralisée des erreurs
 */
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log de l'erreur pour le debugging
  console.error('Error:', {
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    path: req.path,
    method: req.method
  });

  // Erreur de validation Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    error.message = 'Erreur de validation';
    return res.status(400).json({
      success: false,
      error: error.message,
      details: messages
    });
  }

  // Erreur de duplication (clé unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    error.message = `${field} existe déjà`;
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  // Erreur de cast Mongoose (ID invalide)
  if (err.name === 'CastError') {
    error.message = 'Ressource non trouvée';
    return res.status(404).json({
      success: false,
      error: error.message
    });
  }

  // Erreur JWT
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

  // Erreur Multer (upload de fichiers)
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

  // Erreur par défaut
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: error.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware pour les routes non trouvées
 */
export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route non trouvée: ${req.originalUrl}`
  });
};
