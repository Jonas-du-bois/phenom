/**
 * Service API pour les images
 * Endpoints: /observations/:id/images
 */
import apiClient from "../utils/api";

export const imageService = {
  /** POST /observations/:id/images (multipart) - Alias pour compatibilité */
  async uploadToObservation(observationId, file) {
    const formData = new FormData();
    formData.append("image", file);
    const response = await apiClient.post(
      `/observations/${observationId}/images`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  },

  /** GET /observations/:id/images */
  async list(observationId) {
    const response = await apiClient.get(`/observations/${observationId}/images`);
    return response.data;
  },

  /** DELETE /observations/:id/images/:publicId */
  async delete(observationId, publicId) {
    const encodedId = encodeURIComponent(publicId);
    const response = await apiClient.delete(`/observations/${observationId}/images/${encodedId}`);
    return response.data;
  },
};
