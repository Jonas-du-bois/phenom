import { useRouter } from "vue-router";
import { ref } from "vue";

/**
 * Error Handler Composable - Centralized HTTP Error Management
 *
 * Provides consistent error handling across the application with
 * automatic redirects to appropriate error pages.
 *
 * @module composables/useErrorHandler
 *
 * Features:
 * - HTTP status code handling (401, 403, 404, 500)
 * - Automatic redirect to login on 401
 * - Automatic redirect to 404 page
 * - Optional notification display
 * - Loading state management
 *
 * @example
 * const { handleError, withErrorHandling } = useErrorHandler();
 * await withErrorHandling(async () => await api.fetchData());
 */
export function useErrorHandler() {
  const router = useRouter();
  const error = ref(null); // Current error
  const isLoading = ref(false); // Loading state

  /**
   * Handle an HTTP error and redirect if necessary
   * @param {Error} err - Error to handle
   * @param {Object} options - Handling options
   * @param {boolean} options.showNotification - Show toast notification
   * @param {boolean} options.redirectOn404 - Redirect to 404 page
   * @param {boolean} options.redirectOn403 - Redirect to home on forbidden
   * @param {string} options.customMessage - Custom error message
   */
  const handleError = (err, options = {}) => {
    const {
      showNotification = true,
      redirectOn404 = true,
      redirectOn403 = false,
      customMessage = null,
    } = options;

    error.value = err;

    // Gestion selon le code de statut HTTP
    if (err.response) {
      const status = err.response.status;

      switch (status) {
        case 404:
          console.error(
            "404 - Ressource non trouvée:",
            err.response.config.url
          );
          if (redirectOn404) {
            router.push({ name: "not-found" });
          }
          if (showNotification) {
            showNotif("Ressource introuvable", "error");
          }
          break;

        case 403:
          console.error("403 - Accès refusé");
          if (redirectOn403) {
            router.push({ name: "home" });
          }
          if (showNotification) {
            showNotif("Accès refusé", "error");
          }
          break;

        case 401:
          console.error("401 - Non authentifié");
          localStorage.removeItem("token");
          router.push({
            name: "login",
            query: { redirect: router.currentRoute.value.fullPath },
          });
          if (showNotification) {
            showNotif("Veuillez vous connecter", "warning");
          }
          break;

        case 500:
          console.error("500 - Erreur serveur:", err.message);
          if (showNotification) {
            showNotif("Erreur serveur, veuillez réessayer", "error");
          }
          break;

        default:
          console.error(`Erreur HTTP ${status}:`, err.message);
          if (showNotification) {
            const message =
              customMessage ||
              err.response.data?.message ||
              "Une erreur est survenue";
            showNotif(message, "error");
          }
      }
    } else if (err.request) {
      // La requête a été faite mais aucune réponse reçue
      console.error("Pas de réponse du serveur:", err.message);
      if (showNotification) {
        showNotif("Impossible de contacter le serveur", "error");
      }
    } else {
      // Erreur lors de la configuration de la requête
      console.error("Erreur de requête:", err.message);
      if (showNotification) {
        showNotif(customMessage || "Une erreur est survenue", "error");
      }
    }
  };

  /**
   * Wrapper to execute an async function with automatic error handling
   * @param {Function} fn - Async function to execute
   * @param {Object} options - Error handling options
   * @returns {Promise<any>} Function result
   */
  const withErrorHandling = async (fn, options = {}) => {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await fn();
      return result;
    } catch (err) {
      handleError(err, options);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Check if a resource exists before navigating
   * Redirects to 404 page if resource not found
   * @param {Function} fetchFn - Function that fetches the resource
   * @param {string} fallbackRoute - Route name to redirect to on 404
   * @returns {Promise<any|null>} Resource data or null if not found
   */
  const checkResourceExists = async (fetchFn, fallbackRoute = "not-found") => {
    try {
      const data = await fetchFn();
      return data;
    } catch (err) {
      if (err.response?.status === 404) {
        router.push({ name: fallbackRoute });
        return null;
      }
      throw err;
    }
  };

  /**
   * Display a notification (adapt to your notification system)
   * @param {string} message - Message to display
   * @param {string} type - Notification type ('success', 'error', 'warning', 'info')
   * @private
   */
  const showNotif = (message, type = "info") => {
    // Simple console log - replace with your notification system (toast, snackbar, etc.)
    console.log(`[${type.toUpperCase()}] ${message}`);

    // TODO: Integrate with toast notification system
    // Example:
    // import { useToast } from '@/composables/useToast'
    // const toast = useToast()
    // toast.show(message, type)
  };

  /**
   * Clear the current error
   */
  const clearError = () => {
    error.value = null;
  };

  // ============================================================================
  // RETURN PUBLIC API
  // ============================================================================

  return {
    error,
    isLoading,
    handleError,
    withErrorHandling,
    checkResourceExists,
    clearError,
  };
}

/**
 * Usage Example in a component:
 *
 * <script setup>
 * import { useErrorHandler } from '@/composables/useErrorHandler'
 * import { onMounted } from 'vue'
 *
 * const { withErrorHandling, checkResourceExists } = useErrorHandler()
 * const observation = ref(null)
 *
 * onMounted(async () => {
 *   // Méthode 1 : Avec wrapper
 *   await withErrorHandling(async () => {
 *     const response = await fetch('/api/v1/observations/123')
 *     observation.value = await response.json()
 *   })
 *
 *   // Méthode 2 : Avec vérification d'existence
 *   observation.value = await checkResourceExists(
 *     () => fetchObservation('123')
 *   )
 * })
 * </script>
 */
