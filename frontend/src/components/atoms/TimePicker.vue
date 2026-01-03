<!--
  ============================================================================
  TimePicker.vue - Native Time Picker Component
  ============================================================================
  
  PURPOSE:
  A styled native time input that provides consistent dark theme styling
  while leveraging the browser's native time picker for best UX on mobile.

  FEATURES:
  - Native browser time picker (great mobile support)
  - Optional label with required indicator
  - Error state with message
  - Disabled state
  - Dark color scheme styling

  USAGE EXAMPLES:
  <TimePicker v-model="time" label="Observation Time" />
  <TimePicker v-model="startTime" required />

  PROPS:
  - modelValue: Time string in HH:MM format (v-model)
  - label: Label text above the input
  - error: Error message to display
  - disabled: Whether the input is disabled
  - required: Whether a time is required

  EVENTS:
  - update:modelValue: Emitted when time changes
  ============================================================================
-->

<script setup>
/**
 * TimePicker - Native Time Picker Component
 * Design System: Phenom Search
 */

defineOptions({ name: "TimePicker" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
const props = defineProps({
  // Time value in HH:MM format (v-model binding)
  modelValue: {
    type: String,
    default: "",
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
});

// =============================================================================
// EVENTS
// =============================================================================
const emit = defineEmits(["update:modelValue"]);

/**
 * Handle input change and emit new time value
 */
const handleInput = (e) => {
  emit("update:modelValue", e.target.value);
};
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

    <!-- Time Input Container -->
    <div class="relative">
      <!-- 
        Native Time Input
        - Uses browser's native time picker
        - [color-scheme:dark] enables dark mode for the picker
      -->
      <input
        type="time"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :class="[
          'w-full py-3 px-4 bg-white/5 border text-white',
          'focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/20',
          'transition-all duration-200',
          '[color-scheme:dark]',
          error ? 'border-red-500/50' : 'border-white/10',
          { 'opacity-50 cursor-not-allowed': disabled },
        ]"
        @input="handleInput"
      />
    </div>

    <!-- Error Message (conditional) -->
    <p v-if="error" class="mt-2 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
/* Invert the clock icon color for dark theme (WebKit browsers) */
input[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}
</style>
