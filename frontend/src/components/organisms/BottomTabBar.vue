<template>
  <nav
    class="fixed bottom-4 left-0 right-0 z-50 bg-[#080A0E]/50 backdrop-blur-xl border-t border-white/5 rounded-2xl max-w-screen mx-3"
    :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }"
  >
    <div class="flex items-center justify-around h-16">
      <router-link
        v-for="tab in tabs"
        :key="tab.name"
        :to="tab.to"
        class="tab-item flex flex-col items-center justify-center gap-1 min-w-[64px] h-full px-3 transition-all duration-200"
        :class="{ active: isActive(tab) }"
      >
        <!-- Camera tab special styling -->
        <template v-if="tab.name === 'camera'">
          <div
            class="camera-button w-14 h-14 -mt-6 rounded-full bg-[#00F0FF] flex items-center justify-center shadow-glow-cyan transition-transform duration-200 active:scale-95"
          >
            <svg
              class="w-7 h-7 text-black"
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
          </div>
        </template>

        <!-- Normal tabs -->
        <template v-else>
          <div class="icon-wrapper relative">
            <!-- Feed icon -->
            <svg
              v-if="tab.name === 'feed'"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>

            <!-- Map icon -->
            <svg
              v-else-if="tab.name === 'map'"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>

            <!-- Alerts icon -->
            <svg
              v-else-if="tab.name === 'alerts'"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>

            <!-- Profile icon -->
            <svg
              v-else-if="tab.name === 'profile'"
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="1.5"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>

            <!-- Notification badge -->
            <span
              v-if="tab.badge && tab.badge > 0"
              class="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-[#00F0FF] text-black text-xs font-semibold rounded-full flex items-center justify-center px-1"
            >
              {{ tab.badge > 99 ? "99+" : tab.badge }}
            </span>
          </div>

          <span class="text-xs font-medium tracking-wide">{{ tab.label }}</span>
        </template>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";

defineOptions({ name: "BottomTabBar" });

const props = defineProps({
  alertCount: {
    type: Number,
    default: 0,
  },
});

const route = useRoute();

const tabs = computed(() => [
  { name: "feed", label: "Feed", to: "/feed" },
  { name: "map", label: "Map", to: "/map" },
  { name: "camera", label: "", to: "/camera" },
  { name: "alerts", label: "Alertes", to: "/alerts", badge: props.alertCount },
  { name: "profile", label: "Profil", to: "/profile" },
]);

const isActive = (tab) => {
  if (tab.to === "/feed") {
    return route.path === "/" || route.path === "/feed";
  }
  return route.path.startsWith(tab.to);
};
</script>

<style scoped>
.tab-item {
  color: rgba(255, 255, 255, 0.5);
}

.tab-item.active {
  color: #00f0ff;
}

.tab-item:not(.active):active {
  color: rgba(255, 255, 255, 0.7);
}

.tab-item.active .icon-wrapper svg {
  stroke-width: 2;
}

.camera-button {
  box-shadow: 0 0 20px rgba(0, 240, 255, 0.4);
}

.camera-button:active {
  box-shadow: 0 0 10px rgba(0, 240, 255, 0.3);
}
</style>
