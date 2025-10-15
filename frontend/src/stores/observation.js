/**
 * Store Pinia pour les observations
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useObservationStore = defineStore('observation', () => {
  const observations = ref([])
  const currentObservation = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchObservations = async (filters = {}) => {
    // Récupération des observations
  }

  const fetchObservationById = async (id) => {
    // Récupération d'une observation
  }

  const createObservation = async (observationData) => {
    // Création d'observation
  }

  const updateObservation = async (id, observationData) => {
    // Mise à jour
  }

  const deleteObservation = async (id) => {
    // Suppression
  }

  return {
    observations,
    currentObservation,
    loading,
    error,
    fetchObservations,
    fetchObservationById,
    createObservation,
    updateObservation,
    deleteObservation
  }
})
