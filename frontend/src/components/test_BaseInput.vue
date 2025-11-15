<template>
  <div
    class="input-wrapper"
    :class="{ 'input-error': error, 'input-disabled': disabled }"
  >
    <label v-if="label" :for="id" class="input-label">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <div class="input-container">
      <!-- Icon (left) -->
      <span v-if="$slots.icon" class="input-icon-left">
        <slot name="icon"></slot>
      </span>

      <!-- Input field -->
      <input
        :id="id"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :class="inputClasses"
        @input="handleInput"
        @blur="handleBlur"
        @focus="handleFocus"
      />

      <!-- Icon (right) / Clear button -->
      <span
        v-if="modelValue && clearable"
        class="input-icon-right cursor-pointer"
        @click="clear"
      >
        <svg
          class="w-5 h-5 text-gray-400 hover:text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </span>
      <span v-else-if="$slots.iconRight" class="input-icon-right">
        <slot name="iconRight"></slot>
      </span>
    </div>

    <!-- Helper text / Error message -->
    <p v-if="error" class="input-error-text">{{ error }}</p>
    <p v-else-if="helper" class="input-helper-text">{{ helper }}</p>
  </div>
</template>

<script setup>
import { computed, useSlots } from "vue";

const props = defineProps({
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).substr(2, 9)}`,
  },
  modelValue: [String, Number],
  type: {
    type: String,
    default: "text",
  },
  label: String,
  placeholder: String,
  error: String,
  helper: String,
  disabled: Boolean,
  required: Boolean,
  clearable: Boolean,
  autocomplete: String,
});

const emit = defineEmits(["update:modelValue", "blur", "focus"]);

const slots = useSlots();

const inputClasses = computed(() => {
  return [
    "input-field",
    {
      "input-with-icon-left": !!slots.icon,
      "input-with-icon-right": !!slots.iconRight || props.clearable,
    },
  ];
});

const handleInput = (event) => {
  emit("update:modelValue", event.target.value);
};

const handleBlur = (event) => {
  emit("blur", event);
};

const handleFocus = (event) => {
  emit("focus", event);
};

const clear = () => {
  emit("update:modelValue", "");
};
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: var(--phenom-space-2);
  width: 100%;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--phenom-text-primary);
  display: block;
}

.input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border: 1px solid var(--phenom-border-medium);
  border-radius: var(--phenom-radius-lg);
  background: var(--phenom-surface-glass-strong);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: var(--phenom-text-primary);
  transition: var(--phenom-transition-base);
  outline: none;
  font-family: inherit;
  font-weight: 500;
  box-sizing: border-box; /* Ensure padding is included in width and prevents overlap */
}

.input-field:focus {
  border-color: var(--phenom-primary);
  box-shadow: 0 0 0 3px rgba(123, 63, 242, 0.15);
  background: var(--phenom-surface-glass-active);
}

.input-field::placeholder {
  color: var(--phenom-text-placeholder);
  font-weight: 400;
}

.input-field:disabled {
  background: var(--phenom-surface-glass);
  cursor: not-allowed;
  opacity: 0.6;
}

/* With icons */
.input-with-icon-left {
  /* Make space for icon + extra gap so text does not overlap */
  padding-left: 3rem;
}

.input-with-icon-right {
  padding-right: 3rem;
}

.input-icon-left,
.input-icon-right {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  color: var(--phenom-text-tertiary);
}

.input-icon-left {
  left: 0.75rem; /* inside the padding, centered */
  pointer-events: none; /* left icon shouldn't block clicks */
}

.input-icon-right {
  right: 0.75rem; /* inside the padding, centered */
  pointer-events: auto;
}

/* Error state */
.input-error .input-field {
  border-color: #ef4444;
}

.input-error .input-field:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.2);
}

.input-error-text {
  font-size: 0.875rem;
  color: #ef4444;
  margin: 0;
}

.input-helper-text {
  font-size: 0.875rem;
  color: var(--phenom-text-secondary);
  margin: 0;
}

/* Mobile optimization */
@media (max-width: 640px) {
  .input-field {
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 0.875rem 1rem;
    min-height: 3rem;
  }

  .input-with-icon-left {
    padding-left: 3.5rem; /* add a touch more space on mobile */
  }

  .input-with-icon-right {
    padding-right: 3.5rem; /* add a touch more space on mobile */
  }
}
</style>
