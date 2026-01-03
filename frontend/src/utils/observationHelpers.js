/**
 * Observation Helpers - Utilities for Managing Observations
 *
 * Provides functions for filtering, sorting, grouping, and searching
 * observation data. Includes geographic distance calculations using
 * the Haversine formula.
 *
 * @module utils/observationHelpers
 *
 * Features:
 * - Filter by type, tags, date, and geographic proximity
 * - Group by type, date, or user
 * - Sort by various fields
 * - Search across multiple fields
 * - Calculate statistics
 * - Find similar observations
 */

import { OBSERVATION_TYPES } from "../constants/observationTypes";

// ============================================================================
// FILTERING FUNCTIONS
// ============================================================================

/**
 * Filter observations by type code(s)
 * @param {Array} observations - List of observations
 * @param {string|Array<string>} types - Type code(s) to filter by
 * @returns {Array} Filtered observations
 */
export const filterObservationsByType = (observations, types) => {
  if (!types || types.length === 0) return observations;
  const typeArray = Array.isArray(types) ? types : [types];
  return observations.filter((obs) => typeArray.includes(obs.type));
};

/**
 * Filter observations by tags
 * @param {Array} observations - List of observations
 * @param {Array<string>} tags - Tags to search for
 * @param {boolean} matchAll - If true, observation must have ALL tags (AND); otherwise ANY tag (OR)
 * @returns {Array} Filtered observations
 */
export const filterObservationsByTags = (
  observations,
  tags,
  matchAll = false
) => {
  if (!tags || tags.length === 0) return observations;

  return observations.filter((obs) => {
    if (!obs.tags || obs.tags.length === 0) return false;

    if (matchAll) {
      return tags.every((tag) => obs.tags.includes(tag));
    } else {
      return tags.some((tag) => obs.tags.includes(tag));
    }
  });
};

/**
 * Filter observations by date range
 * @param {Array} observations - List of observations
 * @param {Date} startDate - Start of date range
 * @param {Date} endDate - End of date range
 * @returns {Array} Filtered observations within date range
 */
export const filterObservationsByDate = (observations, startDate, endDate) => {
  return observations.filter((obs) => {
    const obsDate = new Date(obs.date || obs.createdAt);
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    return obsDate >= start && obsDate <= end;
  });
};

/**
 * Filter observations by geographic proximity (Haversine formula)
 * Returns observations sorted by distance from center point
 * @param {Array} observations - List of observations
 * @param {Object} center - Center point { latitude, longitude }
 * @param {number} radiusKm - Maximum radius in kilometers
 * @returns {Array} Filtered observations with added distance property, sorted by distance
 */
export const filterObservationsByProximity = (
  observations,
  center,
  radiusKm
) => {
  if (!center || !center.latitude || !center.longitude) return observations;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
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
    .map((obs) => {
      const [lng, lat] = obs.location?.coordinates || [0, 0];
      const distance = calculateDistance(
        center.latitude,
        center.longitude,
        lat,
        lng
      );
      return { ...obs, distance };
    })
    .filter((obs) => obs.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};

/**
 * Group observations by type
 * @param {Array} observations - List of observations
 * @returns {Object} Observations grouped by type
 */
export const groupObservationsByType = (observations) => {
  return observations.reduce((acc, obs) => {
    const type = obs.type || "UNKNOWN";
    if (!acc[type]) acc[type] = [];
    acc[type].push(obs);
    return acc;
  }, {});
};

/**
 * Group observations by date (day)
 * @param {Array} observations - List of observations
 * @returns {Object} Observations grouped by date
 */
export const groupObservationsByDate = (observations) => {
  return observations.reduce((acc, obs) => {
    const date = new Date(obs.date || obs.createdAt);
    const dateKey = date.toISOString().split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(obs);
    return acc;
  }, {});
};

/**
 * Group observations by user
 * @param {Array} observations - List of observations
 * @returns {Object} Observations grouped by userId
 */
export const groupObservationsByUser = (observations) => {
  return observations.reduce((acc, obs) => {
    const userId = obs.userId?._id || obs.userId;
    if (!acc[userId]) acc[userId] = [];
    acc[userId].push(obs);
    return acc;
  }, {});
};

/**
 * Sort observations
 * @param {Array} observations - List of observations
 * @param {string} field - Field to sort by
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} Sorted observations
 */
export const sortObservations = (
  observations,
  field = "createdAt",
  order = "desc"
) => {
  return [...observations].sort((a, b) => {
    let aVal = a[field];
    let bVal = b[field];

    // Handle dates
    if (field === "createdAt" || field === "date" || field === "updatedAt") {
      aVal = new Date(aVal).getTime();
      bVal = new Date(bVal).getTime();
    }

    // Handle strings
    if (typeof aVal === "string") {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (order === "asc") {
      return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
    } else {
      return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
    }
  });
};

/**
 * Recherche dans les observations (titre, description, tags)
 * @param {Array} observations - Liste des observations
 * @param {string} searchText - Texte à rechercher
 * @returns {Array} Observations correspondantes
 */
export const searchObservations = (observations, searchText) => {
  if (!searchText || searchText.trim() === "") return observations;

  const search = searchText.toLowerCase().trim();

  return observations.filter((obs) => {
    const title = (obs.title || "").toLowerCase();
    const description = (obs.description || "").toLowerCase();
    const tags = (obs.tags || []).join(" ").toLowerCase();
    const type = (obs.type || "").toLowerCase();

    return (
      title.includes(search) ||
      description.includes(search) ||
      tags.includes(search) ||
      type.includes(search)
    );
  });
};

/**
 * Calculate statistics for observations
 * @param {Array} observations - List of observations
 * @returns {Object} Statistics object
 */
export const calculateObservationStats = (observations) => {
  const stats = {
    total: observations.length,
    withImages: observations.filter((obs) => obs.images?.length > 0).length,
    withoutImages: observations.filter(
      (obs) => !obs.images || obs.images.length === 0
    ).length,
    byType: {},
    tagCloud: {},
    avgImagesPerObservation: 0,
    dateRange: { oldest: null, newest: null },
  };

  // Stats by type
  observations.forEach((obs) => {
    const type = obs.type || "UNKNOWN";
    stats.byType[type] = (stats.byType[type] || 0) + 1;

    // Tag cloud
    if (obs.tags) {
      obs.tags.forEach((tag) => {
        stats.tagCloud[tag] = (stats.tagCloud[tag] || 0) + 1;
      });
    }
  });

  // Average images per observation
  if (stats.total > 0) {
    const totalImages = observations.reduce(
      (sum, obs) => sum + (obs.images?.length || 0),
      0
    );
    stats.avgImagesPerObservation = (totalImages / stats.total).toFixed(2);
  }

  // Date range
  if (observations.length > 0) {
    const dates = observations.map((obs) =>
      new Date(obs.date || obs.createdAt).getTime()
    );
    stats.dateRange.oldest = new Date(Math.min(...dates));
    stats.dateRange.newest = new Date(Math.max(...dates));
  }

  return stats;
};

/**
 * Check if an observation has all required data
 * Note: Error messages are in French for UI display
 * @param {Object} observation - Observation to validate
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export const validateObservationData = (observation) => {
  const errors = [];

  if (!observation.title || observation.title.trim().length < 3) {
    errors.push("Le titre doit contenir au moins 3 caractères");
  }

  if (!observation.description || observation.description.trim().length < 10) {
    errors.push("La description doit contenir au moins 10 caractères");
  }

  if (
    !observation.location?.coordinates ||
    observation.location.coordinates.length !== 2
  ) {
    errors.push("Les coordonnées GPS sont requises");
  }

  if (observation.type && !OBSERVATION_TYPES[observation.type]) {
    errors.push("Type d'observation invalide");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Extract unique tags from all observations
 * @param {Array} observations - List of observations
 * @returns {Array<string>} Sorted list of unique tags
 */
export const extractUniqueTags = (observations) => {
  const tagsSet = new Set();
  observations.forEach((obs) => {
    if (obs.tags) {
      obs.tags.forEach((tag) => tagsSet.add(tag));
    }
  });
  return Array.from(tagsSet).sort();
};

/**
 * Trouve les observations similaires (même type, tags similaires, proximité géographique)
 * @param {Object} observation - Observation de référence
 * @param {Array} allObservations - Liste de toutes les observations
 * @param {number} maxResults - Nombre max de résultats
 * @returns {Array} Observations similaires avec score de similarité
 */
export const findSimilarObservations = (
  observation,
  allObservations,
  maxResults = 5
) => {
  return allObservations
    .filter((obs) => obs._id !== observation._id)
    .map((obs) => {
      let score = 0;

      // Même type (+3 points)
      if (obs.type === observation.type) score += 3;

      // Tags en commun (+1 point par tag)
      const commonTags = (obs.tags || []).filter((tag) =>
        (observation.tags || []).includes(tag)
      );
      score += commonTags.length;

      // Proximité géographique (dans les 50km = +2 points)
      if (obs.location?.coordinates && observation.location?.coordinates) {
        const [lng1, lat1] = observation.location.coordinates;
        const [lng2, lat2] = obs.location.coordinates;
        const distance =
          Math.sqrt(Math.pow(lat2 - lat1, 2) + Math.pow(lng2 - lng1, 2)) * 111; // Approximation en km

        if (distance < 50) score += 2;
      }

      return { ...obs, similarityScore: score };
    })
    .filter((obs) => obs.similarityScore > 0)
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, maxResults);
};
