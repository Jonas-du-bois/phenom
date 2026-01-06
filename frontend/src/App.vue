<!--
  Root Application Component
  
  This is the main entry point component that:
  - Wraps all views in the AppLayout (provides consistent structure)
  - Controls tab bar visibility based on current route
  - Applies page transition animations between routes
  - Initializes authentication state on app mount
-->

<template>
  <!-- ================================================================== -->
  <!-- MAIN APP LAYOUT                                                    -->
  <!-- ================================================================== -->

  <!-- AppLayout provides the app shell with optional bottom tab bar -->
  <AppLayout :show-tab-bar="showTabBar">
    <!-- Router view with scoped slot for transition control -->
    <router-view v-slot="{ Component }">
      <!-- Page transition: directional based on navigation -->
      <transition :name="transitionName" mode="out-in">
        <component :is="Component" :key="$route.path" />
      </transition>
    </router-view>
  </AppLayout>
</template>

<script setup>
/**
 * Root App Component Script
 *
 * Handles:
 * - Tab bar visibility logic (hidden on auth/camera pages)
 * - Auth store initialization on mount
 * - Intelligent page transition direction (via usePageTransition)
 */

import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { AppLayout } from "./components/layout";
import { useAuthStore } from "./stores/auth";
import { usePageTransition } from "./composables";

// ============================================================================
// COMPOSABLES & STORES
// ============================================================================

const router = useRouter();
const authStore = useAuthStore();

// Page transition with intelligent direction detection
const { transitionName } = usePageTransition();

// ============================================================================
// TAB BAR VISIBILITY
// ============================================================================

/**
 * Computed property to determine if bottom tab bar should be shown
 * Hidden on: login, signup, auth, camera, and old-home (test) pages
 */
const showTabBar = computed(() => {
  const routePath = router.currentRoute.value.path;

  // Routes where the tab bar should be hidden
  const hiddenRoutes = ["/login", "/signup", "/auth", "/camera", "/old-home"];

  return !hiddenRoutes.includes(routePath);
});

// ============================================================================
// LIFECYCLE HOOKS
// ============================================================================

/**
 * Initialize authentication state when app mounts
 * Checks for stored token and validates user session
 */
onMounted(async () => {
  await authStore.initialize();
});
</script>

<style scoped>
/* 
 * Page transition styles are defined in global style.css
 * using the .page-enter-* and .page-leave-* classes
 */
</style>
