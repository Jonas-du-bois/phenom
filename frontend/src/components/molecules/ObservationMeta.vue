<script setup>
/**
 * ObservationMeta - Observation metadata display component
 * Design System: Phenom Search
 *
 * Displays detailed metadata about an observation including:
 * - Credibility and Strangeness gauges
 * - Location (clickable to open map)
 * - Date and time
 * - Duration of observation
 * - UFO shapes observed
 * - Observer types
 * - Phenomena reported
 */

// ============================================================================
// IMPORTS
// ============================================================================
import { computed } from "vue";
import BaseBadge from "../atoms/BaseBadge.vue";
import GlassTooltip from "../atoms/GlassTooltip.vue";
import CredibilityGauge from "../atoms/CredibilityGauge.vue";
import StrangenessGauge from "../atoms/StrangenessGauge.vue";
import { getUfoShapeByCode, getUfoShapeLabel } from "@/constants/ufoShapes";
import { getObserverTypeByCode, getObserverTypeLabel } from "@/constants/observerTypes";
import { PHENOMENA } from "@/constants/phenomena";

// ============================================================================
// COMPONENT OPTIONS
// ============================================================================
defineOptions({ name: "ObservationMeta" });

// ============================================================================
// PROPS
// ============================================================================
const props = defineProps({
  /** The observation object containing all metadata to display */
  observation: {
    type: Object,
    required: true,
  },
});

// ============================================================================
// EMITS
// ============================================================================
/** Emitted when user clicks on the location section (to open map) */
const emit = defineEmits(["locationClick"]);

// ============================================================================
// TOOLTIP HELPERS
// ============================================================================

/**
 * Get shape tooltip content
 * @param {string} code - Shape code
 * @returns {string} Full French label
 */
const getShapeTooltip = (code) => {
  return getUfoShapeLabel(code);
};

/**
 * Get shape icon
 * @param {string} code - Shape code
 * @returns {string} Emoji icon
 */
const getShapeIcon = (code) => {
  const shape = getUfoShapeByCode(code);
  return shape?.icon || "🛸";
};

/**
 * Get observer type tooltip content
 * @param {string} code - Observer type code
 * @returns {string} Full French label
 */
const getObserverTooltip = (code) => {
  return getObserverTypeLabel(code);
};

/**
 * Get observer type icon
 * @param {string} code - Observer type code
 * @returns {string} Emoji icon
 */
const getObserverIcon = (code) => {
  const observer = getObserverTypeByCode(code);
  return observer?.icon || "👁️";
};

/**
 * Get phenomenon tooltip content
 * @param {string} code - Phenomenon code
 * @returns {string} Full French label
 */
const getPhenomenonTooltip = (code) => {
  const phenomenon = PHENOMENA.find(p => p.code === code);
  return phenomenon?.label || code;
};

/**
 * Get phenomenon icon
 * @param {string} code - Phenomenon code
 * @returns {string} Emoji icon
 */
const getPhenomenonIcon = (code) => {
  const phenomenon = PHENOMENA.find(p => p.code === code);
  return phenomenon?.icon || "✨";
};

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

/**
 * Formats the observation duration into a human-readable string
 * Handles seconds, minutes, and hours with proper French labels
 * @returns {string} Formatted duration (e.g., "45 secondes", "2min 30s", "1h 15min")
 */
const formattedDuration = computed(() => {
  const seconds = props.observation.duration || 0;
  if (seconds < 60) return `${seconds} secondes`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}min ${remainingSeconds}s`
      : `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}min`;
});

/**
 * Formats the observation date and time for display
 * Uses French locale for date formatting
 * @returns {{ date: string, time: string }} Object with formatted date and time strings
 */
const formattedDateTime = computed(() => {
  const date = new Date(props.observation.date || props.observation.createdAt);
  // Format date with full weekday and month names in French
  const dateStr = date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  // Use observation.time if available, otherwise extract time from date
  const timeStr =
    props.observation.time ||
    date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  return { date: dateStr, time: timeStr };
});
</script>

<template>
  <!-- ========================================================================
       MAIN CONTAINER
       Transparent background to integrate with liquid glass cards
       ======================================================================== -->
  <div class="px-4 py-4 space-y-4">
    <!-- ======================================================================
         GAUGES SECTION - Credibility & Strangeness indicators
         Displayed side by side, centered
         ====================================================================== -->
    <div class="flex items-center justify-center gap-8 py-4">
      <CredibilityGauge :value="observation.credibility || 0" size="lg" />
      <StrangenessGauge :value="observation.strangeness || 0" size="lg" />
    </div>

    <!-- ======================================================================
         METADATA LIST - Location, Date, Duration
         ====================================================================== -->
    <div class="space-y-3">
      <!-- ================================================================
           LOCATION - Clickable to emit locationClick event
           Displays location/country and optional locale
           ================================================================ -->
      <button
        class="w-full flex items-start gap-3 text-left hover:bg-white/5 p-2 -mx-2 transition-colors"
        @click="emit('locationClick')"
      >
        <span class="text-lg">📍</span>
        <div>
          <p class="text-xs uppercase tracking-wider text-white/40 mb-1">
            Localisation
          </p>
          <p class="text-sm text-white">
            {{ observation.location || observation.country }}
          </p>
          <!-- Optional locale/neighborhood info -->
          <p v-if="observation.locale" class="text-xs text-[#00F0FF]">
            {{ observation.locale }}
          </p>
        </div>
      </button>

      <!-- ================================================================
           DATE & TIME - Static display (not clickable)
           Shows formatted date with weekday and time
           ================================================================ -->
      <div class="flex items-start gap-3 p-2 -mx-2">
        <span class="text-lg">📅</span>
        <div>
          <p class="text-xs uppercase tracking-wider text-white/40 mb-1">
            Date & Heure
          </p>
          <!-- Capitalize first letter of weekday -->
          <p class="text-sm text-white capitalize">
            {{ formattedDateTime.date }}
          </p>
          <p class="text-sm text-white/60">{{ formattedDateTime.time }}</p>
        </div>
      </div>

      <!-- ================================================================
           DURATION - Only shown if observation has duration
           ================================================================ -->
      <div v-if="observation.duration" class="flex items-start gap-3 p-2 -mx-2">
        <span class="text-lg">⏱️</span>
        <div>
          <p class="text-xs uppercase tracking-wider text-white/40 mb-1">
            Durée
          </p>
          <p class="text-sm text-white">{{ formattedDuration }}</p>
        </div>
      </div>
    </div>

    <!-- ======================================================================
         UFO SHAPES - Badges showing observed UFO shapes
         Only displayed if ufoShapes array exists and has items
         ====================================================================== -->
    <div v-if="observation.ufoShapes?.length" class="pt-2">
      <p class="text-xs uppercase tracking-wider text-white/40 mb-3">
        🛸 Formes observées
      </p>
      <div class="flex flex-wrap gap-2">
        <GlassTooltip
          v-for="shape in observation.ufoShapes"
          :key="shape"
          :content="getShapeTooltip(shape)"
          :icon="getShapeIcon(shape)"
        >
          <BaseBadge variant="cyan" class="badge-interactive">
            {{ shape }}
          </BaseBadge>
        </GlassTooltip>
      </div>
    </div>

    <!-- ======================================================================
         OBSERVER TYPES - Badges showing who observed (e.g., pilot, military)
         Only displayed if observerTypes array exists and has items
         ====================================================================== -->
    <div v-if="observation.observerTypes?.length" class="pt-2">
      <p class="text-xs uppercase tracking-wider text-white/40 mb-3">
        👁️ Types d'observateurs
      </p>
      <div class="flex flex-wrap gap-2">
        <GlassTooltip
          v-for="type in observation.observerTypes"
          :key="type"
          :content="getObserverTooltip(type)"
          :icon="getObserverIcon(type)"
        >
          <BaseBadge variant="default" class="badge-interactive">
            {{ type }}
          </BaseBadge>
        </GlassTooltip>
      </div>
    </div>

    <!-- ======================================================================
         PHENOMENA - Badges showing reported phenomena (e.g., lights, sound)
         Only displayed if phenomena array exists and has items
         ====================================================================== -->
    <div v-if="observation.phenomena?.length" class="pt-2">
      <p class="text-xs uppercase tracking-wider text-white/40 mb-3">
        ✨ Phénomènes
      </p>
      <div class="flex flex-wrap gap-2">
        <GlassTooltip
          v-for="phenomenon in observation.phenomena"
          :key="phenomenon"
          :content="getPhenomenonTooltip(phenomenon)"
          :icon="getPhenomenonIcon(phenomenon)"
        >
          <BaseBadge variant="default" class="badge-interactive">
            {{ phenomenon }}
          </BaseBadge>
        </GlassTooltip>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Interactive badge styling (with tooltip) */
.badge-interactive {
  transition: all 0.2s ease;
  cursor: pointer;
}

.badge-interactive:hover {
  filter: drop-shadow(0 0 8px rgba(0, 240, 255, 0.3));
  transform: translateY(-1px);
}

.badge-interactive:active {
  transform: scale(0.97);
}
</style>
