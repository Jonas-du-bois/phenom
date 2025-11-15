/**
 * Services API pour les commentaires
 */
import apiClient from "../utils/api";

export const commentService = {
  /**
   * Récupère les commentaires d'une observation
   */
  async getByObservation(observationId, params = {}) {
    console.log(
      "📥 Récupération commentaires pour observation:",
      observationId,
    );
    const response = await apiClient.get(
      `/observations/${observationId}/comments`,
      { params },
    );
    console.log("✅ Commentaires reçus:", response.data);
    return response.data;
  },

  /**
   * Ajoute un commentaire
   */
  async create(observationId, commentData) {
    console.log("📤 Création commentaire:", { observationId, commentData });
    const response = await apiClient.post(
      `/observations/${observationId}/comments`,
      commentData,
    );
    console.log("✅ Commentaire créé:", response.data);
    return response.data;
  },

  /**
   * Supprime un commentaire
   */
  async delete(commentId) {
    console.log("🗑️ Suppression commentaire:", commentId);
    const response = await apiClient.delete(`/comments/${commentId}`);
    console.log("✅ Commentaire supprimé");
    return response.data;
  },
};
