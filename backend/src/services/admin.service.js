import User from '../models/User.js';
import Observation from '../models/Observation.js';
import Comment from '../models/Comment.js';
import { getPaginationParams, createPaginationMeta } from '../utils/pagination.js';

/**
 * Service d'administration
 */
class AdminService {
  /**
   * Récupère la liste des utilisateurs
   * @param {Object} filters - Filtres de recherche
   * @returns {Object} Liste paginée d'utilisateurs
   */
  async getUsers(filters = {}) {
    const { page, limit, skip } = getPaginationParams(filters);
    const query = {};

    // Filtre de recherche
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query)
    ]);

    return {
      users,
      pagination: createPaginationMeta(total, page, limit)
    };
  }

  /**
   * Change le rôle d'un utilisateur
   * @param {string} userId - ID de l'utilisateur
   * @param {string} role - Nouveau rôle
   * @returns {Object} Utilisateur mis à jour
   */
  async updateUserRole(userId, role) {
    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return user;
  }

  /**
   * Récupère les statistiques globales
   * @returns {Object} Statistiques
   */
  async getStats() {
    const [
      totalUsers,
      totalObservations,
      totalComments,
      recentObservations,
      topContributors
    ] = await Promise.all([
      User.countDocuments(),
      Observation.countDocuments(),
      Comment.countDocuments(),
      Observation.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email')
        .lean(),
      this._getTopContributors()
    ]);

    return {
      totalUsers,
      totalObservations,
      totalComments,
      recentObservations,
      topContributors
    };
  }

  /**
   * Récupère les utilisateurs les plus actifs
   * @private
   * @returns {Array} Top contributeurs
   */
  async _getTopContributors() {
    return await Observation.aggregate([
      {
        $group: {
          _id: '$userId',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$user.name',
          email: '$user.email'
        }
      }
    ]);
  }

  /**
   * Supprime une observation (admin)
   * @param {string} observationId - ID de l'observation
   * @returns {Object} Observation supprimée
   */
  async deleteObservation(observationId) {
    const observation = await Observation.findByIdAndDelete(observationId);

    if (!observation) {
      throw new Error('OBSERVATION_NOT_FOUND');
    }

    // Supprimer tous les commentaires associés
    await Comment.deleteMany({ observationId });

    return observation;
  }

  /**
   * Supprime un commentaire (admin)
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
}

export default new AdminService();
