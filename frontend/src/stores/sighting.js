/**
 * Store Pinia pour les observations (sightings)
 * Compatible avec le format Phenom Search API
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { sightingService } from "../services/sightingService";

// Structure par défaut des filtres (DRY)
const DEFAULT_FILTERS = {
  country: null,
  startYear: null,
  endYear: null,
  minCredibility: null,
  maxCredibility: null,
  minStrangeness: null,
  maxStrangeness: null,
  observerType: null,
  ufoShape: null,
  phenomenon: null,
  hasCoordinates: null,
  hasImages: null,
  search: null,
};

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

export const useSightingStore = defineStore("sighting", () => {
  // ========================================
  // State
  // ========================================
  const sightings = ref([]);
  const currentSighting = ref(null);
  const nearbySightings = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const pagination = ref({ ...DEFAULT_PAGINATION });
  const activeFilters = ref({ ...DEFAULT_FILTERS });

  // ========================================
  // Getters (computed)
  // ========================================
  const hasFilters = computed(() => {
    return Object.values(activeFilters.value).some(
      (v) => v !== null && v !== undefined && v !== ""
    );
  });

  const sightingsWithCoordinates = computed(() => {
    return sightings.value.filter(
      (s) => s.coordinates?.lat && s.coordinates?.lng
    );
  });

  const sightingsWithImages = computed(() => {
    return sightings.value.filter((s) => s.images && s.images.length > 0);
  });

  const totalCount = computed(() => pagination.value.total);

  // ========================================
  // Actions
  // ========================================

  /**
   * Réinitialise les erreurs
   */
  const clearError = () => {
    error.value = null;
  };

  /**
   * Réinitialise les filtres actifs
   */
  const clearFilters = () => {
    activeFilters.value = { ...DEFAULT_FILTERS };
  };

  /**
   * Met à jour les filtres actifs
   * @param {Object} filters - Nouveaux filtres à appliquer
   */
  const setFilters = (filters) => {
    activeFilters.value = { ...activeFilters.value, ...filters };
  };

  /**
   * Helper: Met à jour un sighting dans la liste et dans currentSighting (DRY)
   * @param {String} id - ID du sighting
   * @param {Object} updatedSighting - Sighting mis à jour
   */
  const updateSightingInState = (id, updatedSighting) => {
    const index = sightings.value.findIndex((s) => s._id === id);
    if (index !== -1) {
      sightings.value[index] = updatedSighting;
    }
    if (currentSighting.value?._id === id) {
      currentSighting.value = updatedSighting;
    }
  };

  /**
   * Helper: Met à jour la pagination depuis la réponse API
   * @param {Object} paginationResponse - Réponse de pagination
   */
  const updatePagination = (paginationResponse) => {
    pagination.value = {
      page: paginationResponse.page,
      limit: paginationResponse.limit,
      total: paginationResponse.total,
      totalPages: paginationResponse.totalPages,
      hasNextPage: paginationResponse.hasNextPage,
      hasPrevPage: paginationResponse.hasPrevPage,
    };
  };

  /**
   * Helper: Exécute une action avec gestion du loading/error
   * @param {Function} action - Action async à exécuter
   * @param {String} errorMessage - Message d'erreur par défaut
   */
  const withLoading = async (action, errorMessage) => {
    loading.value = true;
    error.value = null;
    try {
      return await action();
    } catch (err) {
      error.value = err.response?.data?.message || errorMessage;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Récupère les sightings paginés
   * @param {Object} options - Options de pagination
   */
  const fetchPaginated = async ({ page = 1, limit = 20 } = {}) => {
    return withLoading(async () => {
      const response = await sightingService.getPaginated({ page, limit });
      sightings.value = response.data;
      updatePagination(response.pagination);
      return response;
    }, "Erreur lors du chargement");
  };

  /**
   * Récupère les sightings avec filtres
   * @param {Object} filters - Filtres à appliquer
   * @param {Object} paginationOptions - Options de pagination
   */
  const fetchWithFilters = async (
    filters = null,
    { page = 1, limit = 20 } = {}
  ) => {
    const filtersToUse = filters || activeFilters.value;

    return withLoading(async () => {
      const response = await sightingService.getWithFilters({
        ...filtersToUse,
        page,
        limit,
      });

      sightings.value = response.data;
      updatePagination(response.pagination);

      if (filters) {
        setFilters(filters);
      }

      return response;
    }, "Erreur lors du chargement avec filtres");
  };

  /**
   * Récupère un sighting par son ID
   * @param {String} id - ID du sighting
   */
  const fetchById = async (id) => {
    return withLoading(async () => {
      const response = await sightingService.getById(id);
      currentSighting.value = response.data;
      return response.data;
    }, "Observation non trouvée");
  };

  /**
   * Crée un nouveau sighting
   * @param {Object} sightingData - Données du sighting
   */
  const create = async (sightingData) => {
    return withLoading(async () => {
      const newSighting = await sightingService.create(sightingData);
      sightings.value.unshift(newSighting);
      return newSighting;
    }, "Erreur lors de la création");
  };

  /**
   * Met à jour un sighting existant
   * @param {String} id - ID du sighting
   * @param {Object} sightingData - Données à mettre à jour
   */
  const update = async (id, sightingData) => {
    return withLoading(async () => {
      const updatedSighting = await sightingService.update(id, sightingData);
      updateSightingInState(id, updatedSighting);
      return updatedSighting;
    }, "Erreur lors de la mise à jour");
  };

  /**
   * Supprime un sighting
   * @param {String} id - ID du sighting
   */
  const remove = async (id) => {
    return withLoading(async () => {
      await sightingService.delete(id);
      sightings.value = sightings.value.filter((s) => s._id !== id);
      if (currentSighting.value?._id === id) {
        currentSighting.value = null;
      }
      return true;
    }, "Erreur lors de la suppression");
  };

  /**
   * Ajoute des images à un sighting
   * @param {String} id - ID du sighting
   * @param {FormData} formData - FormData contenant les images
   */
  const addImages = async (id, formData) => {
    return withLoading(async () => {
      const updatedSighting = await sightingService.addImages(id, formData);
      updateSightingInState(id, updatedSighting);
      return updatedSighting;
    }, "Erreur lors de l'upload des images");
  };

  /**
   * Génère une image IA pour un sighting
   * @param {String} id - ID du sighting
   */
  const generateAiImage = async (id) => {
    return withLoading(async () => {
      const updatedSighting = await sightingService.generateAiImage(id);
      updateSightingInState(id, updatedSighting);
      return updatedSighting;
    }, "Erreur lors de la génération IA");
  };

  /**
   * Récupère les sightings à proximité
   * @param {Object} options - { lat, lng, maxDistance, limit }
   */
  const fetchNearby = async ({ lat, lng, maxDistance = 50000, limit = 10 }) => {
    return withLoading(async () => {
      const response = await sightingService.getNearby({
        lat,
        lng,
        maxDistance,
        limit,
      });
      nearbySightings.value = response;
      return response;
    }, "Erreur lors de la recherche à proximité");
  };

  /**
   * Helper: Va à une page spécifique (utilisé par nextPage, prevPage, goToPage)
   */
  const navigateToPage = async (page) => {
    if (page < 1 || page > pagination.value.totalPages) return;
    const options = { page, limit: pagination.value.limit };
    return hasFilters.value ? fetchWithFilters(null, options) : fetchPaginated(options);
  };

  /**
   * Charge la page suivante
   */
  const nextPage = () => pagination.value.hasNextPage && navigateToPage(pagination.value.page + 1);

  /**
   * Charge la page précédente
   */
  const prevPage = () => pagination.value.hasPrevPage && navigateToPage(pagination.value.page - 1);

  /**
   * Va à une page spécifique
   */
  const goToPage = (page) => navigateToPage(page);

  /**
   * Réinitialise le store
   */
  const reset = () => {
    sightings.value = [];
    currentSighting.value = null;
    nearbySightings.value = [];
    loading.value = false;
    error.value = null;
    activeFilters.value = { ...DEFAULT_FILTERS };
    pagination.value = { ...DEFAULT_PAGINATION };
  };

  return {
    // State
    sightings,
    currentSighting,
    nearbySightings,
    loading,
    error,
    pagination,
    activeFilters,

    // Getters
    hasFilters,
    sightingsWithCoordinates,
    sightingsWithImages,
    totalCount,

    // Actions
    clearError,
    clearFilters,
    setFilters,
    fetchPaginated,
    fetchWithFilters,
    fetchById,
    create,
    update,
    remove,
    addImages,
    generateAiImage,
    fetchNearby,
    nextPage,
    prevPage,
    goToPage,
    reset,
  };
});
