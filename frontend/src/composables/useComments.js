/**
 * Composable pour la gestion des commentaires
 * Centralise la logique métier liée aux commentaires
 */

import { ref, computed } from "vue";
import { commentService } from "../services/commentService";

export function useComments() {
  // État - stocke les commentaires par observation ID
  const commentsByObservation = ref({});
  const loading = ref(false);
  const error = ref(null);

  // Statistiques calculées
  const totalComments = computed(() => {
    return Object.values(commentsByObservation.value).reduce(
      (sum, comments) => sum + comments.length,
      0,
    );
  });

  /**
   * Charge les commentaires d'une observation
   * @param {string} observationId - ID de l'observation
   * @param {Object} params - Paramètres de requête (limit, page, etc.)
   * @returns {Promise<Array>}
   */
  const loadComments = async (observationId, params = { limit: 100 }) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await commentService.getByObservation(
        observationId,
        params,
      );

      // Gérer différentes structures de réponse
      let comments = [];
      if (response.data) {
        comments = response.data;
      } else if (response.comments) {
        comments = response.comments;
      } else if (Array.isArray(response)) {
        comments = response;
      }

      commentsByObservation.value[observationId] = comments;

      console.log(
        `✅ Commentaires chargés pour ${observationId}:`,
        comments.length,
      );
      return comments;
    } catch (err) {
      console.error(
        `❌ Erreur lors du chargement des commentaires pour ${observationId}:`,
        err,
      );
      error.value = err.response?.data?.message || err.message;
      commentsByObservation.value[observationId] = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Charge les commentaires pour plusieurs observations
   * @param {Array<string>} observationIds - Liste des IDs d'observations
   * @param {Object} params - Paramètres de requête
   * @returns {Promise<void>}
   */
  const loadCommentsForObservations = async (
    observationIds,
    params = { limit: 100 },
  ) => {
    for (const id of observationIds) {
      await loadComments(id, params);
    }
  };

  /**
   * Crée un commentaire
   * @param {string} observationId - ID de l'observation
   * @param {string} text - Texte du commentaire
   * @returns {Promise<Object|null>}
   */
  const createComment = async (observationId, text) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await commentService.create(observationId, text);
      const comment = response.data || response;

      // Ajouter à la liste locale
      if (!commentsByObservation.value[observationId]) {
        commentsByObservation.value[observationId] = [];
      }
      commentsByObservation.value[observationId].push(comment);

      console.log("✅ Commentaire créé:", comment._id || comment.id);
      return comment;
    } catch (err) {
      console.error("❌ Erreur lors de la création du commentaire:", err);
      error.value = err.response?.data?.message || err.message;
      return null;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Supprime un commentaire
   * @param {string} commentId - ID du commentaire
   * @param {string} observationId - ID de l'observation (pour mise à jour locale)
   * @returns {Promise<boolean>}
   */
  const deleteComment = async (commentId, observationId = null) => {
    try {
      loading.value = true;
      error.value = null;

      await commentService.delete(commentId);

      // Retirer de la liste locale si observationId fourni
      if (observationId && commentsByObservation.value[observationId]) {
        commentsByObservation.value[observationId] =
          commentsByObservation.value[observationId].filter(
            (c) => c._id !== commentId,
          );
      }

      console.log("✅ Commentaire supprimé:", commentId);
      return true;
    } catch (err) {
      console.error("❌ Erreur lors de la suppression du commentaire:", err);
      error.value = err.response?.data?.message || err.message;
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Ajoute un commentaire à la liste (temps réel WebSocket)
   * @param {string} observationId - ID de l'observation
   * @param {Object} comment - Nouveau commentaire
   */
  const addComment = (observationId, comment) => {
    if (!commentsByObservation.value[observationId]) {
      commentsByObservation.value[observationId] = [];
    }

    // Vérifier si le commentaire n'existe pas déjà
    const exists = commentsByObservation.value[observationId].some(
      (c) => c._id === comment._id,
    );
    if (!exists) {
      commentsByObservation.value[observationId].push(comment);
      console.log("✅ Commentaire ajouté:", comment._id);
    }
  };

  /**
   * Supprime un commentaire de la liste (temps réel WebSocket)
   * @param {string} observationId - ID de l'observation
   * @param {string} commentId - ID du commentaire
   */
  const removeComment = (observationId, commentId) => {
    if (commentsByObservation.value[observationId]) {
      commentsByObservation.value[observationId] = commentsByObservation.value[
        observationId
      ].filter((c) => c._id !== commentId);
      console.log("✅ Commentaire retiré de la liste:", commentId);
    }
  };

  /**
   * Récupère les commentaires d'une observation depuis l'état
   * @param {string} observationId - ID de l'observation
   * @returns {Array} Liste des commentaires
   */
  const getComments = (observationId) => {
    return commentsByObservation.value[observationId] || [];
  };

  /**
   * Compte le nombre de commentaires pour une observation
   * @param {string} observationId - ID de l'observation
   * @returns {number} Nombre de commentaires
   */
  const getCommentCount = (observationId) => {
    return commentsByObservation.value[observationId]?.length || 0;
  };

  /**
   * Nettoie les commentaires d'une observation
   * @param {string} observationId - ID de l'observation
   */
  const clearComments = (observationId) => {
    delete commentsByObservation.value[observationId];
  };

  /**
   * Nettoie tous les commentaires
   */
  const clearAllComments = () => {
    commentsByObservation.value = {};
  };

  return {
    // État
    commentsByObservation,
    loading,
    error,

    // Statistiques
    totalComments,

    // Méthodes
    loadComments,
    loadCommentsForObservations,
    createComment,
    deleteComment,
    addComment,
    removeComment,
    getComments,
    getCommentCount,
    clearComments,
    clearAllComments,
  };
}
