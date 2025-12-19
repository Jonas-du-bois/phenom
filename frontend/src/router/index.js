import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";

// Check if user is authenticated
const isAuthenticated = () => {
  return (
    !!localStorage.getItem("phenom_auth_token") ||
    !!localStorage.getItem("token")
  );
};

// Check if user is admin
const isAdmin = () => {
  try {
    const user = JSON.parse(localStorage.getItem("phenom_user") || "{}");
    return user?.role === "admin";
  } catch {
    return false;
  }
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(to, from, savedPosition) {
    // Si on revient en arrière, restaurer la position
    if (savedPosition) {
      return savedPosition;
    }

    // Si la route a un hash, laisser le composant gérer le scroll
    // On scroll juste en haut et le composant scrollera vers le hash
    if (to.hash) {
      return { top: 0, behavior: "instant" };
    }

    // Par défaut, toujours scroller en haut avec animation douce
    return { top: 0, behavior: "smooth" };
  },
  routes: [
    // ============ PUBLIC ROUTES ============
    {
      path: "/login",
      name: "login",
      component: () => import("@/views/LoginPage.vue"),
      meta: { guest: true },
    },
    {
      path: "/old-home",
      name: "old-home",
      component: () => import("@/views/Tests.vue"),
      meta: { public: true },
    },
    {
      path: "/signup",
      name: "signup",
      component: () => import("@/views/SignupPage.vue"),
      meta: { guest: true },
    },
    {
      path: "/auth",
      redirect: "/login",
    },

    // ============ PROTECTED ROUTES ============
    // Feed (Home)
    {
      path: "/",
      redirect: "/feed",
    },
    {
      path: "/feed",
      name: "feed",
      component: () => import("@/views/FeedPage.vue"),
      meta: { requiresAuth: true },
    },

    // Camera / Create observation
    {
      path: "/camera",
      name: "camera",
      component: () => import("@/views/CameraPage.vue"),
      meta: { requiresAuth: true },
    },

    // Observation detail
    {
      path: "/observation/:id",
      name: "observation-detail",
      component: () => import("@/views/ObservationDetailPage.vue"),
      meta: { requiresAuth: true },
      props: true,
    },

    // Map
    {
      path: "/map",
      name: "map",
      component: () => import("@/views/MapPage.vue"),
      meta: { requiresAuth: true },
    },

    // Alerts
    {
      path: "/alerts",
      name: "alerts",
      component: () => import("@/views/AlertsPage.vue"),
      meta: { requiresAuth: true },
    },

    // Profile
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
      props: true,
    },

    // Settings
    {
      path: "/settings",
      name: "settings",
      component: () => import("@/views/SettingsPage.vue"),
      meta: { requiresAuth: true },
    },

    // Admin
    {
      path: "/admin",
      name: "admin",
      component: () => import("@/views/AdminPage.vue"),
      meta: { requiresAuth: true, requiresAdmin: true },
    },

    // ============ LEGACY ROUTES (redirects) ============
    {
      path: "/home",
      redirect: "/feed",
    },
    {
      path: "/create",
      redirect: "/camera",
    },
    {
      path: "/observations/:id",
      redirect: (to) => `/observation/${to.params.id}`,
    },

    // ============ 404 ============
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("@/views/NotFoundPage.vue"),
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin);
  const isGuestOnly = to.matched.some((record) => record.meta.guest);
  const isPublic = to.matched.some((record) => record.meta.public);

  const userIsAuthenticated = isAuthenticated();
  const userIsAdmin = isAdmin();

  console.log("[Router Guard]", {
    path: to.path,
    requiresAuth,
    isGuestOnly,
    isPublic,
    userIsAuthenticated,
  });

  // Public routes - always accessible
  if (isPublic) {
    return next();
  }

  // Redirect authenticated users away from guest-only pages (login/signup)
  if (isGuestOnly && userIsAuthenticated) {
    return next("/feed");
  }

  // Redirect non-authenticated users to login
  if (requiresAuth && !userIsAuthenticated) {
    return next({ path: "/login", query: { redirect: to.fullPath } });
  }

  // Redirect non-admin users away from admin pages
  if (requiresAdmin && !userIsAdmin) {
    return next("/feed");
  }

  next();
});

export default router;
