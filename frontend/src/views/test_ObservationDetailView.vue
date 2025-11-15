<template>
  <div class="detail-view">
    <div v-if="loading" class="loading-container">
      <test-BaseLoading size="lg" text="Chargement..." />
    </div>

    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <test-BaseButton @click="router.back()">Retour</test-BaseButton>
    </div>

    <div v-else-if="observation" class="observation-detail">
      <!-- Hero Image Section -->
      <div class="hero-section">
        <div
          v-if="observation.images && observation.images.length > 0"
          class="hero-image-container"
        >
          <img
            :src="observation.images[currentImageIndex].url"
            :alt="observation.title"
            class="hero-image"
          />
          
          <!-- Gradient Overlay -->
          <div class="hero-gradient"></div>

          <!-- Badges Overlay (Type + Location) -->
          <div class="hero-badges">
            <div class="type-badge">
              {{ getObservationTypeLabel(observation.type) }}
            </div>
            <div v-if="observation.location" class="location-badge">
              <svg class="badge-icon" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                />
              </svg>
              <span>{{ observation.location.city || 'Localisation' }}</span>
            </div>
          </div>

          <!-- Image Navigation -->
          <div v-if="observation.images.length > 1" class="image-nav">
            <button class="nav-btn nav-prev" @click="previousImage">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button class="nav-btn nav-next" @click="nextImage">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <!-- Image Indicators -->
          <div v-if="observation.images.length > 1" class="image-indicators">
            <span
              v-for="(img, index) in observation.images"
              :key="img.publicId"
              :class="['indicator', { active: index === currentImageIndex }]"
              @click="currentImageIndex = index"
            ></span>
          </div>
        </div>

        <div v-else class="hero-placeholder">
          <span class="placeholder-icon">�</span>
          <p>Aucune image disponible</p>
        </div>
      </div>

      <!-- Content Container -->
  <PageContainer class="content-container" :maxWidth="1100">
        <!-- Header Card -->
        <div class="header-card">
          <h1 class="obs-title">{{ observation.title }}</h1>
          
          <!-- Meta Info -->
          <div class="obs-meta">
            <test-BaseAvatar
              :src="observation.userId?.avatar"
              :name="observation.userId?.name || 'Anonyme'"
              size="md"
              class="author-avatar"
              @click="navigateToProfile(observation.userId?._id)"
            />
            <div class="meta-info">
              <p class="author-name">
                {{ observation.userId?.name || "Anonyme" }}
              </p>
              <p class="meta-date">{{ formatDate(observation.createdAt) }}</p>
            </div>

            <!-- Actions (edit/delete for owner) -->
            <div v-if="isOwner" class="obs-actions">
              <button class="action-btn" @click="editObservation" title="Modifier">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button class="action-btn delete" @click="confirmDelete" title="Supprimer">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>

          <!-- Stats -->
          <div class="obs-stats">
            <div class="stat-item">
              <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{{ observation.comments?.length || 0 }} commentaires</span>
            </div>
            <div class="stat-item">
              <svg class="stat-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{{ observation.stats?.views || 0 }} vues</span>
            </div>
          </div>
        </div>

        <!-- Description Card -->
        <div class="description-card">
          <h3 class="section-title">Description</h3>
          <p class="description-text">{{ observation.description }}</p>
        </div>

        <!-- Map Card -->
        <div v-if="observation.location" class="map-card">
          <h3 class="section-title">
            <svg class="title-icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
            Localisation
          </h3>
          <div id="detail-map" ref="mapContainer" class="detail-map"></div>
        </div>

        <!-- Comments Section -->
        <div class="comments-card">
          <h3 class="section-title">
            Commentaires ({{ observation.comments?.length || 0 }})
          </h3>

          <!-- Comment form -->
          <div class="comment-form">
            <test-BaseAvatar
              :src="currentUser?.avatar"
              :name="currentUser?.name || 'U'"
              size="sm"
            />
            <div class="comment-input-wrapper">
              <textarea
                v-model="newComment"
                placeholder="Ajouter un commentaire..."
                rows="2"
                class="comment-input"
                @keydown.ctrl.enter="addComment"
              ></textarea>
              <test-BaseButton
                size="sm"
                :disabled="!newComment.trim()"
                :loading="addingComment"
                @click="addComment"
              >
                Publier
              </test-BaseButton>
            </div>
          </div>

          <!-- Comments list -->
          <div class="comments-list">
            <div
              v-for="comment in observation.comments"
              :key="comment._id"
              class="comment-item"
            >
              <test-BaseAvatar
                :src="comment.userId?.avatar"
                :name="comment.userId?.name || 'Anonyme'"
                size="sm"
              />
              <div class="comment-content">
                <div class="comment-header">
                  <span class="comment-author">{{
                    comment.userId?.name || "Anonyme"
                  }}</span>
                  <span class="comment-date">{{
                    formatDate(comment.createdAt)
                  }}</span>
                </div>
                <p class="comment-text">{{ comment.text }}</p>
              </div>
            </div>

            <div
              v-if="!observation.comments || observation.comments.length === 0"
              class="no-comments"
            >
              <p>Aucun commentaire pour le moment</p>
            </div>
          </div>
        </div>
  </PageContainer>
    </div>

    <!-- Delete confirmation modal -->
    <test-BaseModal
      v-model="showDeleteModal"
      title="Supprimer l'observation"
      size="sm"
    >
      <p>
        Êtes-vous sûr de vouloir supprimer cette observation ? Cette action est
        irréversible.
      </p>

      <template #footer>
        <div class="modal-actions">
          <test-BaseButton variant="outline" @click="showDeleteModal = false">
            Annuler
          </test-BaseButton>
          <test-BaseButton
            variant="danger"
            :loading="deleting"
            @click="deleteObservation"
          >
            Supprimer
          </test-BaseButton>
        </div>
      </template>
    </test-BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { useWebSocket } from "../composables/useWebSocket";
import { observationService } from "../services/observationService";
import { commentService } from "../services/commentService";
import { OBSERVATION_TYPES } from "../constants/observationTypes";
import TestBaseLoading from "../components/test_BaseLoading.vue";
import TestBaseButton from "../components/test_BaseButton.vue";
import TestBaseAvatar from "../components/test_BaseAvatar.vue";
import TestBaseModal from "../components/test_BaseModal.vue";
import PageContainer from "../components/PageContainer.vue";

const router = useRouter();
const route = useRoute();
const { user: currentUser } = useAuth();
const { connect, disconnect, messages } = useWebSocket();

const observation = ref(null);
const loading = ref(true);
const error = ref(null);
const currentImageIndex = ref(0);
const newComment = ref("");
const addingComment = ref(false);
const showDeleteModal = ref(false);
const deleting = ref(false);
const mapContainer = ref(null);

const isOwner = computed(() => {
  return (
    currentUser.value &&
    observation.value &&
    currentUser.value._id === observation.value.userId?._id
  );
});

onMounted(async () => {
  await loadObservation();
  
  // Connecter WebSocket (il s'abonne automatiquement aux canaux)
  await connect();
});

onUnmounted(() => {
  disconnect();
});

// Watcher pour écouter les messages WebSocket (évite les souscriptions multiples)
watch(messages, (newMessages) => {
  if (newMessages.length > 0) {
    const lastMessage = newMessages[newMessages.length - 1];
    console.log('📨 Message WebSocket reçu:', lastMessage.data);
    handleWebSocketMessage(lastMessage.data);
  }
}, { deep: true });

// Handler unique pour tous les messages WebSocket
const handleWebSocketMessage = (message) => {
  console.log('📨 Message WebSocket reçu:', message);
  
  // Le message contient { type, data, timestamp }
  const { type, data } = message;
  
  switch (type) {
    case 'comment:created':
      handleCommentCreated(data);
      break;
    case 'comment:updated':
      handleCommentUpdated(data);
      break;
    case 'comment:deleted':
      handleCommentDeleted(data);
      break;
    case 'observation:updated':
      handleObservationUpdated(data);
      break;
    case 'observation:deleted':
      handleObservationDeleted(data);
      break;
  }
};

// Handlers pour chaque type d'événement
const handleCommentCreated = (comment) => {
  console.log('🔔 Nouveau commentaire reçu:', comment);
  // Vérifier que c'est pour cette observation
  if (comment.observationId === observation.value?._id) {
    // Vérifier si le commentaire n'existe pas déjà
    if (!observation.value.comments) {
      observation.value.comments = [];
    }
    const exists = observation.value.comments.some(c => c._id === comment._id);
    if (!exists) {
      observation.value.comments.push(comment);
      console.log('✅ Commentaire ajouté à la liste');
    }
  }
};

const handleCommentUpdated = (comment) => {
  console.log('🔔 Commentaire mis à jour:', comment);
  // Vérifier que c'est pour cette observation
  if (comment.observationId === observation.value?._id && observation.value?.comments) {
    const index = observation.value.comments.findIndex(c => c._id === comment._id);
    if (index !== -1) {
      // Remplacer le commentaire existant par la version mise à jour
      observation.value.comments[index] = comment;
      console.log('✅ Commentaire mis à jour dans la liste');
    }
  }
};

const handleCommentDeleted = (data) => {
  console.log('🔔 Commentaire supprimé:', data);
  if (observation.value?.comments) {
    observation.value.comments = observation.value.comments.filter(
      c => c._id !== data._id
    );
    console.log('✅ Commentaire retiré de la liste');
  }
};

const handleObservationUpdated = (obs) => {
  console.log('🔔 Observation mise à jour:', obs);
  // Vérifier que c'est bien cette observation
  if (obs._id === observation.value?._id) {
    // Garder les commentaires actuels si non fournis
    const currentComments = observation.value.comments;
    observation.value = obs;
    if (!observation.value.comments && currentComments) {
      observation.value.comments = currentComments;
    }
    console.log('✅ Observation mise à jour');
  }
};

const handleObservationDeleted = (data) => {
  console.log('🔔 Observation supprimée:', data);
  // Vérifier que c'est bien cette observation
  if (data._id === observation.value?._id) {
    // Rediriger vers le feed
    router.push('/');
    console.log('✅ Observation supprimée, redirection...');
  }
};

const loadObservation = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await observationService.getById(route.params.id);
    console.log('📥 Observation reçue:', response);
    observation.value = response.data || response;
    console.log('✅ Comments dans observation:', observation.value.comments);

    // Initialize map if location exists
    if (observation.value.location?.coordinates && mapContainer.value) {
      setTimeout(async () => {
        try {
          // Importer Leaflet dynamiquement
          const L = (await import('leaflet')).default
          await import('leaflet/dist/leaflet.css')
          
          // Créer la carte
          const mapInstance = L.map(mapContainer.value).setView(
            [observation.value.location.coordinates[1], observation.value.location.coordinates[0]],
            13
          )
          
          // Ajouter les tuiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(mapInstance)
          
          // Ajouter le marker
          const marker = L.marker([
            observation.value.location.coordinates[1],
            observation.value.location.coordinates[0]
          ]).addTo(mapInstance)
          
          marker.bindPopup(`<b>${observation.value.title}</b>`).openPopup()

          // Prevent popup clicks/scrolls from propagating to the map (avoid modal closing when interacting)
          marker.on('popupopen', (e) => {
            const popupEl = e.popup?.getElement?.() || document.querySelector('.leaflet-popup')
            if (popupEl) {
              L.DomEvent.disableClickPropagation(popupEl)
              L.DomEvent.disableScrollPropagation(popupEl)
            }
          })
        } catch (err) {
          console.error('Erreur initialisation map:', err)
        }
      }, 100);
    }
  } catch (err) {
    console.error("Erreur chargement observation:", err);
    error.value = "Impossible de charger l'observation";
  } finally {
    loading.value = false;
  }
};

const previousImage = () => {
  if (observation.value.images.length > 0) {
    currentImageIndex.value =
      (currentImageIndex.value - 1 + observation.value.images.length) %
      observation.value.images.length;
  }
};

const nextImage = () => {
  if (observation.value.images.length > 0) {
    currentImageIndex.value =
      (currentImageIndex.value + 1) % observation.value.images.length;
  }
};

const getObservationTypeLabel = (type) => {
  const found = OBSERVATION_TYPES.find((t) => t.value === type);
  return found ? found.label : type;
};

const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const navigateToProfile = (userId) => {
  if (userId) {
    router.push(`/profile/${userId}`);
  }
};

const addComment = async () => {
  if (!newComment.value.trim()) return;

  addingComment.value = true;

  try {
    await commentService.create(observation.value._id, {
      text: newComment.value,
    });

    // Ne pas recharger - le WebSocket va ajouter le commentaire automatiquement
    newComment.value = "";
    console.log('✅ Commentaire créé, attente événement WebSocket...');
  } catch (err) {
    console.error("Erreur ajout commentaire:", err);
  } finally {
    addingComment.value = false;
  }
};

const editObservation = () => {
  router.push(`/observations/${observation.value._id}/edit`);
};

const confirmDelete = () => {
  showDeleteModal.value = true;
};

const deleteObservation = async () => {
  deleting.value = true;

  try {
    await observationService.delete(observation.value._id);
    router.push("/feed");
  } catch (err) {
    console.error("Erreur suppression:", err);
    alert("Erreur lors de la suppression");
  } finally {
    deleting.value = false;
    showDeleteModal.value = false;
  }
};
</script>

<style scoped>
.detail-view {
  min-height: 100vh;
  background: var(--phenom-bg-primary);
}

.loading-container,
.error-container {
  min-height: 50vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.error-message {
  color: #ef4444;
  margin-bottom: 1rem;
}

.observation-detail {
  max-width: 900px;
  margin: 0 auto;
}

/* Hero Section */
.hero-section {
  position: relative;
  width: 100%;
  margin-bottom: var(--phenom-space-6);
}

.hero-image-container {
  position: relative;
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  background: var(--phenom-surface-glass-subtle);
}

@media (max-width: 640px) {
  .hero-image-container {
    aspect-ratio: 4/3;
  }
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(to top, rgba(30, 38, 64, 0.9), transparent);
  pointer-events: none;
}

.hero-badges {
  position: absolute;
  top: var(--phenom-space-4);
  right: var(--phenom-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--phenom-space-2);
  align-items: flex-end;
}

.type-badge,
.location-badge {
  padding: 0.5rem 1rem;
  background: var(--phenom-surface-glass-soft);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--phenom-border-soft);
  border-radius: var(--phenom-radius-full);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--phenom-text-primary);
  box-shadow: var(--phenom-shadow-lg);
}

.location-badge {
  display: flex;
  align-items: center;
  gap: var(--phenom-space-2);
}

.badge-icon {
  width: 1rem;
  height: 1rem;
  color: var(--phenom-primary);
}

.hero-placeholder {
  aspect-ratio: 16/9;
  background: var(--phenom-surface-glass-subtle);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--phenom-text-tertiary);
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 0 16px rgba(123, 63, 242, 0.5));
}

/* Image Navigation */
.image-nav {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 var(--phenom-space-4);
  pointer-events: none;
}

.nav-btn {
  width: 2.5rem;
  height: 2.5rem;
  background: var(--phenom-surface-glass-soft);
  backdrop-filter: blur(12px);
  border: 1px solid var(--phenom-border-soft);
  border-radius: 50%;
  color: var(--phenom-text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--phenom-transition-base);
  pointer-events: all;
  box-shadow: var(--phenom-shadow-md);
}

.nav-btn:hover {
  background: var(--phenom-surface-glass-base);
  border-color: var(--phenom-primary);
  transform: scale(1.1);
}

.nav-btn svg {
  width: 1.5rem;
  height: 1.5rem;
}

.image-indicators {
  position: absolute;
  bottom: var(--phenom-space-4);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: var(--phenom-space-2);
}

.indicator {
  width: 0.5rem;
  height: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: var(--phenom-transition-base);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.indicator.active {
  background: var(--phenom-primary);
  width: 1.5rem;
  border-radius: var(--phenom-radius-sm);
  box-shadow: var(--phenom-glow-primary-medium);
}

/* Content Container */
.content-container {
  padding: 0 var(--phenom-space-4);
  display: flex;
  flex-direction: column;
  gap: var(--phenom-space-4);
  padding-bottom: var(--phenom-space-8);
}

@media (min-width: 768px) {
  .content-container {
    padding: 0 var(--phenom-space-6);
  }
}

/* Cards */
.header-card,
.description-card,
.map-card,
.comments-card {
  background: var(--phenom-surface-glass-base);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--phenom-border-soft);
  border-radius: var(--phenom-radius-2xl);
  padding: var(--phenom-space-6);
  box-shadow: var(--phenom-shadow-lg);
}

.obs-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: var(--phenom-text-primary);
  margin: 0 0 var(--phenom-space-4);
  line-height: 1.2;
}

.obs-meta {
  display: flex;
  align-items: center;
  gap: var(--phenom-space-3);
  padding-bottom: var(--phenom-space-4);
  border-bottom: 1px solid var(--phenom-border-soft);
  margin-bottom: var(--phenom-space-4);
}

.author-avatar {
  cursor: pointer;
  transition: var(--phenom-transition-base);
}

.author-avatar:hover {
  transform: scale(1.05);
}

.meta-info {
  flex: 1;
}

.author-name {
  font-weight: 600;
  color: var(--phenom-text-primary);
  margin: 0 0 0.125rem;
  font-size: 1rem;
}

.meta-date {
  font-size: 0.875rem;
  color: var(--phenom-text-tertiary);
  margin: 0;
}

.obs-actions {
  display: flex;
  gap: var(--phenom-space-2);
  margin-left: auto;
}

.action-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--phenom-border-soft);
  background: var(--phenom-surface-glass-base);
  border-radius: var(--phenom-radius-lg);
  color: var(--phenom-text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--phenom-transition-base);
}

.action-btn:hover {
  border-color: var(--phenom-primary);
  color: var(--phenom-primary);
  background: var(--phenom-surface-glass-soft);
}

.action-btn.delete:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.action-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

/* Stats */
.obs-stats {
  display: flex;
  gap: var(--phenom-space-6);
  padding-top: var(--phenom-space-4);
  border-top: 1px solid var(--phenom-border-soft);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--phenom-space-2);
  color: var(--phenom-text-secondary);
  font-size: 0.9375rem;
}

.stat-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: var(--phenom-primary);
}

/* Description */
.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--phenom-text-primary);
  margin: 0 0 var(--phenom-space-4);
  display: flex;
  align-items: center;
  gap: var(--phenom-space-2);
}

.title-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: var(--phenom-primary);
}

.description-text {
  color: var(--phenom-text-secondary);
  font-size: 1rem;
  line-height: 1.7;
  margin: 0;
}

/* Map */
.detail-map {
  width: 100%;
  height: 300px;
  border-radius: var(--phenom-radius-xl);
  overflow: hidden;
  border: 2px solid var(--phenom-border-medium);
  margin-top: var(--phenom-space-4);
  box-shadow: var(--phenom-shadow-lg);
}

/* Comments */
.comment-form {
  display: flex;
  gap: var(--phenom-space-3);
  margin-bottom: var(--phenom-space-6);
  padding-bottom: var(--phenom-space-6);
  border-bottom: 2px solid var(--phenom-border-medium);
}

.comment-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--phenom-space-3);
}

.comment-input {
  width: 100%;
  padding: 1rem;
  background: var(--phenom-surface-glass-strong);
  border: 2px solid var(--phenom-border-medium);
  border-radius: var(--phenom-radius-lg);
  font-size: 1rem;
  font-family: inherit;
  font-weight: 500;
  color: var(--phenom-text-primary);
  resize: vertical;
  min-height: 80px;
  transition: var(--phenom-transition-base);
}

.comment-input::placeholder {
  color: var(--phenom-text-placeholder);
  font-weight: 400;
}

.comment-input:focus {
  outline: none;
  border-color: var(--phenom-primary);
  box-shadow: 0 0 0 3px rgba(123, 63, 242, 0.15);
  background: var(--phenom-surface-glass-active);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--phenom-space-6);
}

.comment-item {
  display: flex;
  gap: var(--phenom-space-3);
  padding-bottom: var(--phenom-space-6);
  border-bottom: 1px solid var(--phenom-border-medium);
}

.comment-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.comment-content {
  flex: 1;
  background: var(--phenom-surface-glass-strong);
  border: 1px solid var(--phenom-border-medium);
  padding: var(--phenom-space-4);
  border-radius: var(--phenom-radius-xl);
  box-shadow: var(--phenom-shadow-sm);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--phenom-space-2);
  margin-bottom: var(--phenom-space-2);
}

.comment-author {
  font-weight: 700;
  font-size: 0.9375rem;
  color: var(--phenom-text-primary);
}

.comment-date {
  font-size: 0.8125rem;
  color: var(--phenom-text-tertiary);
  font-weight: 500;
}

.comment-text {
  color: var(--phenom-text-secondary);
  font-size: 1rem;
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
}

.no-comments {
  text-align: center;
  padding: var(--phenom-space-8) var(--phenom-space-4);
  color: var(--phenom-text-tertiary);
}

.modal-actions {
  display: flex;
  gap: var(--phenom-space-3);
  justify-content: flex-end;
}

/* Responsive */
@media (max-width: 640px) {
  .obs-title {
    font-size: 1.5rem;
  }

  .header-card,
  .description-card,
  .map-card,
  .comments-card {
    padding: var(--phenom-space-4);
  }

  .content-container {
    padding: 0 var(--phenom-space-3);
    gap: var(--phenom-space-3);
  }
}
</style>
