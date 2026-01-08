<!--
  ============================================================================
  FeedPage.vue - Main Observation Feed Page
  ============================================================================
  
  PURPOSE:
  The primary page of the app displaying a scrollable list of UFO observations.
  Includes search, filtering, and infinite scroll loading.

  FEATURES:
  - Infinite scroll with "load more" functionality
  - Search bar with recent searches and suggestions
  - Filter panel for refining observations by type, date, etc.
  - Active filter chips showing current filter state
  - Pull-to-refresh capability
  - Empty state with action to create new observation

  ROUTE: /feed (main tab)
  ============================================================================
-->

<template>
  <AppLayout :alert-count="alertCount">
    <template #header>
      <PageHeader :show-search="true" @search="toggleSearch">
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

    <div class="feed-page">
      <!-- Search Bar avec animation -->
      <Transition name="search">
        <div v-if="showSearch" class="px-4 pt-2 pb-2 border-b border-white/5">
          <SearchBar
            ref="searchBarRef"
            v-model="searchQuery"
            placeholder="Rechercher des observations..."
            :suggestions="searchSuggestions"
            :recent-searches="recentSearches"
            @search="handleSearch"
            @clear="clearSearch"
            @clear-recent="clearRecentSearches"
            @close="toggleSearch"
          />
          <button
            @click="toggleSearch"
            class="mt-2 text-sm text-[#00F0FF] hover:text-[#00F0FF]/80 transition-colors"
          >
            Fermer la recherche
          </button>
        </div>
      </Transition>
      <!-- Active filters display -->
      <div
        v-if="hasActiveFilters"
        class="px-4 py-2 flex items-center gap-2 overflow-x-auto scrollbar-hide border-b border-white/5"
      >
        <div class="flex items-center gap-2 flex-nowrap">
          <button
            @click="clearAllFilters"
            class="text-xs text-[#00F0FF] whitespace-nowrap flex-shrink-0 ml-2"
          >
            Effacer tout
          </button>
          <FilterChip
            v-for="filter in activeFilterChips"
            :key="filter.key"
            :label="filter.label"
            :active="true"
            removable
            @remove="removeFilter(filter.key)"
          />
        </div>
      </div>

      <!-- Observation list -->
      <div class="px-4 py-4">
        <ObservationList
          ref="observationListRef"
          :observations="observations"
          :loading="loading"
          :loading-more="loadingMore"
          :has-more="hasMore"
          empty-title="Aucune observation"
          empty-description="Soyez le premier à partager une observation !"
          @load-more="loadMore"
          @refresh="refresh"
        >
          <template #empty-action>
            <BaseButton variant="primary" @click="$router.push('/camera')">
              Créer une observation
            </BaseButton>
          </template>
        </ObservationList>
      </div>
    </div>

    <!-- Filter panel -->
    <FilterPanel
      :is-open="showFilters"
      :initial-filters="filters"
      @close="showFilters = false"
      @apply="applyFilters"
      @reset="resetFilters"
    />
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from "vue";
import { AppLayout } from "@/components/layout";
import {
  PageHeader,
  ObservationList,
  FilterPanel,
  SearchBar,
} from "@/components/organisms";
import { IconButton, BaseButton } from "@/components/atoms";
import { FilterChip } from "@/components/molecules";
import { useObservationStore } from "@/stores/observation";
import { useFilterStore } from "@/stores/filter";
import { storeToRefs } from "pinia";

defineOptions({ name: "FeedPage" });

const observationStore = useObservationStore();
const filterStore = useFilterStore();

const { observations, loading, pagination } = storeToRefs(observationStore);

const loadingMore = ref(false);
const hasMore = computed(() => pagination.value.hasMore);

const observationListRef = ref(null);
const searchBarRef = ref(null);
const showFilters = ref(false);
const showSearch = ref(false);
const searchQuery = ref("");
const alertCount = ref(0);

// Récupérer les recherches récentes depuis le localStorage
const recentSearches = ref(
  JSON.parse(localStorage.getItem("recentSearches") || "[]")
);
const searchSuggestions = ref([]);

const filters = ref({
  ufoShapes: [],
  phenomena: [],
  observerTypes: [],
  countries: [],
  dateFrom: "",
  dateTo: "",
  minCredibility: 0,
  minStrangeness: 0,
  radius: 50,
  hasMedia: false,
  verifiedOnly: false,
});

const hasActiveFilters = computed(() => {
  return (
    filters.value.ufoShapes.length > 0 ||
    filters.value.phenomena.length > 0 ||
    filters.value.observerTypes.length > 0 ||
    filters.value.countries.length > 0 ||
    filters.value.dateFrom ||
    filters.value.dateTo ||
    filters.value.minCredibility > 0 ||
    filters.value.minStrangeness > 0 ||
    filters.value.hasMedia ||
    filters.value.verifiedOnly
  );
});

const activeFilterChips = computed(() => {
  const chips = [];

  filters.value.ufoShapes.forEach((shape) => {
    chips.push({
      key: `shape-${shape}`,
      label: filterStore.getUfoShapeLabel(shape) || shape,
    });
  });

  filters.value.phenomena.forEach((phenomenon) => {
    chips.push({
      key: `phenomenon-${phenomenon}`,
      label: filterStore.getPhenomenonLabel(phenomenon) || phenomenon,
    });
  });

  filters.value.observerTypes.forEach((observerType) => {
    chips.push({
      key: `observer-${observerType}`,
      label: filterStore.getObserverTypeLabel(observerType) || observerType,
    });
  });

  filters.value.countries.forEach((country) => {
    chips.push({ key: `country-${country}`, label: country });
  });

  if (filters.value.minCredibility > 0) {
    chips.push({
      key: "credibility",
      label: `Créd. ≥${filters.value.minCredibility}`,
    });
  }

  if (filters.value.minStrangeness > 0) {
    chips.push({
      key: "strangeness",
      label: `Étrang. ≥${filters.value.minStrangeness}`,
    });
  }

  if (filters.value.hasMedia) {
    chips.push({ key: "hasMedia", label: "Avec média" });
  }

  if (filters.value.verifiedOnly) {
    chips.push({ key: "verified", label: "Vérifié" });
  }

  return chips;
});

const applyFilters = (newFilters) => {
  filters.value = { ...newFilters };
  observationStore.fetchObservations(filters.value);
};

const resetFilters = () => {
  filters.value = {
    ufoShapes: [],
    phenomena: [],
    observerTypes: [],
    countries: [],
    dateFrom: "",
    dateTo: "",
    minCredibility: 0,
    minStrangeness: 0,
    radius: 50,
    hasMedia: false,
    verifiedOnly: false,
  };
  observationStore.fetchObservations();
};

const removeFilter = (key) => {
  if (key.startsWith("shape-")) {
    const shape = key.replace("shape-", "");
    filters.value.ufoShapes = filters.value.ufoShapes.filter(
      (s) => s !== shape
    );
  } else if (key.startsWith("phenomenon-")) {
    const phenomenon = key.replace("phenomenon-", "");
    filters.value.phenomena = filters.value.phenomena.filter(
      (p) => p !== phenomenon
    );
  } else if (key.startsWith("observer-")) {
    const observerType = key.replace("observer-", "");
    filters.value.observerTypes = filters.value.observerTypes.filter(
      (o) => o !== observerType
    );
  } else if (key.startsWith("country-")) {
    const country = key.replace("country-", "");
    filters.value.countries = filters.value.countries.filter(
      (c) => c !== country
    );
  } else if (key === "credibility") {
    filters.value.minCredibility = 0;
  } else if (key === "strangeness") {
    filters.value.minStrangeness = 0;
  } else if (key === "hasMedia") {
    filters.value.hasMedia = false;
  } else if (key === "verified") {
    filters.value.verifiedOnly = false;
  }
  observationStore.fetchObservations(filters.value);
};

const clearAllFilters = () => {
  resetFilters();
};

const loadMore = async () => {
  if (loadingMore.value) return;
  loadingMore.value = true;
  try {
    await observationStore.loadMore(filters.value);
  } finally {
    loadingMore.value = false;
  }
};

const refresh = () => {
  observationStore.fetchObservations(filters.value);
};

const toggleSearch = async () => {
  showSearch.value = !showSearch.value;
  if (showSearch.value) {
    // Focus sur le champ de recherche après l'animation
    await nextTick();
    setTimeout(() => {
      searchBarRef.value?.focus();
    }, 300);
  } else {
    // Réinitialiser la recherche à la fermeture
    clearSearch();
  }
};

const handleSearch = (query) => {
  if (!query || query.trim().length < 2) return;

  // Ajouter aux recherches récentes
  const trimmedQuery = query.trim();
  const recent = recentSearches.value.filter((s) => s !== trimmedQuery);
  recent.unshift(trimmedQuery);
  recentSearches.value = recent.slice(0, 5); // Garder seulement les 5 dernières
  localStorage.setItem("recentSearches", JSON.stringify(recentSearches.value));

  // Effectuer la recherche
  filters.value.search = trimmedQuery;

  // Réinitialiser la pagination pour la nouvelle recherche
  pagination.value.page = 1;

  observationStore.fetchObservations(filters.value);
};

const clearSearch = () => {
  searchQuery.value = "";
  if (filters.value.search) {
    delete filters.value.search;
    observationStore.fetchObservations(filters.value);
  }
};

const clearRecentSearches = () => {
  recentSearches.value = [];
  localStorage.removeItem("recentSearches");
};

onMounted(() => {
  observationStore.fetchObservations();
});
</script>

<style scoped>
.feed-page {
  margin-top: 4rem;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* Animation de la barre de recherche */
.search-enter-active,
.search-leave-active {
  transition: all 0.3s ease;
}

.search-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.search-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
