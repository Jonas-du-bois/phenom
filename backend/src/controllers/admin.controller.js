import adminService from '../services/admin.service.js';
import { successResponse, notFoundResponse } from '../utils/response.js';
import { paginatedResponse } from '../utils/pagination.js';

/**
 * Contrôleur d'administration
 */
class AdminController {
  /**
   * Récupère la liste des utilisateurs
   * GET /admin/users
   */
  async getUsers(req, res, next) {
    try {
      const { users, pagination } = await adminService.getUsers(req.query);
      
      return res.status(200).json(
        paginatedResponse(users, pagination.total, pagination.page, pagination.limit)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change le rôle d'un utilisateur
   * PUT /admin/users/:id/role
   */
  async updateUserRole(req, res, next) {
    try {
      const user = await adminService.updateUserRole(req.params.id, req.body.role);
      
      return successResponse(res, user, 'Rôle utilisateur mis à jour avec succès');
    } catch (error) {
      if (error.message === 'USER_NOT_FOUND') {
        return notFoundResponse(res, 'Utilisateur non trouvé');
      }
      next(error);
    }
  }

  /**
   * Récupère les statistiques globales
   * GET /admin/stats
   */
  async getStats(req, res, next) {
    try {
      const stats = await adminService.getStats();
      
      return successResponse(res, stats);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Supprime une observation (admin)
   * DELETE /admin/observations/:id
   */
  async deleteObservation(req, res, next) {
    try {
      await adminService.deleteObservation(req.params.id);
      
      return successResponse(res, null, 'Observation supprimée avec succès');
    } catch (error) {
      if (error.message === 'OBSERVATION_NOT_FOUND') {
        return notFoundResponse(res, 'Observation non trouvée');
      }
      next(error);
    }
  }

  /**
   * Supprime un commentaire (admin)
   * DELETE /admin/comments/:id
   */
  async deleteComment(req, res, next) {
    try {
      await adminService.deleteComment(req.params.id);
      
      return successResponse(res, null, 'Commentaire supprimé avec succès');
    } catch (error) {
      if (error.message === 'COMMENT_NOT_FOUND') {
        return notFoundResponse(res, 'Commentaire non trouvé');
      }
      next(error);
    }
  }
}

export default new AdminController();
