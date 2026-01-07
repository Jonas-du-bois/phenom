<!--
  ============================================================================
  AppLayout.vue - Main Application Layout Component
  ============================================================================
  
  PURPOSE:
  The root layout component that wraps all pages of the application.
  Provides consistent structure, navigation, and global UI features
  like toast notifications and loading overlays.

  FEATURES:
  - Flexible page structure with header slot and main content area
  - Bottom tab bar navigation (optional, can be hidden)
  - Global toast notification system (success, error, warning, info)
  - Global loading overlay with optional message
  - iOS safe area insets handling (notch, home indicator)
  - Provides toast and loading APIs to all child components via Vue's provide/inject

  STRUCTURE:
  ┌─────────────────────────────┐
  │      Header Slot            │
  ├─────────────────────────────┤
  │                             │
  │      Main Content           │
  │      (default slot)         │
  │                             │
  ├─────────────────────────────┤
  │    Bottom Tab Bar           │
  └─────────────────────────────┘

  USAGE EXAMPLES:
  <AppLayout>
    <template #header><PageHeader title="Home" /></template>
    <HomePage />
  </AppLayout>

  <AppLayout :showTabBar="false">
    <FullScreenPage />
  </AppLayout>

  PROPS:
  - showTabBar: Whether to display bottom navigation (default: true)
  - alertCount: Badge count for alerts tab
  - hasContentPadding: Whether to add padding-top for fixed header (default: true)

  PROVIDES (inject in children):
  - toast: { show(options), remove(id) } - Toast notification methods
  - loading: { set(isLoading, message?) } - Global loading control

  TOAST OPTIONS:
  toast.show({
    type: 'success' | 'error' | 'warning' | 'info',
    title: 'Optional Title',
    message: 'Required message',
    duration: 4000  // ms, 0 for persistent
  })
  ============================================================================
-->

<template>
  <div class="app-layout min-h-screen bg-[#000000] flex flex-col">
    <!-- Page Header slot - for page-specific headers -->
    <slot name="header" />

    <!-- 
      Main Content Area
      - flex-1: Takes all available vertical space
      - overflow-y-auto: Enables scrolling for long content
      - overscroll-contain: Prevents scroll chaining to parent
      - Padding top accounts for fixed header + iOS safe area (if hasContentPadding)
      - Padding bottom accounts for tab bar + iOS safe area
    -->
    <main
      class="flex-1 overflow-y-auto overscroll-contain"
      :style="{
        paddingTop: hasContentPadding
          ? 'calc(2.5rem + env(safe-area-inset-top, 0px))'
          : undefined,
        paddingBottom: showTabBar
          ? 'calc(5.5rem + env(safe-area-inset-bottom, 0px))'
          : undefined,
      }"
    >
      <!-- Default slot for page content -->
      <slot />
    </main>

    <!-- Bottom Tab Bar Navigation (conditional) -->
    <BottomTabBar v-if="showTabBar" :alert-count="alertCount" />

    <!-- 
      =====================================================================
      TOAST NOTIFICATIONS
      =====================================================================
      Teleported to body to ensure proper stacking above all content.
      Uses TransitionGroup for animated list transitions.
    -->
    <Teleport to="body">
      <TransitionGroup
        name="toast"
        tag="div"
        class="fixed top-4 left-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        :style="{ top: 'calc(1rem + env(safe-area-inset-top, 0px))' }"
      >
        <!-- Individual Toast Items -->
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item p-4 rounded-xl shadow-xl pointer-events-auto"
          :class="toastClasses[toast.type]"
        >
          <div class="flex items-start gap-3">
            <!-- Toast Icon (varies by type) -->
            <div class="shrink-0 mt-0.5">
              <!-- Success: Checkmark -->
              <svg
                v-if="toast.type === 'success'"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <!-- Error: X mark -->
              <svg
                v-else-if="toast.type === 'error'"
                class="w-5 h-5"
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
              <!-- Warning: Triangle exclamation -->
              <svg
                v-else-if="toast.type === 'warning'"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <!-- Info: Circle info (default) -->
              <svg
                v-else
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <!-- Toast Content (title + message) -->
            <div class="flex-1 min-w-0">
              <p v-if="toast.title" class="font-medium">{{ toast.title }}</p>
              <p class="text-sm opacity-90">{{ toast.message }}</p>
            </div>

            <!-- Close/Dismiss Button -->
            <button
              @click="removeToast(toast.id)"
              class="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
            >
              <svg
                class="w-4 h-4"
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
          </div>
        </div>
      </TransitionGroup>
    </Teleport>

    <!-- 
      =====================================================================
      GLOBAL LOADING OVERLAY
      =====================================================================
      Full-screen loading indicator for blocking operations.
      Teleported to body with high z-index.
    -->
    <Teleport to="body">
      <Transition name="fade">
        <div
          v-if="globalLoading"
          class="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm flex items-center justify-center"
        >
          <div class="text-center">
            <LoadingSpinner size="lg" />
            <!-- Optional loading message -->
            <p v-if="loadingMessage" class="mt-4 text-white/60">
              {{ loadingMessage }}
            </p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, provide, onMounted } from "vue";
import { BottomTabBar } from "@/components/organisms";
import { LoadingSpinner } from "@/components/atoms";

/**
 * AppLayout - Main Application Layout Component
 * Design System: Phenom Search
 *
 * Provides the overall page structure, navigation,
 * and global UI features (toasts, loading overlay).
 */

defineOptions({ name: "AppLayout" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  // Whether to display the bottom tab bar navigation
  showTabBar: {
    type: Boolean,
    default: true,
  },
  // Badge count for the alerts/notifications tab
  alertCount: {
    type: Number,
    default: 0,
  },
  // Whether to add padding-top for fixed header (disable for full-screen pages)
  hasContentPadding: {
    type: Boolean,
    default: true,
  },
});

// =============================================================================
// TOAST NOTIFICATION SYSTEM
// =============================================================================

// Array of active toast notifications
const toasts = ref([]);

// Auto-incrementing ID for unique toast identification
let toastId = 0;

/**
 * Tailwind classes for each toast type
 * - success: Green background
 * - error: Red background
 * - warning: Yellow background with dark text
 * - info: Cyan (brand color) background with dark text
 */
const toastClasses = {
  success: "bg-green-500/90 text-white",
  error: "bg-red-500/90 text-white",
  warning: "bg-yellow-500/90 text-black",
  info: "bg-[#00F0FF]/90 text-black",
};

/**
 * Show a toast notification
 * @param {Object} options - Toast configuration
 * @param {string} options.type - 'success' | 'error' | 'warning' | 'info'
 * @param {string} options.title - Optional title text
 * @param {string} options.message - Required message text
 * @param {number} options.duration - Auto-dismiss time in ms (0 = persistent)
 * @returns {number} Toast ID for manual removal
 */
const showToast = ({ type = "info", title = "", message, duration = 4000 }) => {
  const id = ++toastId;
  toasts.value.push({ id, type, title, message });

  // Auto-remove after duration (unless duration is 0)
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration);
  }

  return id;
};

/**
 * Remove a toast notification by ID
 * @param {number} id - Toast ID to remove
 */
const removeToast = (id) => {
  const index = toasts.value.findIndex((t) => t.id === id);
  if (index !== -1) {
    toasts.value.splice(index, 1);
  }
};

// =============================================================================
// GLOBAL LOADING OVERLAY
// =============================================================================

// Whether the loading overlay is visible
const globalLoading = ref(false);

// Optional message to display during loading
const loadingMessage = ref("");

/**
 * Show or hide the global loading overlay
 * @param {boolean} loading - Whether to show the overlay
 * @param {string} message - Optional message to display
 */
const setGlobalLoading = (loading, message = "") => {
  globalLoading.value = loading;
  loadingMessage.value = message;
};

// =============================================================================
// PROVIDE TO CHILDREN
// =============================================================================

// Make toast and loading APIs available to all descendant components
provide("toast", { show: showToast, remove: removeToast });
provide("loading", { set: setGlobalLoading });

// =============================================================================
// iOS SAFE AREA HANDLING
// =============================================================================

/**
 * Set CSS custom properties for safe area insets
 * Used to handle iPhone notch, home indicator, etc.
 */
onMounted(() => {
  document.documentElement.style.setProperty(
    "--sat",
    "env(safe-area-inset-top)"
  );
  document.documentElement.style.setProperty(
    "--sab",
    "env(safe-area-inset-bottom)"
  );
  document.documentElement.style.setProperty(
    "--sal",
    "env(safe-area-inset-left)"
  );
  document.documentElement.style.setProperty(
    "--sar",
    "env(safe-area-inset-right)"
  );
});
</script>

<style scoped>
/* =============================================================================
   TOAST ANIMATIONS
   ============================================================================= */

/* Enter animation: slide down and fade in */
.toast-enter-active {
  transition: all 0.3s ease;
}

/* Leave animation: faster, slide right */
.toast-leave-active {
  transition: all 0.2s ease;
}

/* Initial state when entering */
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

/* Final state when leaving */
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

/* Smooth repositioning when list changes */
.toast-move {
  transition: transform 0.3s ease;
}

/* =============================================================================
   FADE TRANSITION (for loading overlay)
   ============================================================================= */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
