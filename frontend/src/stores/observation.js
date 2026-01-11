/**
 * Observations Pinia Store
 *
 * Manages the observation data for the application.
 * KISS principle: Simple wrapper around the observation service.
 *
 * Features:
 * - Fetch observations with filters and pagination
 * - Create, update, delete observations
 * - Map-specific queries with bounding box
 * - Client-side caching for map data
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { observationService } from "../services/observationService";

export const useObservationStore = defineStore("observation", () => {
  // ==========================================================================
  // STATE
  // ==========================================================================

  /** List of observations for feed/list views */
  const observations = ref([]);

  /** Currently viewed observation (detail page) */
  const currentObservation = ref(null);

  /** Loading state for async operations */
  const loading = ref(false);

  /** Error message from last failed operation */
  const error = ref(null);

  /** Pagination state */
  const pagination = ref({ page: 1, limit: 30, total: 0, hasMore: true });

  // ==========================================================================
  // COMPUTED GETTERS
  // ==========================================================================

  /** Check if there are any observations loaded */
  const hasObservations = computed(() => observations.value.length > 0);

  /** Filter observations that have images */
  const observationsWithImages = computed(() =>
    observations.value.filter((o) => o.images?.length > 0)
  );

  // ==========================================================================
  // FILTER CONVERSION
  // ==========================================================================

  /**
   * Convert frontend filters to API query parameters
   * Backend format: ufoShape, phenomenon, country (regex, single), observerType
   * @param {Object} filters - Frontend filter object
   * @returns {Object} API-compatible query parameters
   */
  const convertFiltersToApiParams = (filters) => {
    const params = {};

    // Text search
    if (filters.search) {
      params.search = filters.search;
    }

    // UFO Shapes (comma-separated)
    if (filters.ufoShapes?.length) {
      params.ufoShape = filters.ufoShapes.join(",");
    }

    // Phenomena (comma-separated)
    if (filters.phenomena?.length) {
      params.phenomenon = filters.phenomena.join(",");
    }

    // Observer Types (comma-separated)
    if (filters.observerTypes?.length) {
      params.observerType = filters.observerTypes.join(",");
    }

    // Country - backend uses regex, so only one country at a time
    // Take the first selected country
    if (filters.countries?.length) {
      params.country = filters.countries[0];
    }

    // Locale type
    if (filters.locale) {
      params.locale = filters.locale;
    }

    // Score ranges (min/max)
    if (filters.minCredibility !== undefined && filters.minCredibility > 0) {
      params.minCredibility = filters.minCredibility;
    }
    if (filters.maxCredibility !== undefined && filters.maxCredibility < 15) {
      params.maxCredibility = filters.maxCredibility;
    }
    if (filters.minStrangeness !== undefined && filters.minStrangeness > 0) {
      params.minStrangeness = filters.minStrangeness;
    }
    if (filters.maxStrangeness !== undefined && filters.maxStrangeness < 10) {
      params.maxStrangeness = filters.maxStrangeness;
    }

    // Year range (dateFrom/dateTo -> startYear/endYear)
    if (filters.dateFrom) {
      const year = new Date(filters.dateFrom).getFullYear();
      if (!isNaN(year)) params.startYear = year;
    }
    if (filters.dateTo) {
      const year = new Date(filters.dateTo).getFullYear();
      if (!isNaN(year)) params.endYear = year;
    }

    // Boolean options
    if (filters.hasMedia) {
      params.hasImages = true;
    }
    if (filters.hasCoordinates) {
      params.hasCoordinates = true;
    }
    if (filters.verifiedOnly) {
      params.isVerified = true;
    }

    return params;
  };

  // ==========================================================================
  // FETCH ACTIONS
  // ==========================================================================

  /**
   * Fetch observations with optional filters
   * Updates the observations state and pagination
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Fetched observations
   */
  const fetchObservations = async (filters = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const apiParams = convertFiltersToApiParams(filters);

      const response = await observationService.getAll({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...apiParams,
      });

      observations.value = response.data || response.observations || [];
      if (response.pagination) {
        pagination.value = {
          ...pagination.value,
          total: response.pagination.total,
          hasMore: response.pagination.hasNextPage,
        };
      }
      return observations.value;
    } catch (err) {
      error.value = err.response?.data?.message || "Loading error";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // ==========================================================================
  // MAP-SPECIFIC QUERIES (with caching)
  // ==========================================================================

  /**
   * Fetch observations for a map bounding box without mutating the global store
   * Uses local caching to minimize API calls
   * @param {Object} filters - Can contain bounds (JSON), hasCoordinates, etc.
   * @param {Object} opts - { limit, page, force }
   * @returns {Promise<Array>} Observations within bounds
   */

  // Simple caching strategy for map: keep last bbox + filters
  // If requested bbox is contained in cache (with margin) and filters
  // are identical and cache hasn't expired, return cached data
  const CACHE_KEY = "phenom_map_cache";
  const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

  const mapCache = ref({ bounds: null, filtersHash: null, data: [], ts: 0 });

  /** Save cache to localStorage */
  const saveCacheToStorage = () => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(mapCache.value));
    } catch {
      // empty catch block: ignore error
    }
  };

  /** Load cache from localStorage */
  const loadCacheFromStorage = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        mapCache.value = { ...mapCache.value, ...parsed };
      }
    } catch {
      // empty catch block: ignore error
    }
  };

  /** Create stable JSON string for object comparison (sorted keys) */
  const stableStringify = (obj) => {
    if (!obj || typeof obj !== "object") return JSON.stringify(obj);
    const keys = Object.keys(obj).sort();
    const out = {};
    keys.forEach((k) => {
      out[k] = obj[k];
    });
    return JSON.stringify(out);
  };

  /** Check if big bounds contain small bounds (with margin tolerance) */
  const boundsContains = (big, small, margin = 0.15) => {
    // big & small: { north, south, east, west }
    if (!big || !small) return false;
    const latMargin = (big.north - big.south) * margin;
    const lngMargin = (big.east - big.west) * margin;
    return (
      small.north <= big.north + latMargin &&
      small.south >= big.south - latMargin &&
      small.east <= big.east + lngMargin &&
      small.west >= big.west - lngMargin
    );
  };

  // Initialize cache from localStorage on module load
  try {
    loadCacheFromStorage();
  } catch {
    // empty catch block: ignore error
  }

  const fetchObservationsInBounds = async (filters = {}, opts = {}) => {
    const { limit = 150, page = 1, force = false } = opts;

    // Normalize bounds (if provided as stringified JSON)
    let bounds = filters.bounds;
    try {
      if (typeof bounds === "string" && bounds) bounds = JSON.parse(bounds);
    } catch {
      bounds = null;
    }

    // Compute filters hash excluding bounds (we compare filters only)
    const filtersForHash = { ...filters };
    if (filtersForHash.bounds) delete filtersForHash.bounds;
    const filtersHash = stableStringify(filtersForHash);

    // Check cache
    const now = Date.now();
    if (
      !force &&
      mapCache.value.data?.length &&
      mapCache.value.filtersHash === filtersHash
    ) {
      const age = now - (mapCache.value.ts || 0);
      if (age < CACHE_TTL) {
        if (!bounds || !mapCache.value.bounds) {
          // no bounds requested -> return cached data
          return mapCache.value.data.slice(0, limit);
        }
        // if requested bounds contained in cached bounds (with margin), reuse
        if (boundsContains(mapCache.value.bounds, bounds)) {
          return mapCache.value.data.slice(0, limit);
        }
      }
    }

    // Otherwise fetch from API
    loading.value = true;
    error.value = null;
    try {
      const apiParams = convertFiltersToApiParams(filters);
      const response = await observationService.getAll({
        page,
        limit,
        ...apiParams,
      });
      const list = response.data || response.observations || [];

      // Update cache: store requested bounds (if any), filtersHash, data, ts
      mapCache.value = {
        bounds: bounds || null,
        filtersHash,
        data: list,
        ts: Date.now(),
      };
      try {
        saveCacheToStorage();
      } catch {
        // empty catch block: ignore error
      }

      return list;
    } catch (err) {
      error.value = err.response?.data?.message || "Error loading bounds data";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Load more observations (infinite scroll pagination)
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Array>} Newly loaded observations
   */
  const loadMore = async (filters = {}) => {
    if (!pagination.value.hasMore || loading.value) return;

    pagination.value.page++;
    loading.value = true;

    try {
      const apiParams = convertFiltersToApiParams(filters);
      const response = await observationService.getAll({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...apiParams,
      });

      const newObs = response.data || response.observations || [];
      observations.value.push(...newObs);

      pagination.value.hasMore = newObs.length === pagination.value.limit;
      return newObs;
    } catch (err) {
      pagination.value.page--; // Rollback
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Fetch a single observation by ID
   * @param {string} id - Observation ID
   * @returns {Promise<Object>} The observation object
   */
  const fetchObservationById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await observationService.getById(id);
      currentObservation.value = response.data || response;
      return currentObservation.value;
    } catch (err) {
      error.value = err.response?.data?.message || "Observation not found";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Create a new observation
   * @param {Object} data - Observation data to create
   * @returns {Promise<Object>} The created observation
   */
  const createObservation = async (data) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await observationService.create(data);
      const newObs = response.data || response;

      // Backend may return { success: false, error: '...' } with 200 status.
      // Treat that as an error to ensure callers can handle it.
      if (newObs && newObs.success === false) {
        error.value = newObs.error || "Creation failed";
        throw new Error(error.value);
      }
      observations.value.unshift(newObs);
      return newObs;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to create observation";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Update an existing observation
   * @param {string} id - Observation ID to update
   * @param {Object} data - Updated observation data
   * @returns {Promise<Object>} The updated observation
   */
  const updateObservation = async (id, data) => {
    loading.value = true;
    try {
      const response = await observationService.update(id, data);
      const updated = response.data || response;

      // Update in local list
      const index = observations.value.findIndex((o) => o._id === id);
      if (index !== -1) observations.value[index] = updated;
      if (currentObservation.value?._id === id)
        currentObservation.value = updated;

      return updated;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to update observation";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Upload images for an observation (POST /observations/:id/images)
   */
  const uploadObservationImages = async (observationId, files) => {
    loading.value = true;
    error.value = null;
    try {
      const formData = new FormData();
      if (Array.isArray(files)) {
        files.forEach((f) => formData.append("images", f));
      } else if (files) {
        formData.append("images", files);
      }

      const response = await observationService.addImages(
        observationId,
        formData
      );
      const updated = response.data || response;

      // Update currentObservation and list
      if (
        currentObservation.value &&
        (currentObservation.value._id === observationId ||
          currentObservation.value.id === observationId)
      ) {
        currentObservation.value = { ...currentObservation.value, ...updated };
      }

      const idx = observations.value.findIndex(
        (o) => o._id === observationId || o.id === observationId
      );
      if (idx !== -1) {
        observations.value[idx] = { ...observations.value[idx], ...updated };
      }

      return updated;
    } catch (err) {
      error.value = err.response?.data?.message || "Failed to upload images";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Generate an AI image for an observation (POST /observations/:id/generate-ai-image)
   */
  const generateAiImage = async (observationId) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await observationService.generateAiImage(observationId);
      const updated = response.data || response;

      // Merge updated data into currentObservation/list
      if (
        currentObservation.value &&
        (currentObservation.value._id === observationId ||
          currentObservation.value.id === observationId)
      ) {
        currentObservation.value = { ...currentObservation.value, ...updated };
      }

      const idx = observations.value.findIndex(
        (o) => o._id === observationId || o.id === observationId
      );
      if (idx !== -1) {
        observations.value[idx] = { ...observations.value[idx], ...updated };
      }

      return updated;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to generate AI image";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Delete an observation
   * @param {string} id - Observation ID to delete
   * @returns {Promise<void>}
   */
  const deleteObservation = async (id) => {
    loading.value = true;
    try {
      await observationService.delete(id);
      observations.value = observations.value.filter((o) => o._id !== id);
      if (currentObservation.value?._id === id) currentObservation.value = null;
    } catch (err) {
      error.value =
        err.response?.data?.message || "Failed to delete observation";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Reset store state to initial values
   */
  const reset = () => {
    observations.value = [];
    currentObservation.value = null;
    pagination.value = { page: 1, limit: 20, total: 0, hasMore: true };
    error.value = null;
  };

  return {
    // State
    observations,
    currentObservation,
    loading,
    error,
    pagination,

    // Computed
    hasObservations,
    observationsWithImages,

    // Actions
    fetchObservations,
    fetchObservationsInBounds,
    loadMore,
    fetchObservationById,
    createObservation,
    updateObservation,
    deleteObservation,
    uploadObservationImages,
    generateAiImage,
    reset,
  };
});
