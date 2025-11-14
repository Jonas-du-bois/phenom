/**
 * Composable pour le scroll infini et pagination
 * CLEAN: Séparation des responsabilités - gestion du scroll
 */
import { ref, computed, onMounted, onUnmounted } from 'vue'

export function useInfiniteScroll(fetchFunction, options = {}) {
  const {
    limit = 20,
    threshold = 200, // Distance en px du bas pour charger
    initialLoad = true
  } = options

  const items = ref([])
  const page = ref(1)
  const loading = ref(false)
  const hasMore = ref(true)
  const error = ref(null)

  const totalItems = computed(() => items.value.length)

  /**
   * Charger plus d'items
   */
  const loadMore = async () => {
    if (loading.value || !hasMore.value) return

    try {
      loading.value = true
      error.value = null

      const response = await fetchFunction({
        page: page.value,
        limit
      })

      const newItems = response.data || response.observations || response

      if (Array.isArray(newItems)) {
        if (newItems.length < limit) {
          hasMore.value = false
        }

        items.value = [...items.value, ...newItems]
        page.value++
      } else {
        hasMore.value = false
      }
    } catch (err) {
      error.value = err.message || 'Erreur de chargement'
      console.error('Erreur loadMore:', err)
    } finally {
      loading.value = false
    }
  }

  /**
   * Recharger depuis le début
   */
  const reload = async () => {
    items.value = []
    page.value = 1
    hasMore.value = true
    await loadMore()
  }

  /**
   * Ajouter un item au début
   */
  const prependItem = (item) => {
    items.value.unshift(item)
  }

  /**
   * Mettre à jour un item
   */
  const updateItem = (itemId, updatedItem) => {
    const index = items.value.findIndex(item => item._id === itemId)
    if (index !== -1) {
      items.value[index] = updatedItem
    }
  }

  /**
   * Supprimer un item
   */
  const removeItem = (itemId) => {
    items.value = items.value.filter(item => item._id !== itemId)
  }

  /**
   * Gérer le scroll
   */
  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight
    const clientHeight = document.documentElement.clientHeight

    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      loadMore()
    }
  }

  // Setup scroll listener
  onMounted(() => {
    if (initialLoad) {
      loadMore()
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
  })

  onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
  })

  return {
    // État
    items,
    page,
    loading,
    hasMore,
    error,
    totalItems,

    // Actions
    loadMore,
    reload,
    prependItem,
    updateItem,
    removeItem
  }
}
