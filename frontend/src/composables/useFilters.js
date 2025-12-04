/**
 * Composable pour la gestion des filtres
 * Compatible avec le format Phenom Search API
 */
import { ref, computed } from "vue";
import { useFilterStore } from "../stores/filter";
import { useSightingStore } from "../stores/sighting";
import { storeToRefs } from "pinia";

// Structure par défaut des filtres (DRY - défini une seule fois)
const createEmptyFilters = () => ({
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
  search: "",
});

export function useFilters() {
  const filterStore = useFilterStore();
  const sightingStore = useSightingStore();

  // Références depuis les stores
  const {
    countries, locales, statistics, loading, error, isInitialized,
    observerTypeOptions, ufoShapeOptions, phenomenaOptions, localeOptions,
    countryOptions, yearRange, credibilityScale, strangenessScale,
  } = storeToRefs(filterStore);

  const { activeFilters, hasFilters } = storeToRefs(sightingStore);

  // État local
  const formFilters = ref(createEmptyFilters());
  const isApplying = ref(false);

  // ========================================
  // Computed
  // ========================================
  const activeFilterCount = computed(() =>
    Object.values(activeFilters.value).filter(v => v !== null && v !== undefined && v !== "").length
  );

  const activeFiltersSummary = computed(() => {
    const summary = [];
    const filters = activeFilters.value;

    if (filters.country) {
      summary.push({ type: "country", label: `Pays: ${filters.country}` });
    }
    if (filters.startYear || filters.endYear) {
      summary.push({ type: "year", label: `Année: ${filters.startYear || "..."} - ${filters.endYear || "..."}` });
    }
    if (filters.minCredibility !== null || filters.maxCredibility !== null) {
      summary.push({ type: "credibility", label: `Crédibilité: ${filters.minCredibility ?? 0}-${filters.maxCredibility ?? 15}` });
    }
    if (filters.minStrangeness !== null || filters.maxStrangeness !== null) {
      summary.push({ type: "strangeness", label: `Étrangeté: ${filters.minStrangeness ?? 0}-${filters.maxStrangeness ?? 10}` });
    }
    if (filters.observerType) {
      summary.push({ type: "observerType", label: `Observateur: ${filterStore.getObserverTypeLabel(filters.observerType)}` });
    }
    if (filters.ufoShape) {
      summary.push({ type: "ufoShape", label: `Forme: ${filterStore.getUfoShapeLabel(filters.ufoShape)}` });
    }
    if (filters.phenomenon) {
      summary.push({ type: "phenomenon", label: `Phénomène: ${filterStore.getPhenomenonLabel(filters.phenomenon)}` });
    }
    if (filters.hasCoordinates) summary.push({ type: "hasCoordinates", label: "Avec coordonnées" });
    if (filters.hasImages) summary.push({ type: "hasImages", label: "Avec images" });
    if (filters.search) summary.push({ type: "search", label: `Recherche: "${filters.search}"` });

    return summary;
  });

  // ========================================
  // Actions
  // ========================================
  const initialize = () => filterStore.initialize();
  const refresh = () => filterStore.refresh();

  const setFilter = (key, value) => { formFilters.value[key] = value; };
  const setFilters = (filters) => { formFilters.value = { ...formFilters.value, ...filters }; };
  const resetFormFilters = () => { formFilters.value = createEmptyFilters(); };

  const applyFilters = async () => {
    isApplying.value = true;
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(formFilters.value).filter(([, v]) => v !== null && v !== undefined && v !== "")
      );
      await sightingStore.fetchWithFilters(cleanFilters);
    } finally {
      isApplying.value = false;
    }
  };

  const clearAllFilters = async () => {
    resetFormFilters();
    sightingStore.clearFilters();
    await sightingStore.fetchPaginated();
  };

  const removeFilter = async (filterType) => {
    // Gestion des filtres de plage
    const rangeFilters = {
      year: ["startYear", "endYear"],
      credibility: ["minCredibility", "maxCredibility"],
      strangeness: ["minStrangeness", "maxStrangeness"],
    };

    if (rangeFilters[filterType]) {
      rangeFilters[filterType].forEach(key => { formFilters.value[key] = null; });
    } else {
      formFilters.value[filterType] = null;
    }
    await applyFilters();
  };

  const syncFormWithActive = () => { formFilters.value = { ...activeFilters.value }; };

  const reset = () => {
    filterStore.reset();
    resetFormFilters();
    isApplying.value = false;
  };

  return {
    // State
    countries, locales, statistics, loading, error, isInitialized,
    // Options
    observerTypeOptions, ufoShapeOptions, phenomenaOptions, localeOptions, countryOptions, yearRange,
    credibilityScale, strangenessScale,
    // Filters state
    activeFilters, hasFilters, formFilters, isApplying,
    // Computed
    activeFilterCount, activeFiltersSummary,
    // Actions
    initialize, refresh, setFilter, setFilters, resetFormFilters,
    applyFilters, clearAllFilters, removeFilter, syncFormWithActive, reset,
    // Label helpers (re-export from store)
    getObserverLabel: filterStore.getObserverTypeLabel,
    getShapeLabel: filterStore.getUfoShapeLabel,
    getPhenomenonLabel: filterStore.getPhenomenonLabel,
    getLocaleLabel: filterStore.getLocaleTypeLabel,
  };
}
