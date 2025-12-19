/**
 * Store Pinia pour les observations
 * KISS: Wrapper simple autour du service
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { observationService } from "../services/observationService";

export const useObservationStore = defineStore("observation", () => {
  // État
  const observations = ref([]);
  const currentObservation = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const pagination = ref({ page: 1, limit: 30, total: 0, hasMore: true });

  // Computed
  const hasObservations = computed(() => observations.value.length > 0);
  const observationsWithImages = computed(() =>
    observations.value.filter((o) => o.images?.length > 0),
  );

  /**
   * Convertit les filtres frontend en format API backend
   * Format backend: ufoShape, phenomenon, country (regex, un seul), observerType
   */
  const convertFiltersToApiParams = (filters) => {
    const params = {};

    // Recherche textuelle
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

    // Country - backend utilise regex, donc un seul pays à la fois
    // On prend le premier pays sélectionné
    if (filters.countries?.length) {
      params.country = filters.countries[0];
    }

    // Locale type
    if (filters.locale) {
      params.locale = filters.locale;
    }

    // Scores min/max
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

    // Années (dateFrom/dateTo -> startYear/endYear)
    if (filters.dateFrom) {
      const year = new Date(filters.dateFrom).getFullYear();
      if (!isNaN(year)) params.startYear = year;
    }
    if (filters.dateTo) {
      const year = new Date(filters.dateTo).getFullYear();
      if (!isNaN(year)) params.endYear = year;
    }

    // Options booléennes
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

  /**
   * Récupère les observations avec filtres
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
      error.value = err.response?.data?.message || "Erreur de chargement";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Récupère des observations pour une bounding box / map view sans muter le store global
   * filters peut contenir bounds (JSON), hasCoordinates, etc.
   * opts: { limit } par défaut 150
   */
  // Simple caching strategy pour la carte : on conserve la dernière bbox+filtres
  // Si la bbox demandée est contenue dans le cache (avec marge) et les filtres
  // sont identiques et que le cache n'est pas expiré, on retourne les données locales.
  const CACHE_KEY = "phenom_map_cache";
  const CACHE_TTL = 1000 * 60 * 10; // 10 minutes

  const mapCache = ref({ bounds: null, filtersHash: null, data: [], ts: 0 });

  const saveCacheToStorage = () => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(mapCache.value));
    } catch {}
  };

  const loadCacheFromStorage = () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        mapCache.value = { ...mapCache.value, ...parsed };
      }
    } catch {}
  };

  const stableStringify = (obj) => {
    if (!obj || typeof obj !== "object") return JSON.stringify(obj);
    const keys = Object.keys(obj).sort();
    const out = {};
    keys.forEach((k) => {
      out[k] = obj[k];
    });
    return JSON.stringify(out);
  };

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

  // initialize cache from localStorage
  try {
    loadCacheFromStorage();
  } catch {}

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
      } catch {}

      return list;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur chargement bounds";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Charge plus d'observations (infinite scroll)
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
   * Récupère une observation par ID
   */
  const fetchObservationById = async (id) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await observationService.getById(id);
      currentObservation.value = response.data || response;
      return currentObservation.value;
    } catch (err) {
      error.value = err.response?.data?.message || "Observation introuvable";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Crée une nouvelle observation
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
        error.value = newObs.error || "Erreur de création";
        throw new Error(error.value);
      }
      observations.value.unshift(newObs);
      return newObs;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur de création";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Met à jour une observation
   */
  const updateObservation = async (id, data) => {
    loading.value = true;
    try {
      const response = await observationService.update(id, data);
      const updated = response.data || response;

      // Mettre à jour dans la liste
      const index = observations.value.findIndex((o) => o._id === id);
      if (index !== -1) observations.value[index] = updated;
      if (currentObservation.value?._id === id)
        currentObservation.value = updated;

      return updated;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur de mise à jour";
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
        formData,
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
        (o) => o._id === observationId || o.id === observationId,
      );
      if (idx !== -1) {
        observations.value[idx] = { ...observations.value[idx], ...updated };
      }

      return updated;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur upload images";
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
        (o) => o._id === observationId || o.id === observationId,
      );
      if (idx !== -1) {
        observations.value[idx] = { ...observations.value[idx], ...updated };
      }

      return updated;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur génération IA";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Supprime une observation
   */
  const deleteObservation = async (id) => {
    loading.value = true;
    try {
      await observationService.delete(id);
      observations.value = observations.value.filter((o) => o._id !== id);
      if (currentObservation.value?._id === id) currentObservation.value = null;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur de suppression";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Reset l'état
   */
  const reset = () => {
    observations.value = [];
    currentObservation.value = null;
    pagination.value = { page: 1, limit: 20, total: 0, hasMore: true };
    error.value = null;
  };

  return {
    // État
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
