/**
 * Composable pour la géolocalisation
 * Gère l'obtention de la position et le reverse geocoding
 */
import { ref, readonly, onUnmounted } from "vue";

export function useGeolocation(options = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 60000,
    watch = false,
  } = options;

  const coordinates = ref(null);
  const address = ref("");
  const error = ref(null);
  const loading = ref(false);
  const watchId = ref(null);

  /**
   * Obtient la position actuelle
   */
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = new Error("Géolocalisation non supportée");
        error.value = err.message;
        reject(err);
        return;
      }

      loading.value = true;
      error.value = null;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: position.timestamp,
          };

          coordinates.value = coords;
          loading.value = false;
          resolve(coords);
        },
        (err) => {
          error.value = getErrorMessage(err);
          loading.value = false;
          reject(err);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        },
      );
    });
  };

  /**
   * Démarre le suivi de position en temps réel
   */
  const startWatching = () => {
    if (!navigator.geolocation) {
      error.value = "Géolocalisation non supportée";
      return;
    }

    if (watchId.value) {
      stopWatching();
    }

    loading.value = true;
    error.value = null;

    watchId.value = navigator.geolocation.watchPosition(
      (position) => {
        coordinates.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          timestamp: position.timestamp,
        };
        loading.value = false;
      },
      (err) => {
        error.value = getErrorMessage(err);
        loading.value = false;
      },
      {
        enableHighAccuracy,
        timeout,
        maximumAge: 0, // Toujours position fraîche en mode watch
      },
    );
  };

  /**
   * Arrête le suivi de position
   */
  const stopWatching = () => {
    if (watchId.value) {
      navigator.geolocation.clearWatch(watchId.value);
      watchId.value = null;
    }
  };

  /**
   * Reverse geocoding - obtient l'adresse à partir des coordonnées
   * Utilise Nominatim (OpenStreetMap) - gratuit et sans clé API
   */
  const reverseGeocode = async (lat, lng) => {
    try {
      loading.value = true;

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?` +
          `format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "fr",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erreur de géocodage");
      }

      const data = await response.json();

      // Construire une adresse lisible
      const parts = [];
      const addr = data.address;

      if (addr.road) parts.push(addr.road);
      if (addr.house_number) parts[0] = `${addr.house_number} ${parts[0]}`;
      if (addr.city || addr.town || addr.village) {
        parts.push(addr.city || addr.town || addr.village);
      }
      if (addr.country) parts.push(addr.country);

      address.value = parts.join(", ") || data.display_name;

      return {
        address: address.value,
        fullAddress: data.display_name,
        raw: data,
      };
    } catch (err) {
      console.error("Erreur reverse geocoding:", err);
      return { address: "", fullAddress: "", raw: null };
    } finally {
      loading.value = false;
    }
  };

  /**
   * Calcule la distance entre deux points (en km)
   * Formule de Haversine
   */
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (deg) => deg * (Math.PI / 180);

  /**
   * Obtient le message d'erreur approprié
   */
  const getErrorMessage = (err) => {
    switch (err.code) {
      case 1: // PERMISSION_DENIED
        return "Accès à la localisation refusé. Veuillez autoriser l'accès dans les paramètres.";
      case 2: // POSITION_UNAVAILABLE
        return "Position indisponible. Vérifiez votre connexion GPS.";
      case 3: // TIMEOUT
        return "Délai d'attente dépassé. Réessayez.";
      default:
        return err.message || "Erreur de géolocalisation";
    }
  };

  /**
   * Vérifie si la géolocalisation est disponible
   */
  const isSupported = () => !!navigator.geolocation;

  /**
   * Demande la permission de géolocalisation
   */
  const requestPermission = async () => {
    if (!navigator.permissions) {
      // Fallback: essayer d'obtenir la position
      try {
        await getCurrentPosition();
        return "granted";
      } catch {
        return "denied";
      }
    }

    try {
      const result = await navigator.permissions.query({ name: "geolocation" });
      return result.state;
    } catch {
      return "prompt";
    }
  };

  // Démarrer le watch si demandé
  if (watch) {
    startWatching();
  }

  // Cleanup
  onUnmounted(() => {
    stopWatching();
  });

  return {
    // État
    coordinates: readonly(coordinates),
    address: readonly(address),
    error: readonly(error),
    loading: readonly(loading),

    // Actions
    getCurrentPosition,
    startWatching,
    stopWatching,
    reverseGeocode,
    calculateDistance,
    isSupported,
    requestPermission,
  };
}
