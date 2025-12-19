<script setup>
/**
 * BaseButton - Composant bouton réutilisable
 * Variants: primary, secondary, ghost
 * Design System: Phenom Search
 */

defineOptions({ name: "BaseButton" });

const props = defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (v) => ["primary", "secondary", "ghost", "danger"].includes(v),
  },
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg", "full"].includes(v),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: "button",
  },
});

const emit = defineEmits(["click"]);

const handleClick = (e) => {
  if (!props.disabled && !props.loading) {
    emit("click", e);
  }
};

const variantClasses = {
  primary: "bg-[#00F0FF] text-black hover:bg-[#00D0DF] active:scale-[0.98]",
  secondary:
    "bg-transparent text-white/70 border border-white/20 hover:text-[#00F0FF] hover:border-[#00F0FF]",
  ghost: "bg-transparent text-white/50 hover:text-white",
  danger:
    "bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30",
};

const sizeClasses = {
  sm: "px-3 py-2 text-xs",
  md: "px-4 py-3 text-sm",
  lg: "px-6 py-4 text-base",
  full: "w-full px-4 py-4 text-sm",
};
</script>

<template>
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
    <!-- Loading Spinner -->
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

    <slot />
  </button>
</template>
