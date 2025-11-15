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
import { computed } from "vue";

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

const inputClasses = computed(() => {
  return [
    "input-field",
    {
      "input-with-icon-left": !!props.$slots?.icon,
      "input-with-icon-right": !!props.$slots?.iconRight || props.clearable,
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
  gap: 0.5rem;
  width: 100%;
}

.input-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
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
  border: 2px solid #d1d5db;
  border-radius: 0.5rem;
  background: white;
  transition: all 0.2s;
  outline: none;
  font-family: inherit;
}

.input-field:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.input-field::placeholder {
  color: #9ca3af;
}

.input-field:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
  opacity: 0.6;
}

/* With icons */
.input-with-icon-left {
  padding-left: 2.75rem;
}

.input-with-icon-right {
  padding-right: 2.75rem;
}

.input-icon-left,
.input-icon-right {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

.input-icon-left {
  left: 1rem;
}

.input-icon-right {
  right: 1rem;
}

/* Error state */
.input-error .input-field {
  border-color: #ef4444;
}

.input-error .input-field:focus {
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.input-error-text {
  font-size: 0.875rem;
  color: #ef4444;
  margin: 0;
}

.input-helper-text {
  font-size: 0.875rem;
  color: #6b7280;
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
    padding-left: 3rem;
  }

  .input-with-icon-right {
    padding-right: 3rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .input-label {
    color: #e5e7eb;
  }

  .input-field {
    background: #1f2937;
    border-color: #374151;
    color: #f3f4f6;
  }

  .input-field:focus {
    border-color: #818cf8;
  }
}
</style>
