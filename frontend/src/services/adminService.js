/**
 * Admin API Service
 *
 * Handles administrative operations.
 * Endpoints: /admin/*
 * Requires admin role authentication.
 *
 * Features:
 * - Dashboard statistics
 * - User management (list, view, role updates)
 * - Content moderation (delete observations/comments)
 */
import apiClient from "../utils/api";

export const adminService = {
  /**
   * Get admin dashboard statistics
   * GET /admin/stats
   * @returns {Promise<Object>} Platform statistics
   */
  async getStats() {
    const response = await apiClient.get("/admin/stats");
    return response.data;
  },

  /**
   * Get list of all users
   * GET /admin/users
   * @param {Object} params - Query params (page, limit, search)
   * @returns {Promise<Object>} { users, pagination }
   */
  async getUsers(params = {}) {
    const response = await apiClient.get("/admin/users", { params });
    return response.data;
  },

  /**
   * Get detailed user information
   * GET /admin/users/:id
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User details with activity
   */
  async getUserDetails(userId) {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },

  /**
   * Update user's role (promote/demote)
   * PUT /admin/users/:id/role
   * @param {string} userId - User ID
   * @param {string} role - New role ('user' or 'admin')
   */
  async updateUserRole(userId, role) {
    const response = await apiClient.put(`/admin/users/${userId}/role`, {
      role,
    });
    return response.data;
  },

  /**
   * Admin delete observation (moderation)
   * DELETE /admin/observations/:id
   * @param {string} id - Observation ID
   */
  async deleteObservation(id) {
    const response = await apiClient.delete(`/admin/observations/${id}`);
    return response.data;
  },

  /**
   * Admin delete comment (moderation)
   * DELETE /admin/comments/:id
   * @param {string} id - Comment ID
   */
  async deleteComment(id) {
    const response = await apiClient.delete(`/admin/comments/${id}`);
    return response.data;
  },
};
