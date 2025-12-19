/**
 * Service API pour les statistiques
 * Endpoints: /health, /statistics, /observations/stats
 */
import apiClient from "../utils/api";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL_LOCAL ||
  "http://localhost:3000";

export const statsService = {
  /** GET /health (pas sous /api/v1) */
  async health() {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  },

  /** GET /statistics */
  async getStatistics() {
    const response = await apiClient.get("/statistics");
    return response.data.data;
  },

  /** GET /observations/stats - alias pour compatibilité */
  async getPublicStats() {
    const response = await apiClient.get("/observations/stats");
    return response.data;
  },

  /** GET /admin/stats */
  async getAdminStats() {
    const response = await apiClient.get("/admin/stats");
    return response.data;
  },
};
