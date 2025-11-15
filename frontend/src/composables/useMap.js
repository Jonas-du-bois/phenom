/**
 * Composable pour la gestion de la carte interactive
 * YAGNI: Seulement les fonctionnalités nécessaires pour afficher et interagir
 */
import { ref, computed } from "vue";

export function useMap() {
  const map = ref(null);
  const markers = ref([]);
  const selectedMarker = ref(null);
  const userLocation = ref(null);
  const loading = ref(false);

  // Configuration par défaut
  const defaultCenter = [46.603354, 1.888334]; // Centre de la France
  const defaultZoom = 6;

  /**
   * Initialiser la carte
   */
  const initMap = (mapInstance) => {
    map.value = mapInstance;
  };

  /**
   * Ajouter un marker
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
   * Ajouter plusieurs markers
   */
  const addMarkers = (observations) => {
    observations.forEach((obs) => addMarker(obs));
  };

  /**
   * Supprimer un marker
   */
  const removeMarker = (observationId) => {
    markers.value = markers.value.filter((m) => m.id !== observationId);
  };

  /**
   * Nettoyer tous les markers
   */
  const clearMarkers = () => {
    markers.value = [];
  };

  /**
   * Centrer sur un marker
   */
  const centerOnMarker = (observationId) => {
    const marker = markers.value.find((m) => m.id === observationId);
    if (marker && map.value) {
      map.value.setView(marker.position, 14);
      selectedMarker.value = marker;
    }
  };

  /**
   * Obtenir la position de l'utilisateur
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
        },
      );
    });
  };

  /**
   * Centrer sur l'utilisateur
   */
  const centerOnUser = async () => {
    try {
      const location = await getUserLocation();
      if (map.value) {
        map.value.setView([location.lat, location.lng], 14);
      }
      return location;
    } catch (error) {
      console.error("Erreur géolocalisation:", error);
      throw error;
    }
  };

  /**
   * Calculer les bounds pour contenir tous les markers
   */
  const fitBounds = () => {
    if (!map.value || markers.value.length === 0) return;

    const bounds = markers.value.map((m) => m.position);
    map.value.fitBounds(bounds, { padding: [50, 50] });
  };

  return {
    // État
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
