/**
 * ============================================================================
 * Atoms - Base Reusable Components
 * ============================================================================
 *
 * This barrel file provides a centralized export point for all atomic components.
 * Atoms are the smallest, most fundamental UI building blocks in the Atomic Design
 * methodology. They cannot be broken down further without losing their meaning.
 *
 * CATEGORIES:
 * - Buttons: Interactive clickable elements
 * - Inputs: Form input components for data entry
 * - Display: Visual feedback and information components
 * - Visuals: Decorative and data visualization elements
 *
 * USAGE:
 * import { BaseButton, TextInput, LoadingSpinner } from '@/components/atoms';
 * ============================================================================
 */

// =============================================================================
// BUTTONS
// =============================================================================
export { default as BaseButton } from "./BaseButton.vue";   // Standard button with variants
export { default as IconButton } from "./IconButton.vue";   // Icon-only button

// =============================================================================
// INPUTS
// =============================================================================
export { default as TextInput } from "./TextInput.vue";       // Single-line text input
export { default as TextArea } from "./TextArea.vue";         // Multi-line text input
export { default as BaseSelect } from "./BaseSelect.vue";     // Single-select dropdown
export { default as MultiSelect } from "./MultiSelect.vue";   // Multi-select with chips
export { default as DatePicker } from "./DatePicker.vue";     // Native date picker
export { default as TimePicker } from "./TimePicker.vue";     // Native time picker
export { default as RangeInput } from "./RangeInput.vue";     // Range slider
export { default as DurationInput } from "./DurationInput.vue"; // Duration in seconds
export { default as BaseToggle } from "./BaseToggle.vue";     // Toggle switch

// =============================================================================
// DISPLAY
// =============================================================================
export { default as BaseBadge } from "./BaseBadge.vue";       // Tag/label badge
export { default as BaseAvatar } from "./BaseAvatar.vue";     // User avatar
export { default as LoadingSpinner } from "./LoadingSpinner.vue"; // Loading indicator
export { default as EmptyState } from "./EmptyState.vue";     // Empty content placeholder
export { default as ErrorState } from "./ErrorState.vue";     // Error display
export { default as GlassTooltip } from "./GlassTooltip.vue"; // Liquid glass tooltip/popup

// =============================================================================
// VISUALS
// =============================================================================
export { default as RadialSymbol } from "./RadialSymbol.vue";       // Decorative radial element
export { default as CredibilityGauge } from "./CredibilityGauge.vue"; // Credibility score (0-15)
export { default as StrangenessGauge } from "./StrangenessGauge.vue"; // Strangeness score (0-10)
