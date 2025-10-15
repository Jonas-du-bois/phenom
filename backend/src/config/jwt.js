import jwt from 'jsonwebtoken';

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
