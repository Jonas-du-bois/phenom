/**
 * Service API pour l'administration
 * Endpoints: /admin/*
 */
import apiClient from "../utils/api";

export const adminService = {
  /** GET /admin/stats */
  async getStats() {
    const response = await apiClient.get("/admin/stats");
    return response.data;
  },

  /** GET /admin/users */
  async getUsers(params = {}) {
    const response = await apiClient.get("/admin/users", { params });
    return response.data;
  },

  /** GET /admin/users/:id */
  async getUserDetails(userId) {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  /** PUT /admin/users/:id/role */
  async updateUserRole(userId, role) {
    const response = await apiClient.put(`/admin/users/${userId}/role`, { role });
    return response.data;
  },

  /** DELETE /admin/observations/:id */
  async deleteObservation(id) {
    const response = await apiClient.delete(`/admin/observations/${id}`);
    return response.data;
  },

  /** DELETE /admin/comments/:id */
  async deleteComment(id) {
    const response = await apiClient.delete(`/admin/comments/${id}`);
    return response.data;
  },
};
