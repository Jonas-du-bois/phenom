<!--
  ============================================================================
  RangeInput.vue - Range Slider Input Component
  ============================================================================
  
  PURPOSE:
  A styled range/slider input for selecting numeric values within a range.
  Features a custom styled track with progress visualization.

  FEATURES:
  - Custom styled slider track with progress color
  - Optional label and current value display
  - Min/max value labels
  - Configurable step value
  - Disabled state
  - Cyan accent color matching design system

  USAGE EXAMPLES:
  <RangeInput v-model="volume" :min="0" :max="100" label="Volume" />
  <RangeInput v-model="rating" :min="1" :max="10" :step="1" />
  <RangeInput v-model="opacity" :min="0" :max="1" :step="0.1" />

  PROPS:
  - modelValue: Current value (v-model)
  - min: Minimum value (default: 0)
  - max: Maximum value (default: 100)
  - step: Step increment (default: 1)
  - label: Label text above the slider
  - showValue: Whether to show current value (default: true)
  - disabled: Whether slider is disabled

  EVENTS:
  - update:modelValue: Emitted when value changes
  ============================================================================
-->

<script setup>
/**
 * RangeInput - Range Slider Input Component
 * Design System: Phenom Search
 */
import { computed } from "vue";

defineOptions({ name: "RangeInput" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
const props = defineProps({
  // Current value (v-model binding)
  modelValue: {
    type: Number,
    default: 0,
  },
  // Minimum allowed value
  min: {
    type: Number,
    default: 0,
  },
  // Maximum allowed value
  max: {
    type: Number,
    default: 100,
  },
  // Step increment between values
  step: {
    type: Number,
    default: 1,
  },
  // Label text displayed above slider
  label: {
    type: String,
    default: "",
  },
  // Whether to display current value
  showValue: {
    type: Boolean,
    default: true,
  },
  // Disabled state
  disabled: {
    type: Boolean,
    default: false,
  },
});

// =============================================================================
// EVENTS
// =============================================================================
const emit = defineEmits(["update:modelValue"]);

/**
 * Handle input change and emit new value
 */
const handleInput = (e) => {
  emit("update:modelValue", Number(e.target.value));
};

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

/**
 * Calculate percentage for styling the progress track
 * Used as CSS custom property --progress
 */
const percentage = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100;
});
</script>

<template>
  <div class="w-full">
    <!-- Label & Current Value Row -->
    <div
      v-if="label || showValue"
      class="flex items-center justify-between mb-2"
    >
      <label
        v-if="label"
        class="text-xs uppercase tracking-wider text-white/60"
      >
        {{ label }}
      </label>
      <!-- Current value display (monospace for alignment) -->
      <span v-if="showValue" class="text-sm text-[#00F0FF] font-mono">
        {{ modelValue }}
      </span>
    </div>

    <!-- 
      Range Input
      - Custom CSS styling via scoped styles
      - Uses --progress CSS variable for track fill
    -->
    <input
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      class="range-input w-full"
      :style="{ '--progress': `${percentage}%` }"
      @input="handleInput"
    />

    <!-- Min/Max Labels -->
    <div class="flex justify-between mt-1">
      <span class="text-[0.65rem] text-white/30">{{ min }}</span>
      <span class="text-[0.65rem] text-white/30">{{ max }}</span>
    </div>
  </div>
</template>

<style scoped>
/* Custom range input styling */
.range-input {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  /* Gradient track: filled portion (cyan) + unfilled (white/10%) */
  background: linear-gradient(
    to right,
    #00f0ff var(--progress),
    rgba(255, 255, 255, 0.1) var(--progress)
  );
  border-radius: 2px;
  cursor: pointer;
}

.range-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Thumb styling for WebKit browsers (Chrome, Safari) */
.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #00f0ff;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
}

.range-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

/* Thumb styling for Firefox */
.range-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #00f0ff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}
</style>
