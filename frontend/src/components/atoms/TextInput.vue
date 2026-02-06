<!--
  ============================================================================
  TextInput.vue - Single-line Text Input Component
  ============================================================================
  
  PURPOSE:
  A styled single-line text input supporting various input types.
  Includes slots for left/right icons and standard form features.

  FEATURES:
  - Multiple input types (text, email, password, number, etc.)
  - Optional label with required indicator
  - Left and right icon slots
  - Error state with message
  - Disabled state
  - Focus and blur events
  - Autocomplete control

  USAGE EXAMPLES:
  <TextInput v-model="email" type="email" label="Email" required />
  <TextInput v-model="search" placeholder="Search...">
    <template #leftIcon><SearchIcon /></template>
  </TextInput>
  <TextInput v-model="password" type="password" label="Password">
    <template #rightIcon><EyeIcon /></template>
  </TextInput>

  PROPS:
  - modelValue: Input value (v-model)
  - type: HTML input type (default: 'text')
  - label: Label text above input
  - placeholder: Placeholder text
  - error: Error message to display
  - disabled: Whether input is disabled
  - required: Whether field is required
  - autocomplete: Autocomplete attribute value

  SLOTS:
  - leftIcon: Icon displayed on the left side of input
  - rightIcon: Icon displayed on the right side of input

  EVENTS:
  - update:modelValue: Emitted on input change
  - blur: Emitted when input loses focus
  - focus: Emitted when input gains focus
  ============================================================================
-->

<script setup>
import { computed, useId } from "vue";

/**
 * TextInput - Single-line Text Input Component
 * Design System: Phenom Search
 */

defineOptions({ name: "TextInput" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  // Input value (v-model binding)
  modelValue: {
    type: [String, Number],
    default: "",
  },
  // HTML input type attribute
  type: {
    type: String,
    default: "text",
  },
  // Label text displayed above input
  label: {
    type: String,
    default: "",
  },
  // Placeholder text
  placeholder: {
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
  // HTML autocomplete attribute
  autocomplete: {
    type: String,
    default: "off",
  },
  // Input ID (optional, will be generated if missing)
  id: {
    type: String,
    default: "",
  },
});

// =============================================================================
// EVENTS
// =============================================================================
const emit = defineEmits(["update:modelValue", "blur", "focus"]);

// Generate a unique ID if not provided
const uniqueId = useId();
const inputId = computed(() => props.id || uniqueId);

/**
 * Handle input and emit new value
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
      :for="inputId"
      class="block mb-2 text-xs uppercase tracking-wider text-white/60"
    >
      {{ label }}
      <span v-if="required" class="text-[#00F0FF]">*</span>
    </label>

    <!-- Input Container (relative for icon positioning) -->
    <div class="relative">
      <!-- Left Icon Slot -->
      <div
        v-if="$slots.leftIcon"
        class="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
      >
        <slot name="leftIcon" />
      </div>

      <!-- Input Element -->
      <input
        :id="inputId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :autocomplete="autocomplete"
        :class="[
          'w-full py-3 bg-white/5 border text-white',
          'placeholder:text-white/40',
          'focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/20',
          'transition-all duration-200',
          // Adjust padding based on icon slots
          $slots.leftIcon ? 'pl-10 pr-4' : 'px-4',
          $slots.rightIcon ? 'pr-10' : '',
          error ? 'border-red-500/50' : 'border-white/10',
          { 'opacity-50 cursor-not-allowed': disabled },
        ]"
        @input="handleInput"
        @blur="emit('blur', $event)"
        @focus="emit('focus', $event)"
      />

      <!-- Right Icon Slot -->
      <div
        v-if="$slots.rightIcon"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40"
      >
        <slot name="rightIcon" />
      </div>
    </div>

    <!-- Error Message (conditional) -->
    <p v-if="error" class="mt-2 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>
