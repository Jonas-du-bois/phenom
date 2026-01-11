<!--
  ============================================================================
  AlertsPage.vue - Notifications and Alerts Page
  ============================================================================
  
  PURPOSE:
  Displays notifications and alerts for the user, including nearby observations
  and system notifications. Supports location-based alerts.

  FEATURES:
  - List of notifications with mark-as-read functionality
  - Location permission request banner
  - Mark all as read action
  - Nearby observation alerts (location-based)
  - Push notification settings
  - Empty state when no alerts
  - Persistent notifications via backend API
  - Background location updates

  ROUTE: /alerts (main tab, requires auth)
  ============================================================================
-->

<template>
  <AppLayout>
    <template #header>
      <PageHeader title="Alertes">
        <template #right>
          <IconButton
            v-if="notificationStore.notifications.length"
            variant="ghost"
            size="sm"
            aria-label="Marquer tout comme lu"
            @click="markAllRead"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </IconButton>
        </template>
      </PageHeader>
    </template>

    <div class="alerts-page">
      <!-- Location permission banner -->
      <div
        v-if="!locationEnabled"
        class="mx-4 mt-4 p-4 bg-[var(--phenom-black)] border border-white/10 rounded-xl"
      >
        <div class="flex items-start gap-3">
          <svg
            class="w-6 h-6 text-[var(--phenom-cyan)] shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <div class="flex-1">
            <h3 class="text-white font-medium">Activez la localisation</h3>
            <p class="text-white/60 text-sm mt-1">
              Pour recevoir des alertes sur les observations proches de vous.
            </p>
          </div>
        </div>
        <BaseButton
          variant="primary"
          size="sm"
          class="w-full mt-3"
          @click="requestLocation"
        >
          Activer
        </BaseButton>
      </div>

      <!-- Radius selector dropdown -->
      <div v-if="locationEnabled" class="px-4 py-4">
        <div class="flex items-center justify-between">
          <span class="text-sm text-white/60">Rayon d'alerte</span>
          <div class="relative">
            <button
              @click="showRadiusDropdown = !showRadiusDropdown"
              class="flex items-center gap-2 bg-[#12151C] border border-white/10 rounded-lg px-4 py-2 text-sm text-[#00F0FF] font-medium focus:outline-none focus:border-[#00F0FF]/50 cursor-pointer"
            >
              <span>{{ alertRadius }} km</span>
              <svg
                class="w-4 h-4 text-white/40 transition-transform"
                :class="{ 'rotate-180': showRadiusDropdown }"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <!-- Dropdown panel -->
            <div
              v-if="showRadiusDropdown"
              class="absolute right-0 top-full mt-2 w-64 bg-[#12151C] border border-white/10 rounded-xl p-4 shadow-xl z-50"
            >
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs text-white/40"
                  >{{ radiusOptions[0] }} km</span
                >
                <span class="text-lg text-[#00F0FF] font-bold"
                  >{{ alertRadius }} km</span
                >
                <span class="text-xs text-white/40"
                  >{{ radiusOptions[radiusOptions.length - 1] }} km</span
                >
              </div>
              <RangeInput
                v-model="alertRadius"
                :min="radiusOptions[0]"
                :max="radiusOptions[radiusOptions.length - 1]"
                :step="5"
              />
              <button
                @click="showRadiusDropdown = false"
                class="w-full mt-3 py-2 text-sm text-white/60 hover:text-white transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Backdrop to close dropdown -->
      <div
        v-if="showRadiusDropdown"
        class="fixed inset-0 z-40"
        @click="showRadiusDropdown = false"
      />

      <!-- Loading -->
      <template v-if="notificationStore.loading">
        <div class="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </template>

      <!-- Empty state -->
      <template v-else-if="!notificationStore.notifications.length">
        <div class="flex items-center justify-center py-12 px-4">
          <EmptyState
            icon="alerts"
            title="Aucune alerte"
            message="Vous serez notifié des observations proches de vous."
          />
        </div>
      </template>

      <!-- Alerts list -->
      <template v-else>
        <div class="divide-y divide-white/5">
          <div
            v-for="alert in notificationStore.sortedNotifications"
            :key="alert.id"
            class="alert-item px-4 py-4 flex gap-3 transition-colors"
            :class="{ 'bg-[#00F0FF]/5': !alert.read }"
            @click="viewAlert(alert)"
          >
            <!-- Observation thumbnail -->
            <div
              class="w-16 h-16 rounded-xl overflow-hidden bg-[#12151C] shrink-0"
            >
              <img
                v-if="alert.observation?.imageUrl"
                :src="alert.observation.imageUrl"
                alt=""
                class="w-full h-full object-cover"
              />
              <div
                v-else
                class="w-full h-full flex items-center justify-center"
              >
                <svg
                  class="w-6 h-6 text-white/20"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="1.5"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span
                  v-if="!alert.read"
                  class="w-2 h-2 rounded-full bg-[#00F0FF] shrink-0"
                />
                <h3 class="text-white font-medium truncate">
                  {{
                    alert.observation?.title ||
                    alert.title ||
                    "Nouvelle observation"
                  }}
                </h3>
              </div>

              <p class="text-white/60 text-sm mt-1 line-clamp-2">
                {{ alert.message }}
              </p>

              <div class="flex items-center gap-3 mt-2 text-xs text-white/40">
                <span v-if="alert.distance" class="flex items-center gap-1">
                  <svg
                    class="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                  {{ alert.distance }}km
                </span>
                <span>{{ formatTime(alert.createdAt) }}</span>
              </div>
            </div>

            <!-- Arrow -->
            <svg
              class="w-5 h-5 text-white/30 shrink-0 self-center"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notification";
import { useRouter } from "vue-router";
import { AppLayout } from "@/components/layout";
import { PageHeader } from "@/components/organisms";
import {
  IconButton,
  BaseButton,
  RangeInput,
  LoadingSpinner,
  EmptyState,
} from "@/components/atoms";

defineOptions({ name: "AlertsPage" });

const router = useRouter();
const authStore = useAuthStore();
const notificationStore = useNotificationStore();

// WebSocket for real-time updates
import { useWebSocket } from "@/composables/useWebSocket";

const { messages: wsMessages, connect } = useWebSocket();

// Local state
const locationEnabled = ref(false);
const alertRadius = ref(50);
const userLocation = ref(null);
const locationCheckIntervalId = ref(null);
const showRadiusDropdown = ref(false);
const LOCATION_CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

// Settings sync (from SettingsPage localStorage key)
const nearbyAlertsEnabled = ref(true);

// Predefined radius options (in km)
const radiusOptions = [5, 10, 25, 50, 100, 150, 200, 300, 500];

/**
 * Load settings from localStorage
 */
const loadSettingsFromStorage = () => {
  try {
    const raw = localStorage.getItem("phenom_settings");
    if (!raw) return;
    const s = JSON.parse(raw);
    if (typeof s.nearbyAlerts === "boolean")
      nearbyAlertsEnabled.value = s.nearbyAlerts;
    if (typeof s.alertRadius === "number") alertRadius.value = s.alertRadius;
  } catch (e) {
    // ignore
  }
};

/**
 * Save alert radius to localStorage for persistence
 */
const saveAlertRadius = () => {
  try {
    const raw = localStorage.getItem("phenom_settings");
    const s = raw ? JSON.parse(raw) : {};
    s.alertRadius = alertRadius.value;
    localStorage.setItem("phenom_settings", JSON.stringify(s));
    // Dispatch custom event for same-tab listeners (SettingsPage)
    window.dispatchEvent(new CustomEvent("phenom-settings-changed"));
  } catch (e) {
    // ignore
  }
};

/**
 * Send current location to backend
 */
const sendLocationToBackend = async () => {
  if (!userLocation.value) return;

  try {
    const token = authStore.token;
    if (!token) return;

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || ""}/api/v1/users/me/location`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lat: userLocation.value.lat,
          lng: userLocation.value.lng,
          radiusKm: alertRadius.value,
        }),
      }
    );

    if (response.ok) {
      const result = await response.json();
      // If new notifications were created, refresh the list
      if (result.data?.newNotifications > 0) {
        await notificationStore.refresh();
      }
    }

    // Send position and settings to service worker for background sync
    sendToServiceWorker("STORE_POSITION", userLocation.value);
    sendToServiceWorker("STORE_SETTINGS", { alertRadius: alertRadius.value });
  } catch (e) {
    console.warn("Failed to send location to backend", e);
  }

  // Record last check time locally
  try {
    localStorage.setItem(
      "phenom_last_location_check",
      new Date().toISOString()
    );
  } catch (e) {
    // empty catch block: ignore error
  }
};

/**
 * Send message to service worker
 */
const sendToServiceWorker = (type, payload) => {
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type, payload });
  }
};

/**
 * Get current location and send to backend
 */
const getCurrentLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      sendLocationToBackend();
    },
    (error) => {
      console.error("Location error:", error);
    }
  );
};

/**
 * Request location permission
 */
const requestLocation = async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    });

    userLocation.value = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    };
    locationEnabled.value = true;

    // Send location and fetch notifications
    await sendLocationToBackend();
    await notificationStore.refresh();

    // Register for background sync if supported
    registerBackgroundSync();
  } catch (error) {
    console.error("Location permission denied:", error);
  }
};

/**
 * Register background sync for location updates
 */
const registerBackgroundSync = async () => {
  if (
    "serviceWorker" in navigator &&
    "periodicSync" in ServiceWorkerRegistration.prototype
  ) {
    try {
      const registration = await navigator.serviceWorker.ready;

      // Check permission
      const status = await navigator.permissions.query({
        name: "periodic-background-sync",
      });

      if (status.state === "granted") {
        await registration.periodicSync.register("location-sync", {
          minInterval: 30 * 60 * 1000, // 30 minutes minimum
        });
        console.log("Periodic background sync registered for location");
      }
    } catch (err) {
      console.warn("Periodic sync not available:", err);
    }
  }
};

/**
 * Start periodic location checks
 */
const startLocationBackgroundLoop = () => {
  if (locationCheckIntervalId.value)
    clearInterval(locationCheckIntervalId.value);
  if (!navigator.geolocation || !locationEnabled.value) return;

  // Run immediately
  getCurrentLocation();

  // Set interval
  locationCheckIntervalId.value = setInterval(() => {
    try {
      navigator.permissions
        ?.query({ name: "geolocation" })
        .then((res) => {
          if (res.state === "granted") getCurrentLocation();
        })
        .catch(() => getCurrentLocation());
    } catch (e) {
      getCurrentLocation();
    }
  }, LOCATION_CHECK_INTERVAL_MS);
};

/**
 * Stop periodic location checks
 */
const stopLocationBackgroundLoop = () => {
  if (locationCheckIntervalId.value) {
    clearInterval(locationCheckIntervalId.value);
    locationCheckIntervalId.value = null;
  }
};

// Watch alert radius changes and persist + send to backend
watch(alertRadius, (newRadius, oldRadius) => {
  if (newRadius !== oldRadius) {
    saveAlertRadius();
    // Debounce sending to backend
    if (userLocation.value) {
      sendLocationToBackend();
    }
  }
});

// Watch WebSocket messages for real-time notification updates
watch(wsMessages, (msgs) => {
  if (!msgs || !msgs.length) return;
  const latest = msgs[msgs.length - 1];

  const channel = latest.channel;
  const payload = latest.data || latest;

  // Handle nearby observation events from WebSocket
  if (channel === "observations" || payload?.type?.includes("observation")) {
    const eventType = payload.type || "";

    if (eventType.includes("nearby")) {
      // New notification from backend - refresh the list to get persisted version
      notificationStore.refresh();
    }
  }
});

onMounted(async () => {
  // Check if location is already enabled
  if (navigator.geolocation) {
    navigator.permissions?.query({ name: "geolocation" }).then((result) => {
      locationEnabled.value = result.state === "granted";
      if (locationEnabled.value) {
        getCurrentLocation();
      }
    });
  }

  // Load settings
  loadSettingsFromStorage();

  // Fetch notifications from API
  await notificationStore.fetchNotifications();

  // Connect WebSocket for real-time updates
  if (nearbyAlertsEnabled.value) {
    connect();
  }

  // Start periodic location checks if allowed
  if (locationEnabled.value) {
    startLocationBackgroundLoop();
  }

  // Watch permission changes
  try {
    navigator.permissions?.query({ name: "geolocation" }).then((perm) => {
      perm.onchange = () => {
        locationEnabled.value = perm.state === "granted";
        if (locationEnabled.value) {
          startLocationBackgroundLoop();
        } else {
          stopLocationBackgroundLoop();
        }
      };
    });
  } catch (e) {
    // empty catch block: ignore error
  }

  // Listen to storage changes (SettingsPage updates localStorage)
  const onStorage = (e) => {
    if (e.key !== "phenom_settings") return;
    loadSettingsFromStorage();
  };
  window.addEventListener("storage", onStorage);

  // Also listen to custom event for same-tab updates
  const onSettingsChange = () => {
    loadSettingsFromStorage();
  };
  window.addEventListener("phenom-settings-changed", onSettingsChange);
  window.__phenom_alerts_storage_handler = onStorage;
  window.__phenom_alerts_settings_handler = onSettingsChange;
});

onUnmounted(() => {
  // Remove storage listener
  const handler = window.__phenom_alerts_storage_handler;
  if (handler) window.removeEventListener("storage", handler);

  // Remove custom event listener
  const settingsHandler = window.__phenom_alerts_settings_handler;
  if (settingsHandler)
    window.removeEventListener("phenom-settings-changed", settingsHandler);

  // Stop location loop
  stopLocationBackgroundLoop();
});

/**
 * View an alert and mark as read
 */
const viewAlert = async (alert) => {
  // Mark as read via API
  if (!alert.read) {
    try {
      await notificationStore.markAsRead(alert.id);
    } catch (e) {
      console.error("Failed to mark as read:", e);
    }
  }

  // Navigate to observation
  const observationId = alert.observation?._id || alert.observationId;
  if (observationId) {
    router.push(`/observation/${observationId}`);
  }
};

/**
 * Mark all alerts as read
 */
const markAllRead = async () => {
  try {
    await notificationStore.markAllAsRead();
  } catch (e) {
    console.error("Failed to mark all as read:", e);
  }
};

/**
 * Format relative time
 */
const formatTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const d = new Date(date);
  const diff = Math.floor((now - d) / 1000);

  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;

  return d.toLocaleDateString("fr-FR");
};
</script>

<style scoped>
.alerts-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
