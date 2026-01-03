/**
 * Observations API Service
 *
 * Handles all observation-related API calls.
 * Endpoints: /observations/*
 *
 * Features:
 * - CRUD operations for observations
 * - Image attachment
 * - Nearby observations query
 * - AI image generation
 */
import apiClient from "../utils/api";

export const observationService = {
  /**
   * Get all observations with optional filters
   * GET /observations
   * @param {Object} params - Query parameters (page, limit, filters)
   * @returns {Promise<Object>} { data: observations[], pagination }
   */
  async getAll(params = {}) {
    const response = await apiClient.get("/observations", { params });
    return response.data;
  },

  /**
   * Get single observation by ID
   * GET /observations/:id
   * @param {string} id - Observation ID
   * @returns {Promise<Object>} Observation data
   */
  async getById(id) {
    const response = await apiClient.get(`/observations/${id}`);
    return response.data;
  },

  /**
   * Create new observation
   * POST /observations
   * @param {Object} data - Observation data
   * @returns {Promise<Object>} Created observation
   */
  async create(data) {
    const response = await apiClient.post("/observations", data);
    return response.data;
  },

  /**
   * Update existing observation
   * PUT /observations/:id
   * @param {string} id - Observation ID
   * @param {Object} data - Updated fields
   * @returns {Promise<Object>} Updated observation
   */
  async update(id, data) {
    const response = await apiClient.put(`/observations/${id}`, data);
    return response.data;
  },

  /**
   * Delete observation
   * DELETE /observations/:id
   * @param {string} id - Observation ID
   */
  async delete(id) {
    const response = await apiClient.delete(`/observations/${id}`);
    return response.data;
  },

  /**
   * Add images to observation (multipart upload)
   * POST /observations/:id/images
   * @param {string} observationId - Observation ID
   * @param {FormData} formData - Form data with image files
   * @returns {Promise<Object>} Upload result with image URLs
   */
  async addImages(observationId, formData) {
    const response = await apiClient.post(
      `/observations/${observationId}/images`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  /**
   * Get observation statistics
   * GET /observations/stats
   * @returns {Promise<Object>} Statistics data
   */
  async getStats() {
    const response = await apiClient.get("/observations/stats");
    return response.data;
  },

  /**
   * Get observations near a location
   * GET /observations/nearby
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radius - Search radius in meters (default: 10000)
   * @param {number} limit - Max results (default: 150)
   * @returns {Promise<Array>} Nearby observations
   */
  async getNearby(lat, lng, radius = 10000, limit = 150) {
    const response = await apiClient.get("/observations/nearby", {
      params: { lat, lng, radius, limit },
    });
    return response.data;
  },

  /**
   * Generate AI image for observation
   * POST /observations/:id/generate-ai-image
   * @param {string} observationId - Observation ID
   * @returns {Promise<Object>} Generated image URL
   */
  async generateAiImage(observationId) {
    const response = await apiClient.post(
      `/observations/${observationId}/generate-ai-image`
    );
    return response.data;
  },

  // ==========================================================================
  // LEGACY ALIASES - For backwards compatibility with old code
  // ==========================================================================

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
