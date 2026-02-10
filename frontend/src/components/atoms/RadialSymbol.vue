<!--
  ============================================================================
  RadialSymbol.vue - Decorative Radial Symbol Component
  ============================================================================
  
  PURPOSE:
  A decorative SVG element that creates a radial/sun-burst pattern.
  Used as visual background decoration in the Phenom Search design system.

  FEATURES:
  - Customizable size, number of rays, color, and opacity
  - Pure SVG (no external dependencies)
  - Generates rays dynamically based on props
  - Includes center circle and outer ring

  USAGE EXAMPLES:
  <RadialSymbol />
  <RadialSymbol :size="300" :rays="32" color="#ff00ff" />
  <RadialSymbol :opacity="0.1" />

  PROPS:
  - size: Overall width/height in pixels (default: 200)
  - rays: Number of radial lines (default: 24)
  - color: Color of the symbol (default: '#00F0FF')
  - opacity: Overall opacity (default: 0.2)
  ============================================================================
-->

<script setup>
import { computed } from "vue";

/**
 * RadialSymbol - Decorative Radial Symbol Component
 * Design System: Phenom Search
 */

defineOptions({ name: "RadialSymbol" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
const props = defineProps({
  // Overall size (width & height) in pixels
  size: {
    type: Number,
    default: 200,
  },
  // Number of radial rays/lines
  rays: {
    type: Number,
    default: 24,
  },
  // Color for the symbol
  color: {
    type: String,
    default: "#00F0FF",
  },
  // Overall opacity of the symbol
  opacity: {
    type: Number,
    default: 0.2,
  },
});

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

/**
 * Generate SVG path data for each ray
 * Rays extend from inner radius to outer radius at equal angles
 */
const rayPaths = computed(() => {
  const paths = [];
  const centerX = props.size / 2;
  const centerY = props.size / 2;
  const innerRadius = props.size * 0.15; // Start 15% from center
  const outerRadius = props.size * 0.45; // End 45% from center

  for (let i = 0; i < props.rays; i++) {
    // Calculate angle for this ray (starting from top, going clockwise)
    const angle = (i * 2 * Math.PI) / props.rays - Math.PI / 2;

    // Calculate start point (on inner circle)
    const x1 = centerX + innerRadius * Math.cos(angle);
    const y1 = centerY + innerRadius * Math.sin(angle);

    // Calculate end point (on outer radius)
    const x2 = centerX + outerRadius * Math.cos(angle);
    const y2 = centerY + outerRadius * Math.sin(angle);

    paths.push(`M ${x1} ${y1} L ${x2} ${y2}`);
  }

  return paths;
});
</script>

<template>
  <!-- 
    Radial Symbol SVG
    - Decorative element, typically used as background
    - Semi-transparent for subtle visual effect
  -->
  <svg
    :width="size"
    :height="size"
    :viewBox="`0 0 ${size} ${size}`"
    fill="none"
    :style="{ opacity }"
  >
    <!-- Center Circle -->
    <circle
      :cx="size / 2"
      :cy="size / 2"
      :r="size * 0.1"
      :stroke="color"
      stroke-width="1"
      fill="none"
    />

    <!-- Radial Rays -->
    <path
      v-for="(path, index) in rayPaths"
      :key="index"
      :d="path"
      :stroke="color"
      stroke-width="1"
      stroke-linecap="round"
    />

    <!-- Outer Circle -->
    <circle
      :cx="size / 2"
      :cy="size / 2"
      :r="size * 0.48"
      :stroke="color"
      stroke-width="0.5"
      fill="none"
    />
  </svg>
</template>
