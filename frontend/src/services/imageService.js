/**
 * Services API pour les images
 */
import apiClient from '../utils/api'

export const imageService = {
  /**
   * Upload une image pour une observation
   * @param {string} observationId - ID de l'observation
   * @param {File} file - Fichier image à uploader
   */
  async uploadToObservation(observationId, file) {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await apiClient.post(`/observations/${observationId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  /**
   * Upload une image (legacy - utilise uploadToObservation à la place)
   * @deprecated
   */
  async upload(file) {
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await apiClient.post('/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  /**
   * Récupère une image par ID
   */
  async getById(imageId) {
    const response = await apiClient.get(`/images/${imageId}`, {
      responseType: 'blob'
    })
    return response.data
  },

  /**
   * Récupère l'URL d'une image
   */
  getImageUrl(imageId) {
    return `${apiClient.defaults.baseURL}/images/${imageId}`
  },

  /**
   * Supprime une image
   */
  async delete(imageId) {
    const response = await apiClient.delete(`/images/${imageId}`)
    return response.data
  }
}
