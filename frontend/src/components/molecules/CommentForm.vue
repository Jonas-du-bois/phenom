<!--
  ============================================================================
  CommentForm.vue - Comment submission form
  ============================================================================
  
  PURPOSE:
  A minimal, inline form for submitting comments on observations.
  Features a text input with a send button in a compact horizontal layout.
  
  FEATURES:
  - Text input with placeholder
  - Send button with airplane icon
  - Loading state with spinner
  - Disabled state when empty or loading
  - Submit via Enter key or button click
  - Auto-clears input after successful submission
  - Liquid glass design aesthetic
  
  USAGE EXAMPLES:
  <CommentForm
    :loading="isSubmitting"
    placeholder="Écrire un commentaire..."
    @submit="handleComment"
  />
  
  PROPS:
  - loading: Boolean (default: false) - Shows loading spinner on button
  - placeholder: String (default: "Écrire un commentaire...") - Input placeholder
  
  EVENTS:
  - @submit(content) - Emitted with trimmed comment text when form is submitted
  ============================================================================
-->

<script setup>
/**
 * CommentForm - Comment submission form component
 * Design System: Phenom Search - Liquid Glass Style
 */
import { ref } from "vue";

defineOptions({ name: "CommentForm" });

// ============================================================================
// PROPS DEFINITION
// ============================================================================
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  // Shows loading spinner on submit button when true
  loading: {
    type: Boolean,
    default: false,
  },
  // Placeholder text for the input field
  placeholder: {
    type: String,
    default: "Écrire un commentaire...",
  },
});

// ============================================================================
// EVENTS
// ============================================================================
const emit = defineEmits(["submit"]);

// ============================================================================
// LOCAL STATE
// ============================================================================
const content = ref(""); // Current comment text

// ============================================================================
// METHODS
// ============================================================================
/**
 * Handle form submission
 * - Validates that content is not empty
 * - Emits the trimmed content
 * - Clears the input after submission
 */
const handleSubmit = () => {
  const trimmedContent = content.value.trim();
  if (trimmedContent && !props.loading) {
    emit("submit", trimmedContent);
    content.value = ""; // Clear input after submission
  }
};
</script>

<template>
  <form class="flex items-center gap-3 mx-2" @submit.prevent="handleSubmit">
    <!-- Input -->
    <input
      v-model="content"
      type="text"
      :placeholder="placeholder"
      :disabled="loading"
      class="flex-1 py-2.5 px-4 bg-white/[0.02] border border-white/[0.08] rounded-full text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-[#00F0FF]/50 focus:bg-white/[0.04] transition-all backdrop-blur-sm"
    />

    <!-- Submit Button -->
    <button
      type="submit"
      :disabled="!content.trim() || loading"
      :class="[
        'flex items-center justify-center w-10 h-10 rounded-full transition-all',
        content.trim() && !loading
          ? 'bg-[#00F0FF]/10 text-[#00F0FF] hover:bg-[#00F0FF]/20 border border-[#00F0FF]/30'
          : 'bg-white/[0.02] text-white/20 cursor-not-allowed border border-white/[0.08]',
      ]"
    >
      <svg
        v-if="loading"
        class="w-5 h-5 animate-spin"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <svg
        v-else
        class="w-5 h-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
    </button>
  </form>
</template>

<style scoped>
/* Effet de focus subtil avec glow */
input:focus {
  box-shadow:
    0 0 0 1px rgba(0, 240, 255, 0.1),
    0 0 20px rgba(0, 240, 255, 0.05);
}

/* Animation du bouton au hover */
button:not(:disabled):hover {
  transform: scale(1.05);
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.15);
}

button:not(:disabled):active {
  transform: scale(0.95);
}
</style>
