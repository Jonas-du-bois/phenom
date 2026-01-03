/**
 * Main Application Entry Point
 *
 * Bootstraps the Vue 3 application with:
 * - Pinia for state management
 * - Vue Router for navigation
 * - Leaflet CSS for map components
 * - Global WebSocket connection for real-time updates
 * - Service Worker registration for PWA support
 */

// ============================================================================
// IMPORTS
// ============================================================================

import { createApp, watch } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";

// Leaflet map library styles
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Global application styles
import "./style.css";

// ============================================================================
// APPLICATION BOOTSTRAP
// ============================================================================

// Create Vue application instance
const app = createApp(App);

// Create Pinia store instance for global state management
const pinia = createPinia();

// Install core plugins
app.use(pinia); // State management
app.use(router); // Client-side routing

// ============================================================================
// GLOBAL WEBSOCKET CONNECTION
// ============================================================================

// Initialize a global WebSocket connection that follows auth state
// This enables real-time updates throughout the application
import { useWebSocket } from "@/composables/useWebSocket";
import { useAuthStore } from "@/stores/auth";

try {
  const ws = useWebSocket();
  const authStore = useAuthStore();

  // Auto-connect WebSocket when user is authenticated
  // Auto-disconnect when user logs out
  watch(
    () => authStore.token,
    (token) => {
      if (token) {
        // User is authenticated - establish WebSocket connection
        ws.connect(token).catch(() => {});
      } else {
        // User logged out - close WebSocket connection
        ws.disconnect();
      }
    },
    { immediate: true } // Run immediately on app start
  );
} catch (e) {
  // WebSocket is optional - app works without it
  console.warn("Could not initialize global websocket:", e);
}

// ============================================================================
// MOUNT APPLICATION
// ============================================================================

// Mount Vue app to DOM element with id="app"
app.mount("#app");

// ============================================================================
// SERVICE WORKER REGISTRATION (PWA)
// ============================================================================

// Register service worker for offline support and caching
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/service-worker.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  });
}
