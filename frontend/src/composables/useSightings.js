/**
 * Composable pour la gestion des observations (sightings)
 * Compatible avec le format Phenom Search API
 */
import { ref, computed } from "vue";
import { useSightingStore } from "../stores/sighting";
import { storeToRefs } from "pinia";
import {
  formatDuration,
  getCredibilityLabel,
  getCredibilityColor,
  getStrangenessLabel,
  getStrangenessColor,
} from "../utils/sightingHelpers";

export function useSightings() {
  const sightingStore = useSightingStore();

  // État local
  const localLoading = ref(false);
  const localError = ref(null);

  // Références depuis le store
  const {
    sightings, currentSighting, nearbySightings, loading, error,
    pagination, activeFilters, hasFilters,
    sightingsWithCoordinates, sightingsWithImages, totalCount,
  } = storeToRefs(sightingStore);

  // ========================================
  // Computed
  // ========================================
  const imageCount = computed(() => sightingsWithImages.value.length);
  const coordinatesCount = computed(() => sightingsWithCoordinates.value.length);

  const uniqueObserverTypes = computed(() => {
    const types = new Set();
    sightings.value.forEach(s => s.observerTypes?.forEach(t => types.add(t)));
    return Array.from(types);
  });

  const uniqueUfoShapes = computed(() => {
    const shapes = new Set();
    sightings.value.forEach(s => s.ufoShapes?.forEach(shape => shapes.add(shape)));
    return Array.from(shapes);
  });

  const uniquePhenomena = computed(() => {
    const phenomena = new Set();
    sightings.value.forEach(s => s.phenomena?.forEach(p => phenomena.add(p)));
    return Array.from(phenomena);
  });

  const uniqueCountries = computed(() =>
    [...new Set(sightings.value.map(s => s.country).filter(Boolean))].sort()
  );

  const currentStats = computed(() => ({
    total: sightings.value.length,
    withImages: imageCount.value,
    withCoordinates: coordinatesCount.value,
    countries: uniqueCountries.value.length,
  }));

  // ========================================
  // Actions
  // ========================================
  const loadSightings = (options = {}) => sightingStore.fetchPaginated(options);
  const loadWithFilters = (filters = null, options = {}) => sightingStore.fetchWithFilters(filters, options);
  const loadSighting = (id) => sightingStore.fetchById(id);
  const updateSighting = (id, data) => sightingStore.update(id, data);
  const deleteSighting = (id) => sightingStore.remove(id);
  const generateAiImage = (id) => sightingStore.generateAiImage(id);

  const createSighting = async (data, imageFiles = []) => {
    localLoading.value = true;
    localError.value = null;
    try {
      const newSighting = await sightingStore.create(data);
      if (imageFiles.length > 0 && newSighting._id) {
        const formData = new FormData();
        imageFiles.forEach(file => formData.append("images", file));
        await sightingStore.addImages(newSighting._id, formData);
      }
      return newSighting;
    } catch (err) {
      localError.value = err.message || "Erreur lors de la création";
      throw err;
    } finally {
      localLoading.value = false;
    }
  };

  const addImages = async (id, files) => {
    const formData = new FormData();
    files.forEach(file => formData.append("images", file));
    return sightingStore.addImages(id, formData);
  };

  const loadNearby = (coordinates, options = {}) =>
    sightingStore.fetchNearby({ lat: coordinates.lat, lng: coordinates.lng, ...options });

  // Filtres rapides
  const search = (query, options = {}) => loadWithFilters({ search: query }, options);
  const filterByCountry = (country, options = {}) => loadWithFilters({ country }, options);
  const filterByYear = (year, options = {}) => loadWithFilters({ startYear: year, endYear: year }, options);
  const filterByCredibility = (min, max, options = {}) => loadWithFilters({ minCredibility: min, maxCredibility: max }, options);
  const filterWithImages = (options = {}) => loadWithFilters({ hasImages: true }, options);
  const filterWithCoordinates = (options = {}) => loadWithFilters({ hasCoordinates: true }, options);

  // Pagination
  const nextPage = () => sightingStore.nextPage();
  const prevPage = () => sightingStore.prevPage();
  const goToPage = (page) => sightingStore.goToPage(page);

  // Filtres
  const clearFilters = () => sightingStore.clearFilters();
  const setFilters = (filters) => sightingStore.setFilters(filters);

  const reset = () => {
    sightingStore.reset();
    localLoading.value = false;
    localError.value = null;
  };

  return {
    // State
    sightings, currentSighting, nearbySightings, loading, error,
    pagination, activeFilters, hasFilters,
    sightingsWithCoordinates, sightingsWithImages, totalCount,
    localLoading, localError,
    // Computed
    imageCount, coordinatesCount, uniqueObserverTypes, uniqueUfoShapes,
    uniquePhenomena, uniqueCountries, currentStats,
    // Actions
    loadSightings, loadWithFilters, loadSighting, createSighting,
    updateSighting, deleteSighting, addImages, generateAiImage, loadNearby, search,
    // Quick filters
    filterByCountry, filterByYear, filterByCredibility, filterWithImages, filterWithCoordinates,
    // Pagination
    nextPage, prevPage, goToPage,
    // Filters
    clearFilters, setFilters, reset,
    // Utils (re-export from helpers)
    formatDuration, getCredibilityLabel, getCredibilityColor, getStrangenessLabel, getStrangenessColor,
  };
}
