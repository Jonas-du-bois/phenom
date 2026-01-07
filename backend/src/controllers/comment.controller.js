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
    const observationId = req.params.id;
    const comment = await commentService.createComment(
      observationId,
      req.body,
      req.user._id
    );

    // Publish WebSocket event with observationId for filtering
    publishCommentEvent("comment:created", {
      comment,
      observationId,
    });

    return createdResponse(res, comment, "Commentaire ajouté avec succès");
  });

  /**
   * Updates a comment
   * PUT /comments/:id
   */
  updateComment = asyncHandler(async (req, res) => {
    const comment = await commentService.updateComment(req.params.id, req.body);

    // Publish WebSocket event with observationId for filtering
    publishCommentEvent("comment:updated", {
      comment,
      observationId: comment.observationId?.toString() || comment.observationId,
    });

    return successResponse(res, comment, "Commentaire mis à jour avec succès");
  });

  /**
   * Deletes a comment
   * DELETE /comments/:id
   */
  deleteComment = asyncHandler(async (req, res) => {
    const commentId = req.params.id;
    // deleteComment returns the deleted comment with observationId
    const deletedComment = await commentService.deleteComment(commentId);
    const observationId = deletedComment?.observationId?.toString() || deletedComment?.observationId;

    // Publish WebSocket event with observationId for filtering
    publishCommentEvent("comment:deleted", {
      _id: commentId,
      observationId,
    });

    return successResponse(res, {}, "Commentaire supprimé avec succès");
  });
}

export default new CommentController();
