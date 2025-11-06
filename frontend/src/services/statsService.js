/**
 * Services API pour les statistiques et la santé du système
 */
import apiClient from '../utils/api'

export const statsService = {
  /**
   * Vérifie la santé de l'API
   */
  async health() {
    const response = await apiClient.get('/health')
    return response.data
  },

  /**
   * Récupère les statistiques publiques
   */
  async getPublicStats() {
    const response = await apiClient.get('/stats')
    return response.data
  },

  /**
   * Récupère les statistiques admin (nécessite rôle admin)
   */
  async getAdminStats() {
    const response = await apiClient.get('/admin/stats')
    return response.data
  }
}
