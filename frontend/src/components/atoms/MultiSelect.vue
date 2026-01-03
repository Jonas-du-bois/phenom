<!--
  ============================================================================
  MultiSelect.vue - Multiple Selection Dropdown Component
  ============================================================================
  
  PURPOSE:
  A dropdown component that allows selecting multiple values.
  Selected items appear as removable chips/tags inside the trigger area.

  FEATURES:
  - Multiple selection with visual chips
  - Removable selected items
  - Optional max items limit
  - Click-outside to close dropdown
  - Disabled state
  - Error state with message

  USAGE EXAMPLES:
  <MultiSelect v-model="selectedTypes" :options="typeOptions" label="Types" />
  <MultiSelect v-model="tags" :options="tagOptions" :maxItems="5" />

  PROPS:
  - modelValue: Array of selected values (v-model)
  - options: Array of { value, label } objects
  - label: Label text above the select
  - placeholder: Text when nothing is selected
  - error: Error message to display
  - disabled: Whether select is disabled
  - maxItems: Maximum number of selections allowed

  EVENTS:
  - update:modelValue: Emitted when selection changes

  NOTE: Requires v-click-outside directive to be registered globally
  ============================================================================
-->

<script setup>
/**
 * MultiSelect - Multiple Selection Dropdown Component
 * Design System: Phenom Search
 */
import { ref, computed } from "vue";

defineOptions({ name: "MultiSelect" });

// =============================================================================
// PROPS DEFINITION
// =============================================================================
const props = defineProps({
  // Array of selected values (v-model binding)
  modelValue: {
    type: Array,
    default: () => [],
  },
  // Available options: [{ value: 'val', label: 'Label' }]
  options: {
    type: Array,
    required: true,
  },
  // Label text displayed above the select
  label: {
    type: String,
    default: "",
  },
  // Placeholder when no items are selected
  placeholder: {
    type: String,
    default: "Select...",
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
  // Maximum number of items that can be selected
  maxItems: {
    type: Number,
    default: null,
  },
});

// =============================================================================
// EVENTS
// =============================================================================
const emit = defineEmits(["update:modelValue"]);

// =============================================================================
// REACTIVE STATE
// =============================================================================

// Controls dropdown visibility
const isOpen = ref(false);

// =============================================================================
// COMPUTED PROPERTIES
// =============================================================================

// Options that haven't been selected yet (shown in dropdown)
const availableOptions = computed(() => {
  return props.options.filter((opt) => !props.modelValue.includes(opt.value));
});

// Selected values mapped to their full option objects (for displaying labels)
const selectedOptions = computed(() => {
  return props.modelValue.map((value) => {
    const opt = props.options.find((o) => o.value === value);
    return opt || { value, label: value };
  });
});

// Whether more items can be added (respects maxItems limit)
const canAddMore = computed(() => {
  if (!props.maxItems) return true;
  return props.modelValue.length < props.maxItems;
});

// =============================================================================
// METHODS
// =============================================================================

/**
 * Toggle an option's selection state
 */
const toggleOption = (value) => {
  if (props.disabled) return;

  const newValue = [...props.modelValue];
  const index = newValue.indexOf(value);

  if (index === -1 && canAddMore.value) {
    // Add option if not selected and under limit
    newValue.push(value);
  } else if (index !== -1) {
    // Remove if already selected
    newValue.splice(index, 1);
  }

  emit("update:modelValue", newValue);
};

/**
 * Remove a selected option
 */
const removeOption = (value) => {
  const newValue = props.modelValue.filter((v) => v !== value);
  emit("update:modelValue", newValue);
};

/**
 * Close dropdown when clicking outside
 */
const handleClickOutside = () => {
  isOpen.value = false;
};
</script>

<template>
  <!-- Container with click-outside directive -->
  <div class="w-full relative" v-click-outside="handleClickOutside">
    <!-- Label (optional) -->
    <label
      v-if="label"
      class="block mb-2 text-xs uppercase tracking-wider text-white/60"
    >
      {{ label }}
    </label>

    <!-- Trigger Button (shows selected items or placeholder) -->
    <button
      type="button"
      :disabled="disabled"
      :class="[
        'w-full min-h-[48px] px-4 py-2 bg-white/5 border text-left',
        'focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/20',
        'transition-all duration-200',
        error ? 'border-red-500/50' : 'border-white/10',
        { 'opacity-50 cursor-not-allowed': disabled },
      ]"
      @click="isOpen = !isOpen"
    >
      <!-- Selected Items as Chips -->
      <div v-if="selectedOptions.length > 0" class="flex flex-wrap gap-2">
        <span
          v-for="opt in selectedOptions"
          :key="opt.value"
          class="inline-flex items-center gap-1 px-2 py-1 bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-xs"
        >
          {{ opt.label }}
          <!-- Remove button for each chip -->
          <button
            type="button"
            class="hover:text-white transition-colors"
            @click.stop="removeOption(opt.value)"
          >
            <svg
              class="w-3 h-3"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </span>
      </div>

      <!-- Placeholder (when nothing selected) -->
      <span v-else class="text-white/40">
        {{ placeholder }}
      </span>
    </button>

    <!-- Dropdown Options List -->
    <Transition name="fade">
      <div
        v-if="isOpen && availableOptions.length > 0"
        class="absolute z-20 w-full mt-1 max-h-60 overflow-y-auto bg-[#12151C] border border-white/10"
      >
        <button
          v-for="option in availableOptions"
          :key="option.value"
          type="button"
          :disabled="!canAddMore"
          :class="[
            'w-full px-4 py-3 text-left text-sm text-white/70',
            'hover:bg-white/5 hover:text-[#00F0FF]',
            'transition-colors',
            { 'opacity-50 cursor-not-allowed': !canAddMore },
          ]"
          @click="toggleOption(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </Transition>

    <!-- Error Message (conditional) -->
    <p v-if="error" class="mt-2 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>
