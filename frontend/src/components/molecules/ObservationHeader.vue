<script setup>
/**
 * ObservationHeader - Header component for observation detail page
 * Design System: Phenom Search - Liquid Glass Style
 *
 * Fixed header with glassmorphism effect that displays:
 * - Back navigation button
 * - User info (avatar, name) and observation date
 * - Menu button (kebab menu)
 */

// ============================================================================
// IMPORTS
// ============================================================================
import { computed } from "vue";
import BaseAvatar from "../atoms/BaseAvatar.vue";

// ============================================================================
// COMPONENT OPTIONS
// ============================================================================
defineOptions({ name: "ObservationHeader" });

// ============================================================================
// PROPS
// ============================================================================
const props = defineProps({
  /**
   * User object with name and avatar
   * Can be passed directly or extracted from observation
   */
  user: {
    type: Object,
    default: null,
  },
  /**
   * Full observation object
   * Used as fallback to extract user data and date
   */
  observation: {
    type: Object,
    default: null,
  },
  /**
   * Date string to display
   * Falls back to observation.date or observation.createdAt
   */
  date: {
    type: String,
    default: "",
  },
  /**
   * Whether the user is verified
   * POTENTIALLY UNUSED: This prop is defined but never used in the template
   */
  verified: {
    type: Boolean,
    default: false,
  },
  /** Whether to show the back navigation button */
  showBack: {
    type: Boolean,
    default: true,
  },
  /** Whether to show the menu button */
  showMenu: {
    type: Boolean,
    default: true,
  },
});

// ============================================================================
// EMITS
// ============================================================================
const emit = defineEmits(["back", "menu"]);

// ============================================================================
// COMPUTED PROPERTIES
// ============================================================================

/**
 * Formats the observation date in French locale
 * Priority: props.date > observation.date > observation.createdAt
 */
const formattedDate = computed(() => {
  const dateValue =
    props.date || props.observation?.date || props.observation?.createdAt;
  if (!dateValue) return "";
  const date = new Date(dateValue);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

/**
 * Extracts user data from props
 * Priority: props.user > observation.userId > observation.user
 */
const userData = computed(() => {
  if (props.user) return props.user;
  return props.observation?.userId || props.observation?.user || null;
});

/**
 * Gets the user display name, defaults to "Anonyme"
 */
const userName = computed(() => {
  return userData.value?.name || "Anonyme";
});

/**
 * Gets the user avatar URL
 */
const userAvatar = computed(() => {
  return userData.value?.avatar || "";
});
</script>

<template>
  <!-- ========================================================================
       FIXED HEADER CONTAINER
       Positioned at top with safe-area inset for notched devices
       ======================================================================== -->
  <header
    class="fixed top-4 left-0 right-0 z-40 mx-5"
    :style="{ paddingTop: 'env(safe-area-inset-top, 0px)' }"
  >
    <!-- Glassmorphism container -->
    <div class="liquid-glass-header rounded-2xl">
      <div class="flex items-center justify-between px-4 py-2">
        <!-- ================================================================
             BACK BUTTON - Left side navigation
             ================================================================ -->
        <button
          v-if="showBack"
          class="touch-target p-2 -ml-2 text-white/70 hover:text-white transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 active:bg-white/20"
          aria-label="Retour"
          @click="emit('back')"
        >
          <!-- Chevron left icon -->
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <!-- ================================================================
             USER INFO - Center section with avatar, name and date
             ================================================================ -->
        <div class="flex items-center gap-3 flex-1 px-4">
          <BaseAvatar :src="userAvatar" :name="userName" size="sm" />
          <div>
            <p class="text-sm font-medium text-white">{{ userName }}</p>
            <p class="text-xs text-white/50">{{ formattedDate }}</p>
          </div>
        </div>

        <!-- ================================================================
             MENU BUTTON - Right side kebab menu
             ================================================================ -->
        <button
          v-if="showMenu"
          class="touch-target p-2 -mr-2 text-white/70 hover:text-white transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 active:bg-white/20"
          aria-label="Menu"
          @click="emit('menu')"
        >
          <!-- Kebab menu icon (three vertical dots) -->
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <circle cx="12" cy="5" r="1" fill="currentColor" />
            <circle cx="12" cy="19" r="1" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<!-- ============================================================================
     SCOPED STYLES - Glassmorphism / Liquid Glass Effect
     ============================================================================ -->
<style scoped>
/**
 * Liquid glass header styling
 * Creates a frosted glass effect with blur and subtle gradients
 * Same style as the main navbar for visual consistency
 */
.liquid-glass-header {
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.01)
  );
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.6);
  overflow: hidden;
}

/**
 * Overlay gradient pseudo-element
 * Adds depth and light reflection effect to the glass
 */
.liquid-glass-header::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0)
  );
  mix-blend-mode: overlay;
}

/**
 * Touch target base styles
 * Ensures proper stacking context for interactive elements
 */
.touch-target {
  position: relative;
  z-index: 1;
}

/**
 * POTENTIALLY REDUNDANT: These hover/active styles duplicate Tailwind classes
 * The button already has hover:bg-white/10 and active:bg-white/20 in the template
 */
.touch-target:hover {
  background: rgba(255, 255, 255, 0.1);
}

.touch-target:active {
  background: rgba(255, 255, 255, 0.2);
}
</style>
