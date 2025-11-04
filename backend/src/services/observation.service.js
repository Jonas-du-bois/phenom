import Observation from '../models/Observation.js';
import { getPaginationParams, createPaginationMeta } from '../utils/pagination.js';
import { publishObservationEvent } from '../config/websocket.js';

/**
 * Service de gestion des observations
 */
class ObservationService {
  /**
   * Récupère la liste des observations avec filtres et pagination
   * @param {Object} filters - Filtres de recherche
   * @returns {Object} Liste paginée d'observations
   */
  async getObservations(filters = {}) {
    const { page, limit, skip } = getPaginationParams(filters);
    const query = {};

    // Filtre de recherche textuelle
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Filtre géographique (proximité)
    if (filters.lat && filters.lng && filters.radius) {
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

    // Exécuter la requête avec pagination
    const [observations, total] = await Promise.all([
      Observation.find(query)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
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
   * Récupère une observation par son ID
   * @param {string} observationId - ID de l'observation
   * @returns {Object} Observation
   */
  async getObservationById(observationId) {
    const observation = await Observation.findById(observationId)
      .populate('userId', 'name email');

    if (!observation) {
      throw new Error('OBSERVATION_NOT_FOUND');
    }

    return observation;
  }

  /**
   * Crée une nouvelle observation
   * @param {Object} observationData - Données de l'observation
   * @param {string} userId - ID de l'utilisateur créateur
   * @returns {Object} Observation créée
   */
  async createObservation(observationData, userId) {
    const observation = await Observation.create({
      ...observationData,
      userId
    });

    const populatedObservation = await observation.populate('userId', 'name email');

    // Publier l'événement via WebSocket
    publishObservationEvent('observation:created', populatedObservation.toObject());

    return populatedObservation;
  }

  /**
   * Met à jour une observation
   * @param {string} observationId - ID de l'observation
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Object} Observation mise à jour
   */
  async updateObservation(observationId, updateData) {
    const observation = await Observation.findByIdAndUpdate(
      observationId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!observation) {
      throw new Error('OBSERVATION_NOT_FOUND');
    }

    // Publier l'événement via WebSocket
    publishObservationEvent('observation:updated', observation.toObject());

    return observation;
  }

  /**
   * Supprime une observation
   * @param {string} observationId - ID de l'observation
   * @returns {Object} Observation supprimée
   */
  async deleteObservation(observationId) {
    const observation = await Observation.findByIdAndDelete(observationId);

    if (!observation) {
      throw new Error('OBSERVATION_NOT_FOUND');
    }

    // Supprimer toutes les images associées
    try {
      const imageService = (await import('./image.service.js')).default;
      await imageService.deleteAllImagesForObservation(observationId);
    } catch (error) {
      console.error(`Erreur lors de la suppression des images: ${error.message}`);
    }

    // Publier l'événement via WebSocket
    publishObservationEvent('observation:deleted', { observationId });

    return observation;
  }

  /**
   * Récupère le propriétaire d'une observation
   * @param {string} observationId - ID de l'observation
   * @returns {string} ID du propriétaire
   */
  async getObservationOwnerId(observationId) {
    const observation = await Observation.findById(observationId).select('userId');
    return observation?.userId;
  }

  /**
   * Recherche d'observations à proximité
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} radius - Rayon en km
   * @param {Object} query - Paramètres de pagination
   * @returns {Object} Observations paginées
   */
  async getNearbyObservations(latitude, longitude, radius, query) {
    const { page, limit, skip } = getPaginationParams(query);
    const radiusInMeters = parseFloat(radius) * 1000;

    // Utiliser $geoWithin au lieu de $near pour permettre skip/limit
    const geoQuery = {
      location: {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(longitude), parseFloat(latitude)],
            radiusInMeters / 6378100 // Rayon de la Terre en mètres
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
   * Récupère les statistiques publiques des observations
   * @returns {Object} Statistiques
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
}

export default new ObservationService();
