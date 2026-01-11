<!--
  ============================================================================
  LoadingSpinner.vue - Loading Indicator Component
  ============================================================================
  
  PURPOSE:
  An animated spinning loader to indicate loading/processing states.
  Uses a circular SVG with a spinning animation.

  FEATURES:
  - Multiple sizes: sm, md, lg, xl
  - Color options: cyan (brand), white
  - Smooth CSS animation
  - Lightweight SVG-based

  USAGE EXAMPLES:
  <LoadingSpinner />
  <LoadingSpinner size="lg" />
  <LoadingSpinner color="white" size="sm" />

  PROPS:
  - size: 'sm' | 'md' | 'lg' | 'xl' (default: 'md')
  - color: 'cyan' | 'white' (default: 'cyan')
  ============================================================================
-->

<script setup>
/**
 * LoadingSpinner - Loading Indicator Component
 * Design System: Phenom Search
 */

defineOptions({ name: "LoadingSpinner" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  // Size variant
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg", "xl"].includes(v),
  },
  // Color variant
  color: {
    type: String,
    default: "cyan",
    validator: (v) => ["cyan", "white"].includes(v),
  },
});

// =============================================================================
// STYLING CONFIGURATION
// =============================================================================

// Size classes (Tailwind dimensions)
const sizeClasses = {
  sm: "w-4 h-4", // 16px - inline/button loading
  md: "w-6 h-6", // 24px - default
  lg: "w-10 h-10", // 40px - section loading
  xl: "w-16 h-16", // 64px - full page loading
};

// Color classes
const colorClasses = {
  cyan: "text-[#00F0FF]", // Brand color
  white: "text-white", // For dark backgrounds
};
</script>

<template>
  <!-- 
    Animated Spinner SVG
    - animate-spin: Tailwind's rotation animation
    - Two-part design: faded track circle + solid arc
  -->
  <svg
    :class="['animate-spin', sizeClasses[size], colorClasses[color]]"
    viewBox="0 0 24 24"
    fill="none"
  >
    <!-- Background track circle (25% opacity) -->
    <circle
      class="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      stroke-width="4"
    />
    <!-- Spinning arc (75% opacity) -->
    <path
      class="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
</template>
