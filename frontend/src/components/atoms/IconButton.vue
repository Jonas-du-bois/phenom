<script setup>
/**
 * IconButton - Bouton avec icône seule
 * Design System: Phenom Search
 */

defineOptions({ name: "IconButton" });

const props = defineProps({
  variant: {
    type: String,
    default: "ghost",
    validator: (v) => ["primary", "secondary", "ghost"].includes(v),
  },
  size: {
    type: String,
    default: "md",
    validator: (v) => ["sm", "md", "lg"].includes(v),
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  ariaLabel: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["click"]);

const handleClick = (e) => {
  if (!props.disabled) {
    emit("click", e);
  }
};

const variantClasses = {
  primary: "bg-[#00F0FF] text-black hover:bg-[#00D0DF]",
  secondary:
    "bg-white/5 text-white/70 border border-white/10 hover:bg-white/10 hover:text-white",
  ghost: "text-white/50 hover:text-white hover:bg-white/5",
};

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-12 h-12",
};
</script>

<template>
  <button
    type="button"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :class="[
      'inline-flex items-center justify-center',
      'transition-all duration-200',
      'touch-target',
      variantClasses[variant],
      sizeClasses[size],
      { 'opacity-50 cursor-not-allowed': disabled },
    ]"
    @click="handleClick"
  >
    <slot />
  </button>
</template>
