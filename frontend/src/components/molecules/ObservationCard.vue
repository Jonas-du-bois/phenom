<script setup>
/**
 * ObservationCard - Card component for displaying observation in the feed
 * Design System: Phenom Search
 *
 * Displays an observation with user info, image, metadata, comments section,
 * and action buttons (comment, share).
 */

// ============================================================================
// IMPORTS
// ============================================================================
import { computed, ref, watch } from "vue";
import { getImageUrl } from "@/utils/imageHelpers";
import { useRouter } from "vue-router";

// Atomic components
import BaseAvatar from "../atoms/BaseAvatar.vue";
import BaseBadge from "../atoms/BaseBadge.vue";
import CredibilityGauge from "../atoms/CredibilityGauge.vue";
import StrangenessGauge from "../atoms/StrangenessGauge.vue";
import TextArea from "../atoms/TextArea.vue";
import BaseButton from "../atoms/BaseButton.vue";

// Stores and composables
import { useCommentStore } from "@/stores/comment";
import { useToast } from "@/composables/useToast";
import { useWebSocket } from "@/composables/useWebSocket";
import { formatRelativeTime } from "@/utils/formatters";

// ============================================================================
// COMPONENT OPTIONS
// ============================================================================
defineOptions({ name: "ObservationCard" });

// ============================================================================
// PROPS & EMITS
// ============================================================================
const props = defineProps({
  /** The observation object containing all data to display */
  observation: {
    type: Object,
    required: true,
  },
});

// NOTE: "comment" and "share" emits are defined but never actually used in the template
// The component handles these actions internally instead of emitting events
// POTENTIALLY UNUSED: emit("comment") and emit("share") are never called
const emit = defineEmits(["click", "comment", "share"]);

// ============================================================================
// DEPENDENCIES
// ============================================================================
const router = useRouter();
const commentStore = useCommentStore();
const toast = useToast();
const { messages: wsMessages } = useWebSocket();

// ============================================================================
// LOCAL STATE
// ============================================================================
const showComments = ref(false); // Controls comments section visibility
const commentText = ref(""); // New comment input text
const isSubmittingComment = ref(false); // Loading state for comment submission
const isLoadingComments = ref(false); // Loading state for fetching comments
const comments = ref([]); // List of comments for this observation
const wsCommentDelta = ref(0); // Tracks comment count changes from WebSocket

// ============================================================================
// WEBSOCKET - Real-time comment updates
// ============================================================================
watch(
  wsMessages,
  (msgs) => {
    if (!msgs || msgs.length === 0) return;

    // Process all messages, not just the last one
    msgs.forEach((message) => {
      // WebSocket messages are wrapped: { channel, data: { type, data: { comment, observationId } } }
      if (message.channel !== "comments") return;

      const payload = message.data;
      if (!payload?.type?.startsWith("comment:")) return;

      const eventObservationId = payload.data?.observationId;
      if (eventObservationId !== props.observation._id) return;

      const comment = payload.data?.comment;

      if (payload.type === "comment:created") {
        // Always update the count delta
        wsCommentDelta.value++;
        // Only update the list if comments section is visible
        if (showComments.value && comment) {
          const exists = comments.value.some((c) => c._id === comment._id);
          if (!exists) {
            // Create new array for reactivity
            comments.value = [comment, ...comments.value];
          }
        }
      } else if (payload.type === "comment:updated") {
        if (showComments.value && comment) {
          const idx = comments.value.findIndex((c) => c._id === comment._id);
          if (idx !== -1) {
            // Create new array for reactivity
            comments.value = comments.value.map((c, i) =>
              i === idx ? comment : c,
            );
          }
        }
      } else if (payload.type === "comment:deleted") {
        // Always update the count delta
        wsCommentDelta.value--;
        // For deleted, the backend sends { _id, observationId } not { comment }
        const deletedId = payload.data?._id || comment?._id;
        if (showComments.value && deletedId) {
          comments.value = comments.value.filter((c) => c._id !== deletedId);
        }
      }
    });
  },
  { deep: true },
);

// ============================================================================
// COMPUTED PROPERTIES - Data formatting and extraction
// ============================================================================

/**
 * Formats the observation date as a relative time string (e.g., "2 hours ago")
 */
const relativeDate = computed(() => {
  return formatRelativeTime(
    props.observation.createdAt || props.observation.date,
    true,
  );
});

/**
 * Extracts the city name from observation data
 * Prioritizes `city` field, falls back to parsing `location` string
 */
const city = computed(() => {
  // Priority: use city field if available
  if (props.observation.city) return props.observation.city;

  const loc = props.observation.location || "";
  if (!loc) return "";

  // Split by comma and take the last non-empty part
  const parts = loc
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  let candidate = parts.length ? parts[parts.length - 1] : loc.trim();

  // Remove any parentheses content and trim
  candidate = candidate.replace(/\s*\(.*\)$/, "").trim();

  return candidate;
});

/**
 * Formats the observation duration into human-readable string
 * Handles seconds, minutes, and hours
 */
const formattedDuration = computed(() => {
  const seconds = props.observation.duration || 0;
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}min`;
});

/**
 * Gets the main (first) image URL from the observation
 * Supports both string URLs and object format { url }
 */
const mainImage = computed(() => {
  const images = props.observation.images || [];
  if (images.length > 0) {
    const first = images[0];
    // Support both string URL and object { url } format
    return typeof first === "string" ? first : getImageUrl(first);
  }
  return null;
});

/**
 * Gets the user display name
 * API may return userId or user object depending on population
 */
const userName = computed(() => {
  return (
    props.observation.userId?.name || props.observation.user?.name || "Anonyme"
  );
});

/**
 * Gets the user avatar URL with Cloudinary transformations
 */
const userAvatar = computed(() => {
  const a =
    props.observation.userId?.avatar || props.observation.user?.avatar || "";
  if (!a) return "";
  return typeof a === "string"
    ? a
    : getImageUrl(a, { width: 128, height: 128, crop: "fill" });
});

/**
 * Gets the total comment count
 * Handles different API response formats and adds WebSocket delta
 */
const commentCount = computed(() => {
  const base =
    props.observation.commentsCount ??
    props.observation.commentCount ??
    props.observation.comments?.length ??
    0;
  return base + wsCommentDelta.value;
});

// ============================================================================
// METHODS - Comments handling
// ============================================================================

/**
 * Toggles the comments section visibility
 * Loads comments from API on first open
 */
const toggleComments = async () => {
  showComments.value = !showComments.value;
  if (showComments.value && comments.value.length === 0) {
    await loadComments();
  }
};

/**
 * Gets avatar URL for a comment author
 * @param {Object} user - The user object from a comment
 * @returns {string} The avatar URL or empty string
 */
const getUserAvatar = (user) => {
  const a = user?.avatar || "";
  if (!a) return "";
  return typeof a === "string"
    ? a
    : getImageUrl(a, { width: 64, height: 64, crop: "fill" });
};

/**
 * Fetches comments from the API for this observation
 */
const loadComments = async () => {
  isLoadingComments.value = true;
  try {
    await commentStore.fetchComments(props.observation._id);
    comments.value = commentStore.comments;
  } catch {
    toast.error("Erreur lors du chargement des commentaires");
  } finally {
    isLoadingComments.value = false;
  }
};

/**
 * Submits a new comment to the API
 * The WebSocket will handle adding the comment to the list and updating the count
 */
const submitComment = async () => {
  if (!commentText.value.trim() || isSubmittingComment.value) return;

  isSubmittingComment.value = true;
  try {
    await commentStore.addComment(props.observation._id, commentText.value);
    // WebSocket will handle adding the comment to the list and updating wsCommentDelta
    commentText.value = "";
    toast.success("Commentaire envoyé");
  } catch {
    toast.error("Erreur lors de l'envoi");
  } finally {
    isSubmittingComment.value = false;
  }
};

/**
 * Handles keyboard events in the comment input
 * Submits on Enter key (without Shift)
 * @param {KeyboardEvent} e - The keyboard event
 */
const handleCommentKeydown = (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    submitComment();
  }
};

// ============================================================================
// METHODS - Sharing
// ============================================================================

/**
 * Shares the observation via Web Share API or copies link to clipboard
 * Uses native share on mobile, clipboard on desktop
 */
const handleShare = async () => {
  const shareUrl = `${window.location.origin}/observation/${props.observation._id}`;

  try {
    if (navigator.share) {
      // Native share (mobile)
      await navigator.share({
        title: "Phenom Sight",
        text: props.observation.description,
        url: shareUrl,
      });
    } else {
      // Fallback: copy to clipboard (desktop)
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Lien copié");
    }
  } catch (error) {
    // Ignore AbortError (user cancelled share dialog)
    if (error.name !== "AbortError") {
      toast.error("Erreur lors du partage");
    }
  }
};

// ============================================================================
// METHODS - Event handling
// ============================================================================

/**
 * Stops event propagation to prevent parent click handlers
 * Used on interactive elements within the card
 * @param {Event} e - The event to stop
 */
const stopPropagation = (e) => {
  e.stopPropagation();
};

/**
 * Navigates to the observation detail page with comments section anchor
 */
const goToComments = () => {
  router.push(`/observation/${props.observation._id}#comments`);
};
</script>

<template>
  <!-- ========================================================================
       MAIN CARD CONTAINER
       Clickable article that emits 'click' event with observation data
       ======================================================================== -->
  <article
    class="bg-[#000000] border-b border-white/10 rounded-lg focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:outline-none cursor-pointer"
    @click="emit('click', observation)"
    @keydown.enter="emit('click', observation)"
    @keydown.space.prevent="emit('click', observation)"
    tabindex="0"
    role="button"
    :aria-label="`Observation de ${userName} à ${city}`"
  >
    <!-- ======================================================================
         HEADER SECTION - User avatar, name, location and date
         ====================================================================== -->
    <div class="px-1 py-3">
      <div class="flex items-center gap-3">
        <!-- User avatar -->
        <BaseAvatar
          :src="userAvatar"
          :name="userName"
          size="sm"
          class="flex-shrink-0"
        />

        <!-- User info column -->
        <div class="flex-1 min-w-0">
          <!-- Name + verification badge (optional, not implemented) -->
          <div class="flex items-center gap-1.5 mb-1">
            <h3 class="text-sm font-bold text-white truncate">
              {{ userName }}
            </h3>
          </div>

          <!-- Location + date on single line -->
          <p class="text-xs text-white/60 truncate leading-tight">
            <span class="text-white">{{ observation.country }}</span>
            <span class="text-white/30 mx-1.5">•</span>
            <span>{{ city }}</span>
            <span class="text-white/30 mx-1.5">•</span>
            <time>{{ relativeDate }}</time>
          </p>
        </div>

        <!-- COMMENTED OUT: Actions menu button (kebab menu)
         POTENTIALLY UNUSED: This feature is not implemented -->
        <!-- <button class="p-1.5 -mr-1.5 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0">
      <svg class="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
      </svg>
    </button> -->
      </div>
    </div>

    <!-- ======================================================================
         IMAGE SECTION - Main observation image with credibility overlay
         ====================================================================== -->
    <div
      v-if="mainImage"
      class="relative aspect-[4/3] bg-[#12151C] overflow-hidden rounded-lg"
    >
      <!-- Main image with lazy loading -->
      <img
        :src="mainImage"
        :alt="observation.description"
        class="w-full h-full object-cover"
        loading="lazy"
      />

      <!-- Gradient overlay for better text/badge readability -->
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"
      />

      <!-- Gauges positioned side by side at bottom right -->
      <div class="absolute bottom-3 right-3 flex items-center gap-2">
        <!-- Strangeness gauge -->
        <StrangenessGauge
          :value="observation.strangeness || 0"
          size="sm"
          :showLabel="false"
          :showMaxValue="false"
        />

        <!-- Credibility gauge -->
        <CredibilityGauge
          :value="observation.credibility || 0"
          size="sm"
          :showLabel="false"
          :showMaxValue="false"
        />
      </div>
    </div>

    <!-- Placeholder when no image is available -->
    <div
      v-else
      class="aspect-[4/3] bg-[#12151C] flex items-center justify-center"
    >
      <!-- UFO-like icon as placeholder -->
      <svg
        class="w-16 h-16 text-white/10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
      </svg>
    </div>

    <!-- ======================================================================
         METADATA SECTION - UFO shapes, duration, description, comments
         ====================================================================== -->
    <div class="px-4 py-3 space-y-3">
      <!-- UFO shapes displayed as chips/badges (max 3 visible) -->
      <div v-if="observation.ufoShapes?.length" class="flex flex-wrap gap-2">
        <BaseBadge
          v-for="shape in observation.ufoShapes.slice(0, 3)"
          :key="shape"
          variant="cyan"
          size="sm"
        >
          {{ shape }}
        </BaseBadge>
        <!-- "+N" badge when more than 3 shapes -->
        <BaseBadge
          v-if="observation.ufoShapes.length > 3"
          variant="default"
          size="sm"
        >
          +{{ observation.ufoShapes.length - 3 }}
        </BaseBadge>
      </div>

      <!-- Duration display with clock icon -->
      <div
        v-if="observation.duration"
        class="flex items-center gap-2 text-xs text-white/50"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{{ formattedDuration }}</span>
      </div>

      <!-- Description text with 3-line clamp -->
      <p class="text-sm text-white/70 line-clamp-3">
        {{ observation.description }}
      </p>

      <!-- Comment count toggle button -->
      <button
        class="flex items-center gap-1 text-xs text-white/40 hover:text-[#00F0FF] transition-colors relative"
        @click.stop="toggleComments"
        @keydown.enter.stop
        @keydown.space.stop
        :aria-expanded="showComments"
        :aria-controls="`comments-section-${observation._id}`"
        :aria-label="
          showComments
            ? 'Masquer les commentaires'
            : `Afficher ${commentCount} commentaires`
        "
      >
        <!-- Comment bubble icon -->
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        <span
          >{{ commentCount }} commentaire{{ commentCount > 1 ? "s" : "" }}</span
        >
        <!-- Chevron icon that rotates when comments are open -->
        <svg
          class="w-3 h-3 transition-transform"
          :class="{ 'rotate-180': showComments }"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- ====================================================================
           EXPANDABLE COMMENTS SECTION
           Uses Vue Transition for slide animation
           ==================================================================== -->
      <Transition name="slide">
        <div
          v-if="showComments"
          :id="`comments-section-${observation._id}`"
          class="mt-3 space-y-3"
          @click="stopPropagation"
        >
          <!-- Loading spinner while fetching comments -->
          <div v-if="isLoadingComments" class="flex justify-center py-4">
            <div
              class="w-5 h-5 border-2 border-[#00F0FF]/30 border-t-[#00F0FF] rounded-full animate-spin"
            ></div>
          </div>

          <!-- Comments list (scrollable, max height) -->
          <div v-else-if="comments.length > 0" class="max-h-60 overflow-y-auto">
            <!-- Individual comment item -->
            <div
              v-for="comment in comments"
              :key="comment._id"
              class="flex gap-3 py-4 border-b border-white/5 last:border-0"
            >
              <!-- Comment author avatar -->
              <BaseAvatar
                :src="getUserAvatar(comment.userId)"
                :name="comment.userId?.name || 'Anonyme'"
                size="sm"
              />
              <div class="flex-1 min-w-0">
                <!-- Author name and timestamp -->
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-medium text-white">
                    {{ comment.userId?.name || "Anonyme" }}
                  </span>
                  <span class="text-xs text-white/40">{{
                    formatRelativeTime(comment.createdAt, true)
                  }}</span>
                </div>
                <!-- Comment text content -->
                <p class="text-sm text-white/70 break-words">
                  {{ comment.text }}
                </p>
              </div>
            </div>
          </div>

          <!-- Empty state when no comments -->
          <p v-else class="text-center text-sm text-white/40 py-3">
            Aucun commentaire pour l'instant
          </p>

          <!-- ================================================================
               NEW COMMENT FORM
               ================================================================ -->
          <div class="mt-4 pt-4 border-t border-white/[0.06] space-y-2">
            <!-- Comment input textarea -->
            <TextArea
              v-model="commentText"
              @keydown="handleCommentKeydown"
              @click="stopPropagation"
              placeholder="Ajouter un commentaire..."
              :rows="2"
            />
            <!-- Submit button -->
            <div class="flex gap-2 justify-end">
              <BaseButton
                variant="primary"
                size="sm"
                :disabled="!commentText.trim() || isSubmittingComment"
                :loading="isSubmittingComment"
                @click.stop="submitComment"
              >
                {{ isSubmittingComment ? "Envoi..." : "Envoyer" }}
              </BaseButton>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ======================================================================
         ACTION BAR - Comment and Share buttons
         ====================================================================== -->
    <div
      class="flex items-center justify-around px-4 py-3 border-t border-white/5"
    >
      <!-- Comment action button - navigates to detail page -->
      <button
        class="flex items-center gap-2 px-4 py-2 text-white/50 hover:text-[#00F0FF] transition-colors touch-target"
        @click.stop="goToComments"
        @keydown.enter.stop
        @keydown.space.stop
        aria-label="Commenter cette observation"
      >
        <svg
          class="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
        <span class="text-xs uppercase tracking-wider">Commenter</span>
      </button>

      <!-- Share action button - uses Web Share API or clipboard -->
      <button
        class="flex items-center gap-2 px-4 py-2 text-white/50 hover:text-[#00F0FF] transition-colors touch-target relative group"
        @click.stop="handleShare"
        @keydown.enter.stop
        @keydown.space.stop
        aria-label="Partager cette observation"
      >
        <svg
          class="w-5 h-5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        <span class="text-xs uppercase tracking-wider">Partager</span>
      </button>
    </div>
  </article>
</template>

<!-- ============================================================================
     SCOPED STYLES - Animation transitions
     ============================================================================ -->
<style scoped>
/* Fade transition for general show/hide animations */
/* POTENTIALLY UNUSED: .fade-* classes are defined but not used in template */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide transition for comments section expand/collapse */
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
  overflow: hidden;
}

.slide-enter-to,
.slide-leave-from {
  max-height: 500px;
  opacity: 1;
}
</style>
