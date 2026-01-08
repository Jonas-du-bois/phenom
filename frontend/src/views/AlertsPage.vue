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

  ROUTE: /alerts (main tab, requires auth)
  ============================================================================
-->

<template>
  <AppLayout>
    <template #header>
      <PageHeader title="Alertes">
        <template #right>
          <IconButton
            v-if="alerts.length"
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

      <!-- Radius selector -->
      <div v-if="locationEnabled" class="px-4 py-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-white/60">Rayon d'alerte</span>
          <span class="text-sm text-[#00F0FF] font-medium"
            >{{ alertRadius }} km</span
          >
        </div>
        <RangeInput v-model="alertRadius" :min="5" :max="100" :step="5" />
      </div>

      <!-- Loading -->
      <template v-if="loading">
        <div class="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </template>

      <!-- Empty state -->
      <template v-else-if="!alerts.length">
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
            v-for="alert in alerts"
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
                  {{ alert.observation?.title || "Nouvelle observation" }}
                </h3>
              </div>

              <p class="text-white/60 text-sm mt-1 line-clamp-2">
                {{ alert.message }}
              </p>

              <div class="flex items-center gap-3 mt-2 text-xs text-white/40">
                <span class="flex items-center gap-1">
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

// WebSocket (WsMini PubSub)
import { useWebSocket } from "@/composables/useWebSocket";

const {
  messages: wsMessages,
  connect,
  disconnect,
} = useWebSocket();

const alerts = ref([]);
const loading = ref(true);
const locationEnabled = ref(false);
const alertRadius = ref(50);
const userLocation = ref(null);
const authStore = useAuthStore();
const locationCheckIntervalId = ref(null);
const LOCATION_CHECK_INTERVAL_MS = 30 * 60 * 1000; // 30 minutes

// Settings sync (from SettingsPage localStorage key)
const nearbyAlertsEnabled = ref(true);

/**
 * Show native browser/phone notification
 * Uses the Notification API for PWA push-like notifications
 */
const showNativeNotification = async (alert) => {
  // Check if notifications are supported and permission is granted
  if (!("Notification" in window)) {
    console.warn("Notifications not supported");
    return;
  }

  // Request permission if not already granted
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }

  if (Notification.permission !== "granted") {
    console.warn("Notification permission denied");
    return;
  }

  try {
    // Use service worker registration for persistent notifications on mobile
    const registration = await navigator.serviceWorker?.ready;
    
    const notificationOptions = {
      body: alert.message,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-72x72.png",
      tag: `observation-${alert.id}`, // Group similar notifications
      renotify: true,
      vibrate: [200, 100, 200], // Vibration pattern for mobile
      data: {
        url: `/observation/${alert.observation?._id || alert.id}`,
        observationId: alert.observation?._id || alert.id,
      },
      actions: [
        { action: "view", title: "Voir" },
        { action: "dismiss", title: "Ignorer" },
      ],
    };

    // Add image if available
    if (alert.observation?.imageUrl) {
      notificationOptions.image = alert.observation.imageUrl;
    }

    if (registration) {
      // Use service worker for better mobile support
      await registration.showNotification(
        `Observation à ${alert.distance ? alert.distance + " km" : "proximité"}`,
        notificationOptions
      );
    } else {
      // Fallback to regular Notification API
      new Notification(
        `Observation à ${alert.distance ? alert.distance + " km" : "proximité"}`,
        notificationOptions
      );
    }
  } catch (error) {
    console.error("Failed to show notification:", error);
  }
};

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

  await fetchAlerts();

  // Load settings and decide whether to connect
  loadSettingsFromStorage();
  if (nearbyAlertsEnabled.value) {
    connect();
  }

  // Start periodic background location checks if allowed
  const startLocationBackgroundLoop = () => {
    // stop any existing loop
    if (locationCheckIntervalId.value)
      clearInterval(locationCheckIntervalId.value);
    if (!navigator.geolocation || !locationEnabled.value) return;
    // run immediately then set interval
    getCurrentLocation();
    locationCheckIntervalId.value = setInterval(() => {
      // Check permission then fetch
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

  const stopLocationBackgroundLoop = () => {
    if (locationCheckIntervalId.value) {
      clearInterval(locationCheckIntervalId.value);
      locationCheckIntervalId.value = null;
    }
  };

  // Start/stop based on current permission
  if (locationEnabled.value) startLocationBackgroundLoop();

  // Watch changes to locationEnabled to manage the loop
  const onLocationEnabledChange = (val) => {
    if (val) startLocationBackgroundLoop();
    else stopLocationBackgroundLoop();
  };

  // expose for cleanup
  window.__phenom_alerts_start_location_loop = startLocationBackgroundLoop;
  window.__phenom_alerts_stop_location_loop = stopLocationBackgroundLoop;

  // Listen to storage changes (SettingsPage updates localStorage)
  const onStorage = (e) => {
    if (e.key !== "phenom_settings") return;
    const prev = nearbyAlertsEnabled.value;
    loadSettingsFromStorage();
    // connect/disconnect when toggle changed
    if (!prev && nearbyAlertsEnabled.value) connect();
    if (prev && !nearbyAlertsEnabled.value) {
      disconnect();
      alerts.value = [];
    }
  };

  window.addEventListener("storage", onStorage);

  // watch permission changes via Permissions API (if supported)
  try {
    navigator.permissions?.query({ name: "geolocation" }).then((perm) => {
      perm.onchange = () => {
        locationEnabled.value = perm.state === "granted";
        onLocationEnabledChange(locationEnabled.value);
      };
    });
  } catch (e) {}

  // store listener for cleanup
  window.__phenom_alerts_storage_handler = onStorage;
});

onUnmounted(() => {
  // remove storage listener
  const handler = window.__phenom_alerts_storage_handler;
  if (handler) window.removeEventListener("storage", handler);
  // cleanup location loop
  if (typeof window.__phenom_alerts_stop_location_loop === "function") {
    window.__phenom_alerts_stop_location_loop();
  }
  // Ne pas déconnecter le WebSocket ici — la connexion est gérée globalement
});

const getCurrentLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      fetchAlerts();
      // send location to backend for proximity checks (if authenticated)
      (async () => {
        try {
          const token = authStore.token;
          if (!token) return;
          await fetch(
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
        } catch (e) {
          console.warn("Failed to send location to backend", e);
        }
      })();
      // record last check time locally
      try {
        localStorage.setItem(
          "phenom_last_location_check",
          new Date().toISOString()
        );
      } catch (e) {}
    },
    (error) => {
      console.error("Location error:", error);
    }
  );
};

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

    await fetchAlerts();
  } catch (error) {
    console.error("Location permission denied:", error);
  }
};

const fetchAlerts = async () => {
  loading.value = true;

  try {
    // TODO: Replace with actual API call
    // const response = await alertService.getAlerts({
    //   lat: userLocation.value?.lat,
    //   lng: userLocation.value?.lng,
    //   radius: alertRadius.value
    // })

    // Mock data for now
    alerts.value = [];
  } catch (error) {
    console.error("Fetch alerts error:", error);
  } finally {
    loading.value = false;
  }
};

// Helper: distance (haversine) in km
const computeDistanceKm = (lat1, lon1, lat2, lon2) => {
  if ([lat1, lon1, lat2, lon2].some((v) => v === null || v === undefined))
    return null;
  const toRad = (v) => (v * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Track processed message IDs to avoid duplicates
const processedMessageIds = ref(new Set());

// Watch WebSocket messages and create alerts when an observation event is received
watch(
  wsMessages,
  (msgs) => {
    if (!msgs || !msgs.length) return;
    const latest = msgs[msgs.length - 1];

    // Create unique message ID to avoid processing same message twice
    const msgId = latest.receivedAt || JSON.stringify(latest);
    if (processedMessageIds.value.has(msgId)) return;
    processedMessageIds.value.add(msgId);

    // Support different shapes depending on source: either wrapper { channel, data, receivedAt }
    // or raw message { type, data, timestamp }
    const channel = latest.channel;
    const payload = latest.data || latest;

    // Only handle observations channel / observation events
    if (channel === "observations" || payload?.type?.includes("observation")) {
      const event = payload;
      const eventType = event.type || "";
      
      // Process new observations and nearby alerts
      // Backend sends "observation:created" for new obs and "observation:nearby" for proximity alerts
      if (!eventType.includes("created") && !eventType.includes("nearby")) return;
      
      const obs = event.data || event;
      const obsId = obs?._id || obs?.id;

      // Check if we already have this observation in alerts
      if (obsId && alerts.value.some((a) => a.id === obsId)) return;

      // If observation has coordinates, compute distance
      let distance = null;
      const obsCoords =
        obs?.coordinates || obs?.location?.coordinates || obs?.locationPoint?.coordinates || obs?.coords;
      if (userLocation.value && obsCoords) {
        // MongoDB stores as [lng, lat], so we need to handle both formats
        let lat, lng;
        if (Array.isArray(obsCoords)) {
          // GeoJSON format: [lng, lat]
          lng = obsCoords[0];
          lat = obsCoords[1];
        } else {
          lat = obsCoords.lat ?? obsCoords.latitude;
          lng = obsCoords.lng ?? obsCoords.longitude;
        }
        
        if (lat !== undefined && lng !== undefined) {
          distance = computeDistanceKm(
            userLocation.value.lat,
            userLocation.value.lng,
            lat,
            lng
          );
          if (distance !== null) distance = Math.round(distance * 10) / 10; // 1 decimal
        }
      }

      // Only add alert if within radius (or no location available)
      if (distance === null || distance <= alertRadius.value) {
        const alertId = obsId || `alert_${Date.now()}`;
        const newAlert = {
          id: alertId,
          observation: {
            ...obs,
            _id: obsId,
            title: obs.title || obs.phenomenonType || "Observation",
            imageUrl: obs.images?.[0]?.url || obs.images?.[0] || null,
          },
          message: `Nouvelle observation à ${distance !== null ? distance + " km" : "proximité"}`,
          distance: distance !== null ? distance : undefined,
          createdAt:
            event.timestamp || latest.receivedAt || new Date().toISOString(),
          read: false,
        };
        
        // Add to alerts list (create new array for reactivity)
        alerts.value = [newAlert, ...alerts.value];
        
        // Show native browser/phone notification
        showNativeNotification(newAlert);
      }
    }
  }
);

const viewAlert = (alert) => {
  // Mark as read
  alert.read = true;

  // Navigate to observation
  if (alert.observation?._id || alert.observationId) {
    router.push(
      `/observation/${alert.observation?._id || alert.observationId}`
    );
  }
};

const markAllRead = () => {
  alerts.value.forEach((alert) => {
    alert.read = true;
  });
  // TODO: API call to mark all read
};

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
