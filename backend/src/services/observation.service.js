import { NotFoundError } from '../utils/errors.js';
import Observation from '../models/Observation.js';
import { getPaginationParams, createPaginationMeta } from '../utils/pagination.js';
import { publishObservationEvent } from '../config/websocket.js';

/**
 * @file observation.service.js
 * @description Service for managing observations.
 * Handles CRUD operations, geospatial queries, and statistics for observations.
 */
class ObservationService {
  /**
   * Retrieves a list of observations with filters and pagination.
   * @param {Object} filters - Search filters (type, search text, location).
   * @returns {Object} Paginated list of observations.
   */
  async getObservations(filters = {}) {
    const { page, limit, skip } = getPaginationParams(filters);
    const query = {};

    // Filter by observation type
    if (filters.type) {
      query.type = filters.type;
    }

    // Text search filter
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Geospatial filter by bounding box (for map view)
    if (filters.minLat && filters.maxLat && filters.minLng && filters.maxLng) {
      const minLng = parseFloat(filters.minLng);
      const maxLng = parseFloat(filters.maxLng);
      const minLat = parseFloat(filters.minLat);
      const maxLat = parseFloat(filters.maxLat);

      query.location = {
        $geoWithin: {
          $geometry: {
            type: 'Polygon',
            coordinates: [[
              [minLng, minLat], // Southwest
              [maxLng, minLat], // Southeast
              [maxLng, maxLat], // Northeast
              [minLng, maxLat], // Northwest
              [minLng, minLat]  // Close loop
            ]]
          }
        }
      };
    }
    // Geospatial filter by proximity (radius search)
    else if (filters.lat && filters.lng && filters.radius) {
      const radiusInMeters = parseFloat(filters.radius) * 1000;
      query.location = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(filters.lng), parseFloat(filters.lat)]
          },
          $maxDistance: radiusInMeters
        }
      };
    }

    // Sorting
    const sortBy = filters.sortBy || 'createdAt';
    const order = filters.order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: order };

    // Execute query with pagination
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
      observations,
      pagination: createPaginationMeta(total, page, limit)
    };
  }

  /**
   * Retrieves an observation by its ID.
   * @param {string} observationId - Observation ID.
   * @returns {Object} The observation document.
   */
  async getObservationById(observationId) {
    const observation = await Observation.findById(observationId)
      .populate('userId', 'name email')
      .populate({
        path: 'comments',
        populate: {
          path: 'userId',
          select: 'name email avatar'
        },
        options: { sort: { createdAt: -1 } }
      });

    if (!observation) {
      throw new NotFoundError('Observation not found');
    }

    return observation;
  }

  /**
   * Creates a new observation.
   * @param {Object} observationData - Observation data.
   * @param {string} userId - ID of the user creating the observation.
   * @returns {Object} Created observation.
   */
  async createObservation(observationData, userId) {
    const observation = await Observation.create({
      ...observationData,
      userId
    });

    const populatedObservation = await observation.populate('userId', 'name email');

    // Publish event via WebSocket
    publishObservationEvent('observation:created', populatedObservation.toObject());

    return populatedObservation;
  }

  /**
   * Updates an existing observation.
   * @param {string} observationId - Observation ID.
   * @param {Object} updateData - Data to update.
   * @returns {Object} Updated observation.
   */
  async updateObservation(observationId, updateData) {
    const observation = await Observation.findByIdAndUpdate(
      observationId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!observation) {
      throw new NotFoundError('Observation not found');
    }

    // Publish event via WebSocket
    publishObservationEvent('observation:updated', observation.toObject());

    return observation;
  }

  /**
   * Deletes an observation.
   * @param {string} observationId - Observation ID.
   * @returns {Object} Deleted observation.
   */
  async deleteObservation(observationId) {
    // Use transaction for atomicity
    const session = await Observation.startSession();
    let observation;

    try {
      await session.startTransaction();

      // Delete observation within transaction
      observation = await Observation.findByIdAndDelete(observationId, { session });

      if (!observation) {
        // Abort transaction if observation doesn't exist
        await session.abortTransaction();
        throw new NotFoundError('Observation not found');
      }

      // Delete associated comments within transaction
      const Comment = (await import('../models/Comment.js')).default;
      const deleteResult = await Comment.deleteMany({ observationId }, { session });
      console.log(`✅ ${deleteResult.deletedCount} comment(s) deleted`);

      // Commit transaction
      await session.commitTransaction();
    } catch (error) {
      // Abort transaction on error (unless it's our NotFoundError)
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      console.error(`❌ Error during deletion (transaction aborted): ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }

    // Delete images from Cloudinary after transaction (external to MongoDB)
    try {
      const imageService = (await import('./image.service.js')).default;
      const deletedImages = await imageService.deleteAllImagesForObservation(observationId);
      console.log(`✅ ${deletedImages} image(s) deleted from Cloudinary`);
    } catch (error) {
      console.error(`❌ Error deleting images from Cloudinary: ${error.message}`);
      console.warn(`⚠️ Observation deleted but ${observation.images?.length || 0} image(s) might be orphaned on Cloudinary`);
    }

    // Publish event via WebSocket
    publishObservationEvent('observation:deleted', { observationId });

    return observation;
  }

  /**
   * Retrieves the owner ID of an observation.
   * @param {string} observationId - Observation ID.
   * @returns {string} Owner ID.
   */
  async getObservationOwnerId(observationId) {
    const observation = await Observation.findById(observationId).select('userId');
    if (!observation) {
      throw new NotFoundError('Observation not found for ownership check');
    }
    return observation.userId;
  }

  /**
   * Searches for observations nearby a location.
   * @param {number} latitude - Latitude.
   * @param {number} longitude - Longitude.
   * @param {number} radius - Radius in km.
   * @param {Object} query - Pagination parameters.
   * @returns {Object} Paginated observations.
   */
  async getNearbyObservations(latitude, longitude, radius, query) {
    const { page, limit, skip } = getPaginationParams(query);
    const radiusInMeters = parseFloat(radius) * 1000;

    // Use $geoWithin instead of $near to allow skip/limit
    const geoQuery = {
      location: {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(longitude), parseFloat(latitude)],
            radiusInMeters / 6378100 // Earth radius in meters
          ]
        }
      }
    };

    const [observations, total] = await Promise.all([
      Observation.find(geoQuery)
        .populate('userId', 'name email')
        .skip(skip)
        .limit(limit)
        .lean(),
      Observation.countDocuments(geoQuery)
    ]);

    return {
      data: observations,
      pagination: createPaginationMeta(total, page, limit)
    };
  }

  /**
   * Retrieves public statistics about observations.
   * @returns {Object} Statistics.
   */
  async getObservationStats() {
    const [
      totalObservations,
      observationsByMonth
    ] = await Promise.all([
      Observation.countDocuments(),
      Observation.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        {
          $sort: { '_id.year': -1, '_id.month': -1 }
        },
        {
          $limit: 12
        }
      ])
    ]);

    return {
      totalObservations,
      observationsByMonth
    };
  }

  /**
   * Retrieves the most popular observation types.
   * @param {number} limit - Number of types to return.
   * @returns {Array} Popular types with counts.
   */
  async getPopularObservationTypes(limit = 6) {
    const popularTypes = await Observation.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          type: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    return popularTypes;
  }
}

export default new ObservationService();
