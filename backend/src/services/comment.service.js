import Comment from '../models/Comment.js';
import Observation from '../models/Observation.js';
import { getPaginationParams, createPaginationMeta } from '../utils/pagination.js';

/**
 * Service de gestion des commentaires
 */
class CommentService {
  /**
   * Récupère les commentaires d'une observation
   * @param {string} observationId - ID de l'observation
   * @param {Object} filters - Filtres de pagination
   * @returns {Object} Liste paginée de commentaires
   */
  async getCommentsByObservation(observationId, filters = {}) {
    // Vérifier que l'observation existe
    const observation = await Observation.findById(observationId);
    if (!observation) {
      throw new Error('OBSERVATION_NOT_FOUND');
    }

    const { page, limit, skip } = getPaginationParams(filters);

    const [comments, total] = await Promise.all([
      Comment.find({ observationId })
        .populate('userId', 'name email')
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
   * Crée un nouveau commentaire
   * @param {string} observationId - ID de l'observation
   * @param {Object} commentData - Données du commentaire
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} Commentaire créé
   */
  async createComment(observationId, commentData, userId) {
    // Vérifier que l'observation existe
    const observation = await Observation.findById(observationId);
    if (!observation) {
      throw new Error('OBSERVATION_NOT_FOUND');
    }

    const comment = await Comment.create({
      ...commentData,
      observationId,
      userId
    });

    return await comment.populate('userId', 'name email');
  }

  /**
   * Met à jour un commentaire
   * @param {string} commentId - ID du commentaire
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Object} Commentaire mis à jour
   */
  async updateComment(commentId, updateData) {
    // Whitelist des champs modifiables
    const allowedFields = ['text'];
    const filteredData = Object.keys(updateData)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updateData[key];
        return obj;
      }, {});

    const comment = await Comment.findByIdAndUpdate(
      commentId,
      { $set: filteredData },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!comment) {
      throw new Error('COMMENT_NOT_FOUND');
    }

    return comment;
  }

  /**
   * Supprime un commentaire
   * @param {string} commentId - ID du commentaire
   * @returns {Object} Commentaire supprimé
   */
  async deleteComment(commentId) {
    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      throw new Error('COMMENT_NOT_FOUND');
    }

    return comment;
  }

  /**
   * Récupère le propriétaire d'un commentaire
   * @param {string} commentId - ID du commentaire
   * @returns {string} ID du propriétaire
   */
  async getCommentOwnerId(commentId) {
    const comment = await Comment.findById(commentId).select('userId');
    return comment?.userId;
  }

  /**
   * Supprime tous les commentaires d'une observation
   * @param {string} observationId - ID de l'observation
   * @returns {Object} Résultat de la suppression
   */
  async deleteCommentsByObservation(observationId) {
    return await Comment.deleteMany({ observationId });
  }
}

export default new CommentService();
