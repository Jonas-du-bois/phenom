import User from '../models/User.js';
import Observation from '../models/Observation.js';
import Comment from '../models/Comment.js';
import {
  getPaginationParams,
  createPaginationMeta
} from '../utils/pagination.js';
import { escapeRegex } from '../utils/sanitize.js';

/**
 * @file admin.service.js
 * @description Administration service for managing users, observations, and comments.
 * Provides admin-only operations and statistics.
 */
class AdminService {
  /**
   * Retrieves the list of users
   * @param {Object} filters - Search filters
   * @returns {Object} Paginated list of users
   */
  async getUsers(filters = {}) {
    const { page, limit, skip } = getPaginationParams(filters);
    const query = {};

    // Filter by role
    if (filters.role) {
      query.role = filters.role;
    }

    // Search filter
    if (filters.search) {
      const sanitizedSearch = escapeRegex(filters.search);
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { email: { $regex: sanitizedSearch, $options: 'i' } }
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
   * Changes a user's role
   * @param {string} userId - User ID
   * @param {string} role - New role
   * @returns {Object} Updated user
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
   * Retrieves global statistics
   * @returns {Object} Statistics
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
        .populate('userId', 'name email avatar')
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
   * Retrieves the most active users
   * @private
   * @returns {Array} Top contributors
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
   * Deletes an observation (admin)
   * @param {string} observationId - Observation ID
   * @returns {Object} Deleted observation
   */
  async deleteObservation(observationId) {
    const observation = await Observation.findByIdAndDelete(observationId);

    if (!observation) {
      throw new Error('OBSERVATION_NOT_FOUND');
    }

    // Delete all associated images on Cloudinary
    try {
      const imageService = (await import('./image.service.js')).default;
      const deletedImages = await imageService.deleteAllImagesForObservation(
        observationId
      );
      console.log(
        `✅ [Admin] ${deletedImages} image(s) supprimée(s) de Cloudinary`
      );
    } catch (error) {
      console.error(
        `❌ [Admin] Erreur lors de la suppression des images: ${error.message}`
      );
    }

    // Delete all associated comments
    await Comment.deleteMany({ observationId });

    return observation;
  }

  /**
   * Deletes a comment (admin)
   * @param {string} commentId - Comment ID
   * @returns {Object} Deleted comment
   */
  async deleteComment(commentId) {
    const comment = await Comment.findByIdAndDelete(commentId);

    if (!comment) {
      throw new Error('COMMENT_NOT_FOUND');
    }

    return comment;
  }

  /**
   * Retrieves all observations with admin filters
   * @param {Object} filters - Search filters
   * @returns {Object} Paginated list of observations
   */
  async getAllObservations(filters = {}) {
    const { page, limit, skip } = getPaginationParams(filters);
    const query = {};

    // Filter by status
    if (filters.status) {
      query.status = filters.status;
    }

    // Filter by flagged
    if (filters.flagged === 'true') {
      query.flagged = true;
    }

    // Filter by user
    if (filters.userId) {
      query.userId = filters.userId;
    }

    // Handle sorting
    const sortBy = filters.sortBy || 'createdAt';
    const order = filters.order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: order };

    const [observations, total] = await Promise.all([
      Observation.find(query)
        .populate('userId', 'name email avatar')
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
   * Retrieves all comments with admin filters
   * @param {Object} filters - Search filters
   * @returns {Object} Paginated list of comments
   */
  async getAllComments(filters = {}) {
    const { page, limit, skip } = getPaginationParams(filters);
    const query = {};

    // Filter by flagged
    if (filters.flagged === 'true') {
      query.flagged = true;
    }

    // Filter by user
    if (filters.userId) {
      query.userId = filters.userId;
    }

    // Filter by observation
    if (filters.observationId) {
      query.observationId = filters.observationId;
    }

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .populate('userId', 'name email avatar')
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
   * Retrieves a user's details (admin)
   * @param {string} userId - User ID
   * @returns {Object} Complete user details
   */
  async getUserDetails(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    // Retrieve detailed statistics
    const [observationsCount, commentsCount, observations, comments] =
      await Promise.all([
        Observation.countDocuments({ userId }),
        Comment.countDocuments({ userId }),
        Observation.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
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
