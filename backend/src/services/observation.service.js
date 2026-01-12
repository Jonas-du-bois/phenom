import { NotFoundError } from '../utils/errors.js';
import Observation, {
  OBSERVER_TYPES,
  UFO_SHAPES,
  PHENOMENA,
  LOCALE_TYPES
} from '../models/Observation.js';

import { publishObservationEvent } from '../config/websocket.js';

/**
 * @file observation.service.js
 * @description Service for managing observations/sightings.
 * Handles CRUD operations, Phenom Search compatible queries, and statistics.
 * Format compatible with Phenom Search API.
 */
class ObservationService {
  // ============================================
  // PHENOM SEARCH COMPATIBLE ENDPOINTS
  // ============================================

  /**
   * Retrieves paginated sightings (Phenom Search format).
   * GET /sightings/paginated
   * @param {number} page - Page number (starts at 1)
   * @param {number} perPage - Items per page (1-500)
   * @returns {Object} Paginated sightings with Phenom Search format
   */
  async getSightingsPaginated(page = 1, perPage = 50) {
    const pageNum = Math.max(1, parseInt(page));
    const limit = Math.min(500, Math.max(1, parseInt(perPage)));
    const skip = (pageNum - 1) * limit;

    const [sightings, total] = await Promise.all([
      Observation.find()
        .populate('userId', 'name email avatar')
        .populate('commentsCount')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean({ virtuals: true }),
      Observation.countDocuments()
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: sightings,
      pagination: {
        page: pageNum,
        perPage: limit,
        total,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    };
  }

  /**
   * Retrieves sightings with advanced filters (Phenom Search format).
   * GET /sightings
   * @param {Object} filters - Search filters
   * @returns {Object} Filtered sightings
   */
  async getSightingsWithFilters(filters = {}) {
    const limit = Math.min(500, Math.max(1, parseInt(filters.limit) || 50));

    // Support both 'page' (1-indexed) and 'offset' (0-indexed)
    let offset;
    if (filters.page !== undefined) {
      const page = Math.max(1, parseInt(filters.page) || 1);
      offset = (page - 1) * limit;
    } else {
      offset = Math.max(0, parseInt(filters.offset) || 0);
    }

    const query = {};

    // Country filter (partial match)
    if (filters.country) {
      query.country = { $regex: filters.country, $options: 'i' };
    }

    // Locale filter
    if (filters.locale) {
      query.locale = filters.locale;
    }

    // Year range filter (parse date string to extract year)
    if (filters.startYear || filters.endYear) {
      // For date strings like "6/24/1947" or ISO dates
      const dateConditions = [];
      if (filters.startYear) {
        dateConditions.push({
          $expr: {
            $gte: [
              {
                $year: {
                  $dateFromString: {
                    dateString: '$date',
                    onError: new Date(0)
                  }
                }
              },
              parseInt(filters.startYear)
            ]
          }
        });
      }
      if (filters.endYear) {
        dateConditions.push({
          $expr: {
            $lte: [
              {
                $year: {
                  $dateFromString: { dateString: '$date', onError: new Date() }
                }
              },
              parseInt(filters.endYear)
            ]
          }
        });
      }
      if (dateConditions.length > 0) {
        query.$and = query.$and || [];
        query.$and.push(...dateConditions);
      }
    }

    // Credibility range filter
    if (filters.minCredibility !== undefined) {
      query.credibility = query.credibility || {};
      query.credibility.$gte = parseInt(filters.minCredibility);
    }
    if (filters.maxCredibility !== undefined) {
      query.credibility = query.credibility || {};
      query.credibility.$lte = parseInt(filters.maxCredibility);
    }

    // Strangeness range filter
    if (filters.minStrangeness !== undefined) {
      query.strangeness = query.strangeness || {};
      query.strangeness.$gte = parseInt(filters.minStrangeness);
    }
    if (filters.maxStrangeness !== undefined) {
      query.strangeness = query.strangeness || {};
      query.strangeness.$lte = parseInt(filters.maxStrangeness);
    }

    // Duration range filter
    if (filters.minDuration !== undefined) {
      query.duration = query.duration || {};
      query.duration.$gte = parseInt(filters.minDuration);
    }
    if (filters.maxDuration !== undefined) {
      query.duration = query.duration || {};
      query.duration.$lte = parseInt(filters.maxDuration);
    }

    // Observer types filter (comma-separated)
    if (filters.observerType) {
      const types = filters.observerType.split(',').map((t) => t.trim());
      query.observerTypes = { $in: types };
    }

    // UFO shapes filter (comma-separated)
    if (filters.ufoShape) {
      const shapes = filters.ufoShape.split(',').map((s) => s.trim());
      query.ufoShapes = { $in: shapes };
    }

    // Phenomena filter (comma-separated)
    if (filters.phenomenon) {
      const phenom = filters.phenomenon.split(',').map((p) => p.trim());
      query.phenomena = { $in: phenom };
    }

    // Text search - uses regex for flexible search
    if (filters.search) {
      const searchTerm = filters.search.trim();

      // If the term contains spaces, use text search
      // Otherwise use regex for partial search
      if (searchTerm.includes(' ')) {
        query.$text = { $search: searchTerm };
      } else {
        // Partial search on multiple fields
        query.$or = [
          { description: { $regex: searchTerm, $options: 'i' } },
          { location: { $regex: searchTerm, $options: 'i' } },
          { country: { $regex: searchTerm, $options: 'i' } },
          { tags: { $regex: searchTerm, $options: 'i' } }
        ];
      }
    }

    // Has coordinates filter
    if (filters.hasCoordinates === 'true' || filters.hasCoordinates === true) {
      query['coordinates.lat'] = { $exists: true, $ne: null };
      query['coordinates.lng'] = { $exists: true, $ne: null };
    }

    // Has images filter (Phenom App specific)
    if (filters.hasImages === 'true' || filters.hasImages === true) {
      query.images = { $exists: true, $not: { $size: 0 } };
    }

    const [sightings, total] = await Promise.all([
      Observation.find(query)
        .populate('userId', 'name email avatar')
        .populate('commentsCount')
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean({ virtuals: true }),
      Observation.countDocuments(query)
    ]);

    // Calculate page info
    const currentPage = Math.floor(offset / limit) + 1;
    const totalPages = Math.ceil(total / limit);

    return {
      data: sightings,
      pagination: {
        total,
        limit,
        offset,
        page: currentPage,
        totalPages,
        hasMore: offset + sightings.length < total,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1
      }
    };
  }

  /**
   * Retrieves a sighting by ID (Phenom Search format).
   * GET /sightings/:id
   * @param {string} sightingId - Sighting ID
   * @returns {Object} Detailed sighting
   */
  async getSightingById(sightingId) {
    const sighting = await Observation.findById(sightingId)
      .populate('userId', 'name email avatar')
      .populate({
        path: 'comments',
        populate: {
          path: 'userId',
          select: 'name email avatar'
        },
        options: { sort: { createdAt: -1 } }
      });

    if (!sighting) {
      throw new NotFoundError('Sighting not found');
    }

    return sighting;
  }

  /**
   * Retrieves statistics (Phenom Search format).
   * GET /statistics
   * @returns {Object} Global statistics
   */
  async getStatistics() {
    const [
      totalSightings,
      credibilityStats,
      strangenessStats,
      durationStats,
      topCountries,
      observerTypeDistribution,
      ufoShapeDistribution,
      phenomenaDistribution,
      sightingsWithCoordinates,
      sightingsWithImages
    ] = await Promise.all([
      Observation.countDocuments(),
      Observation.aggregate([
        {
          $group: {
            _id: null,
            min: { $min: '$credibility' },
            max: { $max: '$credibility' },
            avg: { $avg: '$credibility' }
          }
        }
      ]),
      Observation.aggregate([
        {
          $group: {
            _id: null,
            min: { $min: '$strangeness' },
            max: { $max: '$strangeness' },
            avg: { $avg: '$strangeness' }
          }
        }
      ]),
      Observation.aggregate([
        { $match: { duration: { $gt: 0 } } },
        {
          $group: {
            _id: null,
            min: { $min: '$duration' },
            max: { $max: '$duration' },
            avg: { $avg: '$duration' }
          }
        }
      ]),
      Observation.aggregate([
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { country: '$_id', count: 1, _id: 0 } }
      ]),
      Observation.aggregate([
        { $unwind: '$observerTypes' },
        { $group: { _id: '$observerTypes', count: { $sum: 1 } } },
        { $project: { type: '$_id', count: 1, _id: 0 } }
      ]),
      Observation.aggregate([
        { $unwind: '$ufoShapes' },
        { $group: { _id: '$ufoShapes', count: { $sum: 1 } } },
        { $project: { shape: '$_id', count: 1, _id: 0 } }
      ]),
      Observation.aggregate([
        { $unwind: '$phenomena' },
        { $group: { _id: '$phenomena', count: { $sum: 1 } } },
        { $project: { phenomenon: '$_id', count: 1, _id: 0 } }
      ]),
      Observation.countDocuments({
        'coordinates.lat': { $exists: true, $ne: null }
      }),
      Observation.countDocuments({
        images: { $exists: true, $not: { $size: 0 } }
      })
    ]);

    const credStats = credibilityStats[0] || { min: 0, max: 15, avg: 0 };
    const strangeStats = strangenessStats[0] || { min: 0, max: 10, avg: 0 };
    const durStats = durationStats[0] || { min: 0, max: 0, avg: 0 };

    // Convert distributions to objects
    const observerTypeDist = {};
    observerTypeDistribution.forEach((item) => {
      observerTypeDist[item.type] = item.count;
    });

    const ufoShapeDist = {};
    ufoShapeDistribution.forEach((item) => {
      ufoShapeDist[item.shape] = item.count;
    });

    const phenomenaDist = {};
    phenomenaDistribution.forEach((item) => {
      phenomenaDist[item.phenomenon] = item.count;
    });

    return {
      totalSightings,
      credibilityStats: {
        min: credStats.min,
        max: credStats.max,
        avg: credStats.avg?.toFixed(2) || '0.00'
      },
      strangenessStats: {
        min: strangeStats.min,
        max: strangeStats.max,
        avg: strangeStats.avg?.toFixed(2) || '0.00'
      },
      durationStats: {
        min: durStats.min,
        max: durStats.max,
        avg: durStats.avg?.toFixed(2) || '0.00'
      },
      topCountries,
      observerTypeDistribution: observerTypeDist,
      ufoShapeDistribution: ufoShapeDist,
      phenomenaDistribution: phenomenaDist,
      sightingsWithCoordinates,
      sightingsWithImages
    };
  }

  /**
   * Get available filter values
   */
  async getFilterValues(filterType) {
    switch (filterType) {
    case 'countries':{
      const countries = await Observation.distinct('country');
      return countries.filter((c) => c).sort();}
    case 'locales':
      return LOCALE_TYPES;
    case 'observer-types':
      return OBSERVER_TYPES.map((code) => ({
        code,
        description: this.getObserverTypeDescription(code)
      }));
    case 'ufo-shapes':
      return UFO_SHAPES.map((code) => ({
        code,
        description: this.getUfoShapeDescription(code)
      }));
    case 'phenomena':
      return PHENOMENA.map((code) => ({
        code,
        description: this.getPhenomenonDescription(code)
      }));
    default:
      return [];
    }
  }

  // Helper methods for descriptions
  getObserverTypeDescription(code) {
    const descriptions = {
      GND: 'Ground Observers - Observateur(s) au sol',
      MIL: 'Military Observers - Observateur(s) militaires',
      CIV: 'Civilian Observers - Observateur(s) civils',
      HQO: 'High-Quality Observers - Observateur(s) de haute qualité',
      SCI: 'Scientist Involvement - Implication de scientifiques',
      CST: 'Coastal Observers - Observateur(s) en zone côtière',
      SEA: 'Sea Observers - Observateur(s) en mer',
      NWS: 'News Media Report - Rapport médias/presse'
    };
    return descriptions[code] || code;
  }

  getUfoShapeDescription(code) {
    const descriptions = {
      SCR: 'Saucer/Classic - Soucoupe classique, disque ou sphère',
      CIG: 'Cigar/Torpedo - Torpille, cigare ou cylindre',
      DLT: 'Delta/Boomerang - Delta, V, boomerang ou forme rectangulaire',
      NLT: 'Nightlights - Points lumineux ou lueurs nocturnes',
      FBL: 'Fireball - Boule de feu, forme brillante indistincte',
      FIG: 'Figure/Entity - Figure ou entité mal définie',
      PRB: 'Probe - Sonde (probablement télécommandée)',
      NFO: 'No Craft - Aucun engin vu (entités seules)'
    };
    return descriptions[code] || code;
  }

  getPhenomenonDescription(code) {
    const descriptions = {
      WAV: 'Wave/Cluster/Flap - Vague, cluster ou flap',
      TCH: 'Technical Details - Nouveaux détails techniques',
      HST: 'Historical Account - Compte rendu historique',
      SND: 'Sounds - Sons d\'OVNI entendus ou enregistrés',
      ODD: 'Atypical/Paranormal - Atypique, Forteana ou paranormal',
      MID: 'Misidentification - Probable mésidentification',
      RAY: 'Light/Beam - Lumière bizarre, projecteur, faisceau',
      SIG: 'Signals - Signaux, réponses ou communications',
      LND: 'Landing - Atterrissage d\'OVNI',
      SUB: 'Submersible - Émerge de l\'eau ou s\'y immerge',
      OBS: 'Observation/Chase - Véhicules d\'observation ou de poursuite',
      VEH: 'Vehicle Affected - Véhicule affecté',
      TRC: 'Physical Traces - Traces physiques directes',
      DRT: 'Dirt/Soil Marks - Traces de terre, sol, marques',
      VEG: 'Vegetation - Plantes affectées',
      PHT: 'Photos/Video - Photos, films ou vidéos prises',
      RDA: 'Radiation - Radiation détectée',
      BLD: 'Buildings/Structures - Bâtiment affecté',
      OID: 'Humanoid/Grey - Humanoïde, petit extraterrestre',
      NOC: 'No Entity - Aucune entité vue',
      ANI: 'Animals Affected - Animaux affectés',
      HUM: 'Humans Affected - Humains affectés',
      INJ: 'Injuries - Blessures, maladie, mort'
    };
    return descriptions[code] || code;
  }

  // ============================================
  // CRUD OPERATIONS (for authenticated users)
  // ============================================

  /**
   * Retrieves a list of observations with filters and pagination.
   * @param {Object} filters - Search filters (type, search text, location).
   * @returns {Object} Paginated list of observations.
   */
  async getObservations(filters = {}) {
    // Delegate to new method for backward compatibility
    return this.getSightingsWithFilters(filters);
  }

  /**
   * Retrieves an observation by its ID.
   * @param {string} observationId - Observation ID.
   * @returns {Object} The observation document.
   */
  async getObservationById(observationId) {
    return this.getSightingById(observationId);
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
      userId,
      source: 'phenom-app'
    });

    const populatedObservation = await observation.populate(
      'userId',
      'name email avatar'
    );

    // Publish event via WebSocket
    publishObservationEvent(
      'observation:created',
      populatedObservation.toObject()
    );

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
    ).populate('userId', 'name email avatar');

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
      observation = await Observation.findByIdAndDelete(observationId, {
        session
      });

      if (!observation) {
        // Abort transaction if observation doesn't exist
        await session.abortTransaction();
        throw new NotFoundError('Observation not found');
      }

      // Delete associated comments within transaction
      const Comment = (await import('../models/Comment.js')).default;
      const deleteResult = await Comment.deleteMany(
        { observationId },
        { session }
      );
      console.log(`✅ ${deleteResult.deletedCount} comment(s) deleted`);

      // Commit transaction
      await session.commitTransaction();
    } catch (error) {
      // Abort transaction on error (unless it's our NotFoundError)
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      console.error(
        `❌ Error during deletion (transaction aborted): ${error.message}`
      );
      throw error;
    } finally {
      session.endSession();
    }

    // Delete images from Cloudinary after transaction (external to MongoDB)
    try {
      const imageService = (await import('./image.service.js')).default;
      const deletedImages = await imageService.deleteAllImagesForObservation(
        observationId
      );
      console.log(`✅ ${deletedImages} image(s) deleted from Cloudinary`);
    } catch (error) {
      console.error(
        `❌ Error deleting images from Cloudinary: ${error.message}`
      );
      console.warn(
        `⚠️ Observation deleted but ${
          observation.images?.length || 0
        } image(s) might be orphaned on Cloudinary`
      );
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
    console.log('🔍 getObservationOwnerId called with ID:', observationId);
    const observation = await Observation.findById(observationId).select(
      'userId'
    );
    console.log('🔍 Observation found:', observation ? 'Yes' : 'No', observation?._id);
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
   * @param {number} limit - Max results.
   * @returns {Array} Nearby observations.
   */
  async getNearbyObservations(latitude, longitude, radius = 10, limit = 50) {
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusKm = parseFloat(radius);
    const maxResults = Math.min(500, Math.max(1, parseInt(limit)));

    // Find observations with coordinates within radius
    // Using a simple bounding box approximation
    const latDelta = radiusKm / 111; // ~111km per degree of latitude
    const lngDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

    const observations = await Observation.find({
      'coordinates.lat': { $gte: lat - latDelta, $lte: lat + latDelta },
      'coordinates.lng': { $gte: lng - lngDelta, $lte: lng + lngDelta }
    })
      .populate('userId', 'name email avatar')
      .populate('commentsCount')
      .limit(maxResults)
      .lean({ virtuals: true });

    // Calculate actual distances and filter
    const haversineDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    return observations
      .map((obs) => ({
        ...obs,
        distance: haversineDistance(
          lat,
          lng,
          obs.coordinates.lat,
          obs.coordinates.lng
        )
      }))
      .filter((obs) => obs.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Retrieves public statistics about observations (legacy).
   * @returns {Object} Statistics.
   */
  async getObservationStats() {
    return this.getStatistics();
  }

  /**
   * Retrieves the most popular phenomena.
   * @param {number} limit - Number of types to return.
   * @returns {Array} Popular phenomena with counts.
   */
  async getPopularObservationTypes(limit = 6) {
    const popularPhenomena = await Observation.aggregate([
      { $unwind: '$phenomena' },
      { $group: { _id: '$phenomena', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { type: '$_id', count: 1, _id: 0 } }
    ]);

    return popularPhenomena;
  }
}

export default new ObservationService();
