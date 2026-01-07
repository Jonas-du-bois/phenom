import Comment from '../models/Comment.js';
import Observation from '../models/Observation.js';
import {
  getPaginationParams,
  createPaginationMeta
} from '../utils/pagination.js';
import { NotFoundError } from '../utils/errors.js';

/**
 * @file comment.service.js
 * @description Comment management service.
 * Handles CRUD operations for observation comments.
 */
class CommentService {
  /**
   * Validates that an observation exists
   * @param {string} observationId - Observation ID
   * @throws {NotFoundError} If the observation does not exist
   * @private
   */
  async _validateObservationExists(observationId) {
    const observation = await Observation.findById(observationId);
    if (!observation) {
      throw new NotFoundError('Observation non trouvée');
    }
    return observation;
  }

  /**
   * Retrieves comments for an observation
   * @param {string} observationId - Observation ID
   * @param {Object} filters - Pagination filters
   * @returns {Object} Paginated list of comments
   */
  async getCommentsByObservation(observationId, filters = {}) {
    // Verify that the observation exists
    await this._validateObservationExists(observationId);

    const { page, limit, skip } = getPaginationParams(filters);

    const [comments, total] = await Promise.all([
      Comment.find({ observationId })
        .populate('userId', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments({ observationId })
    ]);

    return {
      comments,
      pagination: createPaginationMeta(total, page, limit)
    };
  }

  /**
   * Creates a new comment
   * @param {string} observationId - Observation ID
   * @param {Object} commentData - Comment data
   * @param {string} userId - User ID
   * @returns {Object} Created comment
   */
  async createComment(observationId, commentData, userId) {
    // Verify that the observation exists
    await this._validateObservationExists(observationId);

    const comment = await Comment.create({
      ...commentData,
      observationId,
      userId
    });

    const populatedComment = await comment.populate(
      'userId',
      'name email avatar'
    );

    // WebSocket event will be published in the controller
    return populatedComment;
  }

  /**
   * Updates a comment
   * @param {string} commentId - Comment ID
   * @param {Object} updateData - Data to update
   * @returns {Object} Updated comment
   */
  async updateComment(commentId, updateData) {
    // Whitelist of editable fields
    const allowedFields = ['text'];
    const filteredData = Object.keys(updateData)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { $set: filteredData },
      { new: true, runValidators: true }
    ).populate('userId', 'name email avatar');

    if (!comment) {
      throw new NotFoundError('Commentaire non trouvé');
    }

    // WebSocket event will be published in the controller
    return comment;
  }

  /**
   * Deletes a comment
   * @param {string} commentId - Comment ID
   * @returns {Object} Deleted comment
   */
  async deleteComment(commentId) {
    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      throw new NotFoundError('Commentaire non trouvé');
    }

    // WebSocket event will be published in the controller
    return comment;
  }

  /**
   * Retrieves the owner of a comment
   * @param {string} commentId - Comment ID
   * @returns {string} Owner ID
   */
  async getCommentOwnerId(commentId) {
    const comment = await Comment.findById(commentId).select('userId');
    if (!comment) {
      throw new NotFoundError(
        'Commentaire non trouvé pour vérification de propriété'
      );
    }
    return comment?.userId;
  }

  /**
   * Deletes all comments for an observation
   * @param {string} observationId - Observation ID
   * @returns {Object} Deletion result
   */
  async deleteCommentsByObservation(observationId) {
    return await Comment.deleteMany({ observationId });
  }
}

export default new CommentService();
