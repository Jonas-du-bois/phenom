import rateLimit from 'express-rate-limit';

/**
 * General rate limiter for all routes
 * Prevents abuse by limiting requests per time window
 */
export const generalLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  skip: () => process.env.NODE_ENV === 'test', // Disable in test mode
  message: {
    success: false,
    error: 'Trop de requêtes, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false
});

/**
 * Strict rate limiter for authentication routes
 * Prevents brute force attacks on login/signup
 */
export const authLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes by default
  max: parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 20, // 20 max attempts by default
  skipSuccessfulRequests: true,
  skip: () => process.env.NODE_ENV === 'test', // Disable in test mode
  message: {
    success: false,
    error: 'Trop de tentatives de connexion, veuillez réessayer plus tard'
  }
});

/**
 * Rate limiter for content creation
 * Limits the number of resources a user can create per hour
 */
export const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 max creations per hour
  message: {
    success: false,
    error: 'Limite de création atteinte, veuillez réessayer plus tard'
  }
});
