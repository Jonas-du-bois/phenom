/**
 * Export centralisé de tous les utilitaires
 * Permet d'importer facilement: import { formatDate, validateEmail } from '@/utils'
 */

// Formatters
export {
  formatDate,
  formatDateShort,
  formatRelativeTime,
  getInitials,
  formatNumber,
  formatFileSize,
  truncate
} from './formatters'

// Image Helpers (Cloudinary)
export {
  getImageUrl,
  getPlaceholderImage,
  handleImageError,
  validateImageFile,
  createImagePreview
} from './imageHelpers'

// Geolocation
export {
  getCurrentPosition,
  watchPosition,
  clearPositionWatch,
  getOpenStreetMapUrl,
  getGoogleMapsUrl,
  calculateDistance,
  formatCoordinates,
  isValidCoordinates,
  isGeolocationSupported
} from './geolocation'

// Validators
export {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateName,
  validateText,
  validateTag,
  validateCoordinates,
  validateDate,
  validateForm
} from './validators'

// Observation Helpers
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
  findSimilarObservations
} from './observationHelpers'

// User Helpers
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
  generateDefaultAvatar
} from './userHelpers'

// Comment Helpers
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
  getTopCommenters
} from './commentHelpers'

// Storage
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
  STORAGE_KEYS
} from './storage'

// Permissions
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
  getPermissionErrorMessage
} from './permissions'

