/**
 * Services API pour les statistiques et la santé du système
 * Compatible avec le format Phenom Search API
 */
import apiClient from "../utils/api";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const statsService = {
  /**
   * Vérifie la santé de l'API (à la racine, pas sous /api/v1)
   */
  async health() {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  },

  /**
   * Récupère les statistiques globales (format Phenom Search)
   * GET /statistics
   */
  async getStatistics() {
    const response = await apiClient.get("/statistics");
    return response.data.data;
  },

  /**
   * Récupère les statistiques admin (nécessite rôle admin)
   */
  async getAdminStats() {
    const response = await apiClient.get("/admin/stats");
    return response.data;
  },
};
