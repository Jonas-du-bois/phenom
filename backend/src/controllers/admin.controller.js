import adminService from "../services/admin.service.js";
import { successResponse, notFoundResponse } from "../utils/response.js";
import { paginatedResponse } from "../utils/pagination.js";

/**
 * Administration controller
 * Handles admin-only operations for user, observation, and comment management
 */
class AdminController {
  /**
   * Retrieves the list of users
   * GET /admin/users
   */
  async getUsers(req, res, next) {
    try {
      const { users, pagination } = await adminService.getUsers(req.query);

      return res
        .status(200)
        .json(
          paginatedResponse(
            users,
            pagination.total,
            pagination.page,
            pagination.limit
          )
        );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Changes a user's role
   * PUT /admin/users/:id/role
   */
  async updateUserRole(req, res, next) {
    try {
      const user = await adminService.updateUserRole(
        req.params.id,
        req.body.role
      );

      return successResponse(
        res,
        user,
        "Rôle utilisateur mis à jour avec succès"
      );
    } catch (error) {
      if (error.message === "USER_NOT_FOUND") {
        return notFoundResponse(res, "Utilisateur non trouvé");
      }
      next(error);
    }
  }

  /**
   * Retrieves global statistics
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
   * Deletes an observation (admin)
   * DELETE /admin/observations/:id
   */
  async deleteObservation(req, res, next) {
    try {
      await adminService.deleteObservation(req.params.id);

      return successResponse(res, {}, "Observation supprimée avec succès");
    } catch (error) {
      if (error.message === "OBSERVATION_NOT_FOUND") {
        return notFoundResponse(res, "Observation non trouvée");
      }
      next(error);
    }
  }

  /**
   * Deletes a comment (admin)
   * DELETE /admin/comments/:id
   */
  async deleteComment(req, res, next) {
    try {
      await adminService.deleteComment(req.params.id);

      return successResponse(res, {}, "Commentaire supprimé avec succès");
    } catch (error) {
      if (error.message === "COMMENT_NOT_FOUND") {
        return notFoundResponse(res, "Commentaire non trouvé");
      }
      next(error);
    }
  }

  /**
   * Retrieves all observations (admin)
   * GET /admin/observations
   */
  async getAllObservations(req, res, next) {
    try {
      const result = await adminService.getAllObservations(req.query);

      return res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves global statistics
   * GET /admin/stats
   */

  /**
   * Rejects an observation
   * POST /admin/observations/:id/reject
   */
  async rejectObservation(req, res, next) {
    try {
      const observationId = req.params.id;
      const adminId = req.user._id;
      const { reason } = req.body;

      const observation = await adminService.rejectObservation(
        observationId,
        adminId,
        reason
      );

      return successResponse(
        res,
        observation,
        "Observation rejetée avec succès"
      );
    } catch (error) {
      if (error.message === "OBSERVATION_NOT_FOUND") {
        return notFoundResponse(res, "Observation non trouvée");
      }
      next(error);
    }
  }

  /**
   * Suspends a user
   * POST /admin/users/:id/suspend
   */
  async suspendUser(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await adminService.suspendUser(userId, req.body);

      return successResponse(res, user, "Utilisateur suspendu avec succès");
    } catch (error) {
      if (error.message === "USER_NOT_FOUND") {
        return notFoundResponse(res, "Utilisateur non trouvé");
      }
      next(error);
    }
  }

  /**
   * Reactivates a suspended user
   * POST /admin/users/:id/activate
   */
  async activateUser(req, res, next) {
    try {
      const userId = req.params.id;
      const user = await adminService.activateUser(userId);

      return successResponse(res, user, "Utilisateur réactivé avec succès");
    } catch (error) {
      if (error.message === "USER_NOT_FOUND") {
        return notFoundResponse(res, "Utilisateur non trouvé");
      }
      next(error);
    }
  }

  /**
   * Retrieves all comments (admin)
   * GET /admin/comments
   */
  async getAllComments(req, res, next) {
    try {
      const result = await adminService.getAllComments(req.query);

      return res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves a user's details (admin)
   * GET /admin/users/:id
   */
  async getUserDetails(req, res, next) {
    try {
      const user = await adminService.getUserDetails(req.params.id);

      return successResponse(res, user);
    } catch (error) {
      if (error.message === "USER_NOT_FOUND") {
        return notFoundResponse(res, "Utilisateur non trouvé");
      }
      next(error);
    }
  }
}

export default new AdminController();
