<!-- ========================================================================
     OBSERVATION MAP - Interactive Leaflet map with clustered markers
     
     Features:
     - Leaflet map with dark/satellite tile layers
     - MarkerCluster grouping with custom glass styling
     - Color-coded markers by credibility (red/yellow/cyan)
     - Custom zoom controls overlay
     - Center on user location button
     - Layer toggle (dark/satellite)
     - Observation count badge
     - Slide-up popup for selected observation
     - Bounds change events for dynamic loading
     
     Props:
     - observations: Array of observations with coordinates
     - center: Initial map center [lat, lng]
     - zoom: Initial zoom level
     - loading: Show loading spinner overlay
     
     Events:
     - bounds-change: Map viewport changed { north, south, east, west }
     - marker-click: Marker clicked with observation data
     ======================================================================== -->
<template>
  <div ref="mapContainer" class="observation-map w-full h-full bg-[#080A0E]">
    <!-- Map loading state - Full screen spinner overlay -->
    <div
      v-if="loading"
      class="absolute inset-0 flex items-center justify-center bg-[#080A0E]"
    >
      <LoadingSpinner size="lg" />
    </div>

    <!-- Map controls overlay -->
    <div
      v-if="showControls"
      class="absolute right-4 z-[1000] flex flex-col gap-2"
      :style="{
        top: controlsTopOffset,
        right: 'calc(1rem + env(safe-area-inset-right, 0px))',
      }"
    >
      <!-- Zoom controls -->
      <div
        v-if="showZoomControls"
        class="bg-[#12151C] rounded-xl overflow-hidden shadow-lg border border-white/10"
      >
        <button
          @click="zoomIn"
          aria-label="Zoom in"
          class="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-colors"
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
              stroke-width="2"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
        <div class="h-px bg-white/10" />
        <button
          @click="zoomOut"
          aria-label="Zoom out"
          class="w-10 h-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/5 transition-colors"
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
              stroke-width="2"
              d="M20 12H4"
            />
          </svg>
        </button>
      </div>

      <!-- Location button -->
      <button
        @click="centerOnUser"
        aria-label="Center map on your location"
        class="w-10 h-10 bg-[#12151C] rounded-xl flex items-center justify-center text-white/70 hover:text-[#00F0FF] shadow-lg border border-white/10 transition-colors"
        :class="{ 'text-[#00F0FF]': isFollowingUser }"
      >
        <LoadingSpinner v-if="locating" size="sm" />
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
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      <!-- Layer toggle -->
      <button
        @click="toggleLayer"
        aria-label="Toggle map layer"
        class="w-10 h-10 bg-[#12151C] rounded-xl flex items-center justify-center text-white/70 hover:text-white shadow-lg border border-white/10 transition-colors"
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
            stroke-width="2"
            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
          />
        </svg>
      </button>
    </div>

    <!-- Observation count badge -->
    <div
      v-if="observations.length > 0 && showBadge"
      class="absolute z-[1000] backdrop-blur-2xl bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 shadow-2xl hover:bg-white/10 transition-all duration-300"
      :style="{
        top: badgeTopOffset,
        left: 'calc(1rem + env(safe-area-inset-left, 0px))',
      }"
    >
      <div class="flex items-center gap-2.5">
        <div class="relative">
          <div class="w-2 h-2 bg-[#00F0FF] rounded-full"></div>
          <div
            class="absolute inset-0 w-2 h-2 bg-[#00F0FF] rounded-full animate-ping opacity-75"
          ></div>
        </div>
        <span class="text-sm font-medium text-white">
          <span class="font-bold text-[#00F0FF]">{{
            observations.length
          }}</span>
          <span class="text-white/60 ml-1 text-xs">observations</span>
        </span>
      </div>
    </div>

    <!-- Selected observation popup -->
    <Transition name="slide-up">
      <div
        v-if="selectedObservation && showPopup"
        class="absolute z-[1000]"
        :style="{
          bottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))',
          left: 'calc(1rem + env(safe-area-inset-left, 0px))',
          right: 'calc(1rem + env(safe-area-inset-right, 0px))',
        }"
      >
        <MapPopup
          :observation="selectedObservation"
          @close="selectedObservation = null"
          @view="handleViewObservation"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import L from "leaflet";
import "leaflet.markercluster";
import { LoadingSpinner } from "@/components/atoms";
import { MapPopup } from "@/components/molecules";
import { getLeafletCoordinates } from "@/utils";

defineOptions({ name: "ObservationMap" });

// eslint-disable-next-line no-unused-vars
const props = defineProps({
  observations: {
    type: Array,
    default: () => [],
  },
  center: {
    type: Array,
    default: () => [46.8182, 8.2275], // Switzerland center
  },
  zoom: {
    type: Number,
    default: 8,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  // UI customization props
  showControls: {
    type: Boolean,
    default: true,
  },
  showZoomControls: {
    type: Boolean,
    default: true,
  },
  showPopup: {
    type: Boolean,
    default: true,
  },
  showBadge: {
    type: Boolean,
    default: true,
  },
  // Compact mode for embedded maps (smaller controls, different positioning)
  compact: {
    type: Boolean,
    default: false,
  },
});

// Computed offsets based on compact mode
const controlsTopOffset = computed(() =>
  props.compact
    ? "calc(1rem + env(safe-area-inset-top, 0px))"
    : "calc(5.5rem + env(safe-area-inset-top, 0px))",
);

const badgeTopOffset = computed(() =>
  props.compact
    ? "calc(1rem + env(safe-area-inset-top, 0px))"
    : "calc(6rem + env(safe-area-inset-top, 0px))",
);

const emit = defineEmits(["bounds-change", "marker-click"]);

const router = useRouter();
const mapContainer = ref(null);
const selectedObservation = ref(null);
const locating = ref(false);
const isFollowingUser = ref(false);

let map = null;
let markerClusterGroup = null;
let userMarker = null;
let currentLayer = "dark";

// Dark map tiles
const tileLayers = {
  dark: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
  satellite:
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
};

onMounted(() => {
  initMap();
});

onUnmounted(() => {
  if (map) {
    map.remove();
    map = null;
  }
});

watch(
  () => props.observations,
  () => {
    if (map) {
      updateMarkers();
    }
  },
  { deep: true },
);

const initMap = async () => {
  await nextTick();

  if (!mapContainer.value) return;

  // Initialize map
  map = L.map(mapContainer.value, {
    center: props.center,
    zoom: props.zoom,
    zoomControl: false,
    attributionControl: false,
  });

  // Add dark tile layer
  L.tileLayer(tileLayers.dark, {
    maxZoom: 19,
  }).addTo(map);

  // Initialize marker cluster group with custom styling
  markerClusterGroup = L.markerClusterGroup({
    iconCreateFunction: (cluster) => {
      const count = cluster.getChildCount();
      let sizeClass = "cluster-sm";
      if (count > 15) sizeClass = "cluster-lg";
      else if (count > 8) sizeClass = "cluster-md";

      return L.divIcon({
        html: `
          <div class="cluster-glass ${sizeClass}">
            <div class="cluster-glass-bg"></div>
            <div class="cluster-glass-content">${count}</div>
          </div>
        `,
        className: "custom-cluster-icon",
        iconSize: L.point(56, 56),
        iconAnchor: L.point(28, 28),
      });
    },
    maxClusterRadius: 50,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
  });

  map.addLayer(markerClusterGroup);

  // Update markers
  updateMarkers();

  // Emit bounds on move
  map.on("moveend", () => {
    const bounds = map.getBounds();
    emit("bounds-change", {
      north: bounds.getNorth(),
      south: bounds.getSouth(),
      east: bounds.getEast(),
      west: bounds.getWest(),
    });
  });
};

const updateMarkers = () => {
  if (!markerClusterGroup) return;

  markerClusterGroup.clearLayers();

  props.observations.forEach((obs) => {
    const coords = getLeafletCoordinates(obs);
    if (!coords) return;

    const [lat, lng] = coords;
    const credibility = obs.credibility || 0;

    // Color based on credibility
    let color = "#FF4444";
    if (credibility >= 10) color = "#00F0FF";
    else if (credibility >= 5) color = "#FFD700";

    const marker = L.marker([lat, lng], {
      icon: L.divIcon({
        html: `
          <div class="custom-marker" style="--marker-color: ${color}">
            <svg viewBox="0 0 24 24" fill="${color}" class="w-8 h-8">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
        `,
        className: "custom-marker-icon",
        iconSize: L.point(32, 32),
        iconAnchor: L.point(16, 32),
      }),
    });

    marker.on("click", () => {
      selectedObservation.value = obs;
      emit("marker-click", obs);
    });

    markerClusterGroup.addLayer(marker);
  });
};

const zoomIn = () => {
  map?.zoomIn();
};

const zoomOut = () => {
  map?.zoomOut();
};

const centerOnUser = async () => {
  if (!navigator.geolocation) return;

  locating.value = true;

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
      });
    });

    const { latitude, longitude } = position.coords;

    map?.setView([latitude, longitude], 14);

    // Add/update user marker
    if (userMarker) {
      userMarker.setLatLng([latitude, longitude]);
    } else {
      userMarker = L.marker([latitude, longitude], {
        icon: L.divIcon({
          html: `
            <div class="user-location-marker">
              <div class="pulse"></div>
              <div class="dot"></div>
            </div>
          `,
          className: "user-marker-icon",
          iconSize: L.point(24, 24),
        }),
      }).addTo(map);
    }

    isFollowingUser.value = true;
  } catch (error) {
    console.error("Geolocation error:", error);
  } finally {
    locating.value = false;
  }
};

const toggleLayer = () => {
  if (!map) return;

  currentLayer = currentLayer === "dark" ? "satellite" : "dark";

  map.eachLayer((layer) => {
    if (layer instanceof L.TileLayer) {
      map.removeLayer(layer);
    }
  });

  L.tileLayer(tileLayers[currentLayer], {
    maxZoom: 19,
  }).addTo(map);
};

const handleViewObservation = (observation) => {
  router.push(`/observation/${observation._id || observation.id}`);
};

// Expose methods
defineExpose({
  zoomIn,
  zoomOut,
  centerOnUser,
  setView: (center, zoom) => map?.setView(center, zoom),
  fitBounds: (bounds) => map?.fitBounds(bounds),
});
</script>

<style>
/* Cluster marker styles - Modern Glassmorphism */
.custom-cluster-icon {
  background: transparent !important;
  border: none !important;
}

.cluster-glass {
  position: relative;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Glassmorphic background with optimized shadow */
.cluster-glass-bg {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: rgba(0, 240, 255, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1.5px solid rgba(0, 240, 255, 0.3);
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.2),
    inset 0 1px 3px rgba(255, 255, 255, 0.2),
    0 0 30px rgba(0, 240, 255, 0.3);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  animation: float-pulse 3s ease-in-out infinite;
}

/* Content text */
.cluster-glass-content {
  position: relative;
  z-index: 1;
  font-size: 22px;
  font-weight: 900;
  color: #00f0ff;
  text-shadow:
    0 0 10px rgba(0, 240, 255, 0.8),
    0 2px 4px rgba(0, 0, 0, 0.6);
  letter-spacing: -0.5px;
  white-space: nowrap;
  transition: text-shadow 0.3s ease;
}

/* Hover effect */
.cluster-glass:hover .cluster-glass-bg {
  background: rgba(0, 240, 255, 0.25);
  border-color: rgba(0, 240, 255, 0.5);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  box-shadow:
    0 12px 48px rgba(0, 0, 0, 0.3),
    inset 0 1px 3px rgba(255, 255, 255, 0.3),
    0 0 50px rgba(0, 240, 255, 0.5);
  transform: scale(1.08);
}

.cluster-glass:hover .cluster-glass-content {
  text-shadow:
    0 0 15px rgba(0, 240, 255, 1),
    0 2px 4px rgba(0, 0, 0, 0.8);
}

/* Size variants - only differences */
.cluster-sm .cluster-glass {
  width: 48px;
  height: 48px;
}

.cluster-sm .cluster-glass-bg {
  background: rgba(0, 240, 255, 0.12);
  border-width: 1px;
  box-shadow:
    0 6px 24px rgba(0, 0, 0, 0.15),
    inset 0 1px 3px rgba(255, 255, 255, 0.2),
    0 0 20px rgba(0, 240, 255, 0.2);
}

.cluster-sm .cluster-glass-content {
  font-size: 16px;
}

.cluster-md .cluster-glass {
  width: 52px;
  height: 52px;
}

.cluster-md .cluster-glass-bg {
  background: rgba(0, 240, 255, 0.18);
}

.cluster-md .cluster-glass-content {
  font-size: 20px;
}

.cluster-lg .cluster-glass {
  width: 60px;
  height: 60px;
}

.cluster-lg .cluster-glass-bg {
  background: rgba(0, 240, 255, 0.22);
  border-width: 2px;
  border-color: rgba(0, 240, 255, 0.4);
}

.cluster-lg .cluster-glass-content {
  font-size: 24px;
}

/* Optimized animation */
@keyframes float-pulse {
  0%,
  100% {
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.2),
      inset 0 1px 3px rgba(255, 255, 255, 0.2),
      0 0 30px rgba(0, 240, 255, 0.3);
  }
  50% {
    box-shadow:
      0 8px 32px rgba(0, 0, 0, 0.2),
      inset 0 1px 3px rgba(255, 255, 255, 0.2),
      0 0 45px rgba(0, 240, 255, 0.5);
  }
}

/* Custom marker */
.custom-marker-icon {
  background: transparent !important;
  border: none !important;
  filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.4))
    drop-shadow(0 0 12px rgba(0, 240, 255, 0.2));
  transition: all 0.3s ease;
  cursor: pointer;
}

.custom-marker-icon:hover {
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.6))
    drop-shadow(0 0 20px rgba(0, 240, 255, 0.4))
    drop-shadow(0 0 30px rgba(0, 102, 204, 0.3));
  transform: scale(1.2);
}

.custom-marker {
  position: relative;
}

.custom-marker::before {
  content: "";
  position: absolute;
  inset: -4px;
  background: radial-gradient(circle, var(--marker-color), transparent);
  border-radius: 50%;
  opacity: 0.3;
  animation: glow 2s ease-in-out infinite;
}

.custom-marker svg {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 2px 6px rgba(0, 0, 0, 0.5));
}

/* User location marker */
.user-marker-icon {
  background: transparent !important;
  filter: drop-shadow(0 2px 8px rgba(0, 240, 255, 0.4));
}

.user-location-marker {
  position: relative;
  width: 24px;
  height: 24px;
}

.user-location-marker .dot {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: linear-gradient(135deg, #00f0ff, #0066cc);
  border-radius: 50%;
  border: 3px solid white;
  box-shadow:
    0 0 12px rgba(0, 240, 255, 0.8),
    inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

.user-location-marker .pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 24px;
  height: 24px;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.4), transparent);
  border-radius: 50%;
  border: 2px solid rgba(0, 240, 255, 0.3);
  animation: pulse 2s ease-out infinite;
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    border-color: rgba(0, 240, 255, 0.5);
  }
  100% {
    transform: translate(-50%, -50%) scale(2.8);
    opacity: 0;
    border-color: rgba(0, 240, 255, 0);
  }
}

@keyframes glow {
  0%,
  100% {
    opacity: 0.2;
  }
  50% {
    opacity: 0.4;
  }
}

/* Slide up transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}
</style>
