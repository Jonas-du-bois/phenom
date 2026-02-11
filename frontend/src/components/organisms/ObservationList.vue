<!-- ========================================================================
     OBSERVATION LIST - Scrollable list of observation cards with features
     
     Features:
     - Pull-to-refresh functionality on mobile
     - Infinite scroll with IntersectionObserver
     - Loading skeleton placeholders
     - Empty state with customizable icon/message
     - Animated card transitions (enter/leave/move)
     - Click handlers for observation and user navigation
     
     Props:
     - observations: Array of observation objects to display
     - loading: Show loading skeletons
     - loadingMore: Show spinner at bottom during pagination
     - hasMore: Enable infinite scroll load more
     - showPullToRefresh: Enable pull-to-refresh gesture
     - emptyIcon/Title/Description: Empty state customization
     
     Events:
     - click: Observation card clicked
     - user-click: User avatar/name clicked
     - load-more: Triggered for infinite scroll pagination
     - refresh: Triggered by pull-to-refresh
     ======================================================================== -->
<template>
  <div
    class="observation-list"
    @touchstart="handleTouchStart"
    @touchmove="handleTouchMove"
    @touchend="handleTouchEnd"
  >
    <!-- Pull to refresh indicator - Shows spinner or rotation arrow -->
    <div
      v-if="pullProgress > 0"
      class="flex items-center justify-center py-4 text-[#00F0FF] overflow-hidden"
      :style="{ height: `${Math.min(pullProgress, 60)}px` }"
    >
      <LoadingSpinner v-if="isRefreshing" size="sm" />
      <svg
        v-else
        class="w-6 h-6 transition-transform"
        :style="{ transform: `rotate(${Math.min(pullProgress, 60) * 3}deg)` }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    </div>

    <!-- Loading skeleton -->
    <template v-if="loading && !observations.length">
      <div v-for="n in 3" :key="n" class="observation-skeleton mb-4">
        <div class="surface-card rounded-2xl overflow-hidden">
          <!-- Header skeleton -->
          <div class="flex items-center gap-3 p-4">
            <div class="skeleton-shimmer w-10 h-10 rounded-full" />
            <div class="flex-1 space-y-2">
              <div class="skeleton-shimmer w-24 h-4 rounded" />
              <div class="skeleton-shimmer w-32 h-3 rounded" />
            </div>
          </div>
          <!-- Image skeleton -->
          <div class="skeleton-shimmer aspect-video" />
          <!-- Content skeleton -->
          <div class="p-4 space-y-3">
            <div class="skeleton-shimmer w-3/4 h-4 rounded" />
            <div class="skeleton-shimmer w-1/2 h-3 rounded" />
          </div>
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <EmptyState
      v-else-if="!loading && !observations.length"
      :icon="emptyIcon"
      :title="emptyTitle"
      :description="emptyDescription"
    >
      <template #action>
        <slot name="empty-action" />
      </template>
    </EmptyState>

    <!-- Observation cards -->
    <template v-else>
      <TransitionGroup name="list" tag="div" class="space-y-4">
        <ObservationCard
          v-for="observation in observations"
          :key="observation._id || observation.id"
          :observation="observation"
          @click="handleClick(observation)"
          @user-click="handleUserClick"
        />
      </TransitionGroup>

      <!-- Load more -->
      <div
        v-if="hasMore"
        ref="loadMoreRef"
        class="flex items-center justify-center py-6"
      >
        <LoadingSpinner v-if="loadingMore" size="md" />
        <button
          v-else
          @click="$emit('load-more')"
          class="text-[#00F0FF] font-medium py-2 px-4"
        >
          Charger plus
        </button>
      </div>

      <!-- End of list -->
      <div
        v-else-if="observations.length > 0"
        class="text-center py-6 text-white/40 text-sm"
      >
        Fin des observations
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { ObservationCard } from "@/components/molecules";
import { LoadingSpinner, EmptyState } from "@/components/atoms";

defineOptions({ name: "ObservationList" });

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  observations: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  loadingMore: {
    type: Boolean,
    default: false,
  },
  hasMore: {
    type: Boolean,
    default: false,
  },
  showPullToRefresh: {
    type: Boolean,
    default: true,
  },
  emptyIcon: {
    type: String,
    default: "search",
  },
  emptyTitle: {
    type: String,
    default: "Aucune observation",
  },
  emptyDescription: {
    type: String,
    default: "Il n'y a pas encore d'observations à afficher.",
  },
});

const emit = defineEmits(["click", "user-click", "load-more", "refresh"]);

const router = useRouter();
const loadMoreRef = ref(null);
const isRefreshing = ref(false);
const pullProgress = ref(0);

// Pull to refresh variables
let startY = 0;
let currentY = 0;
let touchStarted = false;
let observer = null;
let intersectionDebounce = null;

const PULL_THRESHOLD = 80; // Distance to trigger refresh
const PULL_MAX_DISTANCE = 120; // Max visual distance

// Handle touch start
const handleTouchStart = (e) => {
  // Only start pull if scrolled to top
  const scrollParent = e.currentTarget;
  if (scrollParent.scrollTop === 0 && props.showPullToRefresh) {
    startY = e.touches[0].clientY;
    touchStarted = true;
  }
};

// Handle touch move
const handleTouchMove = (e) => {
  if (!touchStarted || isRefreshing.value) return;

  currentY = e.touches[0].clientY;
  const diff = currentY - startY;

  if (diff > 0) {
    // Calculate pull progress with easing
    const progress = Math.min(diff, PULL_MAX_DISTANCE);
    pullProgress.value = progress;
  }
};

// Handle touch end
const handleTouchEnd = () => {
  if (!touchStarted) return;
  touchStarted = false;

  if (pullProgress.value >= PULL_THRESHOLD && !isRefreshing.value) {
    handleRefresh();
  } else {
    // Reset progress
    pullProgress.value = 0;
  }
};

// Intersection observer for infinite scroll
// Create an IntersectionObserver and re-create it when `hasMore` or the ref changes.
const setupObserver = () => {
  // cleanup previous observer
  if (observer) {
    try {
      observer.disconnect();
    } catch (e) {
      // empty catch block: ignore error
    }
    observer = null;
  }

  if (!props.hasMore || !loadMoreRef.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && !props.loadingMore) {
        // debounce rapid intersections
        if (intersectionDebounce) clearTimeout(intersectionDebounce);
        intersectionDebounce = setTimeout(() => {
          emit("load-more");
          intersectionDebounce = null;
        }, 200);
      }
    },
    { threshold: 0.1, rootMargin: "200px 0px" },
  );

  try {
    observer.observe(loadMoreRef.value);
  } catch (e) {
    // empty catch block: ignore error
  }
};

onMounted(() => {
  setupObserver();
});

onUnmounted(() => {
  if (observer) {
    try {
      observer.disconnect();
    } catch (e) {
      // empty catch block: ignore error
    }
    observer = null;
  }
  if (intersectionDebounce) {
    clearTimeout(intersectionDebounce);
    intersectionDebounce = null;
  }
});

// Recreate observer when hasMore flag or the ref element changes
watch([() => props.hasMore, () => loadMoreRef.value], () => {
  // small delay to allow DOM to settle
  setTimeout(() => setupObserver(), 50);
});

const handleClick = (observation) => {
  emit("click", observation);
  router.push(`/observation/${observation._id || observation.id}`);
};

const handleUserClick = (user) => {
  emit("user-click", user);
  router.push(`/profile/${user._id || user.id}`);
};

// Pull to refresh handler
const handleRefresh = async () => {
  isRefreshing.value = true;
  emit("refresh");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  isRefreshing.value = false;
  pullProgress.value = 0;
};

defineExpose({ handleRefresh });
</script>

<style scoped>
/* ============================================================================
   SKELETON SHIMMER EFFECT - Modern loading animation
   ============================================================================ */

.skeleton-shimmer {
  position: relative;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.08) 20%,
    rgba(255, 255, 255, 0.03) 40%,
    rgba(255, 255, 255, 0.03) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
  overflow: hidden;
}

/* Shimmer animation - smooth sliding shine effect */
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

/* Add subtle variation to multiple skeletons */
.observation-skeleton:nth-child(2) .skeleton-shimmer {
  animation-delay: 0.2s;
}

.observation-skeleton:nth-child(3) .skeleton-shimmer {
  animation-delay: 0.4s;
}

/* Transition animations for list items */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.list-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>
