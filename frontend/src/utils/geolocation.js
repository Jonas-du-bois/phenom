/**
 * Geolocation Utilities
 *
 * Provides functions for working with GPS coordinates and geolocation.
 * Wraps the browser's Geolocation API with Promise-based interface
 * and adds utility functions for coordinate formatting and distance calculation.
 *
 * @module utils/geolocation
 *
 * Features:
 * - Get current position (Promise-based)
 * - Watch position in real-time
 * - Calculate distance between two points (Haversine formula)
 * - Generate OpenStreetMap and Google Maps URLs
 * - Format coordinates for display
 * - Validate coordinate values
 */

// ============================================================================
// GEOLOCATION OPTIONS
// ============================================================================

/**
 * Default options for the Geolocation API
 */
const DEFAULT_GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

/**
 * Get the user's current GPS position
 * @param {Object} options - Geolocation options
 * @returns {Promise<Object>} { latitude, longitude, accuracy } or error
 */
export const getCurrentPosition = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Géolocalisation non supportée par ce navigateur"));
      return;
    }

    const mergedOptions = { ...DEFAULT_GEOLOCATION_OPTIONS, ...options };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let errorMessage = "Erreur de géolocalisation";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Permission refusée. Autorisez la géolocalisation dans les paramètres.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Position non disponible.";
            break;
          case error.TIMEOUT:
            errorMessage = "Délai de détection dépassé.";
            break;
          default:
            errorMessage = "Erreur inconnue.";
        }

        reject(new Error(errorMessage));
      },
      mergedOptions,
    );
  });
};

/**
 * Watch GPS position in real-time
 * @param {Function} onSuccess - Callback called on each position update
 * @param {Function} onError - Callback called on error
 * @param {Object} options - Geolocation options
 * @returns {number} Watcher ID (to stop watching with clearWatch)
 */
export const watchPosition = (onSuccess, onError, options = {}) => {
  if (!navigator.geolocation) {
    if (onError) {
      onError(new Error("Géolocalisation non supportée par ce navigateur"));
    }
    return null;
  }

  const mergedOptions = { ...DEFAULT_GEOLOCATION_OPTIONS, ...options };

  return navigator.geolocation.watchPosition(
    (position) => {
      if (onSuccess) {
        onSuccess({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          timestamp: position.timestamp,
        });
      }
    },
    (error) => {
      if (onError) {
        onError(new Error(getGeolocationErrorMessage(error)));
      }
    },
    mergedOptions,
  );
};

/**
 * Stop position watching
 * @param {number} watchId - Watcher ID
 */
export const clearPositionWatch = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Generate an OpenStreetMap URL with marker
 * @param {Array<number>} coordinates - [longitude, latitude] (GeoJSON format)
 * @param {number} zoom - Zoom level (1-18)
 * @returns {string} OpenStreetMap URL
 */
export const getOpenStreetMapUrl = (coordinates, zoom = 15) => {
  const [lng, lat] = coordinates;
  // mlat/mlon adds a marker, #map defines zoom and center
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
};

/**
 * Generate a Google Maps URL with marker
 * @param {Array<number>} coordinates - [longitude, latitude] (GeoJSON format)
 * @param {number} zoom - Zoom level (1-21)
 * @returns {string} Google Maps URL
 */
export const getGoogleMapsUrl = (coordinates, zoom = 15) => {
  const [lng, lat] = coordinates;
  return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}`;
};

/**
 * Calculate the distance between two GPS points (Haversine formula)
 * @param {Object} point1 - { latitude, longitude }
 * @param {Object} point2 - { latitude, longitude }
 * @returns {number} Distance in kilometers
 */
export const calculateDistance = (point1, point2) => {
  const R = 6371; // Earth radius in km
  const dLat = toRadians(point2.latitude - point1.latitude);
  const dLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.latitude)) *
      Math.cos(toRadians(point2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};

// ============================================================================
// COORDINATE FORMATTING AND VALIDATION
// ============================================================================

/**
 * Format GPS coordinates in human-readable format
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {number} precision - Decimal places (default: 6)
 * @returns {string} Formatted coordinates (e.g., "46.818200°, 8.227500°")
 */
export const formatCoordinates = (latitude, longitude, precision = 6) => {
  return `${latitude.toFixed(precision)}°, ${longitude.toFixed(precision)}°`;
};

/**
 * Validate GPS coordinates
 * @param {number} latitude - Latitude (-90 to 90)
 * @param {number} longitude - Longitude (-180 to 180)
 * @returns {boolean} True if coordinates are valid
 */
export const isValidCoordinates = (latitude, longitude) => {
  return (
    typeof latitude === "number" &&
    typeof longitude === "number" &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
};

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Convert degrees to radians
 * @param {number} degrees - Angle in degrees
 * @returns {number} Angle in radians
 * @private
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Get human-readable geolocation error message
 * @param {GeolocationPositionError} error - Geolocation API error
 * @returns {string} French error message for UI display
 * @private
 */
const getGeolocationErrorMessage = (error) => {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Permission refusée. Autorisez la géolocalisation dans les paramètres.";
    case error.POSITION_UNAVAILABLE:
      return "Position non disponible.";
    case error.TIMEOUT:
      return "Délai de détection dépassé.";
    default:
      return "Erreur inconnue.";
  }
};

/**
 * Check if geolocation is supported by the browser
 * @returns {boolean} True if geolocation API is available
 */
export const isGeolocationSupported = () => {
  return "geolocation" in navigator;
};

// ============================================================================
// OBSERVATION COORDINATES HELPERS
// ============================================================================

/**
 * Extract coordinates from an observation object
 * Handles both formats: coordinates.lat/lng and location.coordinates (GeoJSON)
 * @param {Object} observation - Observation object
 * @returns {{ lat: number, lng: number } | null} Coordinates or null if not found
 */
export const getObservationCoordinates = (observation) => {
  if (!observation) return null;

  // Backend format: coordinates.lat and coordinates.lng
  if (
    observation.coordinates?.lat != null &&
    observation.coordinates?.lng != null
  ) {
    return {
      lat: observation.coordinates.lat,
      lng: observation.coordinates.lng,
    };
  }

  // GeoJSON format: location.coordinates [lng, lat]
  if (
    Array.isArray(observation.location?.coordinates) &&
    observation.location.coordinates.length >= 2
  ) {
    return {
      lat: observation.location.coordinates[1],
      lng: observation.location.coordinates[0],
    };
  }

  return null;
};

/**
 * Check if an observation has valid coordinates
 * @param {Object} observation - Observation object
 * @returns {boolean} True if coordinates are present
 */
export const hasValidCoordinates = (observation) => {
  return getObservationCoordinates(observation) !== null;
};

/**
 * Get coordinates in Leaflet format [lat, lng]
 * @param {Object} observation - Observation object
 * @returns {[number, number] | null} [lat, lng] or null
 */
export const getLeafletCoordinates = (observation) => {
  const coords = getObservationCoordinates(observation);
  if (!coords) return null;
  return [coords.lat, coords.lng];
};
