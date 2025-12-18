/**
 * Composable pour la gestion des observations
 * KISS: Wrapper léger autour du store Pinia
 */
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useObservationStore } from "@/stores/observation";

export function useObservations() {
  const store = useObservationStore();
  const { observations, currentObservation, loading, error, pagination } = storeToRefs(store);

  // Computed
  const hasMore = computed(() => pagination.value.hasMore);
  const loadingMore = computed(() => loading.value && observations.value.length > 0);
  
  const observationsWithImages = computed(() => 
    observations.value.filter((obs) => obs.images?.length > 0 || obs.imageUrl)
  );

  const uniqueTypes = computed(() => {
    const types = new Set(observations.value.map((obs) => obs.type).filter(Boolean));
    return [...types];
  });

  const totalObservations = computed(() => observations.value.length);

  // Actions - délègue au store
  const fetchObservations = (params = {}) => store.fetchObservations(params);
  const loadMore = (params = {}) => store.loadMore(params);
  const refresh = (params = {}) => {
    store.reset();
    return store.fetchObservations(params);
  };

  const loadObservation = (id) => store.fetchObservationById(id);
  const createObservation = (data) => store.createObservation(data);
  const updateObservation = (id, data) => store.updateObservation(id, data);
  const deleteObservation = (id) => store.deleteObservation(id);

  // WebSocket helpers
  const addObservation = (observation) => {
    const exists = observations.value.some((obs) => obs._id === observation._id);
    if (!exists) {
      observations.value.unshift(observation);
    }
  };

  const updateObservationInList = (observation) => {
    const index = observations.value.findIndex((obs) => obs._id === observation._id);
    if (index !== -1) {
      observations.value[index] = observation;
    }
  };

  const removeObservation = (observationId) => {
    observations.value = observations.value.filter((obs) => obs._id !== observationId);
  };

  // Filtres locaux
  const filterByType = (type) => {
    if (!type) return observations.value;
    return observations.value.filter((obs) => obs.type === type);
  };

  const sortObservations = (sortBy = "createdAt", order = "desc") => {
    return [...observations.value].sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      return order === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });
  };

  return {
    // État (refs du store)
    observations,
    currentObservation,
    loading,
    loadingMore,
    error,
    hasMore,

    // Computed
    observationsWithImages,
    uniqueTypes,
    totalObservations,

    // Actions
    fetchObservations,
    loadMore,
    refresh,
    loadObservation,
    createObservation,
    updateObservation,
    deleteObservation,

    // WebSocket helpers
    addObservation,
    updateObservationInList,
    removeObservation,

    // Filtres
    filterByType,
    sortObservations,
  };
}
