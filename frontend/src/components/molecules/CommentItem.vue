<script setup>
/**
 * CommentItem - Élément de commentaire
 * Design System: Phenom Search
 */
import { computed } from "vue";
import BaseAvatar from "../atoms/BaseAvatar.vue";

defineOptions({ name: "CommentItem" });

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
  currentUserId: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["delete", "user-click"]);

// Formater la date relative
const relativeDate = computed(() => {
  const date = new Date(props.comment.createdAt);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `${diffMins}min`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}j`;

  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
});

// API renvoie userId (objet) et non user
const userName = computed(() => {
  return props.comment.userId?.name || props.comment.user?.name || "Anonyme";
});

// Avatar de l'utilisateur
const userAvatar = computed(() => {
  return (
    props.comment.userId?.avatar?.url || props.comment.user?.avatar?.url || ""
  );
});

// Texte du commentaire (API renvoie text, pas content)
const commentText = computed(() => {
  return props.comment.text || props.comment.content || "";
});

// L'utilisateur peut supprimer son propre commentaire
const canDelete = computed(() => {
  const commentUserId = props.comment.userId?._id || props.comment.user?._id;
  return props.currentUserId && commentUserId === props.currentUserId;
});
</script>

<template>
  <div class="flex gap-3 py-4 border-b border-white/5 last:border-0">
    <!-- Avatar -->
    <BaseAvatar :src="userAvatar" :name="userName" size="sm" />

    <!-- Content -->
    <div class="flex-1 min-w-0">
      <!-- Header -->
      <div class="flex items-center gap-2 mb-1">
        <span class="text-sm font-medium text-white">{{ userName }}</span>
        <span class="text-xs text-white/40">{{ relativeDate }}</span>
      </div>

      <!-- Comment Text -->
      <p class="text-sm text-white/70 break-words">
        {{ commentText }}
      </p>
    </div>

    <!-- Delete Button (swipe left on mobile would be ideal, but for now button) -->
    <button
      v-if="canDelete"
      class="self-start p-2 text-white/30 hover:text-red-500 transition-colors"
      aria-label="Supprimer le commentaire"
      @click="emit('delete', comment)"
    >
      <svg
        class="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <polyline points="3 6 5 6 21 6" />
        <path
          d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
        />
      </svg>
    </button>
  </div>
</template>
