/**
 * Utilitaires pour la gestion du localStorage
 */

const STORAGE_KEYS = {
  AUTH_TOKEN: "phenom_auth_token",
  USER_DATA: "phenom_user_data",
  USER_PREFERENCES: "phenom_user_preferences",
  RECENT_SEARCHES: "phenom_recent_searches",
  DRAFT_OBSERVATION: "phenom_draft_observation",
  MAP_VIEW: "phenom_map_view",
  FILTERS: "phenom_filters",
  CACHE_PREFIX: "phenom_cache_",
};

/**
 * Sauvegarde une valeur dans le localStorage
 * @param {string} key - Clé de stockage
 * @param {any} value - Valeur à stocker
 */
export const setItem = (key, value) => {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
  } catch (error) {
    console.error("Erreur lors de la sauvegarde dans localStorage:", error);
  }
};

/**
 * Récupère une valeur du localStorage
 * @param {string} key - Clé de stockage
 * @param {any} defaultValue - Valeur par défaut si non trouvée
 * @returns {any} Valeur récupérée
 */
export const getItem = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error("Erreur lors de la lecture du localStorage:", error);
    return defaultValue;
  }
};

/**
 * Supprime une valeur du localStorage
 * @param {string} key - Clé à supprimer
 */
export const removeItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Erreur lors de la suppression du localStorage:", error);
  }
};

/**
 * Vide complètement le localStorage
 */
export const clearAll = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error("Erreur lors du nettoyage du localStorage:", error);
  }
};

// ========== Gestion du token d'authentification ==========

/**
 * Sauvegarde le token d'authentification
 * @param {string} token - Token JWT
 */
export const saveAuthToken = (token) => {
  setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Récupère le token d'authentification
 * @returns {string|null} Token JWT
 */
export const getAuthToken = () => {
  return getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Supprime le token d'authentification
 */
export const removeAuthToken = () => {
  removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

// ========== Gestion des données utilisateur ==========

/**
 * Sauvegarde les données utilisateur
 * @param {Object} userData - Données utilisateur
 */
export const saveUserData = (userData) => {
  setItem(STORAGE_KEYS.USER_DATA, userData);
};

/**
 * Récupère les données utilisateur
 * @returns {Object|null} Données utilisateur
 */
export const getUserData = () => {
  return getItem(STORAGE_KEYS.USER_DATA);
};

/**
 * Supprime les données utilisateur
 */
export const removeUserData = () => {
  removeItem(STORAGE_KEYS.USER_DATA);
};

// ========== Gestion des préférences utilisateur ==========

/**
 * Sauvegarde les préférences utilisateur
 * @param {Object} preferences - Préférences
 */
export const saveUserPreferences = (preferences) => {
  setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
};

/**
 * Récupère les préférences utilisateur
 * @returns {Object} Préférences avec valeurs par défaut
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
 * Met à jour une préférence spécifique
 * @param {string} key - Clé de la préférence
 * @param {any} value - Nouvelle valeur
 */
export const updatePreference = (key, value) => {
  const preferences = getUserPreferences();
  preferences[key] = value;
  saveUserPreferences(preferences);
};

// ========== Gestion des recherches récentes ==========

/**
 * Ajoute une recherche récente
 * @param {string} searchText - Texte recherché
 * @param {number} maxItems - Nombre max de recherches à conserver
 */
export const addRecentSearch = (searchText, maxItems = 10) => {
  const searches = getRecentSearches();
  const filtered = searches.filter((s) => s !== searchText);
  filtered.unshift(searchText);
  setItem(STORAGE_KEYS.RECENT_SEARCHES, filtered.slice(0, maxItems));
};

/**
 * Récupère les recherches récentes
 * @returns {Array<string>} Liste des recherches
 */
export const getRecentSearches = () => {
  return getItem(STORAGE_KEYS.RECENT_SEARCHES, []);
};

/**
 * Supprime une recherche spécifique
 * @param {string} searchText - Recherche à supprimer
 */
export const removeRecentSearch = (searchText) => {
  const searches = getRecentSearches();
  const filtered = searches.filter((s) => s !== searchText);
  setItem(STORAGE_KEYS.RECENT_SEARCHES, filtered);
};

/**
 * Vide les recherches récentes
 */
export const clearRecentSearches = () => {
  removeItem(STORAGE_KEYS.RECENT_SEARCHES);
};

// ========== Gestion du brouillon d'observation ==========

/**
 * Sauvegarde un brouillon d'observation
 * @param {Object} draft - Données du brouillon
 */
export const saveDraftObservation = (draft) => {
  setItem(STORAGE_KEYS.DRAFT_OBSERVATION, {
    ...draft,
    savedAt: new Date().toISOString(),
  });
};

/**
 * Récupère le brouillon d'observation
 * @returns {Object|null} Brouillon
 */
export const getDraftObservation = () => {
  return getItem(STORAGE_KEYS.DRAFT_OBSERVATION);
};

/**
 * Supprime le brouillon d'observation
 */
export const removeDraftObservation = () => {
  removeItem(STORAGE_KEYS.DRAFT_OBSERVATION);
};

/**
 * Vérifie si un brouillon existe
 * @returns {boolean}
 */
export const hasDraftObservation = () => {
  return getDraftObservation() !== null;
};

// ========== Gestion de la vue carte ==========

/**
 * Sauvegarde la position de la carte
 * @param {Object} mapView - { center, zoom }
 */
export const saveMapView = (mapView) => {
  setItem(STORAGE_KEYS.MAP_VIEW, mapView);
};

/**
 * Récupère la position de la carte
 * @returns {Object|null} { center, zoom }
 */
export const getMapView = () => {
  return getItem(STORAGE_KEYS.MAP_VIEW);
};

// ========== Gestion des filtres ==========

/**
 * Sauvegarde les filtres actifs
 * @param {Object} filters - Filtres
 */
export const saveFilters = (filters) => {
  setItem(STORAGE_KEYS.FILTERS, filters);
};

/**
 * Récupère les filtres sauvegardés
 * @returns {Object} Filtres
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
 * Réinitialise les filtres
 */
export const resetFilters = () => {
  removeItem(STORAGE_KEYS.FILTERS);
};

// ========== Gestion du cache ==========

/**
 * Met en cache une donnée avec expiration
 * @param {string} key - Clé du cache
 * @param {any} data - Données à cacher
 * @param {number} ttl - Durée de vie en secondes (par défaut 1h)
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
 * Récupère une donnée du cache si elle n'a pas expiré
 * @param {string} key - Clé du cache
 * @returns {any|null} Données cachées ou null si expiré
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
 * Supprime une donnée du cache
 * @param {string} key - Clé du cache
 */
export const removeCacheItem = (key) => {
  const cacheKey = STORAGE_KEYS.CACHE_PREFIX + key;
  removeItem(cacheKey);
};

/**
 * Nettoie tous les caches expirés
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
    console.error("Erreur lors du nettoyage du cache:", error);
  }
};

/**
 * Vide tout le cache
 */
export const clearAllCache = () => {
  try {
    const keys = Object.keys(localStorage);
    const cacheKeys = keys.filter((k) =>
      k.startsWith(STORAGE_KEYS.CACHE_PREFIX),
    );
    cacheKeys.forEach((key) => removeItem(key));
  } catch (error) {
    console.error("Erreur lors du nettoyage du cache:", error);
  }
};

/**
 * Calcule la taille utilisée du localStorage
 * @returns {Object} { used: number (bytes), usedMB: number }
 */
export const getStorageSize = () => {
  try {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return {
      used: total,
      usedMB: (total / (1024 * 1024)).toFixed(2),
    };
  } catch (error) {
    console.error("Erreur lors du calcul de la taille du storage:", error);
    return { used: 0, usedMB: 0 };
  }
};

/**
 * Déconnexion complète - supprime toutes les données sensibles
 */
export const clearAuthData = () => {
  removeAuthToken();
  removeUserData();
  removeDraftObservation();
  clearAllCache();
};

export { STORAGE_KEYS };
