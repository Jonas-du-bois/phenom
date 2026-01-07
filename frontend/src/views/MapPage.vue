<!--
  ============================================================================
  MapPage.vue - Interactive Observation Map Page
  ============================================================================
  
  PURPOSE:
  Displays observations on an interactive Leaflet map with clustering.
  Users can explore observations geographically and filter by various criteria.

  FEATURES:
  - Leaflet map with marker clustering
  - Auto-centers on user's location (with permission)
  - Focus on specific observation via query param (?focus=id)
  - Bounds-based observation loading (fetches visible area only)
  - Filter panel for refining displayed observations
  - Debounced bounds change handling for performance

  ROUTE: /map (main tab)
  ============================================================================
-->

<template>
  <AppLayout :show-tab-bar="true" :has-content-padding="false">
    <!-- Header slot (floating above map) -->
    <template #header>
      <PageHeader title="Carte" show-back>
        <template #right>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="Filtrer les observations"
            @click="showFilters = true"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
          </IconButton>
        </template>
      </PageHeader>
    </template>

    <div class="map-page h-screen relative">
      <!-- Map (full screen, passes under both navbars) -->
      <div 
        class="absolute inset-0 overflow-hidden z-0"
      >
        <ObservationMap
          ref="mapRef"
          :observations="mapObservations"
          :center="mapCenter"
          :zoom="mapZoom"
          :loading="loading"
          @bounds-change="handleBoundsChange"
          @marker-click="handleMarkerClick"
        />
      </div>

      <!-- Filter panel -->
      <FilterPanel
        :is-open="showFilters"
        :initial-filters="filters"
        @close="showFilters = false"
        @apply="applyFilters"
        @reset="resetFilters"
      />
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { AppLayout } from "@/components/layout";
import {
  PageHeader,
  ObservationMap,
  FilterPanel,
} from "@/components/organisms";
import { IconButton } from "@/components/atoms";
import { useObservationStore } from "@/stores/observation";
import { storeToRefs } from "pinia";
import { getObservationCoordinates } from "@/utils";

defineOptions({ name: "MapPage" });

const route = useRoute();
const observationStore = useObservationStore();
const { loading } = storeToRefs(observationStore);

// Observations specifically for the map viewport (non-mutative)
const mapObservations = ref([]);

// Simple debounce handle for bounds changes
let boundsTimeout = null;

const mapRef = ref(null);
const showFilters = ref(false);

const mapCenter = ref([46.8182, 8.2275]); // Switzerland
const mapZoom = ref(8);

const filters = ref({
  types: [],
  dateFrom: "",
  dateTo: "",
  minCredibility: 0,
  minStrangeness: 0,
  radius: 50,
  hasMedia: false,
  verifiedOnly: false,
});

const currentBounds = ref(null);

onMounted(async () => {
  // Check for focus query param
  if (route.query.focus) {
    // Fetch specific observation and center on it
    try {
      await observationStore.fetchObservationById(route.query.focus);
      const obs = observationStore.currentObservation;
      const coords = getObservationCoordinates(obs);

      if (coords) {
        mapCenter.value = [coords.lat, coords.lng];
        mapZoom.value = 14;
      }
    } catch {}
  }

  // Try to get user location
  if (navigator.geolocation && !route.query.focus) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        mapCenter.value = [position.coords.latitude, position.coords.longitude];
        mapZoom.value = 10;
      },
      () => {},
      { timeout: 5000 }
    );
  }

  await fetchMapObservations();
});
const fetchMapObservations = async (opts = {}) => {
  const { limit = 150 } = opts;
  const params = {
    ...filters.value,
    hasCoordinates: true,
  };

  if (currentBounds.value) {
    params.bounds = JSON.stringify(currentBounds.value);
  }

  try {
    const list = await observationStore.fetchObservationsInBounds(params, {
      limit,
    });
    mapObservations.value = list;
  } catch (err) {
    // noop, error handled in store
  }
};

const handleBoundsChange = (bounds) => {
  currentBounds.value = bounds;
  if (boundsTimeout) clearTimeout(boundsTimeout);
  boundsTimeout = setTimeout(() => {
    fetchMapObservations();
  }, 250);
};

const handleMarkerClick = (observation) => {
  // Popup handled by ObservationMap
};

const applyFilters = (newFilters) => {
  filters.value = { ...newFilters };
  fetchMapObservations();
};

const resetFilters = () => {
  filters.value = {
    types: [],
    dateFrom: "",
    dateTo: "",
    minCredibility: 0,
    minStrangeness: 0,
    radius: 50,
    hasMedia: false,
    verifiedOnly: false,
  };
  fetchMapObservations();
};
</script>
