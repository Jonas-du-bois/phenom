<script setup>
/**
 * RangeInput - Input de plage numérique
 * Design System: Phenom Search
 */
import { computed } from "vue";

defineOptions({ name: "RangeInput" });

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  step: {
    type: Number,
    default: 1,
  },
  label: {
    type: String,
    default: "",
  },
  showValue: {
    type: Boolean,
    default: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

const handleInput = (e) => {
  emit("update:modelValue", Number(e.target.value));
};

// Pourcentage pour le style de la track
const percentage = computed(() => {
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100;
});
</script>

<template>
  <div class="w-full">
    <!-- Label & Value -->
    <div
      v-if="label || showValue"
      class="flex items-center justify-between mb-2"
    >
      <label
        v-if="label"
        class="text-xs uppercase tracking-wider text-white/60"
      >
        {{ label }}
      </label>
      <span v-if="showValue" class="text-sm text-[#00F0FF] font-mono">
        {{ modelValue }}
      </span>
    </div>

    <!-- Range Input -->
    <input
      type="range"
      :value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      :disabled="disabled"
      class="range-input w-full"
      :style="{ '--progress': `${percentage}%` }"
      @input="handleInput"
    />

    <!-- Min/Max Labels -->
    <div class="flex justify-between mt-1">
      <span class="text-[0.65rem] text-white/30">{{ min }}</span>
      <span class="text-[0.65rem] text-white/30">{{ max }}</span>
    </div>
  </div>
</template>

<style scoped>
.range-input {
  -webkit-appearance: none;
  appearance: none;
  height: 4px;
  background: linear-gradient(
    to right,
    #00f0ff var(--progress),
    rgba(255, 255, 255, 0.1) var(--progress)
  );
  border-radius: 2px;
  cursor: pointer;
}

.range-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: #00f0ff;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s;
}

.range-input::-webkit-slider-thumb:hover {
  transform: scale(1.2);
}

.range-input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: #00f0ff;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}
</style>
