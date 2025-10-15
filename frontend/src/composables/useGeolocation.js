/**
 * Composable pour la géolocalisation
 */
import { ref } from 'vue'

export function useGeolocation() {
  const coordinates = ref(null)
  const address = ref('')
  const error = ref(null)
  const loading = ref(false)

  // Méthodes pour obtenir la position

  return {
    coordinates,
    address,
    error,
    loading,
    getCurrentPosition: () => {},
    reverseGeocode: () => {}
  }
}
