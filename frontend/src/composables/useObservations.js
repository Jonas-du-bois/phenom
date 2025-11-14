/**
 * Composable pour la gestion des observations
 * Centralise la logique métier liée aux observations
 */

import { ref, computed } from 'vue'
import { observationService } from '../services/observationService'
import { imageService } from '../services/imageService'

export function useObservations() {
  // État
  const observations = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Statistiques calculées
  const observationsWithImages = computed(() => {
    return observations.value.filter(obs => obs.images?.length > 0).length
  })

  const uniqueTypes = computed(() => {
    const types = new Set(observations.value.map(obs => obs.type).filter(Boolean))
    return types.size
  })

  const totalObservations = computed(() => observations.value.length)

  /**
   * Charge toutes les observations
   * @param {Object} params - Paramètres de requête (limit, page, search, etc.)
   * @returns {Promise<void>}
   */
  const loadObservations = async (params = { limit: 100 }) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await observationService.getAll(params)
      
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
    } catch (err) {
      console.error('❌ Erreur lors du chargement des observations:', err)
      error.value = err.response?.data?.message || err.message || 'Erreur de chargement'
    } finally {
      loading.value = false
    }
  }

  /**
   * Charge une observation par son ID
   * @param {string} id - ID de l'observation
   * @returns {Promise<Object|null>}
   */
  const loadObservation = async (id) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await observationService.getById(id)
      const observation = response.data || response
      
      console.log('✅ Observation chargée:', observation._id)
      return observation
    } catch (err) {
      console.error('❌ Erreur lors du chargement de l\'observation:', err)
      error.value = err.response?.data?.message || err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Crée une nouvelle observation
   * @param {Object} data - Données de l'observation
   * @param {File} imageFile - Fichier image (optionnel)
   * @returns {Promise<Object|null>}
   */
  const createObservation = async (data, imageFile = null) => {
    try {
      loading.value = true
      error.value = null
      
      // Créer l'observation
      const response = await observationService.create(data)
      const observation = response.data || response
      
      console.log('✅ Observation créée:', observation._id || observation.id)
      return observation
    } catch (err) {
      console.error('❌ Erreur lors de la création de l\'observation:', err)
      error.value = err.response?.data?.message || err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Met à jour une observation
   * @param {string} id - ID de l'observation
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<Object|null>}
   */
  const updateObservation = async (id, data) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await observationService.update(id, data)
      const observation = response.data || response
      
      // Mettre à jour dans la liste locale
      const index = observations.value.findIndex(obs => obs._id === id)
      if (index !== -1) {
        observations.value[index] = observation
      }
      
      console.log('✅ Observation mise à jour:', id)
      return observation
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour de l\'observation:', err)
      error.value = err.response?.data?.message || err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprime une observation
   * @param {string} id - ID de l'observation
   * @returns {Promise<boolean>}
   */
  const deleteObservation = async (id) => {
    try {
      loading.value = true
      error.value = null
      
      await observationService.delete(id)
      
      // Retirer de la liste locale
      observations.value = observations.value.filter(obs => obs._id !== id)
      
      console.log('✅ Observation supprimée:', id)
      return true
    } catch (err) {
      console.error('❌ Erreur lors de la suppression de l\'observation:', err)
      error.value = err.response?.data?.message || err.message
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Ajoute une observation à la liste (temps réel WebSocket)
   * @param {Object} observation - Nouvelle observation
   */
  const addObservation = async (observation) => {
    // Vérifier si elle n'existe pas déjà
    const exists = observations.value.some(obs => obs._id === observation._id)
    if (!exists) {
      observations.value.unshift(observation) // Ajouter au début
      console.log('✅ Observation ajoutée:', observation._id)
    }
  }

  /**
   * Met à jour une observation dans la liste (temps réel WebSocket)
   * @param {Object} observation - Observation mise à jour
   */
  const updateObservationInList = async (observation) => {
    const index = observations.value.findIndex(obs => obs._id === observation._id)
    if (index !== -1) {
      observations.value[index] = observation
      console.log('✅ Observation mise à jour dans la liste:', observation._id)
    }
  }

  /**
   * Supprime une observation de la liste (temps réel WebSocket)
   * @param {string} observationId - ID de l'observation
   */
  const removeObservation = (observationId) => {
    observations.value = observations.value.filter(obs => obs._id !== observationId)
    console.log('✅ Observation retirée de la liste:', observationId)
  }

  /**
   * Recherche des observations par texte
   * @param {string} searchText - Texte de recherche
   * @returns {Promise<void>}
   */
  const searchObservations = async (searchText) => {
    await loadObservations({ search: searchText, limit: 100 })
  }

  /**
   * Filtre les observations par type
   * @param {string} type - Type d'observation
   * @returns {Array} Observations filtrées
   */
  const filterByType = (type) => {
    if (!type) return observations.value
    return observations.value.filter(obs => obs.type === type)
  }

  /**
   * Trie les observations
   * @param {string} sortBy - Champ de tri (date, title, etc.)
   * @param {string} order - Ordre (asc, desc)
   * @returns {Array} Observations triées
   */
  const sortObservations = (sortBy = 'createdAt', order = 'desc') => {
    return [...observations.value].sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })
  }

  /**
   * Upload une image pour une observation
   * @param {string} observationId - ID de l'observation
   * @param {File} file - Fichier image
   * @returns {Promise<Object|null>}
   */
  const uploadImage = async (observationId, file) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await imageService.uploadToObservation(observationId, file)
      console.log('✅ Image uploadée:', response.data)
      
      return response.data
    } catch (err) {
      console.error('❌ Erreur lors de l\'upload de l\'image:', err)
      error.value = err.response?.data?.message || err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Modifie/remplace une image existante
   * @param {string} observationId - ID de l'observation
   * @param {string} publicId - Public ID de l'image à remplacer
   * @param {File} file - Nouveau fichier image
   * @returns {Promise<Object|null>}
   */
  const updateImage = async (observationId, publicId, file) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await imageService.updateImage(observationId, publicId, file)
      console.log('✅ Image modifiée:', response.data)
      
      return response.data
    } catch (err) {
      console.error('❌ Erreur lors de la modification de l\'image:', err)
      error.value = err.response?.data?.message || err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Supprime une image
   * @param {string} observationId - ID de l'observation
   * @param {string} publicId - Public ID de l'image
   * @returns {Promise<boolean>}
   */
  const deleteImage = async (observationId, publicId) => {
    try {
      loading.value = true
      error.value = null
      
      await imageService.deleteImage(observationId, publicId)
      console.log('✅ Image supprimée')
      
      return true
    } catch (err) {
      console.error('❌ Erreur lors de la suppression de l\'image:', err)
      error.value = err.response?.data?.message || err.message
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    // État
    observations,
    loading,
    error,
    
    // Statistiques
    observationsWithImages,
    uniqueTypes,
    totalObservations,
    
    // Méthodes
    loadObservations,
    loadObservation,
    createObservation,
    updateObservation,
    deleteObservation,
    addObservation,
    updateObservationInList,
    removeObservation,
    searchObservations,
    filterByType,
    sortObservations,
    
    // Méthodes pour les images
    uploadImage,
    updateImage,
    deleteImage
  }
}
