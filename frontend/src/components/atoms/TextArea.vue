<!--
  ============================================================================
  TextArea.vue - Multi-line Text Input Component
  ============================================================================
  
  PURPOSE:
  A styled multi-line text input for longer text content like descriptions,
  comments, or notes. Supports character counting and validation.

  FEATURES:
  - Multi-line text input
  - Optional label with required indicator
  - Character count display (when maxlength set)
  - Min/max length validation
  - Error state with message
  - Disabled state
  - Focus and blur events
  - Non-resizable (resize: none)

  USAGE EXAMPLES:
  <TextArea v-model="description" label="Description" :rows="6" />
  <TextArea v-model="comment" :maxlength="500" showCount />
  <TextArea v-model="notes" placeholder="Add notes..." required />

  PROPS:
  - modelValue: Text content (v-model)
  - label: Label text above textarea
  - placeholder: Placeholder text
  - error: Error message to display
  - disabled: Whether textarea is disabled
  - required: Whether field is required
  - rows: Number of visible text rows (default: 4)
  - maxlength: Maximum character limit
  - minlength: Minimum character limit
  - showCount: Whether to show character count

  EVENTS:
  - update:modelValue: Emitted on text change
  - blur: Emitted when textarea loses focus
  - focus: Emitted when textarea gains focus
  ============================================================================
-->

<script setup>
import { computed } from "vue";

/**
 * TextArea - Multi-line Text Input Component
 * Design System: Phenom Search
 */

defineOptions({ name: "TextArea" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
const props = defineProps({
  // Text content (v-model binding)
  modelValue: {
    type: String,
    default: "",
  },
  // Label text displayed above textarea
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
  // Number of visible rows
  rows: {
    type: Number,
    default: 4,
  },
  // Maximum character length
  maxlength: {
    type: Number,
    default: null,
  },
  // Minimum character length
  minlength: {
    type: Number,
    default: null,
  },
  // Whether to display character count
  showCount: {
    type: Boolean,
    default: false,
  },
});

// =============================================================================
// EVENTS
// =============================================================================
const emit = defineEmits(["update:modelValue", "blur", "focus"]);

/**
 * Handle input and emit new value
 */
const handleInput = (e) => {
  emit("update:modelValue", e.target.value);
};

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

// Current character count
const charCount = computed(() => props.modelValue?.length || 0);
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

    <!-- Textarea Element -->
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :rows="rows"
      :maxlength="maxlength"
      :minlength="minlength"
      :class="[
        'w-full px-4 py-3 bg-white/5 border text-white resize-none',
        'placeholder:text-white/40',
        'focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/20',
        'transition-all duration-200',
        error ? 'border-red-500/50' : 'border-white/10',
        { 'opacity-50 cursor-not-allowed': disabled },
      ]"
      @input="handleInput"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />

    <!-- Footer: Error message and character count -->
    <div class="flex items-center justify-between mt-2">
      <!-- Error Message -->
      <p v-if="error" class="text-xs text-red-500">
        {{ error }}
      </p>
      <span v-else />

      <!-- Character Count (shown when maxlength is set and showCount is true) -->
      <p
        v-if="showCount && maxlength"
        :class="[
          'text-xs',
          charCount >= maxlength ? 'text-red-500' : 'text-white/40',
        ]"
      >
        {{ charCount }}/{{ maxlength }}
      </p>
    </div>
  </div>
</template>
