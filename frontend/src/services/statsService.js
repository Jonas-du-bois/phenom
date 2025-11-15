/**
 * Services API pour les statistiques et la santé du système
 */
import apiClient from "../utils/api";
import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const statsService = {
  /**
   * Vérifie la santé de l'API
   * Note: Le endpoint /health est à la racine, pas sous /api/v1
   */
  async health() {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  },

  /**
   * Récupère les statistiques publiques
   * Route: GET /api/v1/observations/stats
   */
  async getPublicStats() {
    const response = await apiClient.get("/observations/stats");
    return response.data;
  },

  /**
   * Récupère les statistiques admin (nécessite rôle admin)
   */
  async getAdminStats() {
    const response = await apiClient.get("/admin/stats");
    return response.data;
  },
};
