/**
 * Utils Index - Centralized Utility Export
 *
 * This file provides a barrel export for all utility functions.
 * Import utilities from here for cleaner imports.
 *
 * @module utils
 *
 * @example
 * // Instead of:
 * import { formatDate } from '@/utils/formatters';
 * import { validateEmail } from '@/utils/validators';
 *
 * // Use:
 * import { formatDate, validateEmail } from '@/utils';
 *
 * Categories:
 * - Formatters: Date, number, text formatting
 * - Image Helpers: Cloudinary image handling
 * - Geolocation: GPS and coordinate utilities
 * - Validators: Form input validation
 * - Observation Helpers: Observation filtering/sorting
 * - User Helpers: User role and permission checks
 * - Comment Helpers: Comment manipulation
 * - Storage: localStorage wrapper with typed keys
 * - Permissions: Role-based access control
 */

// ============================================================================
// FORMATTERS
// ============================================================================
// Date, number, and text formatting utilities

export {
  formatDate,
  formatDateShort,
  formatRelativeTime,
  getInitials,
  formatNumber,
  formatFileSize,
  truncate,
} from "./formatters";

// ============================================================================
// IMAGE HELPERS
// ============================================================================
// Cloudinary image handling and placeholders

export {
  getImageUrl,
  getPlaceholderImage,
  handleImageError,
  validateImageFile,
  createImagePreview,
} from "./imageHelpers";

// ============================================================================
// GEOLOCATION
// ============================================================================
// GPS and coordinate utilities

export {
  getCurrentPosition,
  watchPosition,
  clearPositionWatch,
  getOpenStreetMapUrl,
  getGoogleMapsUrl,
  calculateDistance,
  formatCoordinates,
  isValidCoordinates,
  isGeolocationSupported,
  getObservationCoordinates,
  hasValidCoordinates,
  getLeafletCoordinates,
} from "./geolocation";

// ============================================================================
// VALIDATORS
// ============================================================================
// Form input validation functions

export {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateName,
  validateText,
  validateTag,
  validateCoordinates,
  validateDate,
  validateForm,
} from "./validators";

// ============================================================================
// OBSERVATION HELPERS
// ============================================================================
// Observation filtering, sorting, and grouping

export {
  filterObservationsByType,
  filterObservationsByTags,
  filterObservationsByDate,
  filterObservationsByProximity,
  groupObservationsByType,
  groupObservationsByDate,
  groupObservationsByUser,
  sortObservations,
  searchObservations,
  calculateObservationStats,
  validateObservationData,
  extractUniqueTags,
  findSimilarObservations,
} from "./observationHelpers";

// ============================================================================
// USER HELPERS
// ============================================================================
// User role checks and data formatting

export {
  isAdmin,
  isViewer,
  isOwner,
  canEdit,
  canDelete,
  getUserDisplayName,
  formatUserForDisplay,
  validateUserData,
  filterUsers,
  sortUsers,
  calculateUserStats,
  sanitizeUserData,
  generateDefaultAvatar,
} from "./userHelpers";

// ============================================================================
// COMMENT HELPERS
// ============================================================================
// Comment manipulation utilities

export {
  sortComments,
  filterCommentsByUser,
  filterCommentsByDate,
  searchComments,
  groupCommentsByUser,
  groupCommentsByDate,
  countCommentsByObservation,
  calculateCommentStats,
  validateCommentData,
  formatCommentForDisplay,
  isRecentComment,
  sanitizeCommentContent,
  getTopCommenters,
} from "./commentHelpers";

// ============================================================================
// STORAGE
// ============================================================================
// localStorage wrapper with typed keys and expiring cache

export {
  setItem,
  getItem,
  removeItem,
  clearAll,
  saveAuthToken,
  getAuthToken,
  removeAuthToken,
  saveUserData,
  getUserData,
  removeUserData,
  saveUserPreferences,
  getUserPreferences,
  updatePreference,
  addRecentSearch,
  getRecentSearches,
  removeRecentSearch,
  clearRecentSearches,
  saveDraftObservation,
  getDraftObservation,
  removeDraftObservation,
  hasDraftObservation,
  saveMapView,
  getMapView,
  saveFilters,
  getFilters,
  resetFilters,
  setCacheItem,
  getCacheItem,
  removeCacheItem,
  cleanExpiredCache,
  clearAllCache,
  getStorageSize,
  clearAuthData,
  STORAGE_KEYS,
} from "./storage";

// ============================================================================
// PERMISSIONS
// ============================================================================
// Role-based access control utilities

export {
  ROLES,
  PERMISSIONS,
  hasRole,
  hasPermission,
  canCreateObservation,
  canEditObservation,
  canDeleteObservation,
  canCreateComment,
  canEditComment,
  canDeleteComment,
  canAccessAdminPanel,
  canManageUsers,
  canViewStats,
  canChangeUserRole,
  filterAllowedActions,
  getUserPermissions,
  hasAllPermissions,
  hasAnyPermission,
  getPermissionErrorMessage,
} from "./permissions";
