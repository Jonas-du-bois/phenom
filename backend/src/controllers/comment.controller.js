import commentService from "../services/comment.service.js";
import { successResponse, createdResponse } from "../utils/response.js";
import { paginatedResponse } from "../utils/pagination.js";
import { publishCommentEvent } from "../config/websocket.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Comment controller
 * Handles CRUD operations for observation comments
 */
class CommentController {
  /**
   * Retrieves comments for an observation
   * GET /observations/:id/comments
   */
  getComments = asyncHandler(async (req, res) => {
    const { comments, pagination } =
      await commentService.getCommentsByObservation(req.params.id, req.query);
    return res
      .status(200)
      .json(
        paginatedResponse(
          comments,
          pagination.total,
          pagination.page,
          pagination.limit
        )
      );
  });

  /**
   * Creates a new comment
   * POST /observations/:id/comments
   */
  createComment = asyncHandler(async (req, res) => {
    const comment = await commentService.createComment(
      req.params.id,
      req.body,
      req.user._id
    );

    // Publish WebSocket event
    publishCommentEvent("comment:created", comment);

    return createdResponse(res, comment, "Commentaire ajouté avec succès");
  });

  /**
   * Updates a comment
   * PUT /comments/:id
   */
  updateComment = asyncHandler(async (req, res) => {
    const comment = await commentService.updateComment(req.params.id, req.body);

    // Publish WebSocket event
    publishCommentEvent("comment:updated", comment);

    return successResponse(res, comment, "Commentaire mis à jour avec succès");
  });

  /**
   * Deletes a comment
   * DELETE /comments/:id
   */
  deleteComment = asyncHandler(async (req, res) => {
    const commentId = req.params.id;
    await commentService.deleteComment(commentId);

    // Publish WebSocket event
    publishCommentEvent("comment:deleted", { _id: commentId });

    return successResponse(res, {}, "Commentaire supprimé avec succès");
  });
}

export default new CommentController();
