/**
 * useComments Composable
 *
 * Centralized comment management logic for observations.
 * Handles loading, creating, deleting comments and real-time updates.
 *
 * @module composables/useComments
 */

import { ref, computed } from "vue";
import { commentService } from "../services/commentService";

export function useComments() {
  // State - stores comments indexed by observation ID
  const commentsByObservation = ref({});
  const loading = ref(false);
  const error = ref(null);

  // Computed statistics
  const totalComments = computed(() => {
    return Object.values(commentsByObservation.value).reduce(
      (sum, comments) => sum + comments.length,
      0
    );
  });

  /**
   * Load comments for a specific observation
   * @param {string} observationId - Observation ID
   * @param {Object} params - Query parameters (limit, page, etc.)
   * @returns {Promise<Array>} List of comments
   */
  const loadComments = async (observationId, params = { limit: 100 }) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await commentService.getByObservation(
        observationId,
        params
      );

      // Handle different API response structures
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
        comments.length
      );
      return comments;
    } catch (err) {
      console.error(
        `❌ Erreur lors du chargement des commentaires pour ${observationId}:`,
        err
      );
      error.value = err.response?.data?.message || err.message;
      commentsByObservation.value[observationId] = [];
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load comments for multiple observations sequentially
   * @param {Array<string>} observationIds - List of observation IDs
   * @param {Object} params - Query parameters
   * @returns {Promise<void>}
   */
  const loadCommentsForObservations = async (
    observationIds,
    params = { limit: 100 }
  ) => {
    for (const id of observationIds) {
      await loadComments(id, params);
    }
  };

  /**
   * Create a new comment on an observation
   * @param {string} observationId - Observation ID
   * @param {string} text - Comment text content
   * @returns {Promise<Object|null>} Created comment or null on error
   */
  const createComment = async (observationId, text) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await commentService.create(observationId, text);
      const comment = response.data || response;

      // Add to local list
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
   * Delete a comment
   * @param {string} commentId - Comment ID to delete
   * @param {string} observationId - Observation ID (for local list update)
   * @returns {Promise<boolean>} True if successful
   */
  const deleteComment = async (commentId, observationId = null) => {
    try {
      loading.value = true;
      error.value = null;

      await commentService.delete(commentId);

      // Remove from local list if observationId provided
      if (observationId && commentsByObservation.value[observationId]) {
        commentsByObservation.value[observationId] =
          commentsByObservation.value[observationId].filter(
            (c) => c._id !== commentId
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
   * Add a comment to local state (WebSocket real-time updates)
   * @param {string} observationId - Observation ID
   * @param {Object} comment - New comment object
   */
  const addComment = (observationId, comment) => {
    if (!commentsByObservation.value[observationId]) {
      commentsByObservation.value[observationId] = [];
    }

    // Check if comment doesn't already exist
    const exists = commentsByObservation.value[observationId].some(
      (c) => c._id === comment._id
    );
    if (!exists) {
      commentsByObservation.value[observationId].push(comment);
      console.log("✅ Commentaire ajouté:", comment._id);
    }
  };

  /**
   * Remove a comment from local state (WebSocket real-time updates)
   * @param {string} observationId - Observation ID
   * @param {string} commentId - Comment ID to remove
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
   * Get comments for an observation from local state
   * @param {string} observationId - Observation ID
   * @returns {Array} List of comments
   */
  const getComments = (observationId) => {
    return commentsByObservation.value[observationId] || [];
  };

  /**
   * Get comment count for an observation
   * @param {string} observationId - Observation ID
   * @returns {number} Number of comments
   */
  const getCommentCount = (observationId) => {
    return commentsByObservation.value[observationId]?.length || 0;
  };

  /**
   * Clear comments for a specific observation
   * @param {string} observationId - Observation ID
   */
  const clearComments = (observationId) => {
    delete commentsByObservation.value[observationId];
  };

  /**
   * Clear all comments from local state
   */
  const clearAllComments = () => {
    commentsByObservation.value = {};
  };

  return {
    // State
    commentsByObservation,
    loading,
    error,

    // Computed statistics
    totalComments,

    // Methods
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
