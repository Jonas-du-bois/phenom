import commentService from '../services/comment.service.js';
import { successResponse, createdResponse } from '../utils/response.js';
import { paginatedResponse } from '../utils/pagination.js';
import { publishCommentEvent } from '../config/websocket.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * Contrôleur des commentaires
 */
class CommentController {
  /**
   * Récupère les commentaires d'une observation
   * GET /observations/:id/comments
   */
  getComments = asyncHandler(async (req, res) => {
    const { comments, pagination } = await commentService.getCommentsByObservation(
      req.params.id,
      req.query
    );
    return res.status(200).json(
      paginatedResponse(comments, pagination.total, pagination.page, pagination.limit)
    );
  });

  /**
   * Crée un nouveau commentaire
   * POST /observations/:id/comments
   */
  createComment = asyncHandler(async (req, res) => {
    const comment = await commentService.createComment(
      req.params.id,
      req.body,
      req.user._id
    );

    // Publier l'événement WebSocket
    publishCommentEvent('comment:created', comment);

    return createdResponse(res, comment, 'Commentaire ajouté avec succès');
  });

  /**
   * Met à jour un commentaire
   * PUT /comments/:id
   */
  updateComment = asyncHandler(async (req, res) => {
    const comment = await commentService.updateComment(req.params.id, req.body);

    // Publier l'événement WebSocket
    publishCommentEvent('comment:updated', comment);

    return successResponse(res, comment, 'Commentaire mis à jour avec succès');
  });

  /**
   * Supprime un commentaire
   * DELETE /comments/:id
   */
  deleteComment = asyncHandler(async (req, res) => {
    const commentId = req.params.id;
    await commentService.deleteComment(commentId);

    // Publier l'événement WebSocket
    publishCommentEvent('comment:deleted', { _id: commentId });

    return successResponse(res, {}, 'Commentaire supprimé avec succès');
  });
}

export default new CommentController();
