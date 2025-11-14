/**
 * Service API pour les images (Cloudinary)
 * Simplifié: les images ont des URLs publiques directes
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
   * Liste les images d'une observation
   * @param {string} observationId - ID de l'observation
   */
  async listImages(observationId) {
    const response = await apiClient.get(`/observations/${observationId}/images`)
    return response.data
  },

  /**
   * Supprime une image
   * @param {string} observationId - ID de l'observation
   * @param {string} publicId - Public ID Cloudinary (sera URL-encodé)
   */
  async deleteImage(observationId, publicId) {
    const encodedPublicId = encodeURIComponent(publicId)
    const response = await apiClient.delete(`/observations/${observationId}/images/${encodedPublicId}`)
    return response.data
  },

  /**
   * Modifie/remplace une image existante
   * @param {string} observationId - ID de l'observation
   * @param {string} publicId - Public ID Cloudinary de l'image à remplacer
   * @param {File} file - Nouveau fichier image
   */
  async updateImage(observationId, publicId, file) {
    const formData = new FormData()
    formData.append('image', file)
    
    const encodedPublicId = encodeURIComponent(publicId)
    const response = await apiClient.put(`/observations/${observationId}/images/${encodedPublicId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  },

  /**
   * Les images Cloudinary ont des URLs publiques directes
   * Plus besoin de passer par le backend pour les afficher !
   * @param {string} url - URL Cloudinary de l'image
   * @param {Object} options - Options de transformation (optionnel)
   */
  getImageUrl(url, options = {}) {
    if (!url) return null
    
    // Si des transformations sont demandées, on peut les ajouter à l'URL Cloudinary
    if (options.width || options.height) {
      // Cloudinary permet de modifier l'URL pour transformer l'image
      // Format: https://res.cloudinary.com/cloud_name/image/upload/w_300,h_200/path
      const parts = url.split('/upload/')
      if (parts.length === 2) {
        let transform = []
        if (options.width) transform.push(`w_${options.width}`)
        if (options.height) transform.push(`h_${options.height}`)
        if (options.crop) transform.push(`c_${options.crop}`)
        return `${parts[0]}/upload/${transform.join(',')}/${parts[1]}`
      }
    }
    
    return url
  }
}
