<script setup>
/**
 * Badge - Badge pour afficher des tags/labels
 * Design System: Phenom Search
 */

defineOptions({ name: "BaseBadge" });

const props = defineProps({
  variant: {
    type: String,
    default: "default",
    validator: (v) =>
      ["default", "cyan", "success", "warning", "error"].includes(v),
  },
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md"].includes(v),
  },
  removable: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["remove"]);

const variantClasses = {
  default: "bg-white/5 border-white/20 text-white/70",
  cyan: "bg-[#00F0FF]/10 border-[#00F0FF]/30 text-[#00F0FF]",
  success: "bg-green-500/10 border-green-500/30 text-green-500",
  warning: "bg-amber-500/10 border-amber-500/30 text-amber-500",
  error: "bg-red-500/10 border-red-500/30 text-red-500",
};

const sizeClasses = {
  sm: "px-2 py-1 text-[0.65rem]",
  md: "px-3 py-1.5 text-xs",
};
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 border',
      'font-medium uppercase tracking-wider',
      variantClasses[variant],
      sizeClasses[size],
    ]"
  >
    <slot />

    <!-- Remove Button -->
    <button
      v-if="removable"
      type="button"
      class="ml-1 hover:text-white transition-colors"
      aria-label="Supprimer"
      @click.stop="emit('remove')"
    >
      <svg
        class="w-3 h-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
      >
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  </span>
</template>
