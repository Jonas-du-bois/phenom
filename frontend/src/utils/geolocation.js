/**
 * Utilitaires pour la géolocalisation
 */

/**
 * Options par défaut pour la géolocalisation
 */
const DEFAULT_GEOLOCATION_OPTIONS = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
};

/**
 * Récupère la position GPS actuelle de l'utilisateur
 * @param {Object} options - Options de géolocalisation
 * @returns {Promise<Object>} { latitude, longitude, accuracy } ou erreur
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
 * Surveille la position GPS en temps réel
 * @param {Function} onSuccess - Callback appelé à chaque mise à jour de position
 * @param {Function} onError - Callback appelé en cas d'erreur
 * @param {Object} options - Options de géolocalisation
 * @returns {number} ID du watcher (pour arrêter la surveillance avec clearWatch)
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
 * Arrête la surveillance de position
 * @param {number} watchId - ID du watcher
 */
export const clearPositionWatch = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Génère une URL OpenStreetMap avec marqueur
 * @param {Array<number>} coordinates - [longitude, latitude] (format GeoJSON)
 * @param {number} zoom - Niveau de zoom (1-18)
 * @returns {string} URL OpenStreetMap
 */
export const getOpenStreetMapUrl = (coordinates, zoom = 15) => {
  const [lng, lat] = coordinates;
  // mlat/mlon ajoute un marqueur, #map définit le zoom et le centre
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`;
};

/**
 * Génère une URL Google Maps avec marqueur
 * @param {Array<number>} coordinates - [longitude, latitude] (format GeoJSON)
 * @param {number} zoom - Niveau de zoom (1-21)
 * @returns {string} URL Google Maps
 */
export const getGoogleMapsUrl = (coordinates, zoom = 15) => {
  const [lng, lat] = coordinates;
  return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}`;
};

/**
 * Calcule la distance entre deux points GPS (formule de Haversine)
 * @param {Object} point1 - { latitude, longitude }
 * @param {Object} point2 - { latitude, longitude }
 * @returns {number} Distance en kilomètres
 */
export const calculateDistance = (point1, point2) => {
  const R = 6371; // Rayon de la Terre en km
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

/**
 * Formate les coordonnées GPS en format lisible
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @param {number} precision - Nombre de décimales
 * @returns {string} Coordonnées formatées
 */
export const formatCoordinates = (latitude, longitude, precision = 6) => {
  return `${latitude.toFixed(precision)}°, ${longitude.toFixed(precision)}°`;
};

/**
 * Vérifie si des coordonnées sont valides
 * @param {number} latitude - Latitude
 * @param {number} longitude - Longitude
 * @returns {boolean} true si valides
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

/**
 * Convertit des degrés en radians
 * @param {number} degrees - Degrés
 * @returns {number} Radians
 */
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Récupère le message d'erreur de géolocalisation
 * @param {GeolocationPositionError} error - Erreur de géolocalisation
 * @returns {string} Message d'erreur
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
 * Vérifie si la géolocalisation est supportée
 * @returns {boolean} true si supportée
 */
export const isGeolocationSupported = () => {
  return "geolocation" in navigator;
};

// === Observation Coordinates Helpers ===

/**
 * Extrait les coordonnées d'une observation
 * Gère les deux formats: coordinates.lat/lng et location.coordinates
 * @param {Object} observation - L'observation
 * @returns {{ lat: number, lng: number } | null} Coordonnées ou null
 */
export const getObservationCoordinates = (observation) => {
  if (!observation) return null;

  // Format backend: coordinates.lat et coordinates.lng
  if (
    observation.coordinates?.lat != null &&
    observation.coordinates?.lng != null
  ) {
    return {
      lat: observation.coordinates.lat,
      lng: observation.coordinates.lng,
    };
  }

  // Format GeoJSON: location.coordinates [lng, lat]
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
 * Vérifie si une observation a des coordonnées valides
 * @param {Object} observation - L'observation
 * @returns {boolean} true si coordonnées présentes
 */
export const hasValidCoordinates = (observation) => {
  return getObservationCoordinates(observation) !== null;
};

/**
 * Retourne les coordonnées au format Leaflet [lat, lng]
 * @param {Object} observation - L'observation
 * @returns {[number, number] | null} [lat, lng] ou null
 */
export const getLeafletCoordinates = (observation) => {
  const coords = getObservationCoordinates(observation);
  if (!coords) return null;
  return [coords.lat, coords.lng];
};
