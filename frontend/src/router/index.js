/**
 * Vue Router Configuration
 *
 * Defines all application routes with:
 * - Public routes (login, signup)
 * - Protected routes (require authentication)
 * - Admin routes (require admin role)
 * - Legacy redirects for backwards compatibility
 * - Navigation guards for access control
 *
 * Route meta options:
 * - guest: true      → Only accessible when NOT logged in
 * - public: true     → Accessible by anyone, anytime
 * - requiresAuth: true → Requires user to be logged in
 * - requiresAdmin: true → Requires user to have admin role
 */

import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { getScrollPosition, saveScrollPosition, restoreScrollPosition } from "@/composables/usePageTransition";

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

/**
 * Check if user is authenticated
 * Checks both new and legacy token storage keys for compatibility
 * @returns {boolean} True if user has valid auth token
 */
const isAuthenticated = () => {
  return (
    !!localStorage.getItem("phenom_auth_token") ||
    !!localStorage.getItem("token") // Legacy key for backwards compatibility
  );
};

/**
 * Check if current user has admin role
 * @returns {boolean} True if user is an admin
 */
const isAdmin = () => {
  try {
    const user = JSON.parse(localStorage.getItem("phenom_user") || "{}");
    return user?.role === "admin";
  } catch {
    return false;
  }
};

// ============================================================================
// ROUTER INSTANCE
// ============================================================================

const router = createRouter({
  // Use HTML5 History mode for clean URLs (no hash)
  history: createWebHistory(import.meta.env.BASE_URL),

  /**
   * Scroll behavior configuration
   * Returns false to disable native scroll behavior - we handle it manually
   * for proper support of the main content container (not window)
   */
  scrollBehavior() {
    // Return false to prevent any automatic scrolling
    // Scroll restoration is handled by afterEach hook with restoreScrollPosition
    return false;
  },

  // ============================================================================
  // ROUTE DEFINITIONS
  // ============================================================================

  routes: [
    // ========================================================================
    // PUBLIC ROUTES - Accessible without authentication
    // ========================================================================

    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginPage.vue"),
      meta: { guest: true }, // Redirect to feed if already logged in
    },
    {
      path: "/old-home",
      name: "old-home",
      component: () => import("@/views/Tests.vue"),
      meta: { public: true }, // Test page, always accessible
    },
    {
      path: "/signup",
      name: "signup",
      component: () => import("@/views/SignupPage.vue"),
      meta: { guest: true }, // Redirect to feed if already logged in
    },
    {
      path: "/auth",
      redirect: "/login", // Legacy auth path redirects to login
    },

    // ========================================================================
    // PROTECTED ROUTES - Require authentication
    // ========================================================================

    // ---- Feed (Home) ----
    {
      path: "/",
      redirect: "/feed", // Root redirects to main feed
    },
    {
      path: "/feed",
      name: "feed",
      component: () => import("@/views/FeedPage.vue"),
      meta: { requiresAuth: true },
    },

    // ---- Camera / Create Observation ----
    {
      path: "/camera",
      name: "camera",
      component: () => import("@/views/CameraPage.vue"),
      meta: { requiresAuth: true },
    },

    // ---- Observation Detail ----
    {
      path: "/observation/:id",
      name: "observation-detail",
      component: () => import("@/views/ObservationDetailPage.vue"),
      meta: { requiresAuth: true },
      props: true, // Pass route params as component props
    },

    // ---- Edit Observation ----
    {
      path: "/observation/:id/edit",
      name: "observation-edit",
      component: () => import("@/views/ObservationEditPage.vue"),
      meta: { requiresAuth: true },
      props: true, // Pass route params as component props
    },

    // ---- Map View ----
    {
      path: "/map",
      name: "map",
      component: () => import("@/views/MapPage.vue"),
      meta: { requiresAuth: true },
    },

    // ---- Alerts / Notifications ----
    {
      path: "/alerts",
      name: "alerts",
      component: () => import("@/views/AlertsPage.vue"),
      meta: { requiresAuth: true },
    },

    // ---- User Profile ----
    {
      path: "/profile",
      name: "profile",
      component: () => import("@/views/ProfilePage.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/profile/:userId",
      name: "user-profile",
      component: () => import("@/views/ProfilePage.vue"),
      meta: { requiresAuth: true },
      props: true, // View another user's profile
    },

    // ---- Settings ----
    {
      path: "/settings",
      name: "settings",
      component: () => import("@/views/SettingsPage.vue"),
      meta: { requiresAuth: true },
    },

    // ---- Admin Panel ----
    {
      path: "/admin",
      name: "admin",
      component: () => import("@/views/AdminPage.vue"),
      meta: { requiresAuth: true, requiresAdmin: true }, // Requires admin role
    },

    // ========================================================================
    // LEGACY ROUTES - Redirects for backwards compatibility
    // ========================================================================

    {
      path: "/home",
      redirect: "/feed", // Old home path
    },
    {
      path: "/create",
      redirect: "/camera", // Old create path
    },
    {
      path: "/observations/:id",
      redirect: (to) => `/observation/${to.params.id}`, // Plural to singular
    },

    // ========================================================================
    // 404 NOT FOUND - Catch-all for unknown routes
    // ========================================================================

    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundPage.vue"),
    },
  ],
});

// ============================================================================
// NAVIGATION GUARD
// ============================================================================

/**
 * Global navigation guard - runs before each route change
 * Handles authentication and authorization checks
 * Also saves scroll position when navigating deeper
 */
router.beforeEach((to, from, next) => {
  // ---- SCROLL POSITION SAVING ----
  // Save scroll position when going from a shallow page to a deeper one
  // (e.g., /feed -> /observation/123)
  if (from.path) {
    const getDepth = (path) => path?.split("/").filter(Boolean).length || 0;
    const toDepth = getDepth(to.path);
    const fromDepth = getDepth(from.path);
    
    // Going deeper: save current scroll position
    if (toDepth > fromDepth) {
      saveScrollPosition(from.path);
    }
  }

  // Extract route meta requirements
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
  const isGuestOnly = to.matched.some((record) => record.meta.guest);
  const isPublic = to.matched.some((record) => record.meta.public);

  // Check current user status
  const userIsAuthenticated = isAuthenticated();
  const userIsAdmin = isAdmin();

  // Debug logging for navigation events
  console.log("[Router Guard]", {
    path: to.path,
    requiresAuth,
    isGuestOnly,
    isPublic,
    userIsAuthenticated,
  });

  // ---- ACCESS CONTROL LOGIC ----

  // Public routes: always accessible (e.g., test pages)
  if (isPublic) {
    return next();
  }

  // Guest-only routes: redirect authenticated users to feed
  // (prevents logged-in users from seeing login/signup pages)
  if (isGuestOnly && userIsAuthenticated) {
    return next("/feed");
  }

  // Protected routes: redirect unauthenticated users to login
  // Saves intended destination in query for post-login redirect
  if (requiresAuth && !userIsAuthenticated) {
    return next({ path: "/login", query: { redirect: to.fullPath } });
  }

  // Admin routes: redirect non-admin users to feed
  if (requiresAdmin && !userIsAdmin) {
    return next("/feed");
  }

  // All checks passed: proceed with navigation
  next();
});

/**
 * After navigation hook - handles scroll position restoration
 * Runs after the navigation has completed and transition starts
 */
router.afterEach((to, from) => {
  const getDepth = (path) => path?.split("/").filter(Boolean).length || 0;
  const toDepth = getDepth(to.path);
  const fromDepth = getDepth(from?.path);
  const isGoingBack = from?.path && fromDepth > toDepth;
  
  // After transition completes, handle scroll
  setTimeout(() => {
    if (isGoingBack) {
      // Restore saved scroll position when going back
      restoreScrollPosition(to.path);
    } else {
      // Scroll to top for new pages
      const main = document.querySelector("main.overflow-y-auto");
      if (main) {
        main.scrollTo({ top: 0, behavior: "instant" });
      } else {
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    }
  }, 350); // Slightly after transition (300ms)
});

export default router;
