/**
 * Service Worker for Phenom PWA
 *
 * Handles:
 * - Asset caching for offline support
 * - Cache versioning and cleanup
 * - Network-first with cache fallback strategy
 * - Web Push notifications
 * - Notification click handling
 */

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

/** Cache version - increment to invalidate old caches */
const CACHE_NAME = "phenom-pwa-v2";

/** Static assets to cache on install for offline support */
const ASSETS_TO_CACHE = ["/", "/index.html", "/manifest.json"];

// ============================================================================
// SERVICE WORKER LIFECYCLE EVENTS
// ============================================================================

/**
 * Install event - Cache static assets
 * Called when service worker is first installed or updated
 */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting()) // Activate immediately, don't wait for old SW to finish
  );
});

/**
 * Activate event - Clean up old caches
 * Called when service worker becomes active (after install)
 */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            // Delete any caches that don't match current version
            if (key !== CACHE_NAME) return caches.delete(key);
          })
        )
      )
      .then(() => self.clients.claim()) // Take control of all clients immediately
  );
});

/**
 * Fetch event - Network-first with cache fallback strategy
 * Attempts network request, falls back to cache if offline
 * 
 * IMPORTANT: Only handle same-origin requests to avoid CORS issues
 * External resources (fonts, APIs, CDNs) should not be intercepted
 */
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  
  // Skip cross-origin requests entirely - let browser handle them normally
  // This prevents CORS issues with Google Fonts, external APIs, CDNs, etc.
  if (url.origin !== self.location.origin) {
    return; // Don't call event.respondWith() - let request pass through
  }
  
  // Skip API requests - they should always go to network
  if (url.pathname.startsWith('/api/')) {
    return;
  }
  
  // Skip WebSocket upgrade requests
  if (event.request.headers.get('upgrade') === 'websocket') {
    return;
  }
  
  // For same-origin static assets: cache-first, then network
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(event.request)
        .then((response) => {
          // Don't cache non-successful responses
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          // Clone the response for caching
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          // Return cached version if network fails (offline)
          return cached;
        });
    })
  );
});

// ============================================================================
// WEB PUSH NOTIFICATION HANDLERS
// ============================================================================

/**
 * Push event - Display incoming push notifications
 * Parses notification payload and shows system notification
 */
self.addEventListener("push", (event) => {
  // Parse push data (JSON format expected)
  const payload = event.data?.json?.() || {};

  const title = payload.title || "Phenom";
  const options = {
    body: payload.body || "",
    data: payload.data || {}, // Custom data for click handling
    tag: payload.tag || "phenom-alert", // Group notifications with same tag
    renotify: true, // Notify even if same tag exists
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

/**
 * Notification click event - Handle user interaction with notifications
 * Opens or focuses the alerts page when notification is clicked
 */
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Get target URL from notification data, default to alerts page
  const url = event.notification.data?.url || "/alerts";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing alerts tab
        for (const client of clientList) {
          if (client.url.includes("/alerts") && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});
