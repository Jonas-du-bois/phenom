/**
 * usePageTransition Composable
 *
 * Provides intelligent page transition logic based on navigation direction.
 * Automatically determines if the user is navigating deeper into the app
 * or going back, applying appropriate slide animations.
 *
 * FEATURES:
 * - Directional transitions based on route depth
 * - Scroll position preservation when going back
 *
 * TRANSITION TYPES:
 * - page: Default fade + scale (same level navigation)
 * - page-slide-forward: Slide left when going deeper (e.g., feed → detail)
 * - page-slide-back: Slide right when going back (e.g., detail → feed)
 *
 * USAGE:
 * ```vue
 * <script setup>
 * import { usePageTransition } from '@/composables'
 * const { transitionName } = usePageTransition()
 * </script>
 *
 * <template>
 *   <router-view v-slot="{ Component }">
 *     <transition :name="transitionName" mode="out-in">
 *       <component :is="Component" :key="$route.path" />
 *     </transition>
 *   </router-view>
 * </template>
 * ```
 */

import { ref, watch } from "vue";
import { useRouter } from "vue-router";

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Available transition names
 * Must match CSS classes defined in style.css
 */
export const PAGE_TRANSITIONS = {
  DEFAULT: "page",
  SLIDE_FORWARD: "page-slide-forward",
  SLIDE_BACK: "page-slide-back",
};

// ============================================================================
// SCROLL POSITION STORAGE (Module-level singleton)
// ============================================================================

/**
 * Store scroll positions by route path
 * Persists across component instances
 */
const scrollPositions = new Map();

/**
 * Save scroll position for a route
 * @param {string} path - Route path
 */
export const saveScrollPosition = (path) => {
  if (!path) return;

  const main = document.querySelector("main");
  let position;

  if (main && main.scrollTop > 0) {
    // Scroll is on the main element
    position = { x: main.scrollLeft, y: main.scrollTop, target: "main" };
  } else if (window.scrollY > 0) {
    // Scroll is on the window
    position = { x: window.scrollX, y: window.scrollY, target: "window" };
  } else {
    // Check main anyway (might be at 0)
    position = {
      x: main?.scrollLeft || 0,
      y: main?.scrollTop || 0,
      target: main ? "main" : "window",
    };
  }

  scrollPositions.set(path, position);
  console.log("[Scroll] Saved position for", path, position);
};

/**
 * Get saved scroll position for a route
 * @param {string} path - Route path
 * @returns {{ x: number, y: number } | null}
 */
export const getScrollPosition = (path) => {
  const pos = scrollPositions.get(path) || null;
  console.log("[Scroll] Get position for", path, pos);
  return pos;
};

/**
 * Restore scroll position for a route
 * @param {string} path - Route path
 */
export const restoreScrollPosition = (path) => {
  const saved = scrollPositions.get(path);
  if (!saved || saved.y === 0) {
    console.log("[Scroll] No saved position for", path);
    return;
  }

  // Wait for DOM to update after transition
  requestAnimationFrame(() => {
    setTimeout(() => {
      if (saved.target === "main") {
        const main = document.querySelector("main");
        if (main) {
          main.scrollTo({ left: saved.x, top: saved.y, behavior: "instant" });
          console.log("[Scroll] Restored to main for", path, saved);
        }
      } else {
        window.scrollTo({ left: saved.x, top: saved.y, behavior: "instant" });
        console.log("[Scroll] Restored to window for", path, saved);
      }
    }, 50); // Small delay to ensure DOM is ready
  });
};

/**
 * Clear saved scroll position for a route
 * @param {string} path - Route path
 */
export const clearScrollPosition = (path) => {
  scrollPositions.delete(path);
};

// ============================================================================
// COMPOSABLE
// ============================================================================

/**
 * Page transition composable
 * @returns {Object} Transition state and utilities
 */
export function usePageTransition() {
  const router = useRouter();

  // ============================================================================
  // STATE
  // ============================================================================

  /**
   * Current transition name - reactively updated on navigation
   */
  const transitionName = ref(PAGE_TRANSITIONS.DEFAULT);

  /**
   * Previous route path for comparison
   */
  const previousPath = ref(null);

  /**
   * Flag indicating if we're going back (for scroll restoration)
   */
  const isGoingBack = ref(false);

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Calculate route depth based on path segments
   * Deeper routes have more segments
   * @param {string} path - Route path
   * @returns {number} Number of path segments
   * @example getRouteDepth('/feed') => 1
   * @example getRouteDepth('/observation/123') => 2
   */
  const getRouteDepth = (path) => {
    if (!path) return 0;
    return path.split("/").filter(Boolean).length;
  };

  /**
   * Determine transition direction based on route depths
   * @param {string} toPath - Destination route path
   * @param {string} fromPath - Origin route path
   * @returns {string} Transition name to use
   */
  const determineTransition = (toPath, fromPath) => {
    if (!fromPath) {
      return PAGE_TRANSITIONS.DEFAULT;
    }

    const toDepth = getRouteDepth(toPath);
    const fromDepth = getRouteDepth(fromPath);

    if (toDepth > fromDepth) {
      // Going deeper into the app (e.g., list → detail)
      return PAGE_TRANSITIONS.SLIDE_FORWARD;
    } else if (toDepth < fromDepth) {
      // Going back (e.g., detail → list)
      return PAGE_TRANSITIONS.SLIDE_BACK;
    }

    // Same level navigation (e.g., tab switching)
    return PAGE_TRANSITIONS.DEFAULT;
  };

  // ============================================================================
  // WATCHERS
  // ============================================================================

  /**
   * Watch route changes and update transition name accordingly
   */
  watch(
    () => router.currentRoute.value.path,
    (to, from) => {
      const toDepth = getRouteDepth(to);
      const fromDepth = getRouteDepth(from);

      // Mark if we're going back (for scroll restoration in router)
      isGoingBack.value = fromDepth > toDepth;

      transitionName.value = determineTransition(to, from);
      previousPath.value = from;
    },
  );

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  return {
    /** Current transition name (reactive) */
    transitionName,

    /** Previous route path */
    previousPath,

    /** Whether we're navigating back */
    isGoingBack,

    /** Available transition constants */
    PAGE_TRANSITIONS,

    /** Utility to calculate route depth */
    getRouteDepth,

    /** Utility to manually determine transition */
    determineTransition,

    /** Scroll position utilities */
    saveScrollPosition,
    getScrollPosition,
    clearScrollPosition,

    /**
     * Force a specific transition for the next navigation
     * @param {string} name - Transition name from PAGE_TRANSITIONS
     */
    setTransition: (name) => {
      transitionName.value = name;
    },
  };
}
