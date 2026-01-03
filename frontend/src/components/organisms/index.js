/**
 * Organisms - Complex components combining multiple molecules and atoms
 *
 * In Atomic Design methodology, organisms are relatively complex UI components
 * composed of groups of molecules and/or atoms. They form distinct sections
 * of an interface and have their own business logic.
 *
 * This file provides centralized exports for all organism components,
 * allowing consumers to import multiple components from a single path:
 *
 * @example
 * import { BottomTabBar, ObservationList } from '@/components/organisms'
 */

// ============================================================================
// NAVIGATION COMPONENTS
// Main navigation and header components
// ============================================================================

/** Fixed bottom navigation bar with tabs (Feed, Map, Camera, Alerts, Profile) */
export { default as BottomTabBar } from "./BottomTabBar.vue";

/** Fixed top header with title, back button, and action slots */
export { default as PageHeader } from "./PageHeader.vue";

// ============================================================================
// FILTER & SEARCH COMPONENTS
// Components for filtering and searching observations
// ============================================================================

/** Bottom sheet panel with filter options (shapes, phenomena, date range, etc.) */
export { default as FilterPanel } from "./FilterPanel.vue";

/** Search input with suggestions, recent searches, and autocomplete */
export { default as SearchBar } from "./SearchBar.vue";

// ============================================================================
// OBSERVATION COMPONENTS
// Components for displaying and managing observations
// ============================================================================

/** Scrollable list of observation cards with pull-to-refresh and infinite scroll */
export { default as ObservationList } from "./ObservationList.vue";

/** Interactive Leaflet map displaying observation markers with clustering */
export { default as ObservationMap } from "./ObservationMap.vue";

/** Multi-step form for creating/editing observations */
export { default as ObservationForm } from "./ObservationForm.vue";

// ============================================================================
// COMMENT COMPONENTS
// Components for comment functionality
// ============================================================================

/** Scrollable list of comments with loading states and animations */
export { default as CommentList } from "./CommentList.vue";

// ============================================================================
// AUTHENTICATION FORMS
// Login and registration form components
// ============================================================================

/** Login form with email, password, remember me, and forgot password link */
export { default as LoginForm } from "./LoginForm.vue";

/** Registration form with username, email, password strength, and terms */
export { default as SignupForm } from "./SignupForm.vue";
