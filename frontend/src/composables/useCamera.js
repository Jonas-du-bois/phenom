/**
 * Composable pour accès caméra
 */
import { ref } from "vue";

export function useCamera() {
  const stream = ref(null);
  const error = ref(null);
  const isActive = ref(false);

  // Méthodes pour accéder à la caméra et capturer

  return {
    stream,
    error,
    isActive,
    startCamera: () => {},
    stopCamera: () => {},
    capturePhoto: () => {},
  };
}
