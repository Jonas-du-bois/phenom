<!--
  ============================================================================
  DurationInput.vue - Duration Input Component (Seconds)
  ============================================================================
  
  PURPOSE:
  An input component for entering duration in seconds, with a live formatted
  display showing human-readable time (e.g., "2h 30min" or "45s").
  Used for observation duration fields.

  FEATURES:
  - Numeric input in seconds
  - Live formatted duration display (seconds → human readable)
  - Maximum value constraint
  - Hides browser number spinners for cleaner look
  - Error state with message
  - Disabled state

  FORMAT EXAMPLES:
  - 30 → "30s"
  - 90 → "1min 30s"
  - 3600 → "1h"
  - 5400 → "1h 30min"

  USAGE EXAMPLES:
  <DurationInput v-model="duration" label="Observation Duration" />
  <DurationInput v-model="seconds" :max="3600" />  (max 1 hour)

  PROPS:
  - modelValue: Duration in seconds (v-model)
  - label: Label text above the input
  - error: Error message to display
  - disabled: Whether input is disabled
  - required: Whether a value is required
  - max: Maximum allowed seconds (default: 86400 = 24 hours)

  EVENTS:
  - update:modelValue: Emitted when duration changes
  ============================================================================
-->

<script setup>
/**
 * DurationInput - Duration Input Component (Seconds)
 * Design System: Phenom Search
 */
import { computed } from "vue";

defineOptions({ name: "DurationInput" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
const props = defineProps({
  // Duration value in seconds (v-model binding)
  modelValue: {
    type: Number,
    default: 0,
  },
  // Label text displayed above the input
  label: {
    type: String,
    default: "",
  },
  // Error message (triggers error styling)
  error: {
    type: String,
    default: "",
  },
  // Disabled state
  disabled: {
    type: Boolean,
    default: false,
  },
  // Required field indicator
  required: {
    type: Boolean,
    default: false,
  },
  // Maximum allowed seconds (default: 24 hours)
  max: {
    type: Number,
    default: 86400,
  },
});

// =============================================================================
// EVENTS
// =============================================================================
const emit = defineEmits(["update:modelValue"]);

/**
 * Handle input and clamp value between 0 and max
 */
const handleInput = (e) => {
  const value = Math.min(Math.max(0, Number(e.target.value) || 0), props.max);
  emit("update:modelValue", value);
};

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

/**
 * Format seconds into human-readable duration string
 * Examples: 30 → "30s", 90 → "1min 30s", 3600 → "1h"
 */
const formattedDuration = computed(() => {
  const seconds = props.modelValue;
  
  // Less than a minute: show seconds only
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  // Less than an hour: show minutes (and seconds if any)
  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}min ${remainingSeconds}s`
      : `${minutes}min`;
  }

  // Hours and minutes
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}min`;
  }
  return `${hours}h`;
});
</script>

<template>
  <div class="w-full">
    <!-- Label (optional) -->
    <label
      v-if="label"
      class="block mb-2 text-xs uppercase tracking-wider text-white/60"
    >
      {{ label }}
      <span v-if="required" class="text-[#00F0FF]">*</span>
    </label>

    <!-- Input Container: Number input + Formatted display -->
    <div class="flex items-center gap-3">
      <!-- Number Input for raw seconds -->
      <div class="relative flex-1">
        <input
          type="number"
          :value="modelValue"
          :disabled="disabled"
          :required="required"
          min="0"
          :max="max"
          placeholder="0"
          :class="[
            'w-full py-3 px-4 pr-12 bg-white/5 border text-white',
            'focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/20',
            'transition-all duration-200',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            error ? 'border-red-500/50' : 'border-white/10',
            { 'opacity-50 cursor-not-allowed': disabled },
          ]"
          @input="handleInput"
        />
        <!-- Unit suffix inside input -->
        <span
          class="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm"
        >
          sec
        </span>
      </div>

      <!-- Formatted Duration Display (human-readable) -->
      <div
        class="px-3 py-2 bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-sm font-mono min-w-[100px] text-center"
      >
        {{ formattedDuration }}
      </div>
    </div>

    <!-- Error Message (conditional) -->
    <p v-if="error" class="mt-2 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>
