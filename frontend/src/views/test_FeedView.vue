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
      <div class="filter-chips-wrapper">
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
            :title="type.description"
          >
            {{ type.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Liste des observations -->
    <PageContainer :maxWidth="1100" noBackground>
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
        <div
          v-for="obs in items"
          :key="obs._id"
          class="observation-card"
          @click="navigateTo(`/observations/${obs._id}`)"
        >
          <!-- Image -->
          <div class="card-image-container">
            <img
              v-if="getFirstImage(obs)"
              :src="getFirstImage(obs)"
              :alt="obs.title"
              class="card-image"
            />
            <div v-else class="card-image-placeholder">
              <span class="placeholder-icon">🛸</span>
            </div>
            <!-- Badge type overlay -->
            <div class="card-badge">
              {{ getObservationTypeLabel(obs.type) }}
            </div>
          </div>

          <!-- Content -->
          <div class="card-content">
            <h3 class="card-title">{{ obs.title }}</h3>
            <p class="card-description">
              {{ truncateText(obs.description, 120) }}
            </p>

            <!-- Meta -->
            <div class="card-meta">
              <test-BaseAvatar
                :src="obs.userId?.avatar"
                :name="obs.userId?.name || 'Anonyme'"
                size="sm"
              />
              <div class="meta-info">
                <span class="meta-name">{{ obs.userId?.name || "Anonyme" }}</span>
                <span class="meta-date">{{ formatDate(obs.createdAt) }}</span>
              </div>
            </div>

            <!-- Stats -->
            <div class="card-stats">
              <div class="stat-item">
                <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{{ obs.comments?.length || 0 }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading indicator pour scroll infini -->
      <div v-if="loading && items.length > 0" class="loading-more">
        <test-BaseLoading size="sm" />
      </div>

      <!-- Message fin de liste -->
      <div v-if="!hasMore && items.length > 0" class="end-message">
        <span>✨ Vous avez tout vu !</span>
      </div>
    </PageContainer>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter } from "vue-router";
import PageContainer from "../components/PageContainer.vue";
import { useInfiniteScroll } from "../composables/useInfiniteScroll";
import { observationService } from "../services/observationService";
import { OBSERVATION_TYPE_OPTIONS, getObservationLabel } from "../constants/observationTypes";
import TestBaseCard from "../components/test_BaseCard.vue";
import TestBaseButton from "../components/test_BaseButton.vue";
import TestBaseLoading from "../components/test_BaseLoading.vue";
import TestBaseAvatar from "../components/test_BaseAvatar.vue";

const router = useRouter();
const searchQuery = ref("");
const activeType = ref(null);

const observationTypes = OBSERVATION_TYPE_OPTIONS;

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
  return getObservationLabel(type);
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
  background: var(--phenom-bg-primary);
}

.feed-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--phenom-surface-glass-strong);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  padding: var(--phenom-space-4);
  border-bottom: 1px solid var(--phenom-border-medium);
  box-shadow: var(--phenom-shadow-md);
}

.search-wrapper {
  position: relative;
  margin-bottom: var(--phenom-space-3);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: var(--phenom-text-tertiary);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  background: var(--phenom-surface-glass-strong);
  border: 1px solid var(--phenom-border-medium);
  border-radius: var(--phenom-radius-full);
  font-size: 1rem;
  color: var(--phenom-text-primary);
  font-weight: 500;
  transition: var(--phenom-transition-base);
}

.search-input::placeholder {
  color: var(--phenom-text-placeholder);
  font-weight: 400;
}

.search-input:focus {
  outline: none;
  border-color: var(--phenom-primary);
  box-shadow: 0 0 0 3px rgba(123, 63, 242, 0.15);
  background: var(--phenom-surface-glass-active);
}

.filter-chips-wrapper {
  position: relative;
  margin: 0 -0.5rem;
}

.filter-chips {
  display: flex;
  gap: var(--phenom-space-2);
  overflow-x: auto;
  padding: 0.5rem;
  -webkit-overflow-scrolling: touch;
}

.filter-chip {
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  border: 1px solid var(--phenom-border-medium);
  background: var(--phenom-surface-glass-strong);
  border-radius: var(--phenom-radius-full);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--phenom-text-secondary);
  cursor: pointer;
  transition: var(--phenom-transition-base);
  white-space: nowrap;
}

.filter-chip:hover {
  border-color: var(--phenom-primary);
  color: var(--phenom-primary);
  background: var(--phenom-surface-glass-active);
}

.filter-chip.active {
  background: linear-gradient(135deg, var(--phenom-primary) 0%, var(--phenom-primary-dark) 100%);
  border-color: transparent;
  color: white;
  box-shadow: 0 0 20px rgba(123, 63, 242, 0.4);
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
  filter: drop-shadow(0 0 16px rgba(123, 63, 242, 0.5));
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--phenom-text-primary);
  margin: 0 0 0.5rem;
}

.empty-state p {
  color: var(--phenom-text-secondary);
  margin: 0 0 1.5rem;
}

/* Observation Cards - Glassmorphic Design with better contrast */
.observations-grid {
  display: grid;
  gap: var(--phenom-space-6);
  grid-template-columns: 1fr;
}

.observation-card {
  background: var(--phenom-surface-glass-strong);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--phenom-border-medium);
  border-radius: var(--phenom-radius-2xl);
  overflow: hidden;
  cursor: pointer;
  transition: var(--phenom-transition-base);
  box-shadow: var(--phenom-shadow-lg);
}

.observation-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--phenom-shadow-xl), 0 0 30px rgba(123, 63, 242, 0.3);
  border-color: var(--phenom-primary);
}

.card-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  overflow: hidden;
  background: var(--phenom-bg-secondary);
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--phenom-transition-base);
}

.observation-card:hover .card-image {
  transform: scale(1.05);
}

.card-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(123, 63, 242, 0.1) 0%, rgba(107, 47, 209, 0.1) 100%);
}

.placeholder-icon {
  font-size: 4rem;
  opacity: 0.3;
  filter: drop-shadow(0 0 16px rgba(123, 63, 242, 0.5));
}

.card-badge {
  position: absolute;
  top: var(--phenom-space-3);
  right: var(--phenom-space-3);
  padding: 0.375rem 0.875rem;
  background: var(--phenom-surface-glass-strong);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--phenom-border-medium);
  border-radius: var(--phenom-radius-full);
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--phenom-text-primary);
  box-shadow: var(--phenom-shadow-lg);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.card-content {
  padding: var(--phenom-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--phenom-space-3);
}

.card-title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--phenom-text-primary);
  margin: 0;
  line-height: 1.4;
}

.card-description {
  color: var(--phenom-text-secondary);
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: var(--phenom-space-3);
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  flex: 1;
}

.meta-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--phenom-text-primary);
}

.meta-date {
  font-size: 0.75rem;
  color: var(--phenom-text-tertiary);
  font-weight: 500;
}

.card-stats {
  display: flex;
  gap: var(--phenom-space-4);
  padding-top: var(--phenom-space-3);
  border-top: 1px solid var(--phenom-border-medium);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--phenom-space-2);
  color: var(--phenom-text-secondary);
  font-size: 0.875rem;
  font-weight: 600;
}

.stat-icon {
  width: 1.125rem;
  height: 1.125rem;
  color: var(--phenom-primary);
}

.loading-more {
  padding: 2rem;
  display: flex;
  justify-content: center;
}

.end-message {
  text-align: center;
  padding: 2rem;
  color: var(--phenom-text-secondary);
  font-size: 0.9375rem;
  font-weight: 600;
  background: var(--phenom-surface-glass-strong);
  border-radius: var(--phenom-radius-2xl);
  border: 1px solid var(--phenom-border-medium);
  margin-top: var(--phenom-space-6);
}

/* Responsive Grid */
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

@media (max-width: 640px) {
  .feed-header {
    padding: var(--phenom-space-3);
  }

  .feed-content {
    padding: var(--phenom-space-3);
  }

  .observations-grid {
    gap: var(--phenom-space-4);
  }
}
</style>
