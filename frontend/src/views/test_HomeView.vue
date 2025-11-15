<template>
  <div class="home-view">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-icon">🛸</div>
        <h1 class="hero-title">Phenom</h1>
        <p class="hero-subtitle">Partagez vos observations extraordinaires</p>
        <p class="hero-description">
          Rejoignez une communauté passionnée qui documente et partage des phénomènes
          inexpliqués à travers le monde.
        </p>
        <div class="hero-actions">
          <test-BaseButton variant="primary" size="lg" @click="navigateTo('/create')">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
            </svg>
            Créer une observation
          </test-BaseButton>
          <test-BaseButton variant="secondary" size="lg" @click="navigateTo('/map')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
            </svg>
            Explorer la carte
          </test-BaseButton>
        </div>
      </div>
      
      <!-- Floating decorative elements -->
      <div class="hero-decoration">
        <div class="float-orb orb-1"></div>
        <div class="float-orb orb-2"></div>
        <div class="float-orb orb-3"></div>
      </div>
    </section>

    <!-- Stats Section -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👁️</div>
          <div class="stat-value">{{ stats.totalObservations || 0 }}</div>
          <div class="stat-label">Observations</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-value">{{ stats.totalUsers || 0 }}</div>
          <div class="stat-label">Observateurs</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💬</div>
          <div class="stat-value">{{ stats.totalComments || 0 }}</div>
          <div class="stat-label">Commentaires</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🌍</div>
          <div class="stat-value">{{ stats.totalCountries || '∞' }}</div>
          <div class="stat-label">Pays</div>
        </div>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="categories-section">
      <h2 class="section-title">Types d'observations</h2>
      <div class="categories-grid">
        <div 
          v-for="type in observationTypes" 
          :key="type.value"
          class="category-card"
          @click="navigateToFeedWithFilter(type.value)"
        >
          <div class="category-header">
            <span class="category-emoji">{{ getTypeEmoji(type.value) }}</span>
            <h3 class="category-title">{{ type.label }}</h3>
          </div>
          <p class="category-description">{{ type.description }}</p>
          <div class="category-arrow">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Recent Observations Preview -->
    <section class="recent-section">
      <div class="section-header">
        <h2 class="section-title">Dernières observations</h2>
        <test-BaseButton variant="ghost" @click="navigateTo('/feed')">
          Voir tout
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </test-BaseButton>
      </div>

      <div v-if="loadingRecent" class="loading-container">
        <test-BaseLoading text="Chargement..." />
      </div>

      <div v-else-if="recentObservations.length > 0" class="recent-grid">
        <div
          v-for="obs in recentObservations"
          :key="obs._id"
          class="recent-card"
          @click="navigateTo(`/observations/${obs._id}`)"
        >
          <div class="recent-image-container">
            <img
              v-if="getFirstImage(obs)"
              :src="getFirstImage(obs)"
              :alt="obs.title"
              class="recent-image"
            />
            <div v-else class="recent-image-placeholder">
              <span class="placeholder-icon">🛸</span>
            </div>
            <div class="recent-badge">{{ getObservationTypeLabel(obs.type) }}</div>
          </div>
          <div class="recent-content">
            <h3 class="recent-title">{{ obs.title }}</h3>
            <p class="recent-description">{{ truncateText(obs.description, 80) }}</p>
            <div class="recent-meta">
              <test-BaseAvatar
                :src="obs.userId?.avatar"
                :name="obs.userId?.name || 'Anonyme'"
                size="xs"
              />
              <span class="recent-author">{{ obs.userId?.name || 'Anonyme' }}</span>
              <span class="recent-dot">•</span>
              <span class="recent-date">{{ formatDate(obs.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <span class="empty-icon">🌌</span>
        <p>Aucune observation pour le moment</p>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">Prêt à partager votre expérience ?</h2>
        <p class="cta-description">
          Chaque observation compte. Documentez ce que vous avez vu et contribuez à la 
          compréhension collective des phénomènes inexpliqués.
        </p>
        <test-BaseButton variant="primary" size="lg" @click="navigateTo('/create')">
          Créer votre première observation
        </test-BaseButton>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { observationService } from '../services/observationService'
import { OBSERVATION_TYPE_OPTIONS, getObservationLabel } from '../constants/observationTypes'
import TestBaseButton from '../components/test_BaseButton.vue'
import TestBaseAvatar from '../components/test_BaseAvatar.vue'
import TestBaseLoading from '../components/test_BaseLoading.vue'

const router = useRouter()

const stats = ref({
  totalObservations: 0,
  totalUsers: 0,
  totalComments: 0,
  totalCountries: 0
})

const recentObservations = ref([])
const loadingRecent = ref(false)
const observationTypes = OBSERVATION_TYPE_OPTIONS

const navigateTo = (path) => {
  router.push(path)
}

const navigateToFeedWithFilter = (type) => {
  router.push({ path: '/feed', query: { type } })
}

const getTypeEmoji = (type) => {
  const emojis = {
    WAV: '👋',
    TCH: '🔧',
    OBS: '👁️',
    RAY: '☀️',
    ANI: '🐾',
    HUM: '👤'
  }
  return emojis[type] || '🛸'
}

const getFirstImage = (obs) => {
  return obs.images?.[0]?.url || null
}

const truncateText = (text, maxLength) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatDate = (date) => {
  const now = new Date()
  const obsDate = new Date(date)
  const diffInHours = Math.floor((now - obsDate) / (1000 * 60 * 60))
  
  if (diffInHours < 1) return 'À l\'instant'
  if (diffInHours < 24) return `Il y a ${diffInHours}h`
  if (diffInHours < 48) return 'Hier'
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `Il y a ${diffInDays}j`
  
  return obsDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  })
}

const loadStats = async () => {
  try {
    const response = await observationService.getStats()
    stats.value = response
  } catch (error) {
    console.error('Erreur chargement stats:', error)
  }
}

const loadRecentObservations = async () => {
  loadingRecent.value = true
  try {
    const response = await observationService.getAll({
      limit: 6,
      sort: '-createdAt'
    })
    recentObservations.value = response.data || response || []
  } catch (error) {
    console.error('Erreur chargement observations récentes:', error)
  } finally {
    loadingRecent.value = false
  }
}

onMounted(() => {
  loadStats()
  loadRecentObservations()
})
</script>

<style scoped>
.home-view {
  min-height: 100vh;
  padding-bottom: var(--phenom-space-16);
}

/* Hero Section */
.hero-section {
  position: relative;
  padding: var(--phenom-space-16) var(--phenom-space-6);
  text-align: center;
  overflow: hidden;
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 48rem;
  margin: 0 auto;
}

.hero-icon {
  font-size: 5rem;
  margin-bottom: var(--phenom-space-6);
  animation: float 6s ease-in-out infinite;
}

.hero-title {
  font-size: 4rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--phenom-primary-light) 0%, var(--phenom-primary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--phenom-space-4);
  text-shadow: 0 0 60px rgba(123, 63, 242, 0.3);
}

.hero-subtitle {
  font-size: 1.5rem;
  color: var(--phenom-text-secondary);
  margin-bottom: var(--phenom-space-4);
  font-weight: 500;
}

.hero-description {
  font-size: 1.125rem;
  color: var(--phenom-text-tertiary);
  margin-bottom: var(--phenom-space-8);
  line-height: 1.7;
  max-width: 36rem;
  margin-left: auto;
  margin-right: auto;
}

.hero-actions {
  display: flex;
  gap: var(--phenom-space-4);
  justify-content: center;
  flex-wrap: wrap;
}

.hero-actions button {
  display: flex;
  align-items: center;
  gap: var(--phenom-space-2);
}

/* Floating decorative orbs */
.hero-decoration {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.float-orb {
  position: absolute;
  border-radius: 50%;
  background: radial-gradient(circle, var(--phenom-primary) 0%, transparent 70%);
  opacity: 0.1;
  filter: blur(40px);
}

.orb-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
  animation: float 10s ease-in-out infinite;
}

.orb-2 {
  width: 200px;
  height: 200px;
  top: 60%;
  right: 15%;
  animation: float 15s ease-in-out infinite reverse;
}

.orb-3 {
  width: 250px;
  height: 250px;
  bottom: 10%;
  left: 50%;
  animation: float 12s ease-in-out infinite;
}

/* Stats Section */
.stats-section {
  padding: var(--phenom-space-8) var(--phenom-space-6);
  max-width: 80rem;
  margin: 0 auto;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--phenom-space-4);
}

.stat-card {
  background: var(--phenom-surface-glass-strong);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--phenom-border-subtle);
  border-radius: var(--phenom-radius-2xl);
  padding: var(--phenom-space-6);
  text-align: center;
  transition: var(--phenom-transition-base);
  box-shadow: var(--phenom-shadow-lg);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--phenom-shadow-xl), var(--phenom-glow-sm);
  border-color: var(--phenom-border-medium);
}

.stat-icon {
  font-size: 2.5rem;
  margin-bottom: var(--phenom-space-3);
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--phenom-text-primary);
  margin-bottom: var(--phenom-space-2);
}

.stat-label {
  font-size: 0.875rem;
  color: var(--phenom-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}

/* Categories Section */
.categories-section {
  padding: var(--phenom-space-12) var(--phenom-space-6);
  max-width: 80rem;
  margin: 0 auto;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--phenom-text-primary);
  margin-bottom: var(--phenom-space-8);
  text-align: center;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--phenom-space-4);
}

.category-card {
  background: var(--phenom-surface-glass-strong);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--phenom-border-subtle);
  border-radius: var(--phenom-radius-2xl);
  padding: var(--phenom-space-6);
  cursor: pointer;
  transition: var(--phenom-transition-base);
  position: relative;
  overflow: hidden;
  box-shadow: var(--phenom-shadow-md);
}

.category-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--phenom-primary) 0%, transparent 100%);
  opacity: 0;
  transition: var(--phenom-transition-base);
}

.category-card:hover::before {
  opacity: 0.05;
}

.category-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--phenom-shadow-xl), var(--phenom-glow-sm);
  border-color: var(--phenom-primary);
}

.category-header {
  display: flex;
  align-items: center;
  gap: var(--phenom-space-3);
  margin-bottom: var(--phenom-space-3);
  position: relative;
}

.category-emoji {
  font-size: 2rem;
}

.category-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--phenom-text-primary);
}

.category-description {
  color: var(--phenom-text-tertiary);
  font-size: 0.875rem;
  line-height: 1.6;
  position: relative;
}

.category-arrow {
  position: absolute;
  top: var(--phenom-space-6);
  right: var(--phenom-space-6);
  width: 1.5rem;
  height: 1.5rem;
  color: var(--phenom-primary);
  opacity: 0;
  transform: translateX(-8px);
  transition: var(--phenom-transition-base);
}

.category-card:hover .category-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Recent Section */
.recent-section {
  padding: var(--phenom-space-12) var(--phenom-space-6);
  max-width: 80rem;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--phenom-space-8);
}

.section-header button {
  display: flex;
  align-items: center;
  gap: var(--phenom-space-2);
}

.recent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--phenom-space-6);
}

.recent-card {
  background: var(--phenom-surface-glass-strong);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--phenom-border-subtle);
  border-radius: var(--phenom-radius-2xl);
  overflow: hidden;
  cursor: pointer;
  transition: var(--phenom-transition-base);
  box-shadow: var(--phenom-shadow-md);
}

.recent-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--phenom-shadow-xl), var(--phenom-glow-sm);
  border-color: var(--phenom-border-medium);
}

.recent-image-container {
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.recent-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: var(--phenom-transition-slow);
}

.recent-card:hover .recent-image {
  transform: scale(1.05);
}

.recent-image-placeholder {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, var(--phenom-bg-secondary) 0%, var(--phenom-bg-tertiary) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.placeholder-icon {
  font-size: 4rem;
  opacity: 0.3;
}

.recent-badge {
  position: absolute;
  top: var(--phenom-space-3);
  left: var(--phenom-space-3);
  background: var(--phenom-surface-glass-strong);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--phenom-border-subtle);
  border-radius: var(--phenom-radius-full);
  padding: var(--phenom-space-2) var(--phenom-space-4);
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--phenom-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.recent-content {
  padding: var(--phenom-space-4);
}

.recent-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--phenom-text-primary);
  margin-bottom: var(--phenom-space-2);
  line-height: 1.4;
}

.recent-description {
  color: var(--phenom-text-tertiary);
  font-size: 0.875rem;
  line-height: 1.5;
  margin-bottom: var(--phenom-space-3);
}

.recent-meta {
  display: flex;
  align-items: center;
  gap: var(--phenom-space-2);
  font-size: 0.75rem;
  color: var(--phenom-text-muted);
}

.recent-author {
  font-weight: 500;
  color: var(--phenom-text-tertiary);
}

.recent-dot {
  opacity: 0.5;
}

/* CTA Section */
.cta-section {
  padding: var(--phenom-space-16) var(--phenom-space-6);
  max-width: 48rem;
  margin: 0 auto;
  text-align: center;
}

.cta-content {
  background: var(--phenom-surface-glass-strong);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--phenom-border-medium);
  border-radius: var(--phenom-radius-2xl);
  padding: var(--phenom-space-12);
  box-shadow: var(--phenom-shadow-2xl), var(--phenom-glow-md);
}

.cta-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--phenom-text-primary);
  margin-bottom: var(--phenom-space-4);
}

.cta-description {
  font-size: 1.125rem;
  color: var(--phenom-text-tertiary);
  line-height: 1.7;
  margin-bottom: var(--phenom-space-8);
}

/* Loading & Empty states */
.loading-container,
.empty-state {
  text-align: center;
  padding: var(--phenom-space-12);
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: var(--phenom-space-4);
  opacity: 0.5;
}

.empty-state p {
  color: var(--phenom-text-tertiary);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .categories-grid {
    grid-template-columns: 1fr;
  }

  .recent-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--phenom-space-4);
  }
}

@media (max-width: 640px) {
  .hero-section {
    padding: var(--phenom-space-12) var(--phenom-space-4);
    min-height: 50vh;
  }

  .hero-icon {
    font-size: 3.5rem;
  }

  .cta-content {
    padding: var(--phenom-space-8);
  }

  .cta-title {
    font-size: 1.5rem;
  }
}
</style>
