/**
 * Composable pour la pagination infinie
 */
import { ref } from 'vue'

export function useInfiniteScroll(fetchFunction) {
  const items = ref([])
  const page = ref(1)
  const hasMore = ref(true)
  const loading = ref(false)

  const loadMore = async () => {
    // Logique de chargement
  }

  return {
    items,
    page,
    hasMore,
    loading,
    loadMore
  }
}
