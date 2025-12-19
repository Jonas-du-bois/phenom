/**
 * Service API pour les observations
 * Endpoints: /observations/*
 */
import apiClient from "../utils/api";

export const observationService = {
  /** GET /observations */
  async getAll(params = {}) {
    const response = await apiClient.get("/observations", { params });
    return response.data;
  },

  /** GET /observations/:id */
  async getById(id) {
    const response = await apiClient.get(`/observations/${id}`);
    return response.data;
  },

  /** POST /observations */
  async create(data) {
    const response = await apiClient.post("/observations", data);
    return response.data;
  },

  /** PUT /observations/:id */
  async update(id, data) {
    const response = await apiClient.put(`/observations/${id}`, data);
    return response.data;
  },

  /** DELETE /observations/:id */
  async delete(id) {
    const response = await apiClient.delete(`/observations/${id}`);
    return response.data;
  },

  /** POST /observations/:id/images (multipart) */
  async addImages(observationId, formData) {
    const response = await apiClient.post(
      `/observations/${observationId}/images`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  /** GET /observations/stats */
  async getStats() {
    const response = await apiClient.get("/observations/stats");
    return response.data;
  },

  /** GET /observations/nearby */
  async getNearby(lat, lng, radius = 10000, limit = 150) {
    const response = await apiClient.get("/observations/nearby", {
      params: { lat, lng, radius, limit },
    });
    return response.data;
  },

  /** POST /observations/:id/generate-ai-image */
  async generateAiImage(observationId) {
    const response = await apiClient.post(
      `/observations/${observationId}/generate-ai-image`,
    );
    return response.data;
  },

  // Alias pour compatibilité avec les anciennes pages
  getObservations: function (params) {
    return this.getAll(params);
  },
  getObservation: function (id) {
    return this.getById(id);
  },
  deleteObservation: function (id) {
    return this.delete(id);
  },
};
