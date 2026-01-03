/**
 * Authentication API Service
 *
 * Handles all authentication-related API calls.
 * Endpoints: /auth/*
 *
 * Features:
 * - User login/logout
 * - User registration
 * - Profile fetching
 * - Password reset flow
 */
import apiClient from "../utils/api";

export const authService = {
  /**
   * Login with email and password
   * POST /auth/login
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} { user, accessToken }
   */
  async login(credentials) {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  /**
   * Register new user account
   * POST /auth/signup
   * @param {Object} userData - { name, email, password }
   * @returns {Promise<Object>} { user, accessToken }
   */
  async register(userData) {
    const response = await apiClient.post("/auth/signup", userData);
    return response.data;
  },

  /**
   * Logout current user (invalidates refresh token)
   * POST /auth/logout
   */
  async logout() {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  },

  /**
   * Get current user's profile
   * GET /auth/me
   * @returns {Promise<Object>} User profile data
   */
  async getProfile() {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },

  /**
   * Request password reset email
   * POST /auth/forgot-password
   * @param {string} email - User's email address
   */
  async forgotPassword(email) {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  /**
   * Reset password with token from email
   * POST /auth/reset-password
   * @param {string} token - Reset token from email
   * @param {string} password - New password
   */
  async resetPassword(token, password) {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },
};
