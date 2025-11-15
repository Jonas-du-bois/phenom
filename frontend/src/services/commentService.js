/**
 * Services API pour les commentaires
 */
import apiClient from '../utils/api'

export const commentService = {
  /**
   * Récupère les commentaires d'une observation
   */
  async getByObservation(observationId, params = {}) {
    const response = await apiClient.get(`/observations/${observationId}/comments`, { params })
    return response.data
  },

  /**
   * Ajoute un commentaire
   */
  async create(observationId, commentData) {
    const response = await apiClient.post(`/observations/${observationId}/comments`, commentData)
    return response.data
  },

  /**
   * Supprime un commentaire
   */
  async delete(commentId) {
    const response = await apiClient.delete(`/comments/${commentId}`)
    return response.data
  }
}
