<!--
  ============================================================================
  StrangenessGauge.vue - Strangeness Score Gauge (0-10)
  ============================================================================
  
  PURPOSE:
  A circular progress gauge that displays a strangeness/weirdness score from 0 to 10.
  Used in the Phenom Search system to rate how unusual or unexplainable
  an observation is.

  FEATURES:
  - Circular SVG gauge with animated progress
  - Color-coded by score level (green/cyan/purple)
  - Multiple size variants (sm, md, lg)
  - Optional label display
  - Smooth transition animations

  SCORE COLORS:
  - 0-3: Green (low strangeness - easily explainable)
  - 4-6: Cyan (moderate strangeness)
  - 7-10: Purple (high strangeness - very unusual)

  USAGE EXAMPLES:
  <StrangenessGauge :value="7" />
  <StrangenessGauge :value="score" size="lg" />
  <StrangenessGauge :value="3" :showLabel="false" />

  PROPS:
  - value: Strangeness score (0-10, required)
  - size: 'sm' | 'md' | 'lg' (default: 'md')
  - showLabel: Whether to show "Strangeness" label below gauge
  ============================================================================
-->

<script setup>
import { computed } from "vue";

/**
 * StrangenessGauge - Strangeness Score Gauge (0-10)
 * Design System: Phenom Search
 */

defineOptions({ name: "StrangenessGauge" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
const props = defineProps({
  // Strangeness score value (0-10 scale)
  value: {
    type: Number,
    required: true,
    validator: (v) => v >= 0 && v <= 10,
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
  // Whether to show the maximum value (e.g., /10)
  showMaxValue: {
    type: Boolean,
    default: true,
  },
});

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

// Calculate percentage for SVG arc (value out of 10)
const percentage = computed(() => (props.value / 10) * 100);

/**
 * Determine gauge color based on strangeness value
 * Uses a purple/cyan gradient theme for the "weird" aesthetic
 * - Low (0-3): Green - easily explainable
 * - Moderate (4-6): Cyan - somewhat unusual
 * - High (7-10): Purple - very strange/unexplainable
 */
const gaugeColor = computed(() => {
  if (props.value >= 7) return "#a855f7"; // Purple - very strange
  if (props.value >= 4) return "#00F0FF"; // Cyan - moderate
  return "#22c55e"; // Green - low strangeness
});

// =============================================================================
// SIZE CONFIGURATION
// =============================================================================

// Dimension settings for each size variant
const dimensions = {
  sm: { outer: 40, inner: 32, stroke: 4, text: "0.7rem", smallText: "0.5rem" },
  md: { outer: 60, inner: 48, stroke: 6, text: "1rem", smallText: "0.65rem" },
  lg: { outer: 80, inner: 64, stroke: 8, text: "1.25rem", smallText: "0.8rem" },
};

const dim = computed(() => dimensions[props.size]);

// =============================================================================
// SVG CIRCLE CALCULATIONS
// =============================================================================

// Calculate circle circumference (2 * PI * radius)
const circumference = computed(() => 2 * Math.PI * (dim.value.inner / 2));

// Calculate stroke-dashoffset for progress arc
const offset = computed(
  () => circumference.value - (percentage.value / 100) * circumference.value,
);
</script>

<template>
  <div class="flex flex-col items-center gap-2">
    <!-- Gauge Circle Container with Glassmorphic Background -->
    <div
      class="relative rounded-full glassmorphic-gauge"
      :style="{ width: `${dim.outer + 8}px`, height: `${dim.outer + 8}px` }"
    >
      <!-- SVG Gauge (rotated -90deg so arc starts from top) -->
      <svg
        :width="dim.outer"
        :height="dim.outer"
        class="-rotate-90 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <!-- Background Circle (track) -->
        <circle
          :cx="dim.outer / 2"
          :cy="dim.outer / 2"
          :r="dim.inner / 2"
          fill="none"
          stroke="rgba(255, 255, 255, 0.08)"
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
          class="transition-all duration-500 drop-shadow-glow"
        />
      </svg>

      <!-- Centered Value Display with /10 -->
      <div
        class="absolute inset-0 flex flex-col items-center justify-center font-light leading-none"
      >
        <div class="flex items-baseline gap-0.5">
          <span
            :style="{ fontSize: dim.text, color: gaugeColor }"
            class="font-semibold"
            >{{ value }}</span
          >
          <span
            v-if="showMaxValue"
            :style="{ fontSize: dim.smallText }"
            class="text-white/40"
            >/10</span
          >
        </div>
      </div>
    </div>

    <!-- Label (optional) -->
    <span
      v-if="showLabel"
      class="text-[0.65rem] uppercase tracking-wider text-white/50 font-medium"
    >
      Strangeness
    </span>
  </div>
</template>

<style scoped>
.glassmorphic-gauge {
  background: rgba(255, 255, 255, 0.01);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow:
    0 2px 8px rgba(0, 0, 0, 0.1),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.03);
}

.drop-shadow-glow {
  filter: drop-shadow(0 0 2px currentColor);
  opacity: 0.9;
}
</style>
