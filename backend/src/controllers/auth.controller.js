import authService from '../services/auth.service.js';
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
      const user = await authService.getProfile(req.user._id);
      
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
}

export default new AuthController();
