<!--
  ============================================================================
  EmptyState.vue - Empty State Placeholder Component
  ============================================================================
  
  PURPOSE:
  A placeholder component displayed when a list or view has no content.
  Provides visual feedback and optional action button to guide users.

  FEATURES:
  - Multiple icon options for different contexts
  - Customizable title and message
  - Optional action button
  - Centered layout with appropriate spacing

  ICON OPTIONS:
  - search: No search results
  - observations: No observations
  - comments: No comments
  - alerts: No alerts/notifications
  - map: No map markers/locations

  USAGE EXAMPLES:
  <EmptyState title="No results" message="Try a different search" />
  <EmptyState icon="comments" title="No comments yet" />
  <EmptyState 
    icon="observations" 
    title="No observations" 
    showAction 
    actionLabel="Add First" 
    @action="handleAdd" 
  />

  PROPS:
  - title: Main heading text
  - message: Secondary description text
  - icon: Icon type to display
  - showAction: Whether to show action button
  - actionLabel: Text for action button

  EVENTS:
  - action: Emitted when action button is clicked
  ============================================================================
-->

<script setup>
/**
 * EmptyState - Empty State Placeholder Component
 * Design System: Phenom Search
 */

defineOptions({ name: "EmptyState" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  // Main title/heading
  title: {
    type: String,
    default: "No results",
  },
  // Secondary message/description
  message: {
    type: String,
    default: "",
  },
  // Icon type to display
  icon: {
    type: String,
    default: "search",
    validator: (v) =>
      ["search", "observations", "comments", "alerts", "map"].includes(v),
  },
  // Whether to display an action button
  showAction: {
    type: Boolean,
    default: false,
  },
  // Label for the action button
  actionLabel: {
    type: String,
    default: "Retry",
  },
});

// =============================================================================
// EVENTS
// =============================================================================
const emit = defineEmits(["action"]);
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <!-- Icon Container -->
    <div class="w-16 h-16 mb-6 text-white/20">
      <!-- Search Icon -->
      <svg
        v-if="icon === 'search'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>

      <!-- Observations Icon (target/radar style) -->
      <svg
        v-else-if="icon === 'observations'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
      </svg>

      <!-- Comments Icon (chat bubble) -->
      <svg
        v-else-if="icon === 'comments'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>

      <!-- Alerts Icon (bell) -->
      <svg
        v-else-if="icon === 'alerts'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>

      <!-- Map Icon (location pin) -->
      <svg
        v-else-if="icon === 'map'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    </div>

    <!-- Title -->
    <h3 class="text-lg font-medium text-white/70 mb-2">
      {{ title }}
    </h3>

    <!-- Message (optional) -->
    <p v-if="message" class="text-sm text-white/40 max-w-xs">
      {{ message }}
    </p>

    <!-- Action Button (optional) -->
    <button
      v-if="showAction"
      class="mt-6 px-4 py-2 border border-white/20 text-white/60 text-sm uppercase tracking-wider hover:text-[#00F0FF] hover:border-[#00F0FF] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
