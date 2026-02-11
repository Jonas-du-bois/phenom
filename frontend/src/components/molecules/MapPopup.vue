<!--
  ============================================================================
  MapPopup.vue - Popup card for map markers
  ============================================================================
  
  PURPOSE:
  A popup information card that appears when a map marker is clicked.
  Shows a preview of the observation with image, location, date,
  description, and credibility score. Includes a "View" button.
  
  FEATURES:
  - Image preview with hover zoom effect
  - Location and date display
  - Truncated description (2 lines)
  - Credibility score
  - Close button
  - View button to navigate to full observation
  - Liquid glass design aesthetic with backdrop blur
  - Gradient overlays for depth
  
  USAGE EXAMPLES:
  <MapPopup
    :observation="selectedObservation"
    @view="navigateToObservation"
    @close="closePopup"
  />
  
  PROPS:
  - observation: Object (required) - Observation data to display
  
  EVENTS:
  - @view(observation) - Emitted when "View" button is clicked
  - @close - Emitted when close button is clicked
  ============================================================================
-->

<script setup>
/**
 * MapPopup - Observation popup for map display
 * Design System: Phenom Search
 */
import { computed } from "vue";

defineOptions({ name: "MapPopup" });

// ============================================================================
// PROPS DEFINITION
// ============================================================================
const props = defineProps({
  // The observation data to display in the popup
  observation: {
    type: Object,
    required: true,
  },
});

// ============================================================================
// EVENTS
// ============================================================================
const emit = defineEmits(["view", "close"]);

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

/**
 * Get the main/first image from the observation
 * Returns URL string or null if no images
 */
const mainImage = computed(() => {
  const images = props.observation.images || [];
  if (images.length > 0) {
    return images[0].url || images[0];
  }
  return null;
});

/**
 * Format the observation date in French locale
 * Example: "15 janv. 2024"
 */
const formattedDate = computed(() => {
  const date = new Date(props.observation.date || props.observation.createdAt);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
});
</script>

<template>
  <div
    class="liquid-glass-card relative w-72 rounded-2xl overflow-hidden group"
  >
    <!-- Close Button -->
    <button
      @click="emit('close')"
      class="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm"
      aria-label="Fermer"
    >
      <svg
        class="w-4 h-4 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>

    <!-- Image -->
    <div
      v-if="mainImage"
      class="relative aspect-video bg-black overflow-hidden"
    >
      <img
        :src="mainImage"
        :alt="observation.description"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div
        class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
      ></div>
    </div>

    <!-- Content -->
    <div class="p-4 space-y-3">
      <!-- Location & Date -->
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs text-[#00F0FF] font-semibold truncate">
          📍 {{ observation.location || observation.country }}
        </span>
        <span class="text-xs text-white/50 whitespace-nowrap">
          {{ formattedDate }}
        </span>
      </div>

      <!-- Description -->
      <p class="text-sm text-white/70 line-clamp-2 leading-relaxed">
        {{ observation.description }}
      </p>

      <!-- Credibility & Actions -->
      <div class="flex items-center justify-between pt-1">
        <span class="text-xs text-white/50">
          Crédibilité:
          <span class="text-[#00F0FF] font-bold"
            >{{ observation.credibility || 0 }}/15</span
          >
        </span>

        <!-- View Button -->
        <button
          class="px-3 py-1.5 bg-gradient-to-r from-[#00F0FF]/50 to-[#0099FF]/50 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:from-[#00D0DF] hover:to-[#0077CC] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          @click="emit('view', observation)"
        >
          Voir
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.liquid-glass-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0.02)
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  transition:
    transform 200ms ease,
    box-shadow 200ms ease,
    border-color 200ms ease;
}

.liquid-glass-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 18px 40px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
  border-color: rgba(0, 240, 255, 0.2);
}

.liquid-glass-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      circle at 20% 20%,
      rgba(0, 240, 255, 0.12),
      transparent 35%
    ),
    radial-gradient(circle at 80% 0%, rgba(168, 85, 247, 0.12), transparent 32%);
  mix-blend-mode: screen;
}

.liquid-glass-card::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.04),
    rgba(255, 255, 255, 0)
  );
}
</style>
