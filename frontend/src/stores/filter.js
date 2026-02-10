/**
 * Filter Pinia Store
 *
 * Manages filter options and statistics for the Phenom Search API.
 * Provides dropdowns data for countries, locales, observer types, UFO shapes, etc.
 * Fetches and caches filter metadata from the API.
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { filterService } from "../services/filterService";
import { statsService } from "../services/statsService";
import {
  OBSERVER_TYPES,
  getObserverTypeLabel,
} from "../constants/observerTypes";
import { UFO_SHAPES, getUfoShapeLabel } from "../constants/ufoShapes";
import { PHENOMENA, getPhenomenonLabel } from "../constants/phenomena";
import { LOCALE_TYPES, getLocaleTypeLabel } from "../constants/localeTypes";
import { CREDIBILITY_SCALE, STRANGENESS_SCALE } from "../utils/constants";

export const useFilterStore = defineStore("filter", () => {
  // ==========================================================================
  // STATE
  // ==========================================================================

  /** Available countries from API */
  const countries = ref([]);

  /** Available locale types from API */
  const locales = ref([]);

  /** Statistics about observations (totals, distributions) */
  const statistics = ref({
    total: 0,
    withCoordinates: 0,
    withImages: 0,
    byCountry: [],
    byYear: [],
  });

  /** Distribution counts for filter options */
  const distributions = ref({
    ufoShapes: {},
    phenomena: {},
    observerTypes: {},
  });

  /** Loading state for async operations */
  const loading = ref(false);

  /** Error message from last failed operation */
  const error = ref(null);

  /** Whether store has been initialized */
  const isInitialized = ref(false);

  // ==========================================================================
  // COMPUTED GETTERS - Formatted options for dropdowns
  // ==========================================================================

  /** Observer type options for dropdowns */
  const observerTypeOptions = computed(() =>
    OBSERVER_TYPES.map((t) => ({
      value: t.code,
      label: t.label,
      icon: t.icon,
    })),
  );

  /** UFO shape options for dropdowns */
  const ufoShapeOptions = computed(() =>
    UFO_SHAPES.map((s) => ({
      value: s.code,
      label: s.label,
      icon: s.icon,
      color: s.color,
    })),
  );

  /** Phenomena options for dropdowns */
  const phenomenaOptions = computed(() =>
    PHENOMENA.map((p) => ({
      value: p.code,
      label: p.label,
      icon: p.icon,
      color: p.color,
      category: p.category,
    })),
  );

  /** Locale type options for dropdowns */
  const localeOptions = computed(() =>
    LOCALE_TYPES.map((l) => ({ value: l.code, label: l.label, icon: l.icon })),
  );

  /** Country options for dropdowns */
  const countryOptions = computed(() =>
    countries.value.map((c) => ({ value: c, label: c })),
  );

  /** Year range based on available data */
  const yearRange = computed(() => {
    if (!statistics.value.byYear.length) {
      return { min: 1900, max: new Date().getFullYear() };
    }
    const years = statistics.value.byYear.map((y) => y.year);
    return { min: Math.min(...years), max: Math.max(...years) };
  });

  // ==========================================================================
  // ACTIONS
  // ==========================================================================

  /** Clear error state */
  const clearError = () => {
    error.value = null;
  };

  /** Fetch available countries from API */
  const fetchCountries = async () => {
    const data = await filterService.getCountries();
    countries.value = data;
    return data;
  };

  /** Fetch available locale types from API */
  const fetchLocales = async () => {
    const data = await filterService.getLocales();
    locales.value = data;
    return data;
  };

  /** Fetch statistics and distributions from API */
  const fetchStatistics = async () => {
    const response = await statsService.getPublicStats();
    const data = response.data || response;
    statistics.value = {
      total: data.totalSightings || 0,
      withCoordinates: data.sightingsWithCoordinates || 0,
      withImages: data.sightingsWithImages || 0,
      byCountry: data.topCountries || [],
      byYear: data.byYear || [],
    };
    // Get distributions for filter counts
    distributions.value = {
      ufoShapes: data.ufoShapeDistribution || {},
      phenomena: data.phenomenaDistribution || {},
      observerTypes: data.observerTypeDistribution || {},
    };
    return data;
  };

  /**
   * Initialize the store (fetch all filter data)
   * Should be called once on app startup
   */
  const initialize = async () => {
    if (isInitialized.value) return;

    loading.value = true;
    error.value = null;

    try {
      await Promise.all([fetchCountries(), fetchLocales(), fetchStatistics()]);
      isInitialized.value = true;
    } catch (err) {
      error.value = err.response?.data?.message || "Initialization error";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  /** Force refresh all filter data */
  const refresh = async () => {
    isInitialized.value = false;
    return initialize();
  };

  /** Reset store to initial state */
  const reset = () => {
    countries.value = [];
    locales.value = [];
    statistics.value = {
      total: 0,
      withCoordinates: 0,
      withImages: 0,
      byCountry: [],
      byYear: [],
    };
    loading.value = false;
    error.value = null;
    isInitialized.value = false;
  };

  return {
    // State
    countries,
    locales,
    statistics,
    loading,
    error,
    isInitialized,

    // Computed getters (dropdown options)
    observerTypeOptions,
    ufoShapeOptions,
    phenomenaOptions,
    localeOptions,
    countryOptions,
    yearRange,

    // Scales (from constants)
    credibilityScale: CREDIBILITY_SCALE,
    strangenessScale: STRANGENESS_SCALE,

    // Actions
    clearError,
    fetchCountries,
    fetchLocales,
    fetchStatistics,
    initialize,
    refresh,
    reset,

    // Label helper functions (re-exported from constants)
    getObserverTypeLabel,
    getUfoShapeLabel,
    getPhenomenonLabel,
    getLocaleTypeLabel,
  };
});
