/**
 * Services API pour les commentaires
 */
import apiClient from '../utils/api'

export const commentService = {
  /**
   * Récupère les commentaires d'une observation
   */
  async getByObservation(observationId) {
    const response = await apiClient.get(`/observations/${observationId}/comments`)
    return response.data
  },

  /**
   * Ajoute un commentaire
   */
  async create(observationId, text) {
    const response = await apiClient.post(`/observations/${observationId}/comments`, { text })
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
