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
import CredibilityGauge from "../atoms/CredibilityGauge.vue";
import StrangenessGauge from "../atoms/StrangenessGauge.vue";

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
       Black background with vertical spacing between sections
       ======================================================================== -->
  <div class="px-4 py-4 space-y-4 bg-[#000000]">
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
        <BaseBadge
          v-for="shape in observation.ufoShapes"
          :key="shape"
          variant="cyan"
        >
          {{ shape }}
        </BaseBadge>
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
        <BaseBadge
          v-for="type in observation.observerTypes"
          :key="type"
          variant="default"
        >
          {{ type }}
        </BaseBadge>
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
        <BaseBadge
          v-for="phenomenon in observation.phenomena"
          :key="phenomenon"
          variant="default"
        >
          {{ phenomenon }}
        </BaseBadge>
      </div>
    </div>
  </div>
</template>
