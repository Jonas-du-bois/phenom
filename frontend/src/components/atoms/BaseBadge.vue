<!--
  ============================================================================
  BaseBadge.vue - Tag/Label Badge Component
  ============================================================================
  
  PURPOSE:
  A reusable badge component for displaying tags, labels, or status indicators.
  Commonly used for categories, filters, statuses, or any short text labels
  that need visual distinction.

  FEATURES:
  - Multiple color variants (default, cyan, success, warning, error)
  - Two size options (sm, md)
  - Optional removable functionality with close button
  - Slot-based content for flexibility
  - Pill-shaped design with subtle borders

  USAGE EXAMPLES:
  <BaseBadge>Default</BaseBadge>
  <BaseBadge variant="success">Active</BaseBadge>
  <BaseBadge variant="error" size="sm">Error</BaseBadge>
  <BaseBadge variant="cyan" removable @remove="handleRemove">Tag</BaseBadge>

  PROPS:
  - variant: Color theme - 'default' | 'cyan' | 'success' | 'warning' | 'error'
  - size: Badge size - 'sm' | 'md' (default: 'md')
  - removable: Whether to show a close/remove button (default: false)

  EVENTS:
  - remove: Emitted when the remove button is clicked
  ============================================================================
-->

<script setup>
/**
 * BaseBadge - Tag/Label Badge Component
 * Design System: Phenom Search
 *
 * An atomic component for displaying small labels, tags, or status indicators
 * with various color schemes and optional remove functionality.
 */

defineOptions({ name: "BaseBadge" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  // Color variant of the badge
  // Each variant has matching background, border, and text colors
  variant: {
    type: String,
    default: "default",
    validator: (v) =>
      ["default", "cyan", "success", "warning", "error"].includes(v),
  },
  // Size of the badge (affects padding and font size)
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md"].includes(v),
  },
  // Whether to display a remove/close button
  removable: {
    type: Boolean,
    default: false,
  },
});

// =============================================================================
// EVENTS
// =============================================================================

// Emitted when the user clicks the remove button
const emit = defineEmits(["remove"]);

// =============================================================================
// STYLING CONFIGURATION
// =============================================================================

/**
 * Color classes for each variant
 * Each variant uses a consistent pattern:
 * - Semi-transparent background (10% opacity)
 * - Slightly more visible border (20-30% opacity)
 * - Solid text color
 */
const variantClasses = {
  default: "bg-white/5 border-white/20 text-white/70", // Neutral/gray
  cyan: "bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF]", // Brand accent color
  success: "bg-green-500/10 border-green-500/30 text-green-500", // Positive/success
  warning: "bg-amber-500/10 border-amber-500/30 text-amber-500", // Warning/caution
  error: "bg-red-500/10 border-red-500/30 text-red-500", // Error/danger
};

/**
 * Size classes for padding and font size
 */
const sizeClasses = {
  sm: "px-2 py-1 text-[0.65rem]", // Small - compact badges
  md: "px-3 py-1.5 text-xs", // Medium - default size
};
</script>

<template>
  <!-- 
    Badge Container
    - Inline-flex for proper alignment with text
    - Pill shape with rounded-2xl
    - Uppercase text with letter spacing for label aesthetic
  -->
  <span
    :class="[
      'inline-flex items-center gap-1.5 border rounded-2xl',
      'font-medium uppercase tracking-wider',
      variantClasses[variant],
      sizeClasses[size],
    ]"
  >
    <!-- Default slot for badge content/text -->
    <slot />

    <!-- 
      Remove Button (conditional)
      - Only shown when removable prop is true
      - Uses .stop modifier to prevent event bubbling
      - X icon using inline SVG
    -->
    <button
      v-if="removable"
      type="button"
      class="ml-1 hover:text-white transition-colors"
      aria-label="Remove"
      @click.stop="emit('remove')"
    >
      <!-- X/Close Icon -->
      <svg
        class="w-3 h-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  </span>
</template>
