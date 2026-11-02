<!--
  ============================================================================
  IconButton.vue - Icon-Only Button Component
  ============================================================================
  
  PURPOSE:
  A square button designed to contain only an icon (no text).
  Used for toolbar actions, close buttons, navigation arrows, etc.

  FEATURES:
  - Multiple variants: primary, secondary, ghost
  - Multiple sizes: sm, md, lg
  - Required aria-label for accessibility
  - Disabled state
  - Loading state
  - Slot for icon content

  USAGE EXAMPLES:
  <IconButton aria-label="Close"><CloseIcon /></IconButton>
  <IconButton variant="primary" aria-label="Add"><PlusIcon /></IconButton>
  <IconButton size="lg" aria-label="Menu"><MenuIcon /></IconButton>

  PROPS:
  - variant: 'primary' | 'secondary' | 'ghost' (default: 'ghost')
  - size: 'sm' | 'md' | 'lg' (default: 'md')
  - disabled: Whether button is disabled
  - loading: Whether to show loading spinner
  - ariaLabel: Required accessibility label (screen readers)

  EVENTS:
  - click: Emitted when button is clicked (unless disabled)
  ============================================================================
-->

<script setup>
/**
 * IconButton - Icon-Only Button Component
 * Design System: Phenom Search
 */

defineOptions({ name: "IconButton" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
const props = defineProps({
  // Visual style variant
  variant: {
    type: String,
    default: "ghost",
    validator: (v) => ["primary", "secondary", "ghost"].includes(v),
  },
  // Size variant (affects button dimensions)
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg"].includes(v),
  },
  // Disabled state
  disabled: {
    type: Boolean,
    default: false,
  },
  // Loading state
  loading: {
    type: Boolean,
    default: false,
  },
  // Required: Accessibility label for screen readers
  ariaLabel: {
    type: String,
    required: true,
  },
});

// =============================================================================
// EVENTS
// =============================================================================
const emit = defineEmits(["click"]);

/**
 * Handle click events (only if not disabled and not loading)
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
 */
const variantClasses = {
  primary: "bg-[#00F0FF] text-black hover:bg-[#00D0DF]",
  secondary:
    "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white",
  ghost: "text-white/50 hover:text-white hover:bg-white/5",
};

/**
 * Square dimensions for each size
 */
const sizeClasses = {
  sm: "w-8 h-8", // 32px
  md: "w-10 h-10", // 40px
  lg: "w-12 h-12", // 48px
};
</script>

<template>
  <!-- 
    Icon Button
    - type="button" prevents form submission
    - touch-target ensures minimum 44px touch area on mobile
  -->
  <button
    type="button"
    :disabled="disabled || loading"
    :aria-label="ariaLabel"
    :class="[
      'inline-flex items-center justify-center',
      'transition-all duration-200',
      'touch-target',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent',
      variantClasses[variant],
      sizeClasses[size],
      {
        'opacity-50 cursor-not-allowed': disabled,
        'pointer-events-none': loading,
      },
    ]"
    @click="handleClick"
  >
    <!-- Loading Spinner -->
    <svg
      v-if="loading"
      class="w-5 h-5 animate-spin"
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

    <!-- Slot for icon content -->
    <slot v-else />
  </button>
</template>
