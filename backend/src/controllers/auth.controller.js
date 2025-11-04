import authService from '../services/auth.service.js';
import userService from '../services/user.service.js';
import { successResponse, createdResponse, errorResponse, unauthorizedResponse } from '../utils/response.js';

/**
 * Contrôleur d'authentification
 */
class AuthController {
  /**
   * Inscription d'un nouvel utilisateur
   * POST /auth/signup
   */
  async signup(req, res, next) {
    try {
      const result = await authService.signup(req.body);

      return createdResponse(res, result, 'Inscription réussie');
    } catch (error) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return errorResponse(res, 'Cet email est déjà utilisé', 400);
      }
      next(error);
    }
  }

  /**
   * Connexion d'un utilisateur
   * POST /auth/login
   */
  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);

      return successResponse(res, result, 'Connexion réussie');
    } catch (error) {
      if (error.message === 'INVALID_CREDENTIALS') {
        return unauthorizedResponse(res, 'Email ou mot de passe incorrect');
      }
      next(error);
    }
  }

  /**
   * Récupère le profil de l'utilisateur connecté
   * GET /auth/me
   */
  async getProfile(req, res, next) {
    try {
      const user = await userService.getProfile(req.user._id);

      return successResponse(res, user);
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        return errorResponse(res, 'Utilisateur non trouvé', 404);
      }
      next(error);
    }
  }

  /**
   * Déconnexion (côté client principalement)
   * POST /auth/logout
   */
  async logout(req, res) {
    return successResponse(res, null, 'Déconnexion réussie');
  }

  /**
   * Rafraîchit le token JWT
   * POST /auth/refresh-token
   */
  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);

      return successResponse(res, tokens, 'Token rafraîchi avec succès');
    } catch (error) {
      if (error.message === 'REFRESH_TOKEN_REQUIRED') {
        return errorResponse(res, 'Le refresh token est requis', 400);
      }
      if (error.message === 'INVALID_REFRESH_TOKEN') {
        return unauthorizedResponse(res, 'Refresh token invalide ou expiré');
      }
      if (error.message === 'USER_NOT_FOUND') {
        return unauthorizedResponse(res, 'Utilisateur non trouvé');
      }
      next(error);
    }
  }

  /**
   * Demande de réinitialisation du mot de passe
   * POST /auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      const result = await authService.forgotPassword(email);

      return successResponse(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Réinitialise le mot de passe
   * POST /auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, newPassword } = req.body;
      await authService.resetPassword(token, newPassword);

      return successResponse(res, null, 'Mot de passe réinitialisé avec succès');
    } catch (error) {
      if (error.message === 'INVALID_RESET_TOKEN') {
        return unauthorizedResponse(res, 'Token de réinitialisation invalide ou expiré');
      }
      if (error.message === 'USER_NOT_FOUND') {
        return unauthorizedResponse(res, 'Utilisateur non trouvé');
      }
      next(error);
    }
  }
}

export default new AuthController();
