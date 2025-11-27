import { NotFoundError } from '../utils/errors.js';
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

    // Filtre par type d'observation
    if (filters.type) {
      query.type = filters.type;
    }

    // Filtre de recherche textuelle
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Filtre géographique par zone (bounding box) - pour la carte
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
              [minLng, minLat], // Coin sud-ouest
              [maxLng, minLat], // Coin sud-est
              [maxLng, maxLat], // Coin nord-est
              [minLng, maxLat], // Coin nord-ouest
              [minLng, minLat]  // Retour au point de départ (fermeture du polygone)
            ]]
          }
        }
      };
    }
    // Filtre géographique (proximité) - pour la recherche à proximité
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

    // Gestion du tri
    const sortBy = filters.sortBy || 'createdAt';
    const order = filters.order === 'asc' ? 1 : -1;
    const sortOptions = { [sortBy]: order };

    // Exécuter la requête avec pagination
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
   * Récupère une observation par son ID
   * @param {string} observationId - ID de l'observation
   * @returns {Object} Observation
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
      throw new NotFoundError('Observation non trouvée');
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
      throw new NotFoundError('Observation non trouvée');
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
    // Utiliser une transaction pour garantir l'atomicité
    const session = await Observation.startSession();
    let observation;

    try {
      await session.startTransaction();

      // Supprimer l'observation dans la transaction
      observation = await Observation.findByIdAndDelete(observationId, { session });

      if (!observation) {
        // Annuler la transaction si l'observation n'existe pas
        await session.abortTransaction();
        throw new NotFoundError('Observation non trouvée');
      }

      // Supprimer tous les commentaires associés dans la transaction
      const Comment = (await import('../models/Comment.js')).default;
      const deleteResult = await Comment.deleteMany({ observationId }, { session });
      console.log(`✅ ${deleteResult.deletedCount} commentaire(s) supprimé(s)`);

      // Valider la transaction
      await session.commitTransaction();
    } catch (error) {
      // Annuler la transaction en cas d'erreur (sauf si c'est notre NotFoundError)
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      console.error(`❌ Erreur lors de la suppression (transaction annulée): ${error.message}`);
      throw error; // Renvoyer l'erreur originale (ou notre NotFoundError)
    } finally {
      session.endSession();
    }

    // Supprimer les images Cloudinary après la transaction (externe à MongoDB)
    try {
      const imageService = (await import('./image.service.js')).default;
      const deletedImages = await imageService.deleteAllImagesForObservation(observationId);
      console.log(`✅ ${deletedImages} image(s) supprimée(s) de Cloudinary`);
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression des images Cloudinary: ${error.message}`);
      console.warn(`⚠️ L'observation a été supprimée mais ${observation.images?.length || 0} image(s) pourrai(en)t être orpheline(s) sur Cloudinary`);
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
    if (!observation) {
      throw new NotFoundError('Observation non trouvée pour vérification de propriété');
    }
    return observation.userId;
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

  /**
   * Récupère les types d'observations les plus populaires
   * @param {number} limit - Nombre de types à retourner
   * @returns {Array} Types populaires avec leurs comptages
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
