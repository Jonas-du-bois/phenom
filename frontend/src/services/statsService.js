/**
 * Statistics API Service
 *
 * Handles platform statistics and health checks.
 * Endpoints: /health, /statistics, /observations/stats, /admin/stats
 *
 * Note: /health endpoint is at root level, not under /api/v1
 */
import apiClient from "../utils/api";
import axios from "axios";

// Base URL for health endpoint (not under /api/v1)
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL_LOCAL ||
  "http://localhost:3000";

export const statsService = {
  /**
   * Check API server health
   * GET /health (root level, not under /api/v1)
   * @returns {Promise<Object>} Health status
   */
  async health() {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  },

  /**
   * Get general platform statistics
   * GET /statistics
   * @returns {Promise<Object>} Platform statistics
   */
  async getStatistics() {
    const response = await apiClient.get("/statistics");
    return response.data.data;
  },

  /**
   * Get public observation statistics
   * GET /observations/stats
   * @returns {Promise<Object>} Public stats (totals, distributions)
   */
  async getPublicStats() {
    const response = await apiClient.get("/observations/stats");
    return response.data;
  },

  /**
   * Get admin-level statistics (requires admin role)
   * GET /admin/stats
   * @returns {Promise<Object>} Admin statistics
   */
  async getAdminStats() {
    const response = await apiClient.get("/admin/stats");
    return response.data;
  },
};
