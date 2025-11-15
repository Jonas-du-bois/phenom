<template>
  <div class="feed-view">
    <!-- Header avec recherche et filtres -->
    <div class="feed-header">
      <div class="search-wrapper">
        <svg
          class="search-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          v-model="searchQuery"
          type="search"
          placeholder="Rechercher une observation..."
          class="search-input"
          @input="handleSearch"
        />
      </div>

      <!-- Filtres type -->
      <div class="filter-chips">
        <button
          :class="['filter-chip', { active: !activeType }]"
          @click="setFilter(null)"
        >
          Tous
        </button>
        <button
          v-for="type in observationTypes"
          :key="type.value"
          :class="['filter-chip', { active: activeType === type.value }]"
          @click="setFilter(type.value)"
        >
          {{ type.label }}
        </button>
      </div>
    </div>

    <!-- Liste des observations -->
    <div class="feed-content">
      <div v-if="loading && items.length === 0" class="loading-container">
        <test-BaseLoading size="lg" text="Chargement des observations..." />
      </div>

      <div v-else-if="items.length === 0" class="empty-state">
        <span class="empty-icon">🛸</span>
        <h3>Aucune observation</h3>
        <p>Soyez le premier à partager une observation !</p>
        <test-BaseButton @click="navigateTo('/create')">
          Créer une observation
        </test-BaseButton>
      </div>

      <div v-else class="observations-grid">
        <test-BaseCard
          v-for="obs in items"
          :key="obs._id"
          :image="getFirstImage(obs)"
          :title="obs.title"
          :subtitle="getObservationTypeLabel(obs.type)"
          variant="elevated"
          clickable
          @click="navigateTo(`/observations/${obs._id}`)"
        >
          <p class="observation-description">
            {{ truncateText(obs.description, 120) }}
          </p>

          <template #footer>
            <div class="observation-meta">
              <test-BaseAvatar
                :src="obs.userId?.avatar"
                :name="obs.userId?.name || 'Anonyme'"
                size="sm"
              />
              <span class="meta-text">{{ obs.userId?.name || "Anonyme" }}</span>
              <span class="meta-separator">•</span>
              <span class="meta-text">{{ formatDate(obs.createdAt) }}</span>
            </div>
          </template>
        </test-BaseCard>
      </div>

      <!-- Loading indicator pour scroll infini -->
      <div v-if="loading && items.length > 0" class="loading-more">
        <test-BaseLoading size="sm" />
      </div>

      <!-- Message fin de liste -->
      <div v-if="!hasMore && items.length > 0" class="end-message">
        <span>✨ Vous avez tout vu !</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import { useInfiniteScroll } from "../composables/useInfiniteScroll";
import { observationService } from "../services/observationService";
import { OBSERVATION_TYPES } from "../constants/observationTypes";
import TestBaseCard from "../components/test_BaseCard.vue";
import TestBaseButton from "../components/test_BaseButton.vue";
import TestBaseLoading from "../components/test_BaseLoading.vue";
import TestBaseAvatar from "../components/test_BaseAvatar.vue";

const router = useRouter();

const searchQuery = ref("");
const activeType = ref(null);

const observationTypes = OBSERVATION_TYPES;

// Fonction de fetch avec filtres
const fetchObservations = async (params) => {
  const filters = {
    ...params,
    search: searchQuery.value || undefined,
    type: activeType.value || undefined,
  };
  return await observationService.getAll(filters);
};

const { items, loading, hasMore, reload } = useInfiniteScroll(
  fetchObservations,
  {
    limit: 20,
    initialLoad: true,
  },
);

const navigateTo = (path) => {
  router.push(path);
};

const setFilter = (type) => {
  activeType.value = type;
  reload();
};

const handleSearch = () => {
  // Debounce search
  if (searchQuery.value.length === 0 || searchQuery.value.length >= 3) {
    reload();
  }
};

const getFirstImage = (observation) => {
  return observation.images?.[0]?.url || null;
};

const getObservationTypeLabel = (type) => {
  const found = observationTypes.find((t) => t.value === type);
  return found ? found.label : type;
};

const truncateText = (text, maxLength) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Aujourd'hui";
  if (days === 1) return "Hier";
  if (days < 7) return `Il y a ${days} jours`;
  if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
  if (days < 365) return `Il y a ${Math.floor(days / 30)} mois`;
  return `Il y a ${Math.floor(days / 365)} ans`;
};

// Reload when filters change
watch([activeType, searchQuery], () => {
  if (searchQuery.value.length === 0 || searchQuery.value.length >= 3) {
    reload();
  }
});
</script>

<style scoped>
.feed-view {
  min-height: 100vh;
  background: #f9fafb;
}

.feed-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: white;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.search-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 9999px;
  font-size: 1rem;
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.filter-chips {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  -webkit-overflow-scrolling: touch;
}

.filter-chips::-webkit-scrollbar {
  display: none;
}

.filter-chip {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.filter-chip:hover {
  border-color: #667eea;
  color: #667eea;
}

.filter-chip.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.feed-content {
  padding: 1rem;
}

.loading-container {
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
}

.empty-icon {
  font-size: 5rem;
  display: block;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 1.5rem;
}

.observations-grid {
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
}

@media (min-width: 640px) {
  .observations-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .observations-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.observation-description {
  color: #6b7280;
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0;
}

.observation-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.meta-text {
  font-size: 0.8125rem;
  color: #6b7280;
}

.meta-separator {
  color: #d1d5db;
}

.loading-more {
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.end-message {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-size: 0.9375rem;
}

@media (max-width: 640px) {
  .feed-header {
    padding: 0.875rem;
  }

  .feed-content {
    padding: 0.875rem;
  }

  .observations-grid {
    gap: 1rem;
  }
}
</style>
