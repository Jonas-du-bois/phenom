import jwt from "jsonwebtoken";

/**
 * Validates that JWT secrets are configured
 * Should be called AFTER loading .env
 * @throws {Error} If secrets are not defined
 */
export const validateJwtConfig = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET non défini dans .env");
  }
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET non défini dans .env");
  }

  // Warning if secrets are too short in production
  if (process.env.NODE_ENV === "production") {
    if (process.env.JWT_SECRET.length < 32) {
      console.warn(
        "⚠️  JWT_SECRET devrait avoir au moins 32 caractères en production"
      );
    }
    if (process.env.JWT_REFRESH_SECRET.length < 32) {
      console.warn(
        "⚠️  JWT_REFRESH_SECRET devrait avoir au moins 32 caractères en production"
      );
    }
  }
};

/**
 * Generates a JWT access token
 * @param {Object} payload - Data to encode in the token
 * @returns {string} JWT token
 */
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "1h",
  });
};

/**
 * Generates a JWT refresh token
 * @param {Object} payload - Data to encode in the token
 * @returns {string} JWT token
 */
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d",
  });
};

/**
 * Verifies and decodes a JWT token
 * @param {string} token - Token to verify
 * @param {boolean} isRefresh - If true, verifies a refresh token
 * @returns {Object} Decoded payload
 */
export const verifyToken = (token, isRefresh = false) => {
  const secret = isRefresh
    ? process.env.JWT_REFRESH_SECRET
    : process.env.JWT_SECRET;
  return jwt.verify(token, secret);
};

/**
 * Creates a user payload for the token
 * @param {Object} user - User object
 * @returns {Object} Formatted payload
 */
export const createTokenPayload = (user) => {
  return {
    userId: user._id.toString(),
    email: user.email,
    role: user.role,
  };
};
