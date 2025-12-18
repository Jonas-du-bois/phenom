/**
 * Store Pinia pour les filtres
 * Compatible avec le format Phenom Search API
 */
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { filterService } from "../services/filterService";
import { statsService } from "../services/statsService";
import { OBSERVER_TYPES, getObserverTypeLabel } from "../constants/observerTypes";
import { UFO_SHAPES, getUfoShapeLabel } from "../constants/ufoShapes";
import { PHENOMENA, getPhenomenonLabel } from "../constants/phenomena";
import { LOCALE_TYPES, getLocaleTypeLabel } from "../constants/localeTypes";
import { CREDIBILITY_SCALE, STRANGENESS_SCALE } from "../utils/constants";

export const useFilterStore = defineStore("filter", () => {
  // ========================================
  // State
  // ========================================
  const countries = ref([]);
  const locales = ref([]);
  const statistics = ref({
    total: 0,
    withCoordinates: 0,
    withImages: 0,
    byCountry: [],
    byYear: [],
  });
  const distributions = ref({
    ufoShapes: {},
    phenomena: {},
    observerTypes: {}
  });
  const loading = ref(false);
  const error = ref(null);
  const isInitialized = ref(false);

  // ========================================
  // Getters (computed)
  // ========================================
  const observerTypeOptions = computed(() =>
    OBSERVER_TYPES.map(t => ({ 
      value: t.code, 
      label: t.label, 
      icon: t.icon
    }))
  );

  const ufoShapeOptions = computed(() =>
    UFO_SHAPES.map(s => ({ 
      value: s.code, 
      label: s.label, 
      icon: s.icon, 
      color: s.color
    }))
  );

  const phenomenaOptions = computed(() =>
    PHENOMENA.map(p => ({ 
      value: p.code, 
      label: p.label, 
      icon: p.icon, 
      color: p.color, 
      category: p.category
    }))
  );

  const localeOptions = computed(() =>
    LOCALE_TYPES.map(l => ({ value: l.code, label: l.label, icon: l.icon }))
  );

  const countryOptions = computed(() =>
    countries.value.map(c => ({ value: c, label: c }))
  );

  const yearRange = computed(() => {
    if (!statistics.value.byYear.length) {
      return { min: 1900, max: new Date().getFullYear() };
    }
    const years = statistics.value.byYear.map(y => y.year);
    return { min: Math.min(...years), max: Math.max(...years) };
  });

  // ========================================
  // Actions
  // ========================================
  const clearError = () => { error.value = null; };

  const fetchCountries = async () => {
    const data = await filterService.getCountries();
    countries.value = data;
    return data;
  };

  const fetchLocales = async () => {
    const data = await filterService.getLocales();
    locales.value = data;
    return data;
  };

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
    // Récupérer les distributions
    distributions.value = {
      ufoShapes: data.ufoShapeDistribution || {},
      phenomena: data.phenomenaDistribution || {},
      observerTypes: data.observerTypeDistribution || {}
    };
    return data;
  };

  const initialize = async () => {
    if (isInitialized.value) return;

    loading.value = true;
    error.value = null;

    try {
      await Promise.all([fetchCountries(), fetchLocales(), fetchStatistics()]);
      isInitialized.value = true;
    } catch (err) {
      error.value = err.response?.data?.message || "Erreur lors de l'initialisation";
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const refresh = async () => {
    isInitialized.value = false;
    return initialize();
  };

  const reset = () => {
    countries.value = [];
    locales.value = [];
    statistics.value = { total: 0, withCoordinates: 0, withImages: 0, byCountry: [], byYear: [] };
    loading.value = false;
    error.value = null;
    isInitialized.value = false;
  };

  return {
    // State
    countries, locales, statistics, loading, error, isInitialized,
    // Getters
    observerTypeOptions, ufoShapeOptions, phenomenaOptions, localeOptions, countryOptions, yearRange,
    // Scales (from constants)
    credibilityScale: CREDIBILITY_SCALE,
    strangenessScale: STRANGENESS_SCALE,
    // Actions
    clearError, fetchCountries, fetchLocales, fetchStatistics, initialize, refresh, reset,
    // Label helpers (re-export)
    getObserverTypeLabel, getUfoShapeLabel, getPhenomenonLabel, getLocaleTypeLabel,
  };
});
