<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="buttonClasses"
    @click="handleClick"
  >
    <!-- Loading spinner -->
    <span v-if="loading" class="btn-spinner"></span>

    <!-- Icon (left) -->
    <span v-if="$slots.icon && !loading" class="btn-icon">
      <slot name="icon"></slot>
    </span>

    <!-- Text -->
    <span v-if="$slots.default" class="btn-text">
      <slot></slot>
    </span>

    <!-- Icon (right) -->
    <span v-if="$slots.iconRight && !loading" class="btn-icon-right">
      <slot name="iconRight"></slot>
    </span>
  </button>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  variant: {
    type: String,
    default: "primary",
    validator: (value) =>
      ["primary", "secondary", "outline", "ghost", "danger"].includes(value),
  },
  size: {
    type: String,
    default: "md",
    validator: (value) => ["sm", "md", "lg"].includes(value),
  },
  type: {
    type: String,
    default: "button",
  },
  disabled: Boolean,
  loading: Boolean,
  fullWidth: Boolean,
  rounded: Boolean,
});

const emit = defineEmits(["click"]);

const buttonClasses = computed(() => {
  return [
    "btn",
    `btn-${props.variant}`,
    `btn-${props.size}`,
    {
      "btn-full": props.fullWidth,
      "btn-rounded": props.rounded,
      "btn-loading": props.loading,
      "btn-disabled": props.disabled,
    },
  ];
});

const handleClick = (event) => {
  if (!props.disabled && !props.loading) {
    emit("click", event);
  }
};
</script>

<style scoped>
/* Base button */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--phenom-space-2);
  font-weight: 500;
  border-radius: var(--phenom-radius-full);
  transition: var(--phenom-transition-base);
  cursor: pointer;
  border: none;
  outline: none;
  font-family: inherit;
  user-select: none;
}

/* Sizes */
.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  min-height: 2rem;
}

.btn-md {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  min-height: 2.75rem;
}

.btn-lg {
  padding: 1rem 2rem;
  font-size: 1.125rem;
  min-height: 3.5rem;
}

/* Variants */
.btn-primary {
  background: var(--phenom-gradient-primary);
  color: white;
  border: 1px solid var(--phenom-border-soft);
  box-shadow: var(--phenom-glow-primary-medium);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--phenom-glow-primary-strong);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn-secondary {
  background: var(--phenom-surface-glass-base);
  color: var(--phenom-text-primary);
  border: 1px solid var(--phenom-border-soft);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--phenom-surface-glass-soft);
  border-color: var(--phenom-border-medium);
}

.btn-outline {
  background: transparent;
  border: 2px solid var(--phenom-primary);
  color: var(--phenom-primary);
  backdrop-filter: blur(10px);
}

.btn-outline:hover:not(:disabled) {
  background: var(--phenom-primary);
  color: white;
  box-shadow: var(--phenom-glow-primary-medium);
}

.btn-ghost {
  background: transparent;
  color: var(--phenom-text-secondary);
  border: 1px solid transparent;
}

.btn-ghost:hover:not(:disabled) {
  background: var(--phenom-surface-glass-base);
  color: var(--phenom-text-primary);
}

.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border: 1px solid var(--phenom-border-soft);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
}

.btn-danger:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(239, 68, 68, 0.6);
}

/* States */
.btn:disabled,
.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.btn-loading {
  pointer-events: none;
}

/* Modifiers */
.btn-full {
  width: 100%;
}

.btn-rounded {
  border-radius: var(--phenom-radius-full);
}

/* Spinner */
.btn-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Icons */
.btn-icon,
.btn-icon-right {
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.btn-icon-right {
  width: 1.25rem;
  height: 1.25rem;
}

/* Mobile optimization */
@media (max-width: 640px) {
  .btn-md {
    min-height: 3rem;
    padding: 0.875rem 1.25rem;
  }

  .btn-lg {
    min-height: 3.75rem;
  }
}

/* Active/Focus states */
.btn:focus-visible {
  outline: 2px solid var(--phenom-primary);
  outline-offset: 2px;
}
</style>
