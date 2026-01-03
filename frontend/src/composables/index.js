/**
 * Composables Barrel Export
 *
 * Centralized export of all Vue composables for the Phenom application.
 * Enables clean imports: import { useObservations, useFilters } from '@/composables'
 *
 * Composables provide reusable, reactive logic following Vue 3 Composition API patterns.
 * Each composable encapsulates a specific domain concern.
 */

// ============================================================================
// AUTHENTICATION & USER
// ============================================================================

/** Authentication management (login, register, logout, profile) */
export { useAuth } from "./useAuth";

// ============================================================================
// MEDIA CAPTURE
// ============================================================================

/** Camera access, photo capture, and gallery selection */
export { useCamera } from "./useCamera";

/** Image upload handling with validation and progress tracking */
export { useImageUpload } from "./useImageUpload";

// ============================================================================
// DATA MANAGEMENT
// ============================================================================

/** Observations CRUD operations and list management */
export { useObservations } from "./useObservations";

/** Comments management for observations */
export { useComments } from "./useComments";

/** Filter options and filtering logic for observations */
export { useFilters } from "./useFilters";

// ============================================================================
// GEOLOCATION & MAPS
// ============================================================================

/** Device geolocation and reverse geocoding */
export { useGeolocation } from "./useGeolocation";

/** Interactive map state and marker management */
export { useMap } from "./useMap";

// ============================================================================
// UI UTILITIES
// ============================================================================

/** Modal open/close state management */
export { useModal } from "./useModal";

/** Toast notification system (success, error, warning, info) */
export { useToast } from "./useToast";

/** HTTP error handling with automatic redirects */
export { useErrorHandler } from "./useErrorHandler";

// ============================================================================
// REAL-TIME
// ============================================================================

/** WebSocket connection for real-time updates (observations, comments) */
export { useWebSocket } from "./useWebSocket";
