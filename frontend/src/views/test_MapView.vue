<template>
  <div class="map-view">
    <div id="map" ref="mapContainer" class="map-container"></div>

    <!-- Controls overlay -->
    <div class="map-controls">
      <button
        class="control-btn"
        @click="centerOnUser"
        :disabled="loadingLocation"
        title="Ma position"
      >
        <svg v-if="!loadingLocation" fill="currentColor" viewBox="0 0 20 20">
          <path
            fill-rule="evenodd"
            d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
          />
        </svg>
        <svg v-else class="animate-spin" fill="none" viewBox="0 0 24 24">
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </button>
      
      <div v-if="observations.length" class="observations-count">
        {{ observations.length }} observation(s)
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="map-loading">
      <test-BaseLoading size="lg" text="Chargement de la carte..." />
    </div>
    
    <!-- Error -->
    <div v-if="error" class="map-error">
      <p>{{ error }}</p>
      <test-BaseButton @click="loadObservations">Réessayer</test-BaseButton>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import { useWebSocket } from '../composables/useWebSocket'
import { observationService } from '../services/observationService'
import { getObservationLabel } from '../constants/observationTypes'
import TestBaseButton from '../components/test_BaseButton.vue'
import TestBaseLoading from '../components/test_BaseLoading.vue'

const { connect, disconnect, subscribe, unsubscribe } = useWebSocket()

const mapContainer = ref(null)
const map = ref(null)
const markerClusterGroup = ref(null)
const observations = ref([])
const loading = ref(true)
const loadingLocation = ref(false)
const error = ref(null)

const createCustomIcon = (type) => {
  const color = getTypeColor(type)
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
      <span style="color: white; font-size: 16px;">🛸</span>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })
}

const getTypeColor = (type) => {
  const colors = {
    WAV: '#8B5CF6',
    TCH: '#3B82F6',
    OBS: '#10B981',
    RAY: '#F59E0B',
    ANI: '#EF4444',
    HUM: '#EC4899',
  }
  return colors[type] || '#6B7280'
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const createPopupContent = (obs) => {
  const imageHtml = obs.images?.[0]
    ? `<img src="${obs.images[0].url}" alt="${obs.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; margin-bottom: 12px;" />`
    : ''
    
  return `
    <div style="min-width: 250px; max-width: 300px;">
      ${imageHtml}
      <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">${obs.title}</h3>
      <p style="margin: 0 0 8px 0; font-size: 12px; color: #6B7280; font-weight: 500;">${getObservationLabel(obs.type)}</p>
      <p style="margin: 0 0 12px 0; font-size: 14px; color: #374151; line-height: 1.5;">${obs.description.slice(0, 150)}${obs.description.length > 150 ? '...' : ''}</p>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 12px; color: #6B7280;">
        <span>👤 ${obs.userId?.name || 'Anonyme'}</span>
        <span>•</span>
        <span>📅 ${formatDate(obs.createdAt)}</span>
      </div>
      <button onclick="window.location.href='/#/observations/${obs._id}'" style="width: 100%; padding: 8px 16px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 8px; font-size: 14px; font-weight: 500; cursor: pointer;">
        Voir les détails
      </button>
    </div>
  `
}

const initializeMap = () => {
  if (!mapContainer.value) return
  
  console.log('🗺️ Initialisation de la carte Leaflet...')
  
  // Créer la carte
  map.value = L.map(mapContainer.value).setView([46.603354, 1.888334], 6)
  
  // Ajouter les tuiles OpenStreetMap
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(map.value)
  
  // Créer le groupe de clusters
  markerClusterGroup.value = L.markerClusterGroup({
    chunkedLoading: true,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    zoomToBoundsOnClick: true,
    maxClusterRadius: 80,
    iconCreateFunction: (cluster) => {
      const count = cluster.getChildCount()
      let size = 'small'
      if (count > 10) size = 'medium'
      if (count > 50) size = 'large'
      
      return L.divIcon({
        html: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 40px; height: 40px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; font-weight: bold; color: white; font-size: 14px;">${count}</div>`,
        className: 'marker-cluster',
        iconSize: L.point(40, 40),
      })
    }
  })
  
  map.value.addLayer(markerClusterGroup.value)
  
  // Recharger les observations quand la carte bouge ou zoom
  let moveTimeout
  map.value.on('moveend', () => {
    // Debounce pour éviter trop de requêtes
    clearTimeout(moveTimeout)
    moveTimeout = setTimeout(() => {
      console.log('🔄 Carte déplacée, rechargement des observations...')
      loadObservationsInBounds()
    }, 500)
  })
  
  map.value.on('zoomend', () => {
    console.log('🔍 Zoom changé, rechargement des observations...')
    loadObservationsInBounds()
  })
  
  console.log('✅ Carte initialisée avec succès')
}

const loadObservationsInBounds = async () => {
  if (!map.value) return
  
  loading.value = true
  error.value = null
  
  try {
    // Récupérer les limites de la carte visible
    const bounds = map.value.getBounds()
    const sw = bounds.getSouthWest() // Coin sud-ouest
    const ne = bounds.getNorthEast() // Coin nord-est
    
    console.log('�️ Chargement observations dans la zone:', {
      minLat: sw.lat,
      maxLat: ne.lat,
      minLng: sw.lng,
      maxLng: ne.lng
    })
    
    // Charger les observations dans cette zone
    const response = await observationService.getAll({
      minLat: sw.lat,
      maxLat: ne.lat,
      minLng: sw.lng,
      maxLng: ne.lng,
      limit: 1000
    })
    
    observations.value = response.data || response || []
    console.log(`✅ ${observations.value.length} observation(s) dans cette zone`)
    
    // Nettoyer les anciens marqueurs
    if (markerClusterGroup.value) {
      markerClusterGroup.value.clearLayers()
    }
    
    // Ajouter les nouveaux marqueurs
    const validObservations = observations.value.filter(
      obs => obs.location?.coordinates && obs.location.coordinates.length === 2
    )
    
    console.log(`📍 ${validObservations.length} observation(s) avec coordonnées valides`)
    
    validObservations.forEach(obs => {
      const [lng, lat] = obs.location.coordinates
      const marker = L.marker([lat, lng], {
        icon: createCustomIcon(obs.type)
      })
      
      marker.bindPopup(createPopupContent(obs), {
        maxWidth: 300,
        className: 'custom-popup'
      })
      
      markerClusterGroup.value.addLayer(marker)
    })
    
  } catch (err) {
    console.error('❌ Erreur chargement observations:', err)
    error.value = 'Impossible de charger les observations'
  } finally {
    loading.value = false
  }
}

// Fonction initiale pour charger les observations (sans bounds spécifiques)
const loadObservations = async () => {
  if (map.value) {
    await loadObservationsInBounds()
  }
}

const centerOnUser = () => {
  loadingLocation.value = true
  
  if (!navigator.geolocation) {
    console.warn('⚠️ Géolocalisation non disponible')
    loadingLocation.value = false
    return
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords
      console.log(`📍 Position: ${latitude}, ${longitude}`)
      map.value.setView([latitude, longitude], 13)
      loadingLocation.value = false
    },
    (err) => {
      console.error('❌ Erreur géolocalisation:', err)
      loadingLocation.value = false
    }
  )
}

onMounted(() => {
  initializeMap()
  loadObservations()
  
  // Connecter WebSocket et écouter les messages
  connect()
  subscribe('observations', handleWebSocketMessage)
})

onUnmounted(() => {
  if (map.value) {
    map.value.remove()
  }
  
  disconnect()
})

// Handler unique pour tous les messages WebSocket
const handleWebSocketMessage = (message) => {
  console.log('📨 Message WebSocket reçu:', message);
  
  // Le message contient { type, data, timestamp }
  const { type, data } = message;
  
  switch (type) {
    case 'observation:created':
      handleObservationCreated(data);
      break;
    case 'observation:updated':
      handleObservationUpdated(data);
      break;
    case 'observation:deleted':
      handleObservationDeleted(data);
      break;
  }
};

// Handlers pour chaque type d'événement
const handleObservationCreated = (obs) => {
  console.log('🔔 Nouvelle observation reçue:', obs)
  
  // Vérifier si elle a des coordonnées valides
  if (obs.location?.coordinates && obs.location.coordinates.length === 2) {
    // Ajouter à la liste
    observations.value.push(obs)
    
    // Créer le marqueur
    const [lng, lat] = obs.location.coordinates
    const marker = L.marker([lat, lng], {
      icon: createCustomIcon(obs.type)
    })
    
    marker.bindPopup(createPopupContent(obs), {
      maxWidth: 300,
      className: 'custom-popup'
    })
    
    markerClusterGroup.value.addLayer(marker)
    console.log('✅ Nouvelle observation ajoutée à la carte')
  }
}

const handleObservationUpdated = (obs) => {
  console.log('🔔 Observation mise à jour:', obs)
  
  // Mettre à jour dans la liste
  const index = observations.value.findIndex(o => o._id === obs._id)
  if (index !== -1) {
    observations.value[index] = obs
  }
  
  // Recharger tous les marqueurs pour simplifier
  // (une optimisation serait de trouver et mettre à jour seulement le marqueur concerné)
  if (markerClusterGroup.value) {
    markerClusterGroup.value.clearLayers()
    
    observations.value.forEach(observation => {
      if (observation.location?.coordinates && observation.location.coordinates.length === 2) {
        const [lng, lat] = observation.location.coordinates
        const marker = L.marker([lat, lng], {
          icon: createCustomIcon(observation.type)
        })
        
        marker.bindPopup(createPopupContent(observation), {
          maxWidth: 300,
          className: 'custom-popup'
        })
        
        markerClusterGroup.value.addLayer(marker)
      }
    })
    
    console.log('✅ Observation mise à jour sur la carte')
  }
}

const handleObservationDeleted = (data) => {
  console.log('🔔 Observation supprimée:', data)
  
  // Retirer de la liste
  observations.value = observations.value.filter(obs => obs._id !== data._id)
  
  // Recharger les marqueurs (plus simple que de trouver le bon marqueur)
  if (markerClusterGroup.value) {
    markerClusterGroup.value.clearLayers()
    
    observations.value.forEach(obs => {
      if (obs.location?.coordinates && obs.location.coordinates.length === 2) {
        const [lng, lat] = obs.location.coordinates
        const marker = L.marker([lat, lng], {
          icon: createCustomIcon(obs.type)
        })
        
        marker.bindPopup(createPopupContent(obs), {
          maxWidth: 300,
          className: 'custom-popup'
        })
        
        markerClusterGroup.value.addLayer(marker)
      }
    })
    
    console.log('✅ Observation retirée de la carte')
  }
}
</script>

<style scoped>
.map-view {
  position: relative;
  width: 100%;
  height: calc(100vh - 4rem);
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

.observations-count {
  background: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-size: 0.875rem;
  font-weight: 500;
  color: #667eea;
  text-align: center;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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

.map-error {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.map-error p {
  margin: 0 0 1rem;
  color: #ef4444;
  font-weight: 500;
}

@media (max-width: 640px) {
  .map-view {
    height: calc(100vh - 3.5rem);
  }

  .map-controls {
    bottom: 5rem;
  }
}

/* Leaflet popup styling */
:deep(.custom-popup .leaflet-popup-content-wrapper) {
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
}

:deep(.custom-popup .leaflet-popup-content) {
  margin: 0;
  padding: 16px;
}

:deep(.custom-popup .leaflet-popup-tip) {
  background: white;
}
</style>
