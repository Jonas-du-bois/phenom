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
      <!-- Image Carousel -->
      <div class="image-carousel">
        <div
          v-if="observation.images && observation.images.length > 0"
          class="carousel-container"
        >
          <img
            :src="observation.images[currentImageIndex].url"
            :alt="observation.title"
            class="carousel-image"
          />

          <div v-if="observation.images.length > 1" class="carousel-controls">
            <button class="carousel-btn" @click="previousImage">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <button class="carousel-btn" @click="nextImage">
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

          <div class="carousel-indicators">
            <span
              v-for="(img, index) in observation.images"
              :key="img.publicId"
              :class="['indicator', { active: index === currentImageIndex }]"
              @click="currentImageIndex = index"
            ></span>
          </div>
        </div>

        <div v-else class="no-image">
          <span class="no-image-icon">📷</span>
          <p>Aucune image</p>
        </div>
      </div>

      <!-- Content -->
      <div class="observation-content">
        <!-- Header -->
        <div class="obs-header">
          <div class="obs-type-badge">
            {{ getObservationTypeLabel(observation.type) }}
          </div>
          <h1 class="obs-title">{{ observation.title }}</h1>
        </div>

        <!-- Meta -->
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
            <button class="action-btn" @click="editObservation">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button class="action-btn delete" @click="confirmDelete">
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

        <!-- Description -->
        <div class="obs-description">
          <p>{{ observation.description }}</p>
        </div>

        <!-- Location -->
        <div v-if="observation.location" class="obs-location">
          <div class="location-header">
            <svg class="location-icon" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
            <span class="location-title">Localisation</span>
          </div>
          <div id="detail-map" ref="mapContainer" class="detail-map"></div>
        </div>

        <!-- Comments -->
        <div class="comments-section">
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
      </div>
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
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuth } from "../composables/useAuth";
import { useMap } from "../composables/useMap";
import { useWebSocket } from "../composables/useWebSocket";
import { observationService } from "../services/observationService";
import { commentService } from "../services/commentService";
import { OBSERVATION_TYPES } from "../constants/observationTypes";
import TestBaseLoading from "../components/test_BaseLoading.vue";
import TestBaseButton from "../components/test_BaseButton.vue";
import TestBaseAvatar from "../components/test_BaseAvatar.vue";
import TestBaseModal from "../components/test_BaseModal.vue";

const router = useRouter();
const route = useRoute();
const { user: currentUser } = useAuth();
const { connect, disconnect, subscribe, unsubscribe } = useWebSocket();

const observation = ref(null);
const loading = ref(true);
const error = ref(null);
const currentImageIndex = ref(0);
const newComment = ref("");
const addingComment = ref(false);
const showDeleteModal = ref(false);
const deleting = ref(false);
const mapContainer = ref(null);

const { initMap, addMarker } = useMap();

const isOwner = computed(() => {
  return (
    currentUser.value &&
    observation.value &&
    currentUser.value._id === observation.value.userId?._id
  );
});

onMounted(async () => {
  await loadObservation();
  
  // Connecter WebSocket et écouter les messages
  await connect();
  
  // Écouter les messages du canal comments (déjà souscrit dans useWebSocket)
  const unsubComments = await subscribe('comments', handleWebSocketMessage);
  
  // Écouter les messages du canal observations (déjà souscrit dans useWebSocket)
  const unsubObservations = await subscribe('observations', handleWebSocketMessage);
});

onUnmounted(() => {
  disconnect();
});

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
        await initMap(mapContainer.value);
        const coords = observation.value.location.coordinates;
        addMarker({
          id: observation.value._id,
          position: { lat: coords[1], lng: coords[0] },
          title: observation.value.title,
        });
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
  background: #f9fafb;
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

.image-carousel {
  position: relative;
  background: #000;
}

.carousel-container {
  position: relative;
  aspect-ratio: 16/9;
}

@media (max-width: 640px) {
  .carousel-container {
    aspect-ratio: 4/3;
  }
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.carousel-controls {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  padding: 0 1rem;
}

.carousel-btn {
  width: 2.5rem;
  height: 2.5rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.carousel-btn:hover {
  background: white;
  transform: scale(1.1);
}

.carousel-btn svg {
  width: 1.5rem;
  height: 1.5rem;
}

.carousel-indicators {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
}

.indicator {
  width: 0.5rem;
  height: 0.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}

.indicator.active {
  background: white;
  width: 1.5rem;
  border-radius: 0.25rem;
}

.no-image {
  aspect-ratio: 16/9;
  background: #e5e7eb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.no-image-icon {
  font-size: 4rem;
  margin-bottom: 0.5rem;
}

.observation-content {
  background: white;
  padding: 1.5rem;
}

@media (min-width: 768px) {
  .observation-content {
    padding: 2rem;
  }
}

.obs-header {
  margin-bottom: 1rem;
}

.obs-type-badge {
  display: inline-block;
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 9999px;
  font-size: 0.8125rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.obs-title {
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.obs-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.author-avatar {
  cursor: pointer;
}

.meta-info {
  flex: 1;
}

.author-name {
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.125rem;
}

.meta-date {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.obs-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.action-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 0.5rem;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.action-btn.delete:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.action-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.obs-description {
  color: #374151;
  font-size: 1rem;
  line-height: 1.7;
  margin-bottom: 2rem;
}

.obs-location {
  margin-bottom: 2rem;
}

.location-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.location-icon {
  width: 1.25rem;
  height: 1.25rem;
  color: #667eea;
}

.location-title {
  font-weight: 600;
  color: #111827;
}

.detail-map {
  width: 100%;
  height: 250px;
  border-radius: 0.75rem;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.comments-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 2px solid #e5e7eb;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 1.5rem;
}

.comment-form {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.comment-input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.comment-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.9375rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
}

.comment-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.comment-item {
  display: flex;
  gap: 0.75rem;
}

.comment-content {
  flex: 1;
  background: #f9fafb;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.comment-author {
  font-weight: 600;
  font-size: 0.875rem;
  color: #111827;
}

.comment-date {
  font-size: 0.8125rem;
  color: #9ca3af;
}

.comment-text {
  color: #374151;
  font-size: 0.9375rem;
  line-height: 1.6;
  margin: 0;
}

.no-comments {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}
</style>
