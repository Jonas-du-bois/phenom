import commentService from '../services/comment.service.js';
import { successResponse, createdResponse, notFoundResponse } from '../utils/response.js';
import { paginatedResponse } from '../utils/pagination.js';
import { publishCommentEvent } from '../config/websocket.js';

/**
 * Contrôleur des commentaires
 */
class CommentController {
  /**
   * Récupère les commentaires d'une observation
   * GET /observations/:id/comments
   */
  async getComments(req, res, next) {
    try {
      const { comments, pagination } = await commentService.getCommentsByObservation(
        req.params.id,
        req.query
      );

      return res.status(200).json(
        paginatedResponse(comments, pagination.total, pagination.page, pagination.limit)
      );
    } catch (error) {
      if (error.message === 'OBSERVATION_NOT_FOUND') {
        return notFoundResponse(res, 'Observation non trouvée');
      }
      next(error);
    }
  }

  /**
   * Crée un nouveau commentaire
   * POST /observations/:id/comments
   */
  async createComment(req, res, next) {
    try {
      const comment = await commentService.createComment(
        req.params.id,
        req.body,
        req.user._id
      );

      // Publier l'événement WebSocket
      publishCommentEvent('comment:created', comment);

      return createdResponse(res, comment, 'Commentaire ajouté avec succès');
    } catch (error) {
      if (error.message === 'OBSERVATION_NOT_FOUND') {
        return notFoundResponse(res, 'Observation non trouvée');
      }
      next(error);
    }
  }

  /**
   * Met à jour un commentaire
   * PUT /comments/:id
   */
  async updateComment(req, res, next) {
    try {
      const comment = await commentService.updateComment(req.params.id, req.body);

      // Publier l'événement WebSocket
      publishCommentEvent('comment:updated', comment);

      return successResponse(res, comment, 'Commentaire mis à jour avec succès');
    } catch (error) {
      if (error.message === 'COMMENT_NOT_FOUND') {
        return notFoundResponse(res, 'Commentaire non trouvé');
      }
      next(error);
    }
  }

  /**
   * Supprime un commentaire
   * DELETE /comments/:id
   */
  async deleteComment(req, res, next) {
    try {
      const commentId = req.params.id;
      await commentService.deleteComment(commentId);

      // Publier l'événement WebSocket
      publishCommentEvent('comment:deleted', { _id: commentId });

      return res.status(204).send();
    } catch (error) {
      if (error.message === 'COMMENT_NOT_FOUND') {
        return notFoundResponse(res, 'Commentaire non trouvé');
      }
      next(error);
    }
  }
}

export default new CommentController();
