<script setup>
/**
 * LoadingSpinner - Indicateur de chargement
 * Design System: Phenom Search
 */

defineOptions({ name: "LoadingSpinner" });

const props = defineProps({
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg", "xl"].includes(v),
  },
  color: {
    type: String,
    default: "cyan",
    validator: (v) => ["cyan", "white"].includes(v),
  },
});

const sizeClasses = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
  xl: "w-16 h-16",
};

const colorClasses = {
  cyan: "text-[#00F0FF]",
  white: "text-white",
};
</script>

<template>
  <svg
    :class="['animate-spin', sizeClasses[size], colorClasses[color]]"
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
</template>
