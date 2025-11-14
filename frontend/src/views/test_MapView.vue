<template>
  <div class="map-view">
    <div id="map" ref="mapContainer" class="map-container"></div>

    <!-- Controls overlay -->
    <div class="map-controls">
      <button class="control-btn" @click="centerOnUser" :disabled="loadingLocation">
        <svg v-if="!loadingLocation" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"/>
        </svg>
        <svg v-else class="animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </button>
    </div>

    <!-- Observation popup (mobile) -->
    <transition name="slide-up">
      <div v-if="selectedObservation" class="observation-popup">
        <button class="close-popup" @click="closePopup">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>

        <div class="popup-content">
          <img
            v-if="selectedObservation.images?.[0]"
            :src="selectedObservation.images[0].url"
            :alt="selectedObservation.title"
            class="popup-image"
          />
          
          <h3 class="popup-title">{{ selectedObservation.title }}</h3>
          <p class="popup-type">{{ getObservationTypeLabel(selectedObservation.type) }}</p>
          <p class="popup-description">{{ selectedObservation.description }}</p>
          
          <div class="popup-meta">
            <test-BaseAvatar
              :src="selectedObservation.userId?.avatar"
              :name="selectedObservation.userId?.name || 'Anonyme'"
              size="sm"
            />
            <span class="meta-name">{{ selectedObservation.userId?.name || 'Anonyme' }}</span>
            <span class="meta-separator">•</span>
            <span class="meta-date">{{ formatDate(selectedObservation.createdAt) }}</span>
          </div>

          <test-BaseButton
            fullWidth
            @click="navigateToDetail(selectedObservation._id)"
          >
            Voir les détails
          </test-BaseButton>
        </div>
      </div>
    </transition>

    <!-- Loading -->
    <div v-if="loading" class="map-loading">
      <test-BaseLoading size="lg" text="Chargement de la carte..." />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMap } from '../composables/useMap'
import { observationService } from '../services/observationService'
import { OBSERVATION_TYPES } from '../constants/observationTypes'
import TestBaseButton from '../components/test_BaseButton.vue'
import TestBaseLoading from '../components/test_BaseLoading.vue'
import TestBaseAvatar from '../components/test_BaseAvatar.vue'

const router = useRouter()

const mapContainer = ref(null)
const observations = ref([])
const selectedObservation = ref(null)
const loading = ref(true)
const loadingLocation = ref(false)

const {
  map,
  initMap,
  addMarkers,
  getUserLocation,
  centerOnUser: mapCenterOnUser,
  fitBounds
} = useMap()

onMounted(async () => {
  try {
    // Initialiser la carte
    await initMap(mapContainer.value)
    
    // Charger les observations
    const response = await observationService.getAll({ limit: 1000 })
    observations.value = response.data || []
    
    // Créer les markers
    const markers = observations.value
      .filter(obs => obs.location?.coordinates)
      .map(obs => ({
        id: obs._id,
        position: {
          lat: obs.location.coordinates[1],
          lng: obs.location.coordinates[0]
        },
        title: obs.title,
        popup: createPopupContent(obs),
        onClick: () => selectObservation(obs)
      }))
    
    addMarkers(markers)
    
    // Ajuster la vue pour voir tous les markers
    if (markers.length > 0) {
      const bounds = markers.map(m => m.position)
      fitBounds(bounds)
    }
    
    loading.value = false
  } catch (error) {
    console.error('Erreur chargement carte:', error)
    loading.value = false
  }
})

const createPopupContent = (obs) => {
  const type = getObservationTypeLabel(obs.type)
  const author = obs.userId?.name || 'Anonyme'
  return `
    <div style="min-width: 200px;">
      <h4 style="margin: 0 0 0.5rem; font-size: 1rem; font-weight: 600;">${obs.title}</h4>
      <p style="margin: 0 0 0.5rem; color: #667eea; font-size: 0.875rem;">${type}</p>
      <p style="margin: 0; color: #6b7280; font-size: 0.875rem;">Par ${author}</p>
    </div>
  `
}

const selectObservation = (obs) => {
  selectedObservation.value = obs
}

const closePopup = () => {
  selectedObservation.value = null
}

const centerOnUser = async () => {
  loadingLocation.value = true
  try {
    await getUserLocation()
    mapCenterOnUser()
  } catch (error) {
    console.error('Erreur géolocalisation:', error)
  } finally {
    loadingLocation.value = false
  }
}

const navigateToDetail = (id) => {
  router.push(`/observations/${id}`)
}

const getObservationTypeLabel = (type) => {
  const found = OBSERVATION_TYPES.find(t => t.value === type)
  return found ? found.label : type
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
}

onUnmounted(() => {
  // Cleanup map if needed
})
</script>

<style scoped>
.map-view {
  position: relative;
  width: 100%;
  height: calc(100vh - 4rem); /* Adjust for header */
  overflow: hidden;
}

.map-container {
  width: 100%;
  height: 100%;
}

.map-controls {
  position: absolute;
  bottom: 2rem;
  right: 1rem;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-btn {
  width: 3rem;
  height: 3rem;
  background: white;
  border: none;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #667eea;
}

.control-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.control-btn svg {
  width: 1.5rem;
  height: 1.5rem;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.observation-popup {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-radius: 1.5rem 1.5rem 0 0;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  max-height: 70vh;
  overflow-y: auto;
  z-index: 1001;
  padding: 1.5rem;
}

@media (min-width: 768px) {
  .observation-popup {
    left: auto;
    right: 1rem;
    bottom: 2rem;
    max-width: 400px;
    border-radius: 1rem;
    max-height: 80vh;
  }
}

.close-popup {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2rem;
  height: 2rem;
  background: #f3f4f6;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.close-popup:hover {
  background: #e5e7eb;
  color: #111827;
}

.close-popup svg {
  width: 1.25rem;
  height: 1.25rem;
}

.popup-content {
  margin-top: 0.5rem;
}

.popup-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
}

.popup-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem;
}

.popup-type {
  color: #667eea;
  font-size: 0.875rem;
  font-weight: 500;
  margin: 0 0 0.75rem;
}

.popup-description {
  color: #6b7280;
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0 0 1rem;
}

.popup-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.meta-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.meta-separator {
  color: #d1d5db;
  font-size: 0.875rem;
}

.meta-date {
  font-size: 0.875rem;
  color: #6b7280;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.map-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

@media (max-width: 640px) {
  .map-view {
    height: calc(100vh - 3.5rem);
  }
  
  .map-controls {
    bottom: 5rem; /* Above bottom nav */
  }
}
</style>
