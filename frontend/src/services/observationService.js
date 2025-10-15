/**
 * Services API pour les observations
 */
import apiClient from '../utils/api'

export const observationService = {
  /**
   * Récupère toutes les observations
   */
  async getAll(params = {}) {
    const response = await apiClient.get('/observations', { params })
    return response.data
  },

  /**
   * Récupère une observation par ID
   */
  async getById(id) {
    const response = await apiClient.get(`/observations/${id}`)
    return response.data
  },

  /**
   * Crée une nouvelle observation
   */
  async create(observationData) {
    const response = await apiClient.post('/observations', observationData)
    return response.data
  },

  /**
   * Met à jour une observation
   */
  async update(id, observationData) {
    const response = await apiClient.put(`/observations/${id}`, observationData)
    return response.data
  },

  /**
   * Supprime une observation
   */
  async delete(id) {
    const response = await apiClient.delete(`/observations/${id}`)
    return response.data
  },

  /**
   * Uploader une image
   */
  async uploadImage(file) {
    const formData = new FormData()
    formData.append('image', file)
    const response = await apiClient.post('/observations/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }
}
