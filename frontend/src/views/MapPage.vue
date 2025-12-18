<template>
  <div class="map-page h-screen flex flex-col pb-20">
    <!-- Header -->
    <PageHeader 
      title="Carte"
      show-back
    >
      <template #right>
        <IconButton 
          variant="ghost" 
          size="sm"
          aria-label="Filtrer les observations"
          @click="showFilters = true"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </IconButton>
      </template>
    </PageHeader>
    
    <!-- Map -->
    <div class="flex-1 relative overflow-hidden z-0">
      <ObservationMap
        ref="mapRef"
        :observations="observations"
        :center="mapCenter"
        :zoom="mapZoom"
        :loading="loading"
        @bounds-change="handleBoundsChange"
        @marker-click="handleMarkerClick"
      />
    </div>
    
    <!-- Filter panel -->
    <FilterPanel
      :is-open="showFilters"
      :initial-filters="filters"
      @close="showFilters = false"
      @apply="applyFilters"
      @reset="resetFilters"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { PageHeader, ObservationMap, FilterPanel } from '@/components/organisms'
import { IconButton } from '@/components/atoms'
import { useObservationStore } from '@/stores/observation'
import { storeToRefs } from 'pinia'
import { getObservationCoordinates } from '@/utils'

defineOptions({ name: 'MapPage' })

const route = useRoute()
const observationStore = useObservationStore()
const { observations, loading } = storeToRefs(observationStore)

const mapRef = ref(null)
const showFilters = ref(false)

const mapCenter = ref([46.8182, 8.2275]) // Switzerland
const mapZoom = ref(8)

const filters = ref({
  types: [],
  dateFrom: '',
  dateTo: '',
  minCredibility: 0,
  minStrangeness: 0,
  radius: 50,
  hasMedia: false,
  verifiedOnly: false
})

const currentBounds = ref(null)

onMounted(async () => {
  // Check for focus query param
  if (route.query.focus) {
    // Fetch specific observation and center on it
    try {
      await observationStore.fetchObservationById(route.query.focus)
      const obs = observationStore.currentObservation
      const coords = getObservationCoordinates(obs)
      
      if (coords) {
        mapCenter.value = [coords.lat, coords.lng]
        mapZoom.value = 14
      }
    } catch {}
  }
  
  // Try to get user location
  if (navigator.geolocation && !route.query.focus) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapCenter.value = [position.coords.latitude, position.coords.longitude]
        mapZoom.value = 10
      },
      () => {},
      { timeout: 5000 }
    )
  }
  
  await fetchObservations()
})

const fetchObservations = async () => {
  const params = {
    ...filters.value,
    hasCoordinates: true,
    limit: 500 // Get more for map view
  }
  
  if (currentBounds.value) {
    params.bounds = JSON.stringify(currentBounds.value)
  }
  
  await observationStore.fetchObservations(params)
}

const handleBoundsChange = (bounds) => {
  currentBounds.value = bounds
  // Debounce refetch
  // fetchObservations()
}

const handleMarkerClick = (observation) => {
  // Popup handled by ObservationMap
}

const applyFilters = (newFilters) => {
  filters.value = { ...newFilters }
  fetchObservations()
}

const resetFilters = () => {
  filters.value = {
    types: [],
    dateFrom: '',
    dateTo: '',
    minCredibility: 0,
    minStrangeness: 0,
    radius: 50,
    hasMedia: false,
    verifiedOnly: false
  }
  fetchObservations()
}
</script>
