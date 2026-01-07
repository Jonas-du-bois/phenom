<!--
  ============================================================================
  ObservationDetailPage.vue - Single Observation Detail View
  ============================================================================
  
  PURPOSE:
  Displays complete details of a single UFO observation including
  images, metadata, description, location map, and comments.

  FEATURES:
  - Full-screen image gallery with swipe navigation
  - Observation metadata (type, date, location, credibility)
  - Description and witness information
  - Interactive map showing observation location
  - Comments section with add/delete functionality
  - Edit/delete actions for observation owner
  - Sharing functionality
  - Verification badge for verified observations
  - Liquid glass design aesthetic

  ROUTE: /observation/:id
  ============================================================================
-->

<template>
  <div class="observation-detail-page min-h-screen bg-[#000000] mb-8 mt-16">
    <!-- Loading state -->
    <template v-if="loading">
      <div class="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    </template>

    <!-- Error state -->
    <template v-else-if="error">
      <div class="flex items-center justify-center h-screen px-4">
        <ErrorState
          :title="error"
          description="L'observation n'a pas pu être chargée."
        >
          <template #action>
            <BaseButton variant="secondary" @click="goBack">
              Retour
            </BaseButton>
          </template>
        </ErrorState>
      </div>
    </template>

    <!-- Content -->
    <template v-else-if="observation">
      <!-- Header -->
      <ObservationHeader
        :user="observation.userId || observation.user || observation.author"
        :date="observation.createdAt"
        :verified="observation.verified"
        show-back
        show-menu
        @back="goBack"
        @menu="showMenu = true"
      />

      <!-- Image gallery -->
      <ImageGallery
        v-if="images.length"
        :images="images"
        @image-click="openFullscreen"
      />

      <!-- Observation info - Liquid glass card -->
      <div class="px-5 py-6 space-y-5">
        <!-- Main content card -->
        <div class="liquid-glass-card rounded-2xl p-5 space-y-4">
          <!-- Type badge with tooltip -->
          <div class="flex items-center gap-2 flex-wrap">
            <GlassTooltip 
              :content="getTypeTooltipContent(observation.type)"
              :icon="getTypeIcon(observation.type)"
            >
              <BaseBadge :variant="typeBadgeVariant" class="badge-glow badge-interactive">
                {{ observation.type?.toUpperCase() || "OBSERVATION" }}
              </BaseBadge>
            </GlassTooltip>
            <GlassTooltip 
              v-if="observation.verified" 
              content="Cette observation a été vérifiée par notre équipe de modération"
              icon="✓"
            >
              <BaseBadge variant="success" class="badge-glow badge-interactive">
                ✓ Vérifié
              </BaseBadge>
            </GlassTooltip>
          </div>

          <!-- Description with enhanced typography -->
          <p class="text-white/85 text-base leading-relaxed whitespace-pre-wrap">
            {{ observation.description }}
          </p>
        </div>

        <!-- Metadata card -->
        <div class="liquid-glass-card rounded-2xl overflow-hidden">
          <ObservationMeta :observation="observation" />
        </div>

        <!-- Map preview - Liquid glass style -->
        <div
          v-if="observation.location?.coordinates"
          class="liquid-glass-card rounded-2xl h-44 overflow-hidden cursor-pointer group"
          @click="
            $router.push({ path: '/map', query: { focus: observation._id } })
          "
        >
          <div
            class="w-full h-full flex items-center justify-center relative"
          >
            <!-- Subtle grid pattern background -->
            <div class="absolute inset-0 opacity-20 bg-grid-pattern"></div>
            
            <div class="text-center relative z-10">
              <!-- Map pin icon with glow -->
              <div class="map-icon-wrapper inline-flex items-center justify-center w-14 h-14 rounded-full mb-3">
                <svg
                  class="w-7 h-7 text-[#00F0FF]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <p class="text-sm text-white/70 group-hover:text-[#00F0FF] transition-colors">
                Voir sur la carte
              </p>
              <p class="text-xs text-white/40 mt-1">
                {{ observation.location?.name || observation.country || 'Localisation' }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Comments section - Liquid glass card -->
      <div class="px-5 py-4" id="comments">
        <div class="liquid-glass-card rounded-2xl p-5">
          <!-- Section header -->
          <div class="flex items-center gap-3 mb-5">
            <div class="comment-icon-wrapper flex items-center justify-center w-9 h-9 rounded-xl">
              <svg
                class="w-5 h-5 text-[#00F0FF]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="1.5"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h2 class="text-base font-semibold text-white">
                Commentaires
              </h2>
              <span v-if="comments.length" class="text-xs text-white/40">
                {{ comments.length }} commentaire{{ comments.length > 1 ? 's' : '' }}
              </span>
            </div>
          </div>

          <CommentList
            :comments="comments"
            :loading="false"
            :loading-more="false"
            :has-more="false"
            :current-user-id="currentUserId"
            @delete="deleteComment"
            @user-click="goToProfile"
          />

          <!-- Comment form -->
          <div v-if="isAuthenticated" class="mt-4 pt-4 border-t border-white/[0.06]">
            <CommentForm
              :loading="submittingComment"
              @submit="submitComment"
            />
          </div>
        </div>
      </div>

      <!-- Options menu - Liquid glass bottom sheet -->
      <Teleport to="body">
        <Transition name="slide-up">
          <div v-if="showMenu" class="fixed inset-0 z-50">
            <!-- Backdrop with blur -->
            <div
              class="absolute inset-0 bg-black/70 backdrop-blur-sm"
              @click="showMenu = false"
            />

            <!-- Bottom sheet -->
            <div
              class="liquid-glass-sheet absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden"
              :style="{
                paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
              }"
            >
              <!-- Handle indicator -->
              <div class="flex justify-center pt-3 pb-2">
                <div class="w-10 h-1 rounded-full bg-white/20"></div>
              </div>

              <!-- Menu items -->
              <div class="px-4 py-2 space-y-1">
                <button
                  @click="shareObservation"
                  class="menu-item w-full px-4 py-3.5 flex items-center gap-4 text-white rounded-xl"
                >
                  <div class="menu-icon-wrapper flex items-center justify-center w-10 h-10 rounded-xl">
                    <svg
                      class="w-5 h-5 text-[#00F0FF]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="1.5"
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                  </div>
                  <span class="font-medium">Partager</span>
                </button>

                <template v-if="isOwner">
                  <button
                    @click="editObservation"
                    class="menu-item w-full px-4 py-3.5 flex items-center gap-4 text-white rounded-xl"
                  >
                    <div class="menu-icon-wrapper flex items-center justify-center w-10 h-10 rounded-xl">
                      <svg
                        class="w-5 h-5 text-[#00F0FF]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="1.5"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </div>
                    <span class="font-medium">Modifier</span>
                  </button>

                  <button
                    @click="confirmDelete"
                    class="menu-item menu-item-danger w-full px-4 py-3.5 flex items-center gap-4 rounded-xl"
                  >
                    <div class="menu-icon-wrapper menu-icon-danger flex items-center justify-center w-10 h-10 rounded-xl">
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </div>
                    <span class="font-medium">Supprimer</span>
                  </button>
                </template>
              </div>

              <!-- Cancel button -->
              <div class="px-4 pt-3">
                <button
                  @click="showMenu = false"
                  class="cancel-button w-full px-4 py-4 text-center text-white font-medium rounded-2xl transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </Transition>

        <!-- Fullscreen Gallery Modal - Enhanced with glass UI -->
        <Transition name="fade">
          <div
            v-if="showFullscreenGallery && images.length"
            class="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center"
            @click="closeFullscreen"
          >
            <!-- Close button with glass effect -->
            <button
              class="gallery-nav-button absolute top-4 right-4 z-10 flex items-center justify-center w-11 h-11 rounded-full"
              @click="closeFullscreen"
            >
              <svg
                class="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <!-- Image counter with glass pill -->
            <div class="gallery-counter absolute top-4 left-4 px-4 py-2 rounded-full text-sm text-white/90">
              {{ fullscreenIndex + 1 }} / {{ images.length }}
            </div>

            <!-- Image -->
            <img
              :src="images[fullscreenIndex]"
              :alt="`Image ${fullscreenIndex + 1}`"
              class="max-w-full max-h-full object-contain"
              @click.stop
            />

            <!-- Navigation arrows with glass effect -->
            <button
              v-if="fullscreenIndex > 0"
              class="gallery-nav-button absolute left-4 flex items-center justify-center w-12 h-12 rounded-full"
              @click.stop="fullscreenIndex--"
            >
              <svg
                class="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <button
              v-if="fullscreenIndex < images.length - 1"
              class="gallery-nav-button absolute right-4 flex items-center justify-center w-12 h-12 rounded-full"
              @click.stop="fullscreenIndex++"
            >
              <svg
                class="w-7 h-7 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </Transition>
      </Teleport>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  LoadingSpinner,
  ErrorState,
  BaseButton,
  BaseBadge,
  GlassTooltip,
} from "@/components/atoms";
import { getObservationLabel, OBSERVATION_TYPES } from "@/constants";
import {
  ObservationHeader,
  ObservationMeta,
  ImageGallery,
  CommentForm,
} from "@/components/molecules";
import { getImageUrl } from "@/utils/imageHelpers";
import { CommentList } from "@/components/organisms";
import { useObservationStore } from "@/stores/observation";
import { useCommentStore } from "@/stores/comment";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composables/useToast";
import { useWebSocket } from "@/composables/useWebSocket";
import { storeToRefs } from "pinia";

defineOptions({ name: "ObservationDetailPage" });

const route = useRoute();
const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const observationStore = useObservationStore();
const commentStore = useCommentStore();
const { messages: wsMessages } = useWebSocket();

const {
  currentObservation: observation,
  loading,
  error,
} = storeToRefs(observationStore);
const { isAuthenticated, user: authUser } = storeToRefs(authStore);

// État local
const comments = ref([]);
const submittingComment = ref(false);
const showMenu = ref(false);
const showFullscreenGallery = ref(false);
const fullscreenIndex = ref(0);

// Synchroniser les commentaires quand l'observation change
watch(
  observation,
  (newObs) => {
    if (newObs?.comments) {
      comments.value = newObs.comments;
    }
  },
  { immediate: true }
);

// Écouter les messages WebSocket pour les commentaires en temps réel
watch(
  wsMessages,
  (messages) => {
    if (!messages.length) return;
    
    // Traiter le dernier message reçu
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.channel !== "comments") return;
    
    const { type, data } = lastMsg.data || {};
    const observationId = route.params.id;
    
    // Vérifier que le commentaire concerne cette observation
    const commentObsId = data?.observationId || data?.observation;
    if (commentObsId && commentObsId !== observationId) return;
    
    switch (type) {
      case "comment:created": {
        const newComment = data?.comment || data;
        // Éviter les doublons (si on a déjà ajouté le commentaire localement)
        const exists = comments.value.some(
          (c) => (c._id || c.id) === (newComment._id || newComment.id)
        );
        if (!exists && newComment._id) {
          comments.value.unshift(newComment);
          console.log("📨 Nouveau commentaire reçu via WebSocket");
        }
        break;
      }
      case "comment:updated": {
        const updatedComment = data?.comment || data;
        const index = comments.value.findIndex(
          (c) => (c._id || c.id) === (updatedComment._id || updatedComment.id)
        );
        if (index !== -1) {
          comments.value[index] = updatedComment;
          console.log("📨 Commentaire mis à jour via WebSocket");
        }
        break;
      }
      case "comment:deleted": {
        const deletedId = data?._id || data?.id;
        if (deletedId) {
          comments.value = comments.value.filter(
            (c) => (c._id || c.id) !== deletedId
          );
          console.log("📨 Commentaire supprimé via WebSocket");
        }
        break;
      }
    }
  },
  { deep: true }
);

const currentUserId = computed(() => authUser.value?._id || authUser.value?.id);

const isOwner = computed(() => {
  const obsUserId =
    observation.value?.userId?._id ||
    observation.value?.user?._id ||
    observation.value?.author?._id;
  return currentUserId.value && obsUserId === currentUserId.value;
});

const images = computed(() => {
  if (!observation.value) return [];

  const imgs = [];

  if (observation.value.imageUrl) {
    imgs.push(
      typeof observation.value.imageUrl === "string"
        ? observation.value.imageUrl
        : getImageUrl(observation.value.imageUrl)
    );
  }

  if (observation.value.images?.length) {
    observation.value.images.forEach((img) => {
      // getImageUrl will return a usable URL or placeholder
      const url = typeof img === "string" ? img : getImageUrl(img);
      if (url) imgs.push(url);
    });
  }

  return imgs;
});

const typeBadgeVariant = computed(() => {
  const type = observation.value?.type?.toLowerCase();
  if (type === "ufo") return "cyan";
  if (type === "entity") return "warning";
  return "default";
});

// ============================================================================
// TOOLTIP HELPERS
// ============================================================================

/**
 * Get the full French description for a type code
 * @param {string} type - The observation type code
 * @returns {string} Full French description
 */
const getTypeTooltipContent = (type) => {
  if (!type) return "Type d'observation non spécifié";
  
  const typeUpper = type.toUpperCase();
  const typeData = OBSERVATION_TYPES[typeUpper];
  
  if (typeData) {
    return typeData.label;
  }
  
  // Fallback for common types not in the constant
  const fallbacks = {
    UFO: "Objet Volant Non Identifié",
    OVNI: "Objet Volant Non Identifié",
    ENTITY: "Entité ou créature non identifiée",
    PAN: "Phénomène Aérien Non Identifié",
    UAP: "Unidentified Aerial Phenomenon",
  };
  
  return fallbacks[typeUpper] || getObservationLabel(typeUpper);
};

/**
 * Get the icon for a type code
 * @param {string} type - The observation type code
 * @returns {string} Emoji icon
 */
const getTypeIcon = (type) => {
  if (!type) return "👁️";
  
  const typeUpper = type.toUpperCase();
  const typeData = OBSERVATION_TYPES[typeUpper];
  
  if (typeData?.icon) {
    return typeData.icon;
  }
  
  // Fallback icons for common types
  const fallbackIcons = {
    UFO: "🛸",
    OVNI: "🛸",
    ENTITY: "👽",
    PAN: "🛸",
    UAP: "🛸",
  };
  
  return fallbackIcons[typeUpper] || "👁️";
};

// Forcer le scroll en haut immédiatement lors de la création du composant
// Ceci s'exécute de manière synchrone avant le rendu
if (!route.hash) {
  window.scrollTo({ top: 0, behavior: "instant" });
}

onMounted(async () => {
  // Charger l'observation
  await fetchObservation();

  // Scroller vers le hash si présent (ex: #comments) avec animation douce
  if (route.hash) {
    // Attendre que le DOM soit complètement rendu et que le contenu soit chargé
    setTimeout(() => {
      const element = document.querySelector(route.hash);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
          inline: "nearest",
        });
      }
    }, 500);
  }
});

// Watch le route pour mettre à jour le scroll si le hash change
watch(
  () => route.hash,
  (newHash) => {
    if (newHash) {
      setTimeout(() => {
        const element = document.querySelector(newHash);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 300);
    } else {
      // Si le hash est supprimé, remonter en haut
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }
);

const fetchObservation = async () => {
  try {
    await observationStore.fetchObservationById(route.params.id);
    comments.value = observation.value?.comments || [];
  } catch {
    // Error handled by store
  }
};

const submitComment = async (text) => {
  submittingComment.value = true;

  try {
    // L'ajout local est géré par le WebSocket (comment:created)
    await commentStore.addComment(route.params.id, text);
    toast.success("Commentaire ajouté");
  } catch {
    toast.error("Erreur lors de l'ajout du commentaire");
  } finally {
    submittingComment.value = false;
  }
};

const deleteComment = async (comment) => {
  try {
    // La suppression locale est gérée par le WebSocket (comment:deleted)
    await commentStore.removeComment(
      route.params.id,
      comment._id || comment.id
    );
    toast.success("Commentaire supprimé");
  } catch {
    toast.error("Erreur lors de la suppression");
  }
};

const goToProfile = (user) => {
  router.push(`/profile/${user._id || user.id}`);
};

const openFullscreen = (index) => {
  fullscreenIndex.value = index;
  showFullscreenGallery.value = true;
};

const closeFullscreen = () => {
  showFullscreenGallery.value = false;
};

const shareObservation = async () => {
  showMenu.value = false;

  try {
    if (navigator.share) {
      await navigator.share({
        title: observation.value?.title,
        text: observation.value?.description?.slice(0, 100),
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Lien copié dans le presse-papier");
    }
  } catch {
    // User cancelled share
  }
};

/* const reportObservation = () => {
  showMenu.value = false;
  toast.info("La fonctionnalité de signalement sera bientôt disponible");
}; */

const editObservation = () => {
  showMenu.value = false;
  router.push(`/observation/${route.params.id}/edit`);
};

const confirmDelete = async () => {
  showMenu.value = false;

  if (confirm("Êtes-vous sûr de vouloir supprimer cette observation ?")) {
    try {
      await observationStore.deleteObservation(route.params.id);
      toast.success("Observation supprimée");
      router.push("/feed");
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }
};

// Fonction pour retourner à la page précédente
const goBack = () => {
  router.back();
};
</script>

<style scoped>
/* ============================================================================
   LIQUID GLASS DESIGN SYSTEM - Observation Detail Page
   ============================================================================ */

/* Main content card - frosted glass effect */
.liquid-glass-card {
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.04),
    rgba(255, 255, 255, 0.01)
  );
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 
    0 10px 40px rgba(2, 6, 23, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

/* Light reflection overlay */
.liquid-glass-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0)
  );
  mix-blend-mode: overlay;
}

/* Badge glow effect for type badges */
.badge-glow {
  filter: drop-shadow(0 0 6px rgba(0, 240, 255, 0.2));
}

/* Interactive badge styling (with tooltip) */
.badge-interactive {
  transition: all 0.2s ease;
  cursor: pointer;
}

.badge-interactive:hover {
  filter: drop-shadow(0 0 10px rgba(0, 240, 255, 0.35));
  transform: translateY(-1px);
}

.badge-interactive:active {
  transform: scale(0.97);
}

/* Map icon wrapper with subtle glow */
.map-icon-wrapper {
  background: linear-gradient(
    135deg,
    rgba(0, 240, 255, 0.1),
    rgba(0, 240, 255, 0.02)
  );
  border: 1px solid rgba(0, 240, 255, 0.15);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.1);
}

/* Comment section icon */
.comment-icon-wrapper {
  background: linear-gradient(
    135deg,
    rgba(0, 240, 255, 0.12),
    rgba(0, 240, 255, 0.03)
  );
  border: 1px solid rgba(0, 240, 255, 0.12);
}

/* Subtle grid pattern for map preview */
.bg-grid-pattern {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* ============================================================================
   BOTTOM SHEET - Liquid Glass Style
   ============================================================================ */

.liquid-glass-sheet {
  background: linear-gradient(
    180deg,
    rgba(30, 30, 40, 0.95),
    rgba(20, 20, 28, 0.98)
  );
  backdrop-filter: blur(24px) saturate(150%);
  -webkit-backdrop-filter: blur(24px) saturate(150%);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 -10px 50px rgba(0, 0, 0, 0.5);
}

.liquid-glass-sheet::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.04),
    transparent
  );
  border-radius: inherit;
}

/* Menu item styling */
.menu-item {
  background: transparent;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.menu-item:active {
  background: rgba(255, 255, 255, 0.08);
  transform: scale(0.98);
}

.menu-item-danger {
  color: #f87171;
}

/* Menu icon wrappers */
.menu-icon-wrapper {
  background: linear-gradient(
    135deg,
    rgba(0, 240, 255, 0.1),
    rgba(0, 240, 255, 0.02)
  );
  border: 1px solid rgba(0, 240, 255, 0.12);
}

.menu-icon-danger {
  background: linear-gradient(
    135deg,
    rgba(248, 113, 113, 0.12),
    rgba(248, 113, 113, 0.03)
  );
  border: 1px solid rgba(248, 113, 113, 0.15);
  color: #f87171;
}

/* Cancel button */
.cancel-button {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0.02)
  );
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(10px);
}

.cancel-button:hover {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.04)
  );
}

.cancel-button:active {
  transform: scale(0.98);
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.12),
    rgba(255, 255, 255, 0.06)
  );
}

/* ============================================================================
   FULLSCREEN GALLERY - Glass UI Controls
   ============================================================================ */

.gallery-nav-button {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.02)
  );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.2s ease;
}

.gallery-nav-button:hover {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.15),
    rgba(255, 255, 255, 0.05)
  );
  border-color: rgba(255, 255, 255, 0.2);
}

.gallery-nav-button:active {
  transform: scale(0.95);
}

.gallery-counter {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0.02)
  );
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* ============================================================================
   TRANSITIONS & ANIMATIONS
   ============================================================================ */

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide up transition for bottom sheet */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-active .liquid-glass-sheet,
.slide-up-leave-active .liquid-glass-sheet {
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}

.slide-up-enter-from .liquid-glass-sheet,
.slide-up-leave-to .liquid-glass-sheet {
  transform: translateY(100%);
}

/* Subtle glow animation for interactive elements */
@keyframes subtle-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(0, 240, 255, 0.1);
  }
  50% {
    box-shadow: 0 0 30px rgba(0, 240, 255, 0.15);
  }
}
</style>
