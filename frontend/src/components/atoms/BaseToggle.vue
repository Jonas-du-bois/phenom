<script setup>
/**
 * BaseToggle - Toggle switch
 * Design System: Phenom Search
 */

defineOptions({ name: "BaseToggle" });

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const toggle = () => {
  if (!props.disabled) {
    emit("update:modelValue", !props.modelValue);
  }
};
</script>

<template>
  <label
    :class="[
      'inline-flex items-center gap-3 cursor-pointer',
      { 'opacity-50 cursor-not-allowed': disabled },
    ]"
  >
    <!-- Toggle Switch -->
    <button
      type="button"
      role="switch"
      :aria-checked="modelValue"
      :disabled="disabled"
      :class="[
        'relative w-11 h-6 rounded-full transition-colors duration-200',
        modelValue ? 'bg-[#00F0FF]' : 'bg-white/20',
      ]"
      @click="toggle"
    >
      <span
        :class="[
          'absolute top-1 left-1 w-4 h-4 rounded-full bg-black transition-transform duration-200',
          { 'translate-x-5': modelValue },
        ]"
      />
    </button>

    <!-- Label -->
    <span v-if="label" class="text-sm text-white/70">
      {{ label }}
    </span>
  </label>
</template>
