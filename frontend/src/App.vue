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
  <!-- MAIN APP ROUTER VIEW                                               -->
  <!-- ================================================================== -->

  <!-- Router view with scoped slot for transition control -->
  <!-- Each page manages its own AppLayout to control header slot -->
  <router-view v-slot="{ Component }">
    <!-- Page transition: directional based on navigation -->
    <transition :name="transitionName" mode="out-in">
      <component :is="Component" :key="$route.path" />
    </transition>
  </router-view>
</template>

<script setup>
/**
 * Root App Component Script
 *
 * Handles:
 * - Tab bar visibility logic (hidden on auth/camera pages)
 * - Content padding visibility (disabled for full-screen pages)
 * - Auth store initialization on mount
 * - Intelligent page transition direction (via usePageTransition)
 */

import { onMounted } from "vue";
import { useAuthStore } from "./stores/auth";
import { usePageTransition } from "./composables";

// ============================================================================
// COMPOSABLES & STORES
// ============================================================================

const authStore = useAuthStore();

// Page transition with intelligent direction detection
const { transitionName } = usePageTransition();

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
