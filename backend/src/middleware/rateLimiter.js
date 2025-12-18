import rateLimit from 'express-rate-limit';

/**
 * Rate limiter général pour toutes les routes
 */
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  skip: () => process.env.NODE_ENV === 'test', // Désactiver en mode test
  message: {
    success: false,
    error: 'Trop de requêtes, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Rate limiter strict pour les routes d'authentification
 */
export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes par défaut
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 20, // 20 tentatives max par défaut
  skipSuccessfulRequests: true,
  skip: () => process.env.NODE_ENV === 'test', // Désactiver en mode test
  message: {
    success: false,
    error: 'Trop de tentatives de connexion, veuillez réessayer plus tard'
  }
});

/**
 * Rate limiter pour la création de contenu
 */
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // 20 créations max par heure
  message: {
    success: false,
    error: 'Limite de création atteinte, veuillez réessayer plus tard'
  }
});
