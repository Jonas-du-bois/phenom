/**
 * Service Worker for Phenom PWA
 *
 * Handles:
 * - Asset caching for offline support
 * - Cache versioning and cleanup
 * - Network-first with cache fallback strategy
 * - Web Push notifications
 * - Notification click handling
 * - Background location sync (periodic sync API)
 */

// ============================================================================
// CACHE CONFIGURATION
// ============================================================================

/** Cache version - increment to invalidate old caches */
const CACHE_NAME = "phenom-pwa-v3";

/** Static assets to cache on install for offline support */
const ASSETS_TO_CACHE = ["/", "/index.html", "/manifest.json"];

/** API base URL for backend requests */
const API_BASE = self.location.origin;

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

  const action = event.action;
  const data = event.notification.data || {};

  // Handle action buttons
  if (action === "dismiss") {
    // User dismissed - mark as read if we have the notification ID
    if (data.notificationId) {
      markNotificationAsRead(data.notificationId);
    }
    return;
  }

  // Get target URL from notification data, default to alerts page
  const url = data.url || "/alerts";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Try to focus existing window with the target URL
        for (const client of clientList) {
          if (client.url.includes(url) && "focus" in client) {
            return client.focus();
          }
        }
        // Try to focus any existing alerts tab
        for (const client of clientList) {
          if (client.url.includes("/alerts") && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Otherwise open new window
        if (clients.openWindow) return clients.openWindow(url);
      })
  );

  // Mark notification as read when clicked
  if (data.notificationId) {
    markNotificationAsRead(data.notificationId);
  }
});

// ============================================================================
// BACKGROUND SYNC FOR LOCATION UPDATES
// ============================================================================

/**
 * Periodic sync event - Send location to backend in background
 * This runs even when the app is closed (Chrome Android only)
 */
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "location-sync") {
    event.waitUntil(sendBackgroundLocation());
  }
});

/**
 * Regular sync event - Fallback for one-time sync requests
 */
self.addEventListener("sync", (event) => {
  if (event.tag === "location-sync-once") {
    event.waitUntil(sendBackgroundLocation());
  }
});

/**
 * Send current location to backend
 * Uses cached auth token and location settings from IndexedDB/localStorage
 */
async function sendBackgroundLocation() {
  try {
    // Get stored auth token and settings
    const authData = await getStoredAuthData();
    if (!authData || !authData.token) {
      console.log("[SW] No auth token for background location sync");
      return;
    }

    // Get current position
    const position = await getCurrentPosition();
    if (!position) {
      console.log("[SW] Could not get position for background sync");
      return;
    }

    // Get alert radius from settings
    const settings = await getStoredSettings();
    const radiusKm = settings?.alertRadius || 50;

    // Send to backend
    const response = await fetch(`${API_BASE}/api/v1/users/me/location`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authData.token}`,
      },
      body: JSON.stringify({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        radiusKm,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("[SW] Background location sync success:", result.data);

      // Store last sync time
      await storeLastSyncTime();
    } else {
      console.warn("[SW] Background location sync failed:", response.status);
    }
  } catch (error) {
    console.error("[SW] Background location sync error:", error);
  }
}

/**
 * Get current position using Geolocation API
 * Note: Geolocation in service workers has limited support
 */
function getCurrentPosition() {
  return new Promise((resolve) => {
    if (!("geolocation" in self.navigator)) {
      // Fallback: try to get from stored last known position
      getStoredLastPosition().then(resolve);
      return;
    }

    self.navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => {
        console.warn("[SW] Geolocation error:", error);
        // Fallback to stored position
        getStoredLastPosition().then(resolve);
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  });
}

/**
 * Mark a notification as read via API
 */
async function markNotificationAsRead(notificationId) {
  try {
    const authData = await getStoredAuthData();
    if (!authData || !authData.token) return;

    await fetch(`${API_BASE}/api/v1/notifications/${notificationId}/read`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authData.token}`,
      },
    });
  } catch (error) {
    console.warn("[SW] Failed to mark notification as read:", error);
  }
}

// ============================================================================
// STORAGE HELPERS (using Cache API as simple key-value store)
// ============================================================================

const SW_DATA_CACHE = "phenom-sw-data-v1";

async function getStoredAuthData() {
  try {
    const cache = await caches.open(SW_DATA_CACHE);
    const response = await cache.match("/sw-data/auth");
    if (response) {
      return await response.json();
    }
  } catch (e) {}
  return null;
}

async function getStoredSettings() {
  try {
    const cache = await caches.open(SW_DATA_CACHE);
    const response = await cache.match("/sw-data/settings");
    if (response) {
      return await response.json();
    }
  } catch (e) {}
  return null;
}

async function getStoredLastPosition() {
  try {
    const cache = await caches.open(SW_DATA_CACHE);
    const response = await cache.match("/sw-data/last-position");
    if (response) {
      const data = await response.json();
      // Return in a position-like format
      return {
        coords: {
          latitude: data.lat,
          longitude: data.lng,
        },
      };
    }
  } catch (e) {}
  return null;
}

async function storeLastSyncTime() {
  try {
    const cache = await caches.open(SW_DATA_CACHE);
    await cache.put(
      "/sw-data/last-sync",
      new Response(JSON.stringify({ timestamp: Date.now() }))
    );
  } catch (e) {}
}

// ============================================================================
// MESSAGE HANDLER - Receive data from main thread
// ============================================================================

/**
 * Message event - Receive auth token and settings from main thread
 * This allows the main app to pass data to the service worker for background tasks
 */
self.addEventListener("message", (event) => {
  if (!event.data) return;

  const { type, payload } = event.data;

  switch (type) {
    case "STORE_AUTH":
      // Store auth token for background requests
      caches.open(SW_DATA_CACHE).then((cache) => {
        cache.put(
          "/sw-data/auth",
          new Response(JSON.stringify(payload))
        );
      });
      break;

    case "STORE_SETTINGS":
      // Store settings (including alertRadius)
      caches.open(SW_DATA_CACHE).then((cache) => {
        cache.put(
          "/sw-data/settings",
          new Response(JSON.stringify(payload))
        );
      });
      break;

    case "STORE_POSITION":
      // Store last known position for fallback
      caches.open(SW_DATA_CACHE).then((cache) => {
        cache.put(
          "/sw-data/last-position",
          new Response(JSON.stringify(payload))
        );
      });
      break;

    case "CLEAR_AUTH":
      // Clear auth data on logout
      caches.open(SW_DATA_CACHE).then((cache) => {
        cache.delete("/sw-data/auth");
      });
      break;
  }
});
