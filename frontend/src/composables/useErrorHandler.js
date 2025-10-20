import { useRouter } from 'vue-router'
import { ref } from 'vue'

/**
 * Composable pour gérer les erreurs HTTP de manière centralisée
 * Gère les redirections automatiques vers les pages d'erreur appropriées
 */
export function useErrorHandler() {
  const router = useRouter()
  const error = ref(null)
  const isLoading = ref(false)

  /**
   * Gère une erreur HTTP et redirige si nécessaire
   * @param {Error} err - L'erreur à gérer
   * @param {Object} options - Options de gestion
   */
  const handleError = (err, options = {}) => {
    const {
      showNotification = true,
      redirectOn404 = true,
      redirectOn403 = false,
      customMessage = null
    } = options

    error.value = err

    // Gestion selon le code de statut HTTP
    if (err.response) {
      const status = err.response.status

      switch (status) {
        case 404:
          console.error('404 - Ressource non trouvée:', err.response.config.url)
          if (redirectOn404) {
            router.push({ name: 'not-found' })
          }
          if (showNotification) {
            showNotif('Ressource introuvable', 'error')
          }
          break

        case 403:
          console.error('403 - Accès refusé')
          if (redirectOn403) {
            router.push({ name: 'home' })
          }
          if (showNotification) {
            showNotif('Accès refusé', 'error')
          }
          break

        case 401:
          console.error('401 - Non authentifié')
          localStorage.removeItem('token')
          router.push({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } })
          if (showNotification) {
            showNotif('Veuillez vous connecter', 'warning')
          }
          break

        case 500:
          console.error('500 - Erreur serveur:', err.message)
          if (showNotification) {
            showNotif('Erreur serveur, veuillez réessayer', 'error')
          }
          break

        default:
          console.error(`Erreur HTTP ${status}:`, err.message)
          if (showNotification) {
            const message = customMessage || err.response.data?.message || 'Une erreur est survenue'
            showNotif(message, 'error')
          }
      }
    } else if (err.request) {
      // La requête a été faite mais aucune réponse reçue
      console.error('Pas de réponse du serveur:', err.message)
      if (showNotification) {
        showNotif('Impossible de contacter le serveur', 'error')
      }
    } else {
      // Erreur lors de la configuration de la requête
      console.error('Erreur de requête:', err.message)
      if (showNotification) {
        showNotif(customMessage || 'Une erreur est survenue', 'error')
      }
    }
  }

  /**
   * Wrapper pour exécuter une fonction async avec gestion d'erreur automatique
   * @param {Function} fn - Fonction async à exécuter
   * @param {Object} options - Options de gestion d'erreur
   */
  const withErrorHandling = async (fn, options = {}) => {
    isLoading.value = true
    error.value = null

    try {
      const result = await fn()
      return result
    } catch (err) {
      handleError(err, options)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Vérifie si une ressource existe avant de naviguer
   * @param {Function} fetchFn - Fonction qui récupère la ressource
   * @param {String} fallbackRoute - Route vers laquelle rediriger si 404
   */
  const checkResourceExists = async (fetchFn, fallbackRoute = 'not-found') => {
    try {
      const data = await fetchFn()
      return data
    } catch (err) {
      if (err.response?.status === 404) {
        router.push({ name: fallbackRoute })
        return null
      }
      throw err
    }
  }

  /**
   * Affiche une notification (à adapter selon votre système de notification)
   * @param {String} message - Message à afficher
   * @param {String} type - Type de notification ('success', 'error', 'warning', 'info')
   */
  const showNotif = (message, type = 'info') => {
    // Exemple simple avec alert - à remplacer par votre système de notification
    // (toast, snackbar, etc.)
    console.log(`[${type.toUpperCase()}] ${message}`)
    
    // TODO: Intégrer avec votre système de notification
    // Exemple:
    // import { useToast } from '@/composables/useToast'
    // const toast = useToast()
    // toast.show(message, type)

    // Pour l'instant, on utilise alert pour la démonstration mais je ne sais pas si c'est utile de mettre ces informations dans un notifcation toast 
  }

  /**
   * Nettoie l'erreur
   */
  const clearError = () => {
    error.value = null
  }

  return {
    error,
    isLoading,
    handleError,
    withErrorHandling,
    checkResourceExists,
    clearError
  }
}

/**
 * Exemple d'utilisation dans un composant :
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
