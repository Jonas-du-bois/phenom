/**
 * LocalStorage Utilities
 *
 * Type-safe wrappers for localStorage operations with JSON serialization.
 * Provides specialized functions for auth tokens, user data, and app state.
 */

// ============================================================================
// STORAGE KEYS - Centralized key definitions
// ============================================================================

const STORAGE_KEYS = {
  AUTH_TOKEN: "phenom_auth_token", // JWT access token
  USER_DATA: "phenom_user_data", // User profile object
  USER_PREFERENCES: "phenom_user_preferences", // User settings
  RECENT_SEARCHES: "phenom_recent_searches", // Search history
  DRAFT_OBSERVATION: "phenom_draft_observation", // Unsaved observation
  MAP_VIEW: "phenom_map_view", // Last map position/zoom
  FILTERS: "phenom_filters", // Last applied filters
  CACHE_PREFIX: "phenom_cache_", // Prefix for cached data
};

// ============================================================================
// GENERIC STORAGE OPERATIONS
// ============================================================================

/**
 * Save a value to localStorage with JSON serialization
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON stringified)
 */
export const setItem = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

/**
 * Retrieve a value from localStorage with JSON parsing
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default if key not found
 * @returns {any} Parsed value or default
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Error reading from localStorage:", error);
    return defaultValue;
  }
};

/**
 * Remove a value from localStorage
 * @param {string} key - Key to remove
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing from localStorage:", error);
  }
};

/**
 * Clear all localStorage data
 */
export const clearAll = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("Error clearing localStorage:", error);
  }
};

// ============================================================================
// AUTHENTICATION TOKEN MANAGEMENT
// ============================================================================

/**
 * Save JWT access token
 * @param {string} token - JWT token string
 */
export const saveAuthToken = (token) => {
  setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Get stored JWT access token
 * @returns {string|null} Token or null
 */
export const getAuthToken = () => {
  return getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Remove JWT access token (logout)
 */
export const removeAuthToken = () => {
  removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

// ============================================================================
// USER DATA MANAGEMENT
// ============================================================================

/**
 * Save user profile data
 * @param {Object} userData - User profile object
 */
export const saveUserData = (userData) => {
  setItem(STORAGE_KEYS.USER_DATA, userData);
};

/**
 * Get user profile data
 * @returns {Object|null} User data
 */
export const getUserData = () => {
  return getItem(STORAGE_KEYS.USER_DATA);
};

/**
 * Remove user profile data
 */
export const removeUserData = () => {
  removeItem(STORAGE_KEYS.USER_DATA);
};

// ========== User Preferences Management ==========

/**
 * Save user preferences
 * @param {Object} preferences - Preferences object
 */
export const saveUserPreferences = (preferences) => {
  setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
};

/**
 * Get user preferences with defaults
 * @returns {Object} Preferences with default values
 */
export const getUserPreferences = () => {
  return getItem(STORAGE_KEYS.USER_PREFERENCES, {
    theme: "light",
    language: "fr",
    notifications: true,
    mapType: "osm",
    defaultView: "list",
    itemsPerPage: 20,
    autoSaveDrafts: true,
  });
};

/**
 * Update a specific preference
 * @param {string} key - Preference key
 * @param {any} value - New value
 */
export const updatePreference = (key, value) => {
  const preferences = getUserPreferences();
  preferences[key] = value;
  saveUserPreferences(preferences);
};

// ========== Recent Searches Management ==========

/**
 * Add a recent search
 * @param {string} searchText - Search text
 * @param {number} maxItems - Maximum searches to keep
 */
export const addRecentSearch = (searchText, maxItems = 10) => {
  const searches = getRecentSearches();
  const filtered = searches.filter((s) => s !== searchText);
  filtered.unshift(searchText);
  setItem(STORAGE_KEYS.RECENT_SEARCHES, filtered.slice(0, maxItems));
};

/**
 * Get recent searches
 * @returns {Array<string>} List of searches
 */
export const getRecentSearches = () => {
  return getItem(STORAGE_KEYS.RECENT_SEARCHES, []);
};

/**
 * Remove a specific search
 * @param {string} searchText - Search to remove
 */
export const removeRecentSearch = (searchText) => {
  const searches = getRecentSearches();
  const filtered = searches.filter((s) => s !== searchText);
  setItem(STORAGE_KEYS.RECENT_SEARCHES, filtered);
};

/**
 * Clear all recent searches
 */
export const clearRecentSearches = () => {
  removeItem(STORAGE_KEYS.RECENT_SEARCHES);
};

// ========== Observation Draft Management ==========

/**
 * Save an observation draft
 * @param {Object} draft - Draft data
 */
export const saveDraftObservation = (draft) => {
  setItem(STORAGE_KEYS.DRAFT_OBSERVATION, {
    ...draft,
    savedAt: new Date().toISOString(),
  });
};

/**
 * Get observation draft
 * @returns {Object|null} Draft data
 */
export const getDraftObservation = () => {
  return getItem(STORAGE_KEYS.DRAFT_OBSERVATION);
};

/**
 * Remove observation draft
 */
export const removeDraftObservation = () => {
  removeItem(STORAGE_KEYS.DRAFT_OBSERVATION);
};

/**
 * Check if a draft exists
 * @returns {boolean}
 */
export const hasDraftObservation = () => {
  return getDraftObservation() !== null;
};

// ========== Map View Management ==========

/**
 * Save map position
 * @param {Object} mapView - { center, zoom }
 */
export const saveMapView = (mapView) => {
  setItem(STORAGE_KEYS.MAP_VIEW, mapView);
};

/**
 * Get map position
 * @returns {Object|null} { center, zoom }
 */
export const getMapView = () => {
  return getItem(STORAGE_KEYS.MAP_VIEW);
};

// ========== Filters Management ==========

/**
 * Save active filters
 * @param {Object} filters - Filters object
 */
export const saveFilters = (filters) => {
  setItem(STORAGE_KEYS.FILTERS, filters);
};

/**
 * Get saved filters
 * @returns {Object} Filters with defaults
 */
export const getFilters = () => {
  return getItem(STORAGE_KEYS.FILTERS, {
    types: [],
    tags: [],
    dateRange: null,
    searchText: "",
  });
};

/**
 * Reset filters to defaults
 */
export const resetFilters = () => {
  removeItem(STORAGE_KEYS.FILTERS);
};

// ========== Cache Management ==========

/**
 * Cache data with expiration
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 * @param {number} ttl - Time to live in seconds (default 1h)
 */
export const setCacheItem = (key, data, ttl = 3600) => {
  const cacheKey = STORAGE_KEYS.CACHE_PREFIX + key;
  const cacheData = {
    data,
    expiresAt: Date.now() + ttl * 1000,
  };
  setItem(cacheKey, cacheData);
};

/**
 * Get cached data if not expired
 * @param {string} key - Cache key
 * @returns {any|null} Cached data or null if expired
 */
export const getCacheItem = (key) => {
  const cacheKey = STORAGE_KEYS.CACHE_PREFIX + key;
  const cached = getItem(cacheKey);

  if (!cached) return null;

  if (Date.now() > cached.expiresAt) {
    removeItem(cacheKey);
    return null;
  }

  return cached.data;
};

/**
 * Remove cached data
 * @param {string} key - Cache key
 */
export const removeCacheItem = (key) => {
  const cacheKey = STORAGE_KEYS.CACHE_PREFIX + key;
  removeItem(cacheKey);
};

/**
 * Clean all expired cache entries
 */
export const cleanExpiredCache = () => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((k) =>
      k.startsWith(STORAGE_KEYS.CACHE_PREFIX),
    );

    cacheKeys.forEach((cacheKey) => {
      const cached = getItem(cacheKey);
      if (cached && Date.now() > cached.expiresAt) {
        removeItem(cacheKey);
      }
    });
  } catch (error) {
    console.error("Error cleaning cache:", error);
  }
};

/**
 * Clear all cache entries
 */
export const clearAllCache = () => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((k) =>
      k.startsWith(STORAGE_KEYS.CACHE_PREFIX),
    );
    cacheKeys.forEach((key) => removeItem(key));
  } catch (error) {
    console.error("Error clearing cache:", error);
  }
};

/**
 * Calculate localStorage usage
 * @returns {Object} { used: number (bytes), usedMB: number }
 */
export const getStorageSize = () => {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return {
      used: total,
      usedMB: (total / (1024 * 1024)).toFixed(2),
    };
  } catch (error) {
    console.error("Error calculating storage size:", error);
    return { used: 0, usedMB: 0 };
  }
};

/**
 * Full logout - remove all sensitive data
 */
export const clearAuthData = () => {
  removeAuthToken();
  removeUserData();
  removeDraftObservation();
  clearAllCache();
};

export { STORAGE_KEYS };
