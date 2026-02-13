<!--
  ============================================================================
  LoadingSpinner.vue - Radar Loading Indicator
  ============================================================================
  
  PURPOSE:
  A thematic "Radar Sweep" animation to replace the generic spinner.
  Injects "Phenom" personality (mysterious, tech) into loading states.

  FEATURES:
  - Radar Sweep: Rotating conic gradient
  - Crosshairs: Subtle grid lines for scope effect
  - Pulsing Core: Central blip indicating activity
  - Size & Color props: Fully compatible with previous usage

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
 * LoadingSpinner - Radar Loading Indicator
 * Design System: Phenom Search
 */

defineOptions({ name: "LoadingSpinner" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
defineProps({
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

// Color classes (Text color for currentColor usage)
const colorClasses = {
  cyan: "text-[#00F0FF]", // Brand color
  white: "text-white", // For dark backgrounds
};
</script>

<template>
  <!-- 
    Radar Loader Container
    - relative: Positioning context
    - overflow-hidden: Contains the radar sweep
    - rounded-full: Circular shape
  -->
  <div
    :class="[
      'relative rounded-full overflow-hidden flex items-center justify-center select-none',
      sizeClasses[size],
      colorClasses[color]
    ]"
    role="status"
    aria-label="Chargement..."
  >
    <!--
      Radar Sweep (Conic Gradient)
      - animate-spin: Rotates the sweep
      - opacity-40: Semi-transparent
    -->
    <div
      class="absolute inset-0 animate-spin origin-center opacity-40"
      style="background: conic-gradient(from 180deg, transparent 50%, currentColor 100%);"
    ></div>

    <!--
      Crosshairs
      - opacity-20: Subtle grid lines
    -->
    <div class="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
      <div class="w-full h-[1px] bg-current"></div>
      <div class="h-full w-[1px] bg-current absolute"></div>
    </div>

    <!--
      Central Blip (Pulsing Dot)
      - animate-pulse: Gentle pulsing effect
      - w-1/4 h-1/4: Proportional size
    -->
    <div class="w-1/4 h-1/4 bg-current rounded-full animate-pulse shadow-[0_0_8px_currentColor] z-10"></div>

    <!--
      Outer Ring Border
      - opacity-30: Subtle boundary
    -->
    <div class="absolute inset-0 rounded-full border border-current opacity-30 pointer-events-none"></div>
  </div>
</template>
