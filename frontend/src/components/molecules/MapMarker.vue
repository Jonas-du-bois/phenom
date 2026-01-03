<!--
  ============================================================================
  MapMarker.vue - Custom map marker for observations
  ============================================================================
  
  PURPOSE:
  A custom SVG map marker component used on the observation map.
  The marker color changes based on the observation's credibility score.
  Includes a pulsing animation when selected.
  
  FEATURES:
  - Custom pin/drop shape with inner UFO icon
  - Color coded by credibility:
    - Cyan (#00F0FF): High credibility (>= 10)
    - Amber (#f59e0b): Medium credibility (>= 5)
    - Red (#ef4444): Low credibility (< 5)
  - Larger scale and z-index when selected
  - Pulsing circle animation when selected
  - Drop shadow for depth
  
  USAGE EXAMPLES:
  <MapMarker
    :observation="observationData"
    :selected="isSelected"
    @click="handleMarkerClick"
  />
  
  PROPS:
  - observation: Object (required) - Observation data with credibility
  - selected: Boolean (default: false) - Whether marker is selected
  
  EVENTS:
  - @click(observation) - Emitted when marker is clicked
  ============================================================================
-->

<script setup>
/**
 * MapMarker - Custom map marker component
 * Design System: Phenom Search
 */
import { computed } from "vue";

defineOptions({ name: "MapMarker" });

// ============================================================================
// PROPS DEFINITION
// ============================================================================
const props = defineProps({
  // The observation data object
  observation: {
    type: Object,
    required: true,
  },
  // Whether this marker is currently selected
  selected: {
    type: Boolean,
    default: false,
  },
});

// ============================================================================
// EVENTS
// ============================================================================
const emit = defineEmits(["click"]);

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================
/**
 * Determine marker color based on credibility score
 * - High (>= 10): Cyan - highly credible
 * - Medium (>= 5): Amber - moderately credible
 * - Low (< 5): Red - low credibility
 */
const markerColor = computed(() => {
  const credibility = props.observation.credibility || 0;
  if (credibility >= 10) return "#00F0FF"; // Cyan - high credibility
  if (credibility >= 5) return "#f59e0b"; // Amber - medium credibility
  return "#ef4444"; // Red - low credibility
});
</script>

<template>
  <div
    :class="[
      'relative cursor-pointer transition-transform',
      { 'scale-125 z-10': selected },
    ]"
    @click="emit('click', observation)"
  >
    <!-- Pin -->
    <svg
      width="32"
      height="40"
      viewBox="0 0 32 40"
      fill="none"
      class="drop-shadow-lg"
    >
      <!-- Pin body -->
      <path
        d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z"
        :fill="markerColor"
      />
      <!-- Inner circle -->
      <circle cx="16" cy="16" r="8" fill="black" fill-opacity="0.3" />
      <!-- UFO icon -->
      <path
        d="M16 11c-3.5 0-6 1.5-6 3.5s2.5 3.5 6 3.5 6-1.5 6-3.5-2.5-3.5-6-3.5zm0 5c-1.1 0-2-.45-2-1s.9-1 2-1 2 .45 2 1-.9 1-2 1z"
        fill="white"
      />
    </svg>

    <!-- Pulse animation when selected -->
    <div
      v-if="selected"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full animate-ping"
      :style="{ backgroundColor: `${markerColor}30` }"
    />
  </div>
</template>
