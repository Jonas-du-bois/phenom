/**
 * Comment Helpers - Utilities for Managing Comments
 *
 * Provides functions for sorting, filtering, searching, and grouping
 * comment data on observations.
 *
 * @module utils/commentHelpers
 *
 * Features:
 * - Sort by date (newest/oldest first)
 * - Filter by user or date range
 * - Search within comment content and author names
 * - Group by user or date
 * - Count comments per observation
 * - Calculate comment statistics
 */

// ============================================================================
// SORTING
// ============================================================================

/**
 * Sort comments by creation date
 * @param {Array} comments - List of comments
 * @param {string} order - 'asc' (oldest first) or 'desc' (newest first)
 * @returns {Array} Sorted comments
 */
export const sortComments = (comments, order = "desc") => {
  return [...comments].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return order === "asc" ? dateA - dateB : dateB - dateA;
  });
};

// ============================================================================
// FILTERING
// ============================================================================

/**
 * Filter comments by user
 * @param {Array} comments - List of comments
 * @param {string} userId - User ID to filter by
 * @returns {Array} Comments by the specified user
 */
export const filterCommentsByUser = (comments, userId) => {
  if (!userId) return comments;
  return comments.filter((comment) => {
    const commentUserId = comment.userId?._id || comment.userId;
    return commentUserId === userId;
  });
};

/**
 * Filter comments by date range
 * @param {Array} comments - List of comments
 * @param {Date} startDate - Start date of the range
 * @param {Date} endDate - End date of the range
 * @returns {Array} Filtered comments within the date range
 */
export const filterCommentsByDate = (comments, startDate, endDate) => {
  return comments.filter((comment) => {
    const commentDate = new Date(comment.createdAt);
    const start = startDate ? new Date(startDate) : new Date(0);
    const end = endDate ? new Date(endDate) : new Date();
    return commentDate >= start && commentDate <= end;
  });
};

// ============================================================================
// SEARCH
// ============================================================================

/**
 * Search within comments (content and author name)
 * @param {Array} comments - List of comments
 * @param {string} searchText - Text to search for
 * @returns {Array} Matching comments
 */
export const searchComments = (comments, searchText) => {
  if (!searchText || searchText.trim() === "") return comments;

  const search = searchText.toLowerCase().trim();
  return comments.filter((comment) => {
    const content = (comment.content || "").toLowerCase();
    const userName = (comment.userId?.name || "").toLowerCase();
    return content.includes(search) || userName.includes(search);
  });
};

// ============================================================================
// GROUPING
// ============================================================================

/**
 * Group comments by user
 * @param {Array} comments - List of comments
 * @returns {Object} Comments grouped by userId
 */
export const groupCommentsByUser = (comments) => {
  return comments.reduce((acc, comment) => {
    const userId = comment.userId?._id || comment.userId;
    if (!acc[userId]) acc[userId] = [];
    acc[userId].push(comment);
    return acc;
  }, {});
};

/**
 * Group comments by date (day)
 * @param {Array} comments - List of comments
 * @returns {Object} Comments grouped by date (ISO date string keys)
 */
export const groupCommentsByDate = (comments) => {
  return comments.reduce((acc, comment) => {
    const date = new Date(comment.createdAt);
    const dateKey = date.toISOString().split("T")[0];
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(comment);
    return acc;
  }, {});
};

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Count comments per observation
 * @param {Array} comments - List of comments
 * @returns {Object} { observationId: count }
 */
export const countCommentsByObservation = (comments) => {
  return comments.reduce((acc, comment) => {
    const obsId = comment.observationId;
    acc[obsId] = (acc[obsId] || 0) + 1;
    return acc;
  }, {});
};

/**
 * Calculate statistics for a list of comments
 * @param {Array} comments - List of comments
 * @returns {Object} Statistics object { total, byUser, avgLength, dateRange }
 */
export const calculateCommentStats = (comments) => {
  const stats = {
    total: comments.length,
    byUser: {},
    avgLength: 0,
    dateRange: { oldest: null, newest: null },
  };

  if (comments.length === 0) return stats;

  // Stats by user
  comments.forEach((comment) => {
    const userId = comment.userId?._id || comment.userId;
    const userName = comment.userId?.name || "Anonyme";
    if (!stats.byUser[userId]) {
      stats.byUser[userId] = { name: userName, count: 0 };
    }
    stats.byUser[userId].count++;
  });

  // Average length
  const totalLength = comments.reduce(
    (sum, comment) => sum + (comment.content?.length || 0),
    0
  );
  stats.avgLength = Math.round(totalLength / comments.length);

  // Date range
  const dates = comments.map((c) => new Date(c.createdAt).getTime());
  stats.dateRange.oldest = new Date(Math.min(...dates));
  stats.dateRange.newest = new Date(Math.max(...dates));

  return stats;
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate comment data before submission
 * @param {Object} commentData - Comment data to validate
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export const validateCommentData = (commentData) => {
  const errors = [];

  if (!commentData.content || commentData.content.trim().length === 0) {
    errors.push("Le commentaire ne peut pas être vide");
  }

  if (commentData.content && commentData.content.length > 1000) {
    errors.push("Le commentaire ne peut pas dépasser 1000 caractères");
  }

  if (!commentData.observationId) {
    errors.push("L'ID de l'observation est requis");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format a comment for display in UI
 * @param {Object} comment - Comment to format
 * @returns {Object|null} Formatted comment with author info
 */
export const formatCommentForDisplay = (comment) => {
  if (!comment) return null;

  return {
    id: comment._id || comment.id,
    content: comment.content,
    author: {
      id: comment.userId?._id || comment.userId,
      name: comment.userId?.name || "Utilisateur supprimé",
      email: comment.userId?.email,
    },
    observationId: comment.observationId,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    isRecent: isRecentComment(comment),
  };
};

/**
 * Check if a comment was created recently (less than 24 hours ago)
 * @param {Object} comment - Comment to check
 * @returns {boolean} True if comment is recent
 */
export const isRecentComment = (comment) => {
  const commentDate = new Date(comment.createdAt);
  const now = new Date();
  const diffHours = (now - commentDate) / (1000 * 60 * 60);
  return diffHours < 24;
};

// ============================================================================
// SANITIZATION
// ============================================================================

/**
 * Sanitize comment content by removing HTML and limiting length
 * @param {string} content - Comment content
 * @returns {string} Cleaned content
 */
export const sanitizeCommentContent = (content) => {
  return content
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove scripts
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .slice(0, 1000); // Limit to 1000 characters
};

// ============================================================================
// TOP COMMENTERS
// ============================================================================

/**
 * Get the most active commenters
 * @param {Array} comments - List of comments
 * @param {number} limit - Number of results to return (default: 5)
 * @returns {Array} Top users with their comment counts
 */
export const getTopCommenters = (comments, limit = 5) => {
  const userCounts = {};

  comments.forEach((comment) => {
    const userId = comment.userId?._id || comment.userId;
    const userName = comment.userId?.name || "Anonyme";

    if (!userCounts[userId]) {
      userCounts[userId] = { userId, userName, count: 0 };
    }
    userCounts[userId].count++;
  });

  return Object.values(userCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
};
