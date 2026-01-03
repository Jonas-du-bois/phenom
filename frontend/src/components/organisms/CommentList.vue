<template>
  <!-- ========================================================================
       COMMENT LIST CONTAINER
       Displays comments with loading, empty, and populated states
       ======================================================================== -->
  <div class="comment-list">
    <!-- ======================================================================
         LOADING STATE - Skeleton placeholders while fetching comments
         Shows 3 placeholder items with pulse animation
         ====================================================================== -->
    <template v-if="loading && !comments.length">
      <div v-for="n in 3" :key="n" class="flex gap-3 p-4 animate-pulse">
        <!-- Avatar skeleton -->
        <div class="w-10 h-10 rounded-full bg-white/10 shrink-0" />
        <div class="flex-1 space-y-2">
          <!-- Name skeleton -->
          <div class="w-24 h-4 rounded bg-white/10" />
          <!-- Text skeleton lines -->
          <div class="w-full h-3 rounded bg-white/5" />
          <div class="w-2/3 h-3 rounded bg-white/5" />
        </div>
      </div>
    </template>

    <!-- ======================================================================
         EMPTY STATE - No comments available
         Shows icon and encouraging message to be the first commenter
         ====================================================================== -->
    <div v-else-if="!loading && !comments.length" class="text-center py-8 px-4">
      <!-- Chat bubble icon -->
      <svg
        class="w-12 h-12 mx-auto text-white/20 mb-3"
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
      <p class="text-white/40 text-sm">Aucun commentaire</p>
      <p class="text-white/30 text-xs mt-1">Soyez le premier à commenter</p>
    </div>

    <!-- ======================================================================
         COMMENTS LIST - Animated list of comment items
         Uses TransitionGroup for enter/leave animations
         ====================================================================== -->
    <template v-else>
      <TransitionGroup name="comment" tag="div">
        <CommentItem
          v-for="comment in comments"
          :key="comment._id || comment.id"
          :comment="comment"
          :current-user-id="currentUserId"
          @delete="handleDelete"
          @user-click="handleUserClick"
        />
      </TransitionGroup>

      <!-- Load more button for pagination -->
      <button
        v-if="hasMore"
        @click="$emit('load-more')"
        class="w-full py-3 text-sm text-[#00F0FF] font-medium"
        :disabled="loadingMore"
      >
        <LoadingSpinner v-if="loadingMore" size="sm" class="mx-auto" />
        <span v-else>Voir plus de commentaires</span>
      </button>
    </template>
  </div>
</template>

<script setup>
/**
 * CommentList - Organism component for displaying a list of comments
 *
 * Features:
 * - Loading skeleton state
 * - Empty state with encouraging message
 * - Animated list with TransitionGroup
 * - Load more pagination support
 * - Delete and user click event handling
 */

// ============================================================================
// IMPORTS
// ============================================================================
import { CommentItem } from "@/components/molecules";
import { LoadingSpinner } from "@/components/atoms";

// ============================================================================
// COMPONENT OPTIONS
// ============================================================================
defineOptions({ name: "CommentList" });

// ============================================================================
// PROPS
// ============================================================================
defineProps({
  /** Array of comment objects to display */
  comments: {
    type: Array,
    default: () => [],
  },
  /** Whether comments are being loaded initially */
  loading: {
    type: Boolean,
    default: false,
  },
  /** Whether more comments are being loaded (pagination) */
  loadingMore: {
    type: Boolean,
    default: false,
  },
  /** Whether there are more comments to load */
  hasMore: {
    type: Boolean,
    default: false,
  },
  /** Current user ID for showing delete button on own comments */
  currentUserId: {
    type: String,
    default: "",
  },
});

// ============================================================================
// EMITS
// ============================================================================
const emit = defineEmits(["delete", "load-more", "user-click"]);

// ============================================================================
// METHODS
// ============================================================================

/**
 * Handles comment deletion request
 * @param {Object} comment - The comment to delete
 */
const handleDelete = (comment) => {
  emit("delete", comment);
};

/**
 * Handles click on comment author
 * @param {Object} user - The user who was clicked
 */
const handleUserClick = (user) => {
  emit("user-click", user);
};
</script>

<!-- ============================================================================
     SCOPED STYLES - Comment list transition animations
     ============================================================================ -->
<style scoped>
/* Enter animation - slide down and fade in */
.comment-enter-active {
  transition: all 0.3s ease;
}

/* Leave animation - faster slide out */
.comment-leave-active {
  transition: all 0.2s ease;
}

/* Initial state when entering */
.comment-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

/* Final state when leaving - slide right */
.comment-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Smooth reordering animation */
.comment-move {
  transition: transform 0.3s ease;
}
</style>
