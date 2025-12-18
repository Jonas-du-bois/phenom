<template>
  <AppLayout>
    <template #header>
      <PageHeader title="Explorer">
        <template #right>
          <IconButton 
            variant="ghost" 
            size="sm"
            aria-label="Voir la carte"
            @click="$router.push('/map')"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </IconButton>
        </template>
      </PageHeader>
    </template>
    
    <div class="explore-page">
      <!-- Search bar -->
      <div class="px-4 pt-4">
        <SearchBar
          ref="searchBarRef"
          v-model="searchQuery"
          placeholder="Rechercher des observations..."
          :suggestions="suggestions"
          :recent-searches="recentSearches"
          @search="handleSearch"
          @clear="clearSearch"
          @clear-recent="clearRecentSearches"
        />
      </div>
      
      <!-- Filter chips -->
      <div class="px-4 py-3 space-y-3">
        <!-- UFO Shapes -->
        <div class="flex gap-2 overflow-x-auto scrollbar-hide">
          <FilterChip
            v-for="shape in ufoShapeOptions"
            :key="shape.value"
            :label="shape.label"
            :count="shape.count > 0 ? shape.count : null"
            :selected="selectedUfoShapes.includes(shape.value)"
            @click="toggleUfoShape(shape.value)"
          />
        </div>
        <!-- Phenomena -->
        <div class="flex gap-2 overflow-x-auto scrollbar-hide">
          <FilterChip
            v-for="phenomenon in phenomenaOptions"
            :key="phenomenon.value"
            :label="phenomenon.label"
            :count="phenomenon.count > 0 ? phenomenon.count : null"
            :selected="selectedPhenomena.includes(phenomenon.value)"
            @click="togglePhenomenon(phenomenon.value)"
          />
        </div>
      </div>
      
      <!-- Sort options -->
      <div class="px-4 pb-3 flex items-center justify-between">
        <span class="text-sm text-white/40">
          {{ totalResults }} résultat{{ totalResults > 1 ? 's' : '' }}
        </span>
        <button 
          @click="showSortMenu = !showSortMenu"
          class="flex items-center gap-1 text-sm text-white/60"
        >
          <span>{{ currentSortLabel }}</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      
      <!-- Sort menu dropdown -->
      <Transition name="fade">
        <div 
          v-if="showSortMenu"
          class="absolute right-4 mt-1 w-48 bg-[#12151C] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden"
        >
          <button
            v-for="option in sortOptions"
            :key="option.value"
            class="w-full px-4 py-3 text-left text-sm transition-colors"
            :class="sortBy === option.value ? 'text-[#00F0FF] bg-white/5' : 'text-white hover:bg-white/5'"
            @click="setSortBy(option.value)"
          >
            {{ option.label }}
          </button>
        </div>
      </Transition>
      
      <!-- Results -->
      <div class="px-4 pb-4">
        <ObservationList
          :observations="searchResults"
          :loading="searching"
          :loading-more="loadingMore"
          :has-more="hasMore"
          empty-icon="search"
          empty-title="Aucun résultat"
          empty-description="Essayez avec d'autres termes de recherche"
          @load-more="loadMore"
        />
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { AppLayout } from '@/components/layout'
import { PageHeader, SearchBar, ObservationList } from '@/components/organisms'
import { IconButton } from '@/components/atoms'
import { FilterChip } from '@/components/molecules'
import { useObservationStore } from '@/stores/observation'
import { useFilterStore } from '@/stores/filter'
import { storeToRefs } from 'pinia'

defineOptions({ name: 'ExplorePage' })

const observationStore = useObservationStore()
const filterStore = useFilterStore()
const { loading: searching, pagination } = storeToRefs(observationStore)
const { ufoShapeOptions, phenomenaOptions } = storeToRefs(filterStore)

const searchBarRef = ref(null)
const searchQuery = ref('')
const searchResults = ref([])
const suggestions = ref([])
const recentSearches = ref([])
const selectedUfoShapes = ref([])
const selectedPhenomena = ref([])
const sortBy = ref('recent')
const showSortMenu = ref(false)
const loadingMore = ref(false)
const hasMore = computed(() => pagination.value.hasMore)
const totalResults = ref(0)
const page = ref(1)

const sortOptions = [
  { value: 'recent', label: 'Plus récentes' },
  { value: 'popular', label: 'Plus populaires' },
  { value: 'credibility', label: 'Crédibilité' },
  { value: 'strangeness', label: 'Étrangeté' },
  { value: 'nearby', label: 'À proximité' }
]

const currentSortLabel = computed(() => {
  return sortOptions.find(o => o.value === sortBy.value)?.label || 'Trier'
})

// Load recent searches from localStorage
onMounted(async () => {
  const saved = localStorage.getItem('phenom_recent_searches')
  if (saved) {
    try {
      recentSearches.value = JSON.parse(saved)
    } catch {}
  }
  
  // Initialize filter store
  if (!filterStore.isInitialized) {
    await filterStore.initialize()
  }
  
  // Initial load
  search()
})

// Debounced search on query change
let searchTimeout = null
watch(searchQuery, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    page.value = 1
    search()
  }, 300)
})

watch([selectedUfoShapes, selectedPhenomena], () => {
  page.value = 1
  search()
}, { deep: true })

watch(sortBy, () => {
  page.value = 1
  search()
})

const search = async () => {
  try {
    const params = {
      search: searchQuery.value,
      sort: sortBy.value,
      page: page.value,
      limit: 20
    }
    
    // Ajouter les filtres UFO shapes et phenomena
    if (selectedUfoShapes.value.length > 0) {
      params.ufoShape = selectedUfoShapes.value.join(',')
    }
    if (selectedPhenomena.value.length > 0) {
      params.phenomenon = selectedPhenomena.value.join(',')
    }
    
    await observationStore.fetchObservations(params)
    
    if (page.value === 1) {
      searchResults.value = observationStore.observations
    } else {
      searchResults.value = [...searchResults.value, ...observationStore.observations]
    }
    
    totalResults.value = pagination.value.total || searchResults.value.length
    
  } catch (error) {
    // Error handled by store
  }
}

const handleSearch = (query) => {
  if (query && !recentSearches.value.includes(query)) {
    recentSearches.value = [query, ...recentSearches.value.slice(0, 9)]
    localStorage.setItem('phenom_recent_searches', JSON.stringify(recentSearches.value))
  }
  page.value = 1
  search()
}

const clearSearch = () => {
  searchQuery.value = ''
  page.value = 1
  search()
}

const clearRecentSearches = () => {
  recentSearches.value = []
  localStorage.removeItem('phenom_recent_searches')
}

const toggleUfoShape = (code) => {
  const index = selectedUfoShapes.value.indexOf(code)
  if (index === -1) {
    selectedUfoShapes.value.push(code)
  } else {
    selectedUfoShapes.value.splice(index, 1)
  }
}

const togglePhenomenon = (code) => {
  const index = selectedPhenomena.value.indexOf(code)
  if (index === -1) {
    selectedPhenomena.value.push(code)
  } else {
    selectedPhenomena.value.splice(index, 1)
  }
}

const setSortBy = (value) => {
  sortBy.value = value
  showSortMenu.value = false
}

const loadMore = async () => {
  if (loadingMore.value || !hasMore.value) return
  
  loadingMore.value = true
  page.value++
  await search()
  loadingMore.value = false
}
</script>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
