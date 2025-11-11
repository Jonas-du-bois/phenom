import jwt from 'jsonwebtoken';

/**
 * Vérifie que les secrets JWT sont configurés
 * À appeler APRÈS le chargement de .env
 * @throws {Error} Si les secrets ne sont pas définis
 */
export const validateJwtConfig = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET non défini dans .env');
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET non défini dans .env');
  }

  // Avertissement si secrets trop courts en production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.JWT_SECRET.length < 32) {
      console.warn('⚠️  JWT_SECRET devrait avoir au moins 32 caractères en production');
      throw new Error('JWT_SECRET trop court pour la production (minimum 32 caractères)');
    }
    if (process.env.JWT_REFRESH_SECRET.length < 32) {
      console.warn('⚠️  JWT_REFRESH_SECRET devrait avoir au moins 32 caractères en production');
      throw new Error('JWT_REFRESH_SECRET trop court pour la production (minimum 32 caractères)');
    }
  }
};

/**
 * Génère un access token JWT
 * @param {Object} payload - Données à encoder dans le token
 * @returns {string} Token JWT
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '1h' }
  );
};

/**
 * Génère un refresh token JWT
 * @param {Object} payload - Données à encoder dans le token
 * @returns {string} Token JWT
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};

/**
 * Vérifie et décode un token JWT
 * @param {string} token - Token à vérifier
 * @param {boolean} isRefresh - Si true, vérifie un refresh token
 * @returns {Object} Payload décodé
 */
export const verifyToken = (token, isRefresh = false) => {
  const secret = isRefresh ? process.env.JWT_REFRESH_SECRET : process.env.JWT_SECRET;
  return jwt.verify(token, secret);
};

/**
 * Crée un payload utilisateur pour le token
 * @param {Object} user - Objet utilisateur
 * @returns {Object} Payload formaté
 */
export const createTokenPayload = (user) => {
  return {
    userId: user._id.toString(),
    email: user.email,
    role: user.role
  };
};
