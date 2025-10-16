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

  /**
   * Rafraîchit le token JWT
   * @param {string} refreshToken - Token de rafraîchissement
   * @returns {Object} Nouveaux tokens
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error('REFRESH_TOKEN_REQUIRED');
    }

    // Vérifier le refresh token
    const { verifyToken } = await import('../config/jwt.js');
    let decoded;
    try {
      decoded = verifyToken(refreshToken, true);
    } catch (error) {
      throw new Error('INVALID_REFRESH_TOKEN');
    }

    // Vérifier que l'utilisateur existe toujours
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Générer de nouveaux tokens
    const payload = createTokenPayload(user);
    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Demande de réinitialisation du mot de passe
   * @param {string} email - Email de l'utilisateur
   * @returns {Object} Message de succès
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) {
      // Pour des raisons de sécurité, on ne révèle pas si l'email existe
      return { message: 'Si cet email existe, un lien de réinitialisation a été envoyé' };
    }

    // Générer un token de réinitialisation (valide 1h)
    const resetToken = generateAccessToken({ 
      userId: user._id.toString(),
      type: 'reset-password' 
    });

    // TODO: Envoyer l'email avec le token
    // Pour l'instant, on retourne le token dans la réponse (pour le développement uniquement)
    console.log(`🔐 Token de réinitialisation pour ${email}: ${resetToken}`);

    return { 
      message: 'Si cet email existe, un lien de réinitialisation a été envoyé',
      // En développement uniquement
      ...(process.env.NODE_ENV === 'development' && { resetToken })
    };
  }

  /**
   * Réinitialise le mot de passe avec un token
   * @param {string} token - Token de réinitialisation
   * @param {string} newPassword - Nouveau mot de passe
   * @returns {boolean} true si succès
   */
  async resetPassword(token, newPassword) {
    const { verifyToken } = await import('../config/jwt.js');
    let decoded;
    
    try {
      decoded = verifyToken(token, false);
    } catch (error) {
      throw new Error('INVALID_RESET_TOKEN');
    }

    // Vérifier que c'est bien un token de type reset-password
    if (decoded.type !== 'reset-password') {
      throw new Error('INVALID_RESET_TOKEN');
    }

    // Récupérer l'utilisateur
    const user = await User.findById(decoded.userId).select('+password');
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    return true;
  }
}

export default new AuthService();
