import { createRouter, createWebHistory } from "vue-router";

// Check if user is authenticated (support legacy and current keys)
const isAuthenticated = () => {
  return !!localStorage.getItem("phenom_auth_token") || !!localStorage.getItem("token");
};

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Auth route (public)
    {
      path: "/auth",
      name: "auth",
      component: () => import("../views/AuthPage.vue"),
      meta: { requiresAuth: false },
    },

    // Main app routes (protected)
    {
      path: "/",
      component: () => import("../views/AppLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        { path: "", redirect: "/home" },
        { path: "home", name: "home", component: () => import("../views/HomeView.vue") },
        { path: "feed", name: "feed", component: () => import("../views/FeedView.vue") },
        { path: "map", name: "map", component: () => import("../views/MapView.vue") },
        { path: "create", name: "create", component: () => import("../views/CreateObservationView.vue") },
        { path: "observations/:id", name: "observation-detail", component: () => import("../views/ObservationDetailView.vue") },
        { path: "profile/:userId?", name: "profile", component: () => import("../views/UserProfileView.vue") },
      ],
    },

    // Old HomeView route (keep for compatibility) - No auth required for testing
    {
      path: "/old-home",
      name: "old-home",
      component: () => import("../views/OldHomeView.vue"),
      meta: { requiresAuth: false },
    },
    {
      path: "/test",
      name: "test",
      component: () => import("../views/pageTest.vue"),
    },

    // Route 404 Not Found
    {
      path: "/:pathMatch(.*)*",
      name: "404-not-found",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
});

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const userIsAuthenticated = isAuthenticated();

  if (requiresAuth && !userIsAuthenticated) {
    // Redirect to auth if not authenticated
    next("/auth");
  } else if (to.path === "/auth" && userIsAuthenticated) {
    // Redirect to home if already authenticated
    next("/home");
  } else {
    next();
  }
});

export default router;
