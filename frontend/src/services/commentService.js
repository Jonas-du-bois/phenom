/**
 * Service API pour les commentaires
 * Endpoints: /observations/:id/comments, /comments/:id
 */
import apiClient from "../utils/api";

export const commentService = {
  /** GET /observations/:observationId/comments */
  async getByObservation(observationId, params = {}) {
    const response = await apiClient.get(
      `/observations/${observationId}/comments`,
      { params },
    );
    return response.data;
  },

  /** POST /observations/:observationId/comments */
  async create(observationId, data) {
    const body = typeof data === "string" ? { text: data } : data;
    const response = await apiClient.post(
      `/observations/${observationId}/comments`,
      body,
    );
    return response.data;
  },

  /** DELETE /comments/:id */
  async delete(commentId) {
    const response = await apiClient.delete(`/comments/${commentId}`);
    return response.data;
  },
};
