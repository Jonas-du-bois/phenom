<!--
  ============================================================================
  DatePicker.vue - Native Date Picker Component
  ============================================================================
  
  PURPOSE:
  A styled native date input that provides consistent dark theme styling
  while leveraging the browser's native date picker for best UX on mobile.

  FEATURES:
  - Native browser date picker (great mobile support)
  - Optional label with required indicator
  - Min/max date constraints
  - Error state with message
  - Disabled state
  - Dark color scheme styling

  USAGE EXAMPLES:
  <DatePicker v-model="date" label="Observation Date" />
  <DatePicker v-model="startDate" :max="today" required />
  <DatePicker v-model="birthDate" min="1900-01-01" :max="today" />

  PROPS:
  - modelValue: Date string in YYYY-MM-DD format (v-model)
  - label: Label text above the input
  - error: Error message to display
  - disabled: Whether the input is disabled
  - required: Whether a date is required
  - min: Minimum selectable date (YYYY-MM-DD)
  - max: Maximum selectable date (YYYY-MM-DD)

  EVENTS:
  - update:modelValue: Emitted when date changes
  ============================================================================
-->

<script setup>
/**
 * DatePicker - Native Date Picker Component
 * Design System: Phenom Search
 */

defineOptions({ name: "DatePicker" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
const props = defineProps({
  // Date value in YYYY-MM-DD format (v-model binding)
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
  // Minimum selectable date (YYYY-MM-DD format)
  min: {
    type: String,
    default: "",
  },
  // Maximum selectable date (YYYY-MM-DD format)
  max: {
    type: String,
    default: "",
  },
});

// =============================================================================
// EVENTS
// =============================================================================
const emit = defineEmits(["update:modelValue"]);

/**
 * Handle input change and emit new date value
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

    <!-- Date Input Container -->
    <div class="relative">
      <!-- 
        Native Date Input
        - Uses browser's native date picker
        - [color-scheme:dark] enables dark mode for the picker
      -->
      <input
        type="date"
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :min="min"
        :max="max"
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
/* Invert the calendar icon color for dark theme (WebKit browsers) */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}
</style>
