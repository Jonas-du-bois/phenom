<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">🧪 Page de Test - Observations</h1>
        <p class="mt-2 text-gray-600">Démonstration des observations avec photos et commentaires</p>
      </div>

      <!-- État de chargement -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600">Chargement des observations...</span>
      </div>

      <!-- Message d'erreur -->
      <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/>
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Erreur de chargement</h3>
            <p class="mt-1 text-sm text-red-700">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Statistiques -->
      <div v-else-if="!loading" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Total Observations</div>
          <div class="mt-2 text-3xl font-bold text-gray-900">{{ observations.length }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Avec Photos</div>
          <div class="mt-2 text-3xl font-bold text-blue-600">{{ observationsWithImages }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Total Commentaires</div>
          <div class="mt-2 text-3xl font-bold text-green-600">{{ totalComments }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-500">Types Différents</div>
          <div class="mt-2 text-3xl font-bold text-purple-600">{{ uniqueTypes }}</div>
        </div>
      </div>

      <!-- Liste des observations -->
      <div v-if="!loading && observations.length > 0" class="space-y-6">
        <div
          v-for="observation in observations"
          :key="observation._id"
          class="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <!-- En-tête de l'observation -->
          <div class="p-6 border-b border-gray-200">
            <div class="flex justify-between items-start">
              <div class="flex-1">
                <h2 class="text-2xl font-bold text-gray-900">{{ observation.title }}</h2>
                <p class="mt-2 text-gray-600">{{ observation.description }}</p>
              </div>
              <div class="ml-4 flex items-center gap-2">
                <span v-if="observation.type" class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {{ observation.type }}
                </span>
                <a 
                  v-if="observation.location?.coordinates"
                  :href="getOpenStreetMapUrl(observation.location.coordinates)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 text-sm font-medium shadow-md hover:shadow-lg"
                  title="Voir sur la carte"
                >
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                  </svg>
                  Carte
                  <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                  </svg>
                </a>
              </div>
            </div>

            <!-- Métadonnées -->
            <div class="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
                </svg>
                {{ observation.userId?.name || observation.author?.name || 'Anonyme' }}
              </div>
              <div class="flex items-center">
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"/>
                </svg>
                {{ formatDate(observation.date) }}
              </div>
              <a 
                v-if="observation.location?.coordinates" 
                :href="getOpenStreetMapUrl(observation.location.coordinates)"
                target="_blank"
                rel="noopener noreferrer"
                class="flex items-center text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                title="Voir sur OpenStreetMap"
              >
                <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
                </svg>
                {{ observation.location.coordinates[1].toFixed(4) }}, {{ observation.location.coordinates[0].toFixed(4) }}
                <svg class="w-3 h-3 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z"/>
                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z"/>
                </svg>
              </a>
            </div>

            <!-- Tags -->
            <div v-if="observation.tags?.length" class="mt-4 flex flex-wrap gap-2">
              <span
                v-for="tag in observation.tags"
                :key="tag"
                class="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
              >
                🏷️ {{ tag }}
              </span>
            </div>
          </div>

          <!-- Photos -->
          <div v-if="observation.images?.length" class="p-6 bg-gray-50 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"/>
              </svg>
              Photos ({{ observation.images.length }})
            </h3>
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <div
                v-for="(image, index) in observation.images"
                :key="image.imageId || image.id || index"
                class="relative group"
              >
                <img
                  :src="getImageUrl(observation._id, image)"
                  :alt="`Photo ${index + 1}`"
                  class="w-full h-48 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-shadow duration-300"
                  @error="handleImageError"
                />
                <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity duration-300 rounded-lg"></div>
              </div>
            </div>
          </div>
          <div v-else class="p-4 bg-gray-50 border-b border-gray-200">
            <p class="text-gray-500 text-sm italic">📷 Aucune photo</p>
          </div>

          <!-- Commentaires -->
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
              </svg>
              Commentaires ({{ observationComments[observation._id]?.length || 0 }})
            </h3>

            <!-- Liste des commentaires -->
            <div v-if="observationComments[observation._id]?.length" class="space-y-4">
              <div
                v-for="comment in observationComments[observation._id]"
                :key="comment._id"
                class="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <div class="flex items-start">
                  <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                      {{ getInitials(comment) }}
                    </div>
                  </div>
                  <div class="ml-4 flex-1">
                    <div class="flex items-center justify-between">
                      <h4 class="text-sm font-semibold text-gray-900">
                        {{ comment.userId?.name || comment.author?.name || 'Utilisateur inconnu' }}
                      </h4>
                      <span class="text-xs text-gray-500">
                        {{ formatDate(comment.createdAt) }}
                      </span>
                    </div>
                    <p class="mt-2 text-gray-700">{{ comment.text }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-gray-500 text-sm italic">
              💬 Aucun commentaire pour le moment
            </div>

            <!-- Bouton pour charger les commentaires -->
            <button
              v-if="!observationComments[observation._id]"
              @click="loadComments(observation._id)"
              class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Charger les commentaires
            </button>
          </div>
        </div>
      </div>

      <!-- Message si aucune observation -->
      <div v-else-if="!loading && observations.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Aucune observation</h3>
        <p class="mt-1 text-sm text-gray-500">Commencez par créer une observation.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { observationService } from '../services/observationService'
import { commentService } from '../services/commentService'

// État
const observations = ref([])
const observationComments = ref({})
const imageBlobs = ref({}) // Stocker les blobs d'images
const loading = ref(true)
const error = ref(null)

// Statistiques calculées
const observationsWithImages = computed(() => {
  return observations.value.filter(obs => obs.images?.length > 0).length
})

const totalComments = computed(() => {
  return Object.values(observationComments.value).reduce((sum, comments) => sum + comments.length, 0)
})

const uniqueTypes = computed(() => {
  const types = new Set(observations.value.map(obs => obs.type).filter(Boolean))
  return types.size
})

// Fonctions utilitaires
const formatDate = (date) => {
  if (!date) return 'Date inconnue'
  return new Date(date).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getInitials = (comment) => {
  // Essayer d'obtenir le nom depuis différents champs
  const name = comment?.userId?.name || comment?.author?.name || comment?.userId?.username || comment?.author?.username
  if (!name) return '?'
  
  // Prendre les initiales (première lettre de chaque mot)
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const getImageUrl = (observationId, imageData) => {
  // Si on a déjà un blob pour cette image, l'utiliser
  const imageId = imageData?.imageId || imageData?.id
  if (imageId && imageBlobs.value[imageId]) {
    return imageBlobs.value[imageId]
  }
  
  // Sinon retourner une URL temporaire (sera remplacée par le blob)
  return 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="14" fill="%239ca3af">Chargement...</text></svg>'
}

// Nouvelle fonction pour charger une image via l'API avec authentification
const loadImageBlob = async (imageId) => {
  try {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
    const API_PREFIX = import.meta.env.VITE_API_PREFIX
    const token = localStorage.getItem('token')
    
    if (!token) {
      console.warn('⚠️ Pas de token pour charger l\'image:', imageId)
      return null
    }
    
    const url = `${API_BASE_URL}${API_PREFIX}/images/${imageId}`
    console.log('📥 Chargement de l\'image:', url)
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (!response.ok) {
      console.error('❌ Erreur lors du chargement de l\'image:', response.status, response.statusText)
      return null
    }
    
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    imageBlobs.value[imageId] = blobUrl
    
    console.log('✅ Image chargée:', imageId, '→', blobUrl)
    return blobUrl
  } catch (err) {
    console.error('❌ Erreur lors du chargement de l\'image:', imageId, err)
    return null
  }
}

// Charger toutes les images d'une observation
const loadImagesForObservation = async (observation) => {
  if (!observation.images || observation.images.length === 0) return
  
  console.log(`📸 Chargement de ${observation.images.length} images pour observation ${observation._id}`)
  
  for (const image of observation.images) {
    const imageId = image.imageId || image.id
    if (imageId && !imageBlobs.value[imageId]) {
      await loadImageBlob(imageId)
    }
  }
}

const handleImageError = (event) => {
  console.warn('❌ Image blob non disponible')
  // Utiliser une image SVG inline au lieu de via.placeholder.com
  event.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial" font-size="16" fill="%236b7280">Image non disponible</text></svg>'
  event.target.classList.add('opacity-50')
}

const getOpenStreetMapUrl = (coordinates) => {
  // coordinates est au format [longitude, latitude] (GeoJSON)
  const [lng, lat] = coordinates
  // OpenStreetMap utilise le format: https://www.openstreetmap.org/?mlat={lat}&mlon={lng}#map={zoom}/{lat}/{lng}
  // mlat/mlon ajoute un marqueur, #map définit le zoom et le centre
  const zoom = 15 // Niveau de zoom (15 = quartier, 18 = rue)
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`
}

// Charger les observations
const loadObservations = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await observationService.getAll({ limit: 100 })
    
    // Gérer différentes structures de réponse
    if (response.data) {
      observations.value = Array.isArray(response.data) ? response.data : []
    } else if (response.observations) {
      observations.value = response.observations
    } else if (Array.isArray(response)) {
      observations.value = response
    } else {
      observations.value = []
    }
    
    console.log('✅ Observations chargées:', observations.value.length)
    console.log('📊 Première observation:', observations.value[0])
    
    // Afficher les détails d'une observation avec images
    const obsWithImages = observations.value.find(obs => obs.images?.length > 0)
    if (obsWithImages) {
      console.log('🖼️ Observation avec images:', {
        id: obsWithImages._id,
        title: obsWithImages.title,
        images: obsWithImages.images
      })
    }
    
    // Charger les images pour chaque observation
    console.log('📥 Chargement des images...')
    for (const obs of observations.value) {
      await loadImagesForObservation(obs)
    }
    console.log('✅ Toutes les images chargées')
    
    // Charger automatiquement les commentaires pour chaque observation
    for (const obs of observations.value) {
      await loadComments(obs._id)
    }
  } catch (err) {
    console.error('❌ Erreur lors du chargement des observations:', err)
    error.value = err.response?.data?.message || err.message || 'Erreur de chargement'
  } finally {
    loading.value = false
  }
}

// Charger les commentaires d'une observation
const loadComments = async (observationId) => {
  try {
    const response = await commentService.getByObservation(observationId, { limit: 100 })
    
    // Gérer différentes structures de réponse
    if (response.data) {
      observationComments.value[observationId] = response.data
    } else if (response.comments) {
      observationComments.value[observationId] = response.comments
    } else if (Array.isArray(response)) {
      observationComments.value[observationId] = response
    } else {
      observationComments.value[observationId] = []
    }
    
    console.log(`✅ Commentaires chargés pour ${observationId}:`, observationComments.value[observationId].length)
  } catch (err) {
    console.error(`❌ Erreur lors du chargement des commentaires pour ${observationId}:`, err)
    observationComments.value[observationId] = []
  }
}

// Charger au montage
onMounted(() => {
  loadObservations()
})

// Nettoyer les blobs au démontage pour éviter les fuites mémoire
onBeforeUnmount(() => {
  Object.values(imageBlobs.value).forEach(blobUrl => {
    URL.revokeObjectURL(blobUrl)
  })
})
</script>

<style scoped>
/* Animations personnalisées */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.bg-white {
  animation: fadeIn 0.3s ease-in-out;
}
</style>
