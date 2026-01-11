/**
 * useMap Composable
 *
 * Interactive map management for displaying observation markers.
 * YAGNI: Only essential features for map display and interaction.
 *
 * @module composables/useMap
 */
import { ref } from "vue";

export function useMap() {
  const map = ref(null);
  const markers = ref([]);
  const selectedMarker = ref(null);
  const userLocation = ref(null);
  const loading = ref(false);

  // Default configuration
  const defaultCenter = [46.603354, 1.888334]; // Center of France
  const defaultZoom = 6;

  /**
   * Initialize the map instance
   * @param {Object} mapInstance - Leaflet map instance
   */
  const initMap = (mapInstance) => {
    map.value = mapInstance;
  };

  /**
   * Add a marker for an observation
   * @param {Object} observation - Observation data with location
   * @returns {Object|null} Created marker or null if no coordinates
   */
  const addMarker = (observation) => {
    if (!observation.location?.coordinates) return null;

    const marker = {
      id: observation._id,
      position: [
        observation.location.coordinates[1], // lat
        observation.location.coordinates[0], // lng
      ],
      data: observation,
    };

    markers.value.push(marker);
    return marker;
  };

  /**
   * Add markers for multiple observations
   * @param {Array} observations - List of observations
   */
  const addMarkers = (observations) => {
    observations.forEach((obs) => addMarker(obs));
  };

  /**
   * Remove a marker by observation ID
   * @param {string} observationId - ID of the observation
   */
  const removeMarker = (observationId) => {
    markers.value = markers.value.filter((m) => m.id !== observationId);
  };

  /**
   * Clear all markers from the map
   */
  const clearMarkers = () => {
    markers.value = [];
  };

  /**
   * Center map on a specific marker
   * @param {string} observationId - ID of the observation to center on
   */
  const centerOnMarker = (observationId) => {
    const marker = markers.value.find((m) => m.id === observationId);
    if (marker && map.value) {
      map.value.setView(marker.position, 14);
      selectedMarker.value = marker;
    }
  };

  /**
   * Get the user's current location
   * @returns {Promise<Object>} User location with lat, lng, accuracy
   */
  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Géolocalisation non supportée"));
        return;
      }

      loading.value = true;
      navigator.geolocation.getCurrentPosition(
        (position) => {
          userLocation.value = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          loading.value = false;
          resolve(userLocation.value);
        },
        (error) => {
          loading.value = false;
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  /**
   * Center map on user's current location
   * @returns {Promise<Object>} User location
   */
  const centerOnUser = async () => {
    try {
      const location = await getUserLocation();
      if (map.value) {
        map.value.setView([location.lat, location.lng], 14);
      }
      return location;
    } catch (error) {
      console.error("Geolocation error:", error);
      throw error;
    }
  };

  /**
   * Calculate bounds to fit all markers
   */
  const fitBounds = () => {
    if (!map.value || markers.value.length === 0) return;

    const bounds = markers.value.map((m) => m.position);
    map.value.fitBounds(bounds, { padding: [50, 50] });
  };

  return {
    // State
    map,
    markers,
    selectedMarker,
    userLocation,
    loading,
    defaultCenter,
    defaultZoom,

    // Actions
    initMap,
    addMarker,
    addMarkers,
    removeMarker,
    clearMarkers,
    centerOnMarker,
    getUserLocation,
    centerOnUser,
    fitBounds,
  };
}
