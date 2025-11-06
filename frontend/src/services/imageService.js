/**
 * Services API pour les images
 */
import apiClient from '../utils/api'

export const imageService = {
  /**
   * Upload une image
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
