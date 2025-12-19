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
  const pagination = ref({ page: 1, limit: 20, total: 0, hasMore: true });

  // Computed
  const hasObservations = computed(() => observations.value.length > 0);
  const observationsWithImages = computed(() => 
    observations.value.filter(o => o.images?.length > 0)
  );

  /**
   * Convertit les filtres frontend en format API backend
   * Format backend: ufoShape, phenomenon, country (regex, un seul), observerType
   */
  const convertFiltersToApiParams = (filters) => {
    const params = {}
    
    // Recherche textuelle
    if (filters.search) {
      params.search = filters.search
    }
    
    // UFO Shapes (comma-separated)
    if (filters.ufoShapes?.length) {
      params.ufoShape = filters.ufoShapes.join(',')
    }
    
    // Phenomena (comma-separated)
    if (filters.phenomena?.length) {
      params.phenomenon = filters.phenomena.join(',')
    }
    
    // Observer Types (comma-separated)
    if (filters.observerTypes?.length) {
      params.observerType = filters.observerTypes.join(',')
    }
    
    // Country - backend utilise regex, donc un seul pays à la fois
    // On prend le premier pays sélectionné
    if (filters.countries?.length) {
      params.country = filters.countries[0]
    }
    
    // Locale type
    if (filters.locale) {
      params.locale = filters.locale
    }
    
    // Scores min/max
    if (filters.minCredibility !== undefined && filters.minCredibility > 0) {
      params.minCredibility = filters.minCredibility
    }
    if (filters.maxCredibility !== undefined && filters.maxCredibility < 15) {
      params.maxCredibility = filters.maxCredibility
    }
    if (filters.minStrangeness !== undefined && filters.minStrangeness > 0) {
      params.minStrangeness = filters.minStrangeness
    }
    if (filters.maxStrangeness !== undefined && filters.maxStrangeness < 10) {
      params.maxStrangeness = filters.maxStrangeness
    }
    
    // Années (dateFrom/dateTo -> startYear/endYear)
    if (filters.dateFrom) {
      const year = new Date(filters.dateFrom).getFullYear()
      if (!isNaN(year)) params.startYear = year
    }
    if (filters.dateTo) {
      const year = new Date(filters.dateTo).getFullYear()
      if (!isNaN(year)) params.endYear = year
    }
    
    // Options booléennes
    if (filters.hasMedia) {
      params.hasImages = true
    }
    if (filters.hasCoordinates) {
      params.hasCoordinates = true
    }
    if (filters.verifiedOnly) {
      params.isVerified = true
    }
    
    return params
  }

  /**
   * Récupère les observations avec filtres
   */
  const fetchObservations = async (filters = {}) => {
    loading.value = true;
    error.value = null;
    try {
      const apiParams = convertFiltersToApiParams(filters)
      
      const response = await observationService.getAll({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...apiParams
      });
      
      observations.value = response.data || response.observations || [];
      if (response.pagination) {
        pagination.value = {
          ...pagination.value,
          total: response.pagination.total,
          hasMore: response.pagination.hasNextPage
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
   * Charge plus d'observations (infinite scroll)
   */
  const loadMore = async (filters = {}) => {
    if (!pagination.value.hasMore || loading.value) return;
    
    pagination.value.page++;
    loading.value = true;
    
    try {
      const apiParams = convertFiltersToApiParams(filters)
      const response = await observationService.getAll({
        page: pagination.value.page,
        limit: pagination.value.limit,
        ...apiParams
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
        error.value = newObs.error || 'Erreur de création';
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
      const index = observations.value.findIndex(o => o._id === id);
      if (index !== -1) observations.value[index] = updated;
      if (currentObservation.value?._id === id) currentObservation.value = updated;
      
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
        files.forEach((f) => formData.append('images', f));
      } else if (files) {
        formData.append('images', files);
      }

      const response = await observationService.addImages(observationId, formData);
      const updated = response.data || response;

      // Update currentObservation and list
      if (currentObservation.value && (currentObservation.value._id === observationId || currentObservation.value.id === observationId)) {
        currentObservation.value = { ...currentObservation.value, ...updated };
      }

      const idx = observations.value.findIndex(o => o._id === observationId || o.id === observationId);
      if (idx !== -1) {
        observations.value[idx] = { ...observations.value[idx], ...updated };
      }

      return updated;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur upload images';
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
      if (currentObservation.value && (currentObservation.value._id === observationId || currentObservation.value.id === observationId)) {
        currentObservation.value = { ...currentObservation.value, ...updated };
      }

      const idx = observations.value.findIndex(o => o._id === observationId || o.id === observationId);
      if (idx !== -1) {
        observations.value[idx] = { ...observations.value[idx], ...updated };
      }

      return updated;
    } catch (err) {
      error.value = err.response?.data?.message || 'Erreur génération IA';
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
      observations.value = observations.value.filter(o => o._id !== id);
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
