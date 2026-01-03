<!--
  ============================================================================
  FilterChip.vue - Clickable filter chip/tag component
  ============================================================================
  
  PURPOSE:
  A toggle-able chip/tag component used in filter panels. Users can click
  to select/deselect filter options. Supports optional count display and
  remove button for active chips.
  
  FEATURES:
  - Active/inactive toggle states
  - Cyan highlight when active
  - Optional count badge (e.g., "(12)")
  - Optional remove button for selected chips
  - Uppercase text with letter spacing
  - Pill/capsule shape with rounded corners
  - Smooth transitions
  
  USAGE EXAMPLES:
  <FilterChip
    label="UFO"
    :active="isSelected"
    :count="12"
    :removable="true"
    @click="toggleFilter"
    @remove="removeFilter"
  />
  
  PROPS:
  - label: String (required) - Text displayed on the chip
  - active: Boolean (default: false) - Active/selected state
  - selected: Boolean (default: false) - Alias for active
  - removable: Boolean (default: false) - Show remove button when active
  - count: Number (default: null) - Optional count to display
  
  EVENTS:
  - @click - Emitted when chip is clicked
  - @remove - Emitted when remove button is clicked (only if removable)
  ============================================================================
-->

<script setup>
/**
 * FilterChip - Toggleable filter chip component
 * Design System: Phenom Search - Dark theme with cyan accents
 */
defineOptions({ name: "FilterChip" });

// ============================================================================
// PROPS DEFINITION
// ============================================================================
const props = defineProps({
  // Text displayed on the chip
  label: {
    type: String,
    required: true,
  },
  // Whether the chip is in active/selected state
  active: {
    type: Boolean,
    default: false,
  },
  // Alias for active (for compatibility)
  selected: {
    type: Boolean,
    default: false,
  },
  // Whether to show a remove button when active
  removable: {
    type: Boolean,
    default: false,
  },
  // Optional count to display next to the label
  count: {
    type: Number,
    default: null,
  },
});

// ============================================================================
// EVENTS
// ============================================================================
const emit = defineEmits(["click", "remove"]);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Check if chip is in active state (either active or selected prop)
 */
const isActive = () => props.active || props.selected;
</script>

<template>
  <button
    type="button"
    :class="[
      'inline-flex items-center gap-2 px-4 py-2 border text-sm rounded-full',
      'uppercase tracking-wider transition-all duration-200 whitespace-nowrap flex-shrink-0',
      isActive()
        ? 'bg-[#00F0FF]/10 border-[#00F0FF]/50 text-[#00F0FF]'
        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white/80',
    ]"
    @click="emit('click')"
  >
    {{ label }}
    <span
      v-if="count !== null"
      :class="['text-xs', isActive() ? 'text-[#00F0FF]/70' : 'text-white/40']"
    >
      ({{ count }})
    </span>
    <!-- Remove button -->
    <span
      v-if="removable && isActive()"
      class="ml-1 hover:text-red-400 transition-colors"
      @click.stop="emit('remove')"
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
    </span>
  </button>
</template>
