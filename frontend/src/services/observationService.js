/**
 * Services API pour les observations
 */
import apiClient from "../utils/api";

export const observationService = {
  /**
   * Récupère toutes les observations
   */
  async getAll(params = {}) {
    console.log("📥 Récupération observations avec params:", params);
    const response = await apiClient.get("/observations", { params });
    console.log("✅ Observations reçues:", response.data);
    return response.data;
  },

  /**
   * Récupère une observation par ID
   */
  async getById(id) {
    const response = await apiClient.get(`/observations/${id}`);
    return response.data;
  },

  /**
   * Crée une nouvelle observation
   */
  async create(observationData) {
    const response = await apiClient.post("/observations", observationData);
    return response.data;
  },

  /**
   * Met à jour une observation
   */
  async update(id, observationData) {
    const response = await apiClient.put(
      `/observations/${id}`,
      observationData,
    );
    return response.data;
  },

  /**
   * Supprime une observation
   */
  async delete(id) {
    const response = await apiClient.delete(`/observations/${id}`);
    return response.data;
  },

  /**
   * Upload des images pour une observation
   */
  async addImages(observationId, formData) {
    const response = await apiClient.post(
      `/observations/${observationId}/images`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  /**
   * Récupère les statistiques des observations
   */
  async getStats() {
    const response = await apiClient.get("/observations/stats");
    return response.data;
  },

  /**
   * Récupère les types d'observations les plus populaires
   */
  async getPopularTypes(limit = 6) {
    const response = await apiClient.get("/observations/popular-types", {
      params: { limit }
    });
    return response.data;
  },
};
