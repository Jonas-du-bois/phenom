/**
 * Services API pour l'administration
 */
import apiClient from "../utils/api";

export const adminService = {
  /**
   * Récupère les statistiques admin
   */
  async getStats() {
    const response = await apiClient.get("/admin/stats");
    return response.data;
  },

  /**
   * Récupère tous les utilisateurs
   */
  async getUsers(params = {}) {
    const response = await apiClient.get("/admin/users", { params });
    return response.data;
  },

  /**
   * Récupère les détails d'un utilisateur
   */
  async getUserDetails(userId) {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Modifie le rôle d'un utilisateur
   */
  async updateUserRole(userId, role) {
    const response = await apiClient.put(`/admin/users/${userId}/role`, {
      role,
    });
    return response.data;
  },

  /**
   * Supprime une observation (admin)
   */
  async deleteObservation(observationId) {
    const response = await apiClient.delete(
      `/admin/observations/${observationId}`,
    );
    return response.data;
  },

  /**
   * Supprime un commentaire (admin)
   */
  async deleteComment(commentId) {
    const response = await apiClient.delete(`/admin/comments/${commentId}`);
    return response.data;
  },
};
