import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, createTokenPayload } from '../config/jwt.js';

/**
 * Service d'authentification
 */
class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   * @param {Object} userData - Données de l'utilisateur
   * @returns {Object} Utilisateur créé et tokens
   */
  async signup(userData) {
    const { name, email, password } = userData;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('EMAIL_ALREADY_EXISTS');
    }

    // Créer l'utilisateur
    const user = await User.create({ name, email, password });

    // Générer les tokens
    const payload = createTokenPayload(user);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: user.toSafeObject(),
      accessToken,
      refreshToken
    };
  }

  /**
   * Connexion d'un utilisateur
   * @param {Object} credentials - Email et mot de passe
   * @returns {Object} Utilisateur et tokens
   */
  async login(credentials) {
    const { email, password } = credentials;

    // Trouver l'utilisateur avec le mot de passe
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    // Générer les tokens
    const payload = createTokenPayload(user);
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return {
      user: user.toSafeObject(),
      accessToken,
      refreshToken
    };
  }

  /**
   * Récupère le profil de l'utilisateur connecté
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} Utilisateur
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return user.toSafeObject();
  }
}

export default new AuthService();
