<!--
  ============================================================================
  ErrorState.vue - Error State Display Component
  ============================================================================
  
  PURPOSE:
  A component for displaying error messages when something goes wrong.
  Provides a clear visual indicator with optional retry functionality.

  FEATURES:
  - Error icon with red color theme
  - Customizable title and message
  - Optional retry button
  - Centered layout

  USAGE EXAMPLES:
  <ErrorState />
  <ErrorState title="Connection Error" message="Please check your network" />
  <ErrorState :showRetry="false" title="Access Denied" />
  <ErrorState @retry="fetchData" />

  PROPS:
  - title: Error heading text
  - message: Detailed error description
  - showRetry: Whether to show retry button (default: true)

  EVENTS:
  - retry: Emitted when retry button is clicked
  ============================================================================
-->

<script setup>
/**
 * ErrorState - Error State Display Component
 * Design System: Phenom Search
 */

defineOptions({ name: "ErrorState" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  // Error title/heading
  title: {
    type: String,
    default: "An error occurred",
  },
  // Detailed error message
  message: {
    type: String,
    default: "Please try again later",
  },
  // Whether to display the retry button
  showRetry: {
    type: Boolean,
    default: true,
  },
});

// =============================================================================
// EVENTS
// =============================================================================
const emit = defineEmits(["retry"]);
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <!-- Error Icon (exclamation in circle) -->
    <div class="w-20 h-20 mb-6 text-red-500/80">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>

    <!-- Error Title -->
    <h3 class="text-lg font-medium text-white/70 mb-2">
      {{ title }}
    </h3>

    <!-- Error Message -->
    <p class="text-sm text-white/40 max-w-xs mb-6">
      {{ message }}
    </p>

    <!-- Retry Button (optional) -->
    <button
      v-if="showRetry"
      class="px-6 py-3 bg-[#00F0FF] text-black text-sm font-medium uppercase tracking-wider hover:bg-[#00D0DF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      @click="emit('retry')"
    >
      Retry
    </button>
  </div>
</template>
