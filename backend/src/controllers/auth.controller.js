import authService from '../services/auth.service.js';
import userService from '../services/user.service.js';
import { successResponse, createdResponse, errorResponse, unauthorizedResponse } from '../utils/response.js';

// Configuration des cookies pour le refresh token
const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en millisecondes
  path: '/api/v1/auth'
};

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

      // Définir le refresh token dans un cookie HttpOnly
      res.cookie('refreshToken', result.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      // Ne pas inclure le refreshToken dans la réponse JSON
      const { refreshToken, ...responseData } = result;

      return createdResponse(res, responseData, 'Inscription réussie');
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

      // Définir le refresh token dans un cookie HttpOnly
      res.cookie('refreshToken', result.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      // Ne pas inclure le refreshToken dans la réponse JSON
      const { refreshToken, ...responseData } = result;

      return successResponse(res, responseData, 'Connexion réussie');
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
   * Déconnexion (supprime le cookie refresh token)
   * POST /auth/logout
   */
  async logout(req, res) {
    // Supprimer le cookie du refresh token
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/api/v1/auth'
    });

    return successResponse(res, null, 'Déconnexion réussie');
  }

  /**
   * Rafraîchit le token JWT
   * POST /auth/refresh-token
   */
  async refreshToken(req, res, next) {
    try {
      // Lire le refresh token depuis le cookie HttpOnly
      const refreshToken = req.cookies.refreshToken;
      const tokens = await authService.refreshToken(refreshToken);

      // Mettre à jour le cookie avec le nouveau refresh token
      res.cookie('refreshToken', tokens.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);

      // Ne retourner que l'access token dans la réponse
      return successResponse(res, { accessToken: tokens.accessToken }, 'Token rafraîchi avec succès');
    } catch (error) {
      if (error.message === 'REFRESH_TOKEN_REQUIRED') {
        return errorResponse(res, 'Le refresh token est requis', 400);
      }
      if (error.message === 'INVALID_REFRESH_TOKEN') {
        // Supprimer le cookie invalide
        res.clearCookie('refreshToken', {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
          path: '/api/v1/auth'
        });
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
