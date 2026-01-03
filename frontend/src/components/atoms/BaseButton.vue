<!--
  ============================================================================
  BaseButton.vue - Reusable Button Component
  ============================================================================
  
  PURPOSE:
  A versatile button component with multiple style variants and states.
  Used throughout the application for user interactions like form submissions,
  navigation actions, and triggering operations.

  FEATURES:
  - Multiple variants: primary (cyan), secondary (outlined), ghost, danger
  - Multiple sizes: sm, md, lg, full (full width)
  - Loading state with animated spinner
  - Disabled state with visual feedback
  - Slot-based content for icons and text

  USAGE EXAMPLES:
  <BaseButton>Click me</BaseButton>
  <BaseButton variant="secondary" size="lg">Secondary</BaseButton>
  <BaseButton variant="danger" :loading="isLoading">Delete</BaseButton>
  <BaseButton type="submit" size="full">Submit Form</BaseButton>

  PROPS:
  - variant: 'primary' | 'secondary' | 'ghost' | 'danger' (default: 'primary')
  - size: 'sm' | 'md' | 'lg' | 'full' (default: 'md')
  - disabled: Disables the button
  - loading: Shows loading spinner and prevents clicks
  - type: HTML button type - 'button' | 'submit' | 'reset'

  EVENTS:
  - click: Emitted when button is clicked (unless disabled/loading)
  ============================================================================
-->

<script setup>
/**
 * BaseButton - Reusable Button Component
 * Variants: primary, secondary, ghost, danger
 * Design System: Phenom Search
 */

defineOptions({ name: "BaseButton" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
const props = defineProps({
  // Visual style variant
  variant: {
    type: String,
    default: "primary",
    validator: (v) => ["primary", "secondary", "ghost", "danger"].includes(v),
  },
  // Size variant (affects padding and font size)
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg", "full"].includes(v),
  },
  // Whether the button is disabled
  disabled: {
    type: Boolean,
    default: false,
  },
  // Whether to show loading spinner
  loading: {
    type: Boolean,
    default: false,
  },
  // HTML button type attribute
  type: {
    type: String,
    default: "button",
  },
});

// =============================================================================
// EVENTS
// =============================================================================
const emit = defineEmits(["click"]);

/**
 * Handle click events
 * Only emits if button is not disabled or loading
 */
const handleClick = (e) => {
  if (!props.disabled && !props.loading) {
    emit("click", e);
  }
};

// =============================================================================
// STYLING CONFIGURATION
// =============================================================================

/**
 * Tailwind classes for each variant
 * - primary: Solid cyan background (main CTA)
 * - secondary: Transparent with border (secondary actions)
 * - ghost: No background, subtle hover (tertiary actions)
 * - danger: Red theme for destructive actions
 */
const variantClasses = {
  primary: "bg-[#00F0FF] text-black hover:bg-[#00D0DF] active:scale-[0.98]",
  secondary:
    "bg-transparent text-white/70 border border-white/20 hover:text-[#00F0FF] hover:border-[#00F0FF]",
  ghost: "bg-transparent text-white/50 hover:text-white",
  danger:
    "bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30",
};

/**
 * Tailwind classes for each size
 */
const sizeClasses = {
  sm: "px-3 py-2 text-xs",       // Small - compact buttons
  md: "px-4 py-3 text-sm",       // Medium - default
  lg: "px-6 py-4 text-base",     // Large - prominent buttons
  full: "w-full px-4 py-4 text-sm", // Full width - form submissions
};
</script>

<template>
  <!-- 
    Button Element
    - Uses native button for accessibility
    - Applies variant and size classes dynamically
    - touch-target class ensures minimum 44px touch area on mobile
  -->
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2',
      'font-medium uppercase tracking-wider',
      'transition-all duration-200',
      'touch-target',
      variantClasses[variant],
      sizeClasses[size],
      {
        'opacity-50 cursor-not-allowed': disabled,
        'pointer-events-none': loading,
      },
    ]"
    @click="handleClick"
  >
    <!-- 
      Loading Spinner (conditional)
      - Displayed when loading prop is true
      - Animated spinning SVG
    -->
    <svg
      v-if="loading"
      class="w-4 h-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <!-- Default slot for button content (text, icons, etc.) -->
    <slot />
  </button>
</template>
