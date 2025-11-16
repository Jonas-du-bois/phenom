import userService from '../services/user.service.js';
import { successResponse, errorResponse, notFoundResponse } from '../utils/response.js';

/**
 * Contrôleur pour la gestion des utilisateurs
 */
class UserController {
  /**
   * Récupère le profil de l'utilisateur connecté
   * GET /users/me
   */
  async getProfile(req, res, next) {
    try {
      const userId = req.user._id;
      const profile = await userService.getProfile(userId);

      return successResponse(res, profile);
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        return notFoundResponse(res, 'Utilisateur non trouvé');
      }
      next(error);
    }
  }

  /**
   * Récupère les statistiques de l'utilisateur connecté
   * GET /users/me/stats
   */
  async getUserStats(req, res, next) {
    try {
      const userId = req.user._id;
      const stats = await userService.getUserStats(userId);

      return successResponse(res, stats);
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        return notFoundResponse(res, 'Utilisateur non trouvé');
      }
      next(error);
    }
  }

  /**
   * Met à jour le profil de l'utilisateur connecté
   * PUT /users/me
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user._id;

      // Filtrer les champs autorisés (whitelist)
      const allowedFields = ['name', 'email', 'bio'];
      const updates = {};
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      });

      const user = await userService.updateProfile(userId, updates);

      return successResponse(res, user, 'Profil mis à jour avec succès');
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        return notFoundResponse(res, 'Utilisateur non trouvé');
      }
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        return errorResponse(res, 'Cet email est déjà utilisé', 400);
      }
      next(error);
    }
  }

  /**
   * Change le mot de passe de l'utilisateur connecté
   * PATCH /users/me/password
   */
  async changePassword(req, res, next) {
    try {
      const userId = req.user._id;
      const { currentPassword, newPassword } = req.body;

      await userService.changePassword(userId, currentPassword, newPassword);

      return successResponse(res, null, 'Mot de passe modifié avec succès');
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        return notFoundResponse(res, 'Utilisateur non trouvé');
      }
      if (error.message === 'INVALID_CURRENT_PASSWORD') {
        return errorResponse(res, 'Mot de passe actuel incorrect', 400);
      }
      if (error.message === 'NEW_PASSWORD_SAME_AS_CURRENT') {
        return errorResponse(res, 'Le nouveau mot de passe doit être différent de l\'ancien', 400);
      }
      next(error);
    }
  }

  /**
   * Supprime le compte de l'utilisateur connecté
   * DELETE /users/me
   */
  async deleteAccount(req, res, next) {
    try {
      const userId = req.user._id;
      await userService.deleteAccount(userId);

      return successResponse(res, {}, 'Compte supprimé avec succès');
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        return notFoundResponse(res, 'Utilisateur non trouvé');
      }
      next(error);
    }
  }

  /**
   * Récupère les observations de l'utilisateur connecté
   * GET /users/me/observations
   */
  async getUserObservations(req, res, next) {
    try {
      const userId = req.user._id;
      const result = await userService.getUserObservations(userId, req.query);

      return res.json({
        success: true,
        data: result.data,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
