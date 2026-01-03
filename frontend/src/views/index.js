/**
 * Views/Pages Index - Barrel Export for All Page Components
 *
 * This file exports all view/page components used by the router.
 * Views are the top-level components rendered for each route.
 *
 * @module views
 *
 * Pages:
 * - FeedPage: Main observation feed with search and filters
 * - ExplorePage: Discovery/exploration of observations
 * - CameraPage: Camera capture for new observations
 * - ObservationDetailPage: Single observation detail view
 * - MapPage: Interactive map with observation markers
 * - AlertsPage: Notifications and alerts
 * - ProfilePage: User profile (own or other users)
 * - LoginPage: Authentication login form
 * - SignupPage: User registration form
 * - SettingsPage: User settings and preferences
 * - AdminPage: Administration panel (admin only)
 * - NotFoundPage: 404 error page
 */

// ============================================================================
// MAIN PAGES
// ============================================================================

export { default as FeedPage } from "./FeedPage.vue";
export { default as ExplorePage } from "./ExplorePage.vue";
export { default as CameraPage } from "./CameraPage.vue";
export { default as ObservationDetailPage } from "./ObservationDetailPage.vue";
export { default as MapPage } from "./MapPage.vue";
export { default as AlertsPage } from "./AlertsPage.vue";
export { default as ProfilePage } from "./ProfilePage.vue";

// ============================================================================
// AUTHENTICATION PAGES
// ============================================================================

export { default as LoginPage } from "./LoginPage.vue";
export { default as SignupPage } from "./SignupPage.vue";

// ============================================================================
// SETTINGS AND ADMIN
// ============================================================================

export { default as SettingsPage } from "./SettingsPage.vue";
export { default as AdminPage } from "./AdminPage.vue";
export { default as NotFoundPage } from "./NotFoundPage.vue";
