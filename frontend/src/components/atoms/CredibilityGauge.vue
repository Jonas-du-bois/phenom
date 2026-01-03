<!--
  ============================================================================
  CredibilityGauge.vue - Credibility Score Gauge (0-15)
  ============================================================================
  
  PURPOSE:
  A circular progress gauge that displays a credibility score from 0 to 15.
  Used in the Phenom Search system to rate the reliability of observations
  based on witness credibility factors.

  FEATURES:
  - Circular SVG gauge with animated progress
  - Color-coded by score level (red/amber/cyan)
  - Multiple size variants (sm, md, lg)
  - Optional label display
  - Smooth transition animations

  SCORE COLORS:
  - 0-4: Red (low credibility)
  - 5-9: Amber (medium credibility)
  - 10-15: Cyan (high credibility)

  USAGE EXAMPLES:
  <CredibilityGauge :value="12" />
  <CredibilityGauge :value="score" size="lg" />
  <CredibilityGauge :value="5" :showLabel="false" />

  PROPS:
  - value: Credibility score (0-15, required)
  - size: 'sm' | 'md' | 'lg' (default: 'md')
  - showLabel: Whether to show "Credibility" label below gauge
  ============================================================================
-->

<script setup>
import { computed } from "vue";

/**
 * CredibilityGauge - Credibility Score Gauge (0-15)
 * Design System: Phenom Search
 */

defineOptions({ name: "CredibilityGauge" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
const props = defineProps({
  // Credibility score value (0-15 scale)
  value: {
    type: Number,
    required: true,
    validator: (v) => v >= 0 && v <= 15,
  },
  // Size variant of the gauge
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg"].includes(v),
  },
  // Whether to display the label below the gauge
  showLabel: {
    type: Boolean,
    default: true,
  },
});

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

// Calculate percentage for SVG arc (value out of 15)
const percentage = computed(() => (props.value / 15) * 100);

/**
 * Determine gauge color based on credibility value
 * - High (10-15): Cyan - reliable source
 * - Medium (5-9): Amber - moderate reliability
 * - Low (0-4): Red - low reliability
 */
const gaugeColor = computed(() => {
  if (props.value >= 10) return "#00F0FF"; // Cyan - high credibility
  if (props.value >= 5) return "#f59e0b";  // Amber - medium
  return "#ef4444";                         // Red - low
});

// =============================================================================
// SIZE CONFIGURATION
// =============================================================================

// Dimension settings for each size variant
const dimensions = {
  sm: { outer: 40, inner: 32, stroke: 4, text: "0.7rem" },
  md: { outer: 60, inner: 48, stroke: 6, text: "1rem" },
  lg: { outer: 80, inner: 64, stroke: 8, text: "1.25rem" },
};

const dim = computed(() => dimensions[props.size]);

// =============================================================================
// SVG CIRCLE CALCULATIONS
// =============================================================================

// Calculate circle circumference (2 * PI * radius)
const circumference = computed(() => 2 * Math.PI * (dim.value.inner / 2));

// Calculate stroke-dashoffset for progress arc
// (how much of the circle to "hide")
const offset = computed(
  () => circumference.value - (percentage.value / 100) * circumference.value,
);
</script>

<template>
  <div class="flex flex-col items-center gap-1">
    <!-- Gauge Circle Container -->
    <div
      class="relative"
      :style="{ width: `${dim.outer}px`, height: `${dim.outer}px` }"
    >
      <!-- SVG Gauge (rotated -90deg so arc starts from top) -->
      <svg :width="dim.outer" :height="dim.outer" class="-rotate-90">
        <!-- Background Circle (track) -->
        <circle
          :cx="dim.outer / 2"
          :cy="dim.outer / 2"
          :r="dim.inner / 2"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          :stroke-width="dim.stroke"
        />

        <!-- Progress Circle (colored arc) -->
        <circle
          :cx="dim.outer / 2"
          :cy="dim.outer / 2"
          :r="dim.inner / 2"
          fill="none"
          :stroke="gaugeColor"
          :stroke-width="dim.stroke"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="offset"
          stroke-linecap="round"
          class="transition-all duration-500"
        />
      </svg>

      <!-- Centered Value Display -->
      <div
        class="absolute inset-0 flex items-center justify-center font-light"
        :style="{ fontSize: dim.text, color: gaugeColor }"
      >
        {{ value }}
      </div>
    </div>

    <!-- Label (optional) -->
    <span
      v-if="showLabel"
      class="text-[0.65rem] uppercase tracking-wider text-white/40"
    >
      Credibility
    </span>
  </div>
</template>
