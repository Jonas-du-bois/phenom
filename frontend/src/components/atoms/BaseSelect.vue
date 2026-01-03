<!--
  ============================================================================
  BaseSelect.vue - Dropdown Select Component
  ============================================================================
  
  PURPOSE:
  A styled native select dropdown for single-choice selection.
  Provides a consistent look with the design system while maintaining
  native browser behavior and accessibility.

  FEATURES:
  - Native select element (good accessibility and mobile support)
  - Optional label with required indicator
  - Error state with message display
  - Disabled state
  - Custom chevron icon
  - Dark theme styling

  USAGE EXAMPLES:
  <BaseSelect v-model="selected" :options="options" label="Category" />
  <BaseSelect v-model="status" :options="statusOptions" required />

  PROPS:
  - modelValue: Currently selected value (v-model)
  - options: Array of { value, label } objects
  - label: Optional label text
  - placeholder: Placeholder text when nothing selected
  - error: Error message to display
  - disabled: Whether the select is disabled
  - required: Whether selection is required

  EVENTS:
  - update:modelValue: Emitted when selection changes (v-model)
  ============================================================================
-->

<script setup>
/**
 * BaseSelect - Dropdown Select Component
 * Design System: Phenom Search
 */

defineOptions({ name: "BaseSelect" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
const props = defineProps({
  // Current selected value (v-model binding)
  modelValue: {
    type: [String, Number],
    default: "",
  },
  // Array of options: [{ value: 'val', label: 'Display Label' }]
  options: {
    type: Array,
    required: true,
  },
  // Label text displayed above the select
  label: {
    type: String,
    default: "",
  },
  // Placeholder shown when no value is selected
  placeholder: {
    type: String,
    default: "Sélectionner...",
  },
  // Error message (triggers error styling when set)
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
 * Handle select change and emit new value
 */
const handleChange = (e) => {
  emit("update:modelValue", e.target.value);
};
</script>

<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="label"
      class="block mb-2 text-xs uppercase tracking-wider text-white/60"
    >
      {{ label }}
      <span v-if="required" class="text-[#00F0FF]">*</span>
    </label>

    <!-- Select Container (relative for positioning the chevron) -->
    <div class="relative">
      <!-- Native Select Element -->
      <select
        :value="modelValue"
        :disabled="disabled"
        :required="required"
        :class="[
          'w-full py-3 px-4 pr-10 bg-white/5 border text-white',
          'appearance-none cursor-pointer',
          'focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/20',
          'transition-all duration-200',
          error ? 'border-red-500/50' : 'border-white/10',
          { 'opacity-50 cursor-not-allowed': disabled },
        ]"
        @change="handleChange"
      >
        <!-- Placeholder Option (disabled, cannot be reselected) -->
        <option value="" disabled class="bg-[#12151C] text-white/40">
          {{ placeholder }}
        </option>
        <!-- Dynamic Options -->
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          class="bg-[#12151C] text-white"
        >
          {{ option.label }}
        </option>
      </select>

      <!-- Chevron Down Icon (visual indicator for dropdown) -->
      <div
        class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40"
      >
        <svg
          class="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>

    <!-- Error Message (conditional) -->
    <p v-if="error" class="mt-2 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>
