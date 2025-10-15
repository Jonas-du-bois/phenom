/**
 * Services API pour l'administration
 */
import apiClient from '../utils/api'

export const adminService = {
  /**
   * Récupère les statistiques
   */
  async getStats() {
    const response = await apiClient.get('/admin/stats')
    return response.data
  },

  /**
   * Récupère tous les posts
   */
  async getPosts(status = null) {
    const params = status ? { status } : {}
    const response = await apiClient.get('/admin/observations', { params })
    return response.data
  },

  /**
   * Approuve un post
   */
  async approvePost(postId) {
    const response = await apiClient.put(`/admin/observations/${postId}/approve`)
    return response.data
  },

  /**
   * Rejette un post
   */
  async rejectPost(postId) {
    const response = await apiClient.put(`/admin/observations/${postId}/reject`)
    return response.data
  },

  /**
   * Récupère tous les utilisateurs
   */
  async getUsers() {
    const response = await apiClient.get('/admin/users')
    return response.data
  },

  /**
   * Suspend un utilisateur
   */
  async suspendUser(userId) {
    const response = await apiClient.put(`/admin/users/${userId}/suspend`)
    return response.data
  },

  /**
   * Supprime un utilisateur
   */
  async deleteUser(userId) {
    const response = await apiClient.delete(`/admin/users/${userId}`)
    return response.data
  }
}
