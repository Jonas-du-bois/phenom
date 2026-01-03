/**
 * Comments API Service
 *
 * Handles all comment-related API calls.
 * Endpoints: /observations/:id/comments, /comments/:id
 *
 * Comments are nested under observations but have their own
 * delete endpoint for individual removal.
 */
import apiClient from "../utils/api";

export const commentService = {
  /**
   * Get comments for an observation
   * GET /observations/:observationId/comments
   * @param {string} observationId - Parent observation ID
   * @param {Object} params - Query params (limit, page)
   * @returns {Promise<Object>} { data: comments[] }
   */
  async getByObservation(observationId, params = {}) {
    const response = await apiClient.get(
      `/observations/${observationId}/comments`,
      { params }
    );
    return response.data;
  },

  /**
   * Create a new comment on an observation
   * POST /observations/:observationId/comments
   * @param {string} observationId - Parent observation ID
   * @param {string|Object} data - Comment text or { text: string }
   * @returns {Promise<Object>} Created comment
   */
  async create(observationId, data) {
    // Accept both string and object formats
    const body = typeof data === "string" ? { text: data } : data;
    const response = await apiClient.post(
      `/observations/${observationId}/comments`,
      body
    );
    return response.data;
  },

  /**
   * Delete a comment
   * DELETE /comments/:id
   * @param {string} commentId - Comment ID to delete
   */
  async delete(commentId) {
    const response = await apiClient.delete(`/comments/${commentId}`);
    return response.data;
  },
};
