<template>
  <div class="comment-list">
    <!-- Loading state -->
    <template v-if="loading && !comments.length">
      <div v-for="n in 3" :key="n" class="flex gap-3 p-4 animate-pulse">
        <div class="w-10 h-10 rounded-full bg-white/10 shrink-0" />
        <div class="flex-1 space-y-2">
          <div class="w-24 h-4 rounded bg-white/10" />
          <div class="w-full h-3 rounded bg-white/5" />
          <div class="w-2/3 h-3 rounded bg-white/5" />
        </div>
      </div>
    </template>

    <!-- Empty state -->
    <div v-else-if="!loading && !comments.length" class="text-center py-8 px-4">
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

    <!-- Comments -->
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

      <!-- Load more comments -->
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
import { CommentItem } from "@/components/molecules";
import { LoadingSpinner } from "@/components/atoms";

defineOptions({ name: "CommentList" });

defineProps({
  comments: {
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
  currentUserId: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["delete", "load-more", "user-click"]);

const handleDelete = (comment) => {
  emit("delete", comment);
};

const handleUserClick = (user) => {
  emit("user-click", user);
};
</script>

<style scoped>
.comment-enter-active {
  transition: all 0.3s ease;
}

.comment-leave-active {
  transition: all 0.2s ease;
}

.comment-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.comment-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.comment-move {
  transition: transform 0.3s ease;
}
</style>
