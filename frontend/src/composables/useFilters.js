/**
 * Composable pour la gestion des filtres
 * Gère les options de filtrage et l'état du formulaire
 */
import { ref, computed } from "vue";
import { useFilterStore } from "../stores/filter";
import { useObservationStore } from "../stores/observation";
import { storeToRefs } from "pinia";

// Structure par défaut des filtres
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
  const observationStore = useObservationStore();

  // Références depuis le store filter
  const {
    countries, locales, statistics, loading, error, isInitialized,
    observerTypeOptions, ufoShapeOptions, phenomenaOptions, localeOptions,
    countryOptions, yearRange, credibilityScale, strangenessScale,
  } = storeToRefs(filterStore);

  // État local des filtres
  const formFilters = ref(createEmptyFilters());
  const activeFilters = ref(createEmptyFilters());
  const isApplying = ref(false);

  // Computed
  const hasFilters = computed(() =>
    Object.values(activeFilters.value).some(v => v !== null && v !== undefined && v !== "")
  );

  const activeFilterCount = computed(() =>
    Object.values(activeFilters.value).filter(v => v !== null && v !== undefined && v !== "").length
  );

  const activeFiltersSummary = computed(() => {
    const summary = [];
    const filters = activeFilters.value;

    if (filters.country) summary.push({ type: "country", label: `Pays: ${filters.country}` });
    if (filters.startYear || filters.endYear) {
      summary.push({ type: "year", label: `Année: ${filters.startYear || "..."} - ${filters.endYear || "..."}` });
    }
    if (filters.search) summary.push({ type: "search", label: `Recherche: "${filters.search}"` });

    return summary;
  });

  // Actions
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
      activeFilters.value = { ...formFilters.value };
      await observationStore.fetchObservations(cleanFilters);
    } finally {
      isApplying.value = false;
    }
  };

  const clearAllFilters = async () => {
    resetFormFilters();
    activeFilters.value = createEmptyFilters();
    await observationStore.fetchObservations();
  };

  const removeFilter = async (filterType) => {
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

  const reset = () => {
    filterStore.reset();
    resetFormFilters();
    activeFilters.value = createEmptyFilters();
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
    applyFilters, clearAllFilters, removeFilter, reset,
    // Label helpers
    getObserverLabel: filterStore.getObserverTypeLabel,
    getShapeLabel: filterStore.getUfoShapeLabel,
    getPhenomenonLabel: filterStore.getPhenomenonLabel,
    getLocaleLabel: filterStore.getLocaleTypeLabel,
  };
}
