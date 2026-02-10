/**
 * Image API Service
 *
 * Handles image upload and management for observations.
 * Endpoints: /observations/:id/images
 *
 * Images are stored in Cloudinary and managed through
 * the observation's images array.
 */
import apiClient from "../utils/api";

export const imageService = {
  /**
   * Upload image to an observation
   * POST /observations/:id/images (multipart)
   * @param {string} observationId - Observation ID
   * @param {File} file - Image file to upload
   * @returns {Promise<Object>} Upload result with image URL
   */
  async uploadToObservation(observationId, file) {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post(
      `/observations/${observationId}/images`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return response.data;
  },

  /**
   * List images for an observation
   * GET /observations/:id/images
   * @param {string} observationId - Observation ID
   * @returns {Promise<Array>} List of image objects
   */
  async list(observationId) {
    const response = await apiClient.get(
      `/observations/${observationId}/images`,
    );
    return response.data;
  },

  /**
   * Delete image from observation
   * DELETE /observations/:id/images/:publicId
   * @param {string} observationId - Observation ID
   * @param {string} publicId - Cloudinary public ID (URL encoded)
   */
  async delete(observationId, publicId) {
    // URL encode the public ID (may contain slashes)
    const encodedId = encodeURIComponent(publicId);
    const response = await apiClient.delete(
      `/observations/${observationId}/images/${encodedId}`,
    );
    return response.data;
  },
};
