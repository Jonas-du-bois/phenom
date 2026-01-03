/**
 * Molecules - Composite components built from atoms
 *
 * In Atomic Design methodology, molecules are groups of atoms bonded together
 * to form relatively simple UI components that do one thing well.
 *
 * This file provides centralized exports for all molecule components,
 * allowing consumers to import multiple components from a single path:
 *
 * @example
 * import { ObservationCard, CommentItem } from '@/components/molecules'
 */

// ============================================================================
// OBSERVATION COMPONENTS
// Components related to displaying observation data
// ============================================================================

/** Card component for displaying observation in feed/list views */
export { default as ObservationCard } from "./ObservationCard.vue";

/** Fixed header for observation detail page with user info and navigation */
export { default as ObservationHeader } from "./ObservationHeader.vue";

/** Metadata display component (location, date, duration, gauges, badges) */
export { default as ObservationMeta } from "./ObservationMeta.vue";

/** Image gallery/carousel for observation photos */
export { default as ImageGallery } from "./ImageGallery.vue";

// ============================================================================
// COMMENT COMPONENTS
// Components for comment functionality
// ============================================================================

/** Single comment display with user avatar, name, text and timestamp */
export { default as CommentItem } from "./CommentItem.vue";

/** Form for submitting new comments with textarea and submit button */
export { default as CommentForm } from "./CommentForm.vue";

// ============================================================================
// FILTER COMPONENTS
// Components for filtering/searching observations
// ============================================================================

/** Chip/pill component for filter selection (toggle on/off) */
export { default as FilterChip } from "./FilterChip.vue";

// ============================================================================
// MAP COMPONENTS
// Components for map integration (Leaflet/Mapbox)
// ============================================================================

/** Custom marker component for map pins */
export { default as MapMarker } from "./MapMarker.vue";

/** Popup component displayed when clicking on map markers */
export { default as MapPopup } from "./MapPopup.vue";
