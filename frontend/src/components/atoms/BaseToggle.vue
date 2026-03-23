<!--
  ============================================================================
  BaseToggle.vue - Toggle Switch Component
  ============================================================================
  
  PURPOSE:
  A toggle switch component for boolean on/off settings.
  Provides an intuitive visual toggle with smooth animation.

  FEATURES:
  - Animated sliding toggle
  - Optional label text
  - Disabled state
  - Accessible with proper ARIA attributes (role="switch")
  - v-model support for two-way binding

  USAGE EXAMPLES:
  <BaseToggle v-model="isEnabled" />
  <BaseToggle v-model="darkMode" label="Dark Mode" />
  <BaseToggle v-model="setting" :disabled="!canEdit" />

  PROPS:
  - modelValue: Boolean toggle state (v-model)
  - label: Optional label text displayed next to toggle
  - disabled: Whether the toggle is disabled

  EVENTS:
  - update:modelValue: Emitted when toggle state changes
  ============================================================================
-->

<script setup>
/**
 * BaseToggle - Toggle Switch Component
 * Design System: Phenom Search
 */

defineOptions({ name: "BaseToggle" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  // Current toggle state (v-model binding)
  modelValue: {
    type: Boolean,
    default: false,
  },
  // Label text displayed next to the toggle
  label: {
    type: String,
    default: "",
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
 * Toggle the switch state
 * Only works if not disabled
 */
const toggle = () => {
  if (!props.disabled) {
    emit("update:modelValue", !props.modelValue);
  }
};
</script>

<template>
  <!-- 
    Label wrapper - entire row is clickable
    Uses inline-flex for horizontal layout
  -->
  <label
    :class="[
      'inline-flex items-center gap-3 cursor-pointer',
      { 'opacity-50 cursor-not-allowed': disabled },
    ]"
  >
    <!-- 
      Toggle Switch Button
      - role="switch" for accessibility
      - aria-checked reflects current state
      - Background changes color based on state
    -->
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      :class="[
        'relative w-11 h-6 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F0FF] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent transition-colors duration-200',
        modelValue ? 'bg-[#00F0FF]' : 'bg-white/20',
      ]"
      @click="toggle"
    >
      <!-- Toggle Knob - slides left/right based on state -->
      <span
        :class="[
          'absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform duration-200',
          { 'translate-x-5': modelValue },
        ]"
      />
    </button>

    <!-- Label Text (optional) -->
    <span v-if="label" class="text-sm text-white/70">
      {{ label }}
    </span>
  </label>
</template>
