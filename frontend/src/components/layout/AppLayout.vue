<!--
  ============================================================================
  AppLayout.vue - Main Application Layout Component
  ============================================================================
  
  PURPOSE:
  The root layout component that wraps all pages of the application.
  Provides consistent structure, navigation, and global UI features
  like toast notifications and loading overlays.

  FEATURES:
  - Flexible page structure with header slot and main content area
  - Bottom tab bar navigation (optional, can be hidden)
  - Global toast notification system (success, error, warning, info)
  - Global loading overlay with optional message
  - iOS safe area insets handling (notch, home indicator)
  - Provides toast and loading APIs to all child components via Vue's provide/inject

  STRUCTURE:
  ┌─────────────────────────────┐
  │      Header Slot            │
  ├─────────────────────────────┤
  │                             │
  │      Main Content           │
  │      (default slot)         │
  │                             │
  ├─────────────────────────────┤
  │    Bottom Tab Bar           │
  └─────────────────────────────┘

  USAGE EXAMPLES:
  <AppLayout>
    <template #header><PageHeader title="Home" /></template>
    <HomePage />
  </AppLayout>

  <AppLayout :showTabBar="false">
    <FullScreenPage />
  </AppLayout>

  PROPS:
  - showTabBar: Whether to display bottom navigation (default: true)
  - alertCount: Badge count for alerts tab
  - hasContentPadding: Whether to add padding-top for fixed header (default: true)

  GLOBAL FEATURES:
  - Toast notifications via useToast() composable
  - Global loading overlay (internal use)
  - iOS safe area insets handling
  ============================================================================
-->

<template>
  <div class="app-layout min-h-screen bg-[#000000] flex flex-col">
    <!-- Page Header slot - for page-specific headers -->
    <slot name="header" />

    <!-- 
      Main Content Area
      - flex-1: Takes all available vertical space
      - overflow-y-auto: Enables scrolling for long content
      - overscroll-contain: Prevents scroll chaining to parent
      - Padding top accounts for fixed header + iOS safe area (if hasContentPadding)
      - Padding bottom accounts for tab bar + iOS safe area
    -->
    <main
      class="flex-1 overflow-y-auto overscroll-contain"
      :style="{
        paddingTop: hasContentPadding
          ? 'calc(2rem + env(safe-area-inset-top, 0px))'
          : undefined,
        paddingBottom: showTabBar
          ? 'calc(4.5rem + env(safe-area-inset-bottom, 0px))'
          : undefined,
      }"
    >
      <!-- Default slot for page content -->
      <slot />
    </main>

    <BottomTabBar v-if="showTabBar" :alert-count="alertCount" />

    <!-- Toast Notifications -->
    <Teleport to="body">
      <TransitionGroup
        name="toast"
        tag="div"
        class="fixed top-6 right-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-md"
        :style="{ top: 'calc(2rem + env(safe-area-inset-top, 0px))' }"
      >
        <div
          v-for="toast in globalToasts"
          :key="toast.id"
          class="toast-item liquid-glass-toast p-4 rounded-2xl shadow-2xl pointer-events-auto backdrop-blur-xl border border-white/10"
          :class="toastClasses[toast.type]"
        >
          <div class="flex items-start gap-3">
            <div class="shrink-0 mt-0.5">
              <svg
                v-if="toast.type === 'success'"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <svg
                v-else-if="toast.type === 'error'"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <svg
                v-else-if="toast.type === 'warning'"
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
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
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-sm opacity-90">{{ toast.message }}</p>
            </div>

            <button
              @click="removeToast(toast.id)"
              class="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
            >
              <svg
                class="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </Teleport>
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { BottomTabBar } from "@/components/organisms";
import { useToast } from "@/composables/useToast";

defineOptions({ name: "AppLayout" });

const { toasts: globalToasts, dismiss: removeToast } = useToast();

const toastClasses = {
  success: "bg-green-500/20 text-white border-green-500/30",
  error: "bg-red-500/20 text-white border-red-500/30",
  warning: "bg-yellow-500/20 text-white border-yellow-500/30",
  info: "bg-[#00F0FF]/20 text-white border-[#00F0FF]/30",
};

defineProps({
  showTabBar: { type: Boolean, default: true },
  alertCount: { type: Number, default: 0 },
  hasContentPadding: { type: Boolean, default: true },
});

onMounted(() => {
  document.documentElement.style.setProperty(
    "--sat",
    "env(safe-area-inset-top)"
  );
  document.documentElement.style.setProperty(
    "--sab",
    "env(safe-area-inset-bottom)"
  );
  document.documentElement.style.setProperty(
    "--sal",
    "env(safe-area-inset-left)"
  );
  document.documentElement.style.setProperty(
    "--sar",
    "env(safe-area-inset-right)"
  );
});
</script>

<style scoped>

/* =============================================================================
   APP LAYOUT STYLES
   ============================================================================= */
.app-layout {
  min-height: 100dvh;
  height: 100dvh;
  overscroll-behavior: none;
}
@supports (-webkit-touch-callout: none) {
  .app-layout {
    min-height: -webkit-fill-available;
    height: -webkit-fill-available;
  }
}

/* =============================================================================
   LIQUID GLASS TOAST EFFECT
   ============================================================================= */

.liquid-glass-toast {
  position: relative;
  overflow: hidden;
  box-shadow: 
    0 8px 32px 0 rgba(0, 0, 0, 0.37),
    inset 0 1px 1px 0 rgba(255, 255, 255, 0.1);
}

.liquid-glass-toast::before {
  content: "";
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.1),
    transparent
  );
  transition: left 0.5s;
}

.liquid-glass-toast:hover::before {
  left: 100%;
}

/* =============================================================================
   TOAST ANIMATIONS
   ============================================================================= */

/* Enter animation: slide down and fade in */
.toast-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Leave animation: faster, slide right */
.toast-leave-active {
  transition: all 0.2s ease;
}

/* Initial state when entering */
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.9);
}

/* Final state when leaving */
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%) scale(0.9);
}

/* Smooth repositioning when list changes */
.toast-move {
  transition: transform 0.3s ease;
}
</style>
