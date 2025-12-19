/**
 * Store Pinia pour les commentaires
 * KISS: Wrapper simple autour du service
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { commentService } from "../services/commentService";

export const useCommentStore = defineStore("comment", () => {
  // Commentaires par observation ID (cache)
  const commentsByObservation = ref({});
  const currentObservationId = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Computed: commentaires de l'observation courante
  const comments = computed(() => {
    if (!currentObservationId.value) return [];
    return commentsByObservation.value[currentObservationId.value] || [];
  });

  /**
   * Récupère les commentaires d'une observation
   */
  const fetchComments = async (observationId, params = {}) => {
    loading.value = true;
    error.value = null;
    currentObservationId.value = observationId;
    try {
      const response = await commentService.getByObservation(
        observationId,
        params,
      );
      const fetchedComments =
        response.data?.comments || response.comments || response.data || [];
      commentsByObservation.value[observationId] = fetchedComments;
      return fetchedComments;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur de chargement";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Ajoute un commentaire
   * @param {string} observationId - ID de l'observation
   * @param {string|object} textOrData - Texte du commentaire ou objet {text}
   */
  const addComment = async (observationId, textOrData) => {
    loading.value = true;
    error.value = null;
    try {
      // Accepte soit un string soit un objet avec text
      const text =
        typeof textOrData === "string" ? textOrData : textOrData.text;
      const response = await commentService.create(observationId, text);
      const newComment = response.data || response;

      // Ajouter au cache
      if (!commentsByObservation.value[observationId]) {
        commentsByObservation.value[observationId] = [];
      }
      commentsByObservation.value[observationId].push(newComment);

      return newComment;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur d'ajout";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Supprime un commentaire
   */
  const removeComment = async (observationId, commentId) => {
    loading.value = true;
    try {
      await commentService.delete(commentId);

      // Retirer du cache
      if (commentsByObservation.value[observationId]) {
        commentsByObservation.value[observationId] =
          commentsByObservation.value[observationId].filter(
            (c) => c._id !== commentId,
          );
      }
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur de suppression";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Récupère les commentaires d'une observation depuis le cache
   */
  const getComments = (observationId) => {
    return commentsByObservation.value[observationId] || [];
  };

  /**
   * Vide le cache d'une observation
   */
  const clearCache = (observationId = null) => {
    if (observationId) {
      delete commentsByObservation.value[observationId];
    } else {
      commentsByObservation.value = {};
    }
  };

  return {
    comments,
    commentsByObservation,
    loading,
    error,
    fetchComments,
    addComment,
    removeComment,
    getComments,
    clearCache,
  };
});
