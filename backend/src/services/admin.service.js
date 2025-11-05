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

    // Filtre par rôle
    if (filters.role) {
      query.role = filters.role;
    }

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

  /**
   * Récupère toutes les observations avec filtres admin
   * @param {Object} filters - Filtres de recherche
   * @returns {Object} Liste paginée d'observations
   */
  async getAllObservations(filters = {}) {
    const { page, limit, skip } = getPaginationParams(filters);
    const query = {};

    // Filtre par statut
    if (filters.status) {
      query.status = filters.status;
    }

    // Filtre par signalement
    if (filters.flagged === 'true') {
      query.flagged = true;
    }

    // Filtre par utilisateur
    if (filters.userId) {
      query.userId = filters.userId;
    }

    // Gestion du tri
    const sortBy = filters.sortBy || 'createdAt';
    const order = filters.order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: order };

    const [observations, total] = await Promise.all([
      Observation.find(query)
        .populate('userId', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Observation.countDocuments(query)
    ]);

    return {
      data: observations,
      pagination: createPaginationMeta(total, page, limit)
    };
  }

  /**
   * Récupère tous les commentaires avec filtres admin
   * @param {Object} filters - Filtres de recherche
   * @returns {Object} Liste paginée de commentaires
   */
  async getAllComments(filters = {}) {
    const { page, limit, skip } = getPaginationParams(filters);
    const query = {};

    // Filtre par signalement
    if (filters.flagged === 'true') {
      query.flagged = true;
    }

    // Filtre par utilisateur
    if (filters.userId) {
      query.userId = filters.userId;
    }

    // Filtre par observation
    if (filters.observationId) {
      query.observationId = filters.observationId;
    }

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .populate('userId', 'name email')
        .populate('observationId', 'title')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Comment.countDocuments(query)
    ]);

    return {
      data: comments,
      pagination: createPaginationMeta(total, page, limit)
    };
  }

  /**
   * Récupère les détails d'un utilisateur (admin)
   * @param {string} userId - ID de l'utilisateur
   * @returns {Object} Détails complets de l'utilisateur
   */
  async getUserDetails(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Récupérer les statistiques détaillées
    const [observationsCount, commentsCount, observations, comments] = await Promise.all([
      Observation.countDocuments({ userId }),
      Comment.countDocuments({ userId }),
      Observation.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),
      Comment.find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('observationId', 'title')
        .lean()
    ]);

    return {
      ...user.toObject(),
      observationsCount,
      commentsCount,
      recentObservations: observations,
      recentComments: comments
    };
  }
}

export default new AdminService();
