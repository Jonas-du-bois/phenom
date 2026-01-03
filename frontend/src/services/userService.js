/**
 * User API Service
 *
 * Handles user profile and account management.
 * Endpoints: /users/*
 *
 * Features:
 * - Profile viewing and editing
 * - Avatar upload
 * - Password change
 * - Account deletion
 * - User statistics and observations
 */
import api from "../utils/api";

export const userService = {
  /**
   * Get current user's profile
   * GET /users/me
   * @returns {Promise<Object>} User profile data
   */
  async getMe() {
    const response = await api.get("/users/me");
    return response.data;
  },

  /**
   * Get user by ID (public profile)
   * GET /users/:id
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User public profile
   */
  async getById(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  /**
   * Update current user's profile
   * PUT /users/me
   * @param {Object} data - Profile fields to update
   * @returns {Promise<Object>} Updated user data
   */
  async updateMe(data) {
    const response = await api.put("/users/me", data);
    return response.data;
  },

  /**
   * Upload new avatar image
   * POST /users/me/avatar (multipart)
   * @param {File} file - Image file
   * @returns {Promise<Object>} Updated user with new avatar URL
   */
  async updateAvatar(file) {
    const formData = new FormData();
    formData.append("avatar", file);
    const response = await api.post("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  /**
   * Change password
   * PATCH /users/me/password
   * @param {Object} passwords - { currentPassword, newPassword }
   */
  async changePassword(passwords) {
    const response = await api.patch("/users/me/password", passwords);
    return response.data;
  },

  /**
   * Delete user account
   * DELETE /users/me
   */
  async deleteAccount() {
    const response = await api.delete("/users/me");
    return response.data;
  },

  /**
   * Get current user's statistics
   * GET /users/me/stats
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats() {
    const response = await api.get("/users/me/stats");
    return response.data;
  },

  /**
   * Get current user's observations
   * GET /users/me/observations
   * @param {Object} params - Query parameters (page, limit)
   * @returns {Promise<Object>} User's observations
   */
  async getUserObservations(params = {}) {
    const response = await api.get("/users/me/observations", { params });
    return response.data;
  },
};
