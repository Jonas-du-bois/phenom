/**
 * Comment Store - Pinia Store for Comments
 *
 * KISS: Simple wrapper around the comment service
 * Manages comments with per-observation caching.
 *
 * @module stores/comment
 *
 * State:
 * - commentsByObservation: Cache of comments keyed by observation ID
 * - currentObservationId: Currently viewed observation
 *
 * Actions:
 * - fetchComments: Fetch comments for an observation
 * - addComment: Add a new comment
 * - removeComment: Delete a comment
 * - getComments: Get cached comments
 * - clearCache: Clear comment cache
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { commentService } from "../services/commentService";

export const useCommentStore = defineStore("comment", () => {
  // ============================================================================
  // STATE
  // ============================================================================

  // Comments cache by observation ID
  const commentsByObservation = ref({});
  const currentObservationId = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Computed: comments for current observation
  const comments = computed(() => {
    if (!currentObservationId.value) return [];
    return commentsByObservation.value[currentObservationId.value] || [];
  });

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Fetch comments for an observation
   * @param {string} observationId - Observation ID
   * @param {Object} params - Query parameters
   * @returns {Promise<Array>} Comments array
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
      error.value = err.response?.data?.message || "Failed to load comments";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Add a new comment to an observation
   * @param {string} observationId - Observation ID
   * @param {string|Object} textOrData - Comment text or object {text}
   * @returns {Promise<Object>} Created comment
   */
  const addComment = async (observationId, textOrData) => {
    loading.value = true;
    error.value = null;
    try {
      // Accept either string or object with text property
      const text =
        typeof textOrData === "string" ? textOrData : textOrData.text;
      const response = await commentService.create(observationId, text);
      const newComment = response.data || response;

      // Add to cache
      if (!commentsByObservation.value[observationId]) {
        commentsByObservation.value[observationId] = [];
      }
      commentsByObservation.value[observationId].push(newComment);

      return newComment;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to add comment";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete a comment
   * @param {string} observationId - Observation ID
   * @param {string} commentId - Comment ID to delete
   */
  const removeComment = async (observationId, commentId) => {
    loading.value = true;
    try {
      await commentService.delete(commentId);

      // Remove from cache
      if (commentsByObservation.value[observationId]) {
        commentsByObservation.value[observationId] =
          commentsByObservation.value[observationId].filter(
            (c) => c._id !== commentId,
          );
      }
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to delete comment";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get comments from cache for an observation
   * @param {string} observationId - Observation ID
   * @returns {Array} Cached comments
   */
  const getComments = (observationId) => {
    return commentsByObservation.value[observationId] || [];
  };

  /**
   * Clear comment cache
   * @param {string|null} observationId - Observation ID or null to clear all
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
