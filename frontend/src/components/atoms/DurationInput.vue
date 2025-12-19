<script setup>
/**
 * DurationInput - Input de durée en secondes avec affichage formaté
 * Design System: Phenom Search
 */
import { computed } from "vue";

defineOptions({ name: "DurationInput" });

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  label: {
    type: String,
    default: "",
  },
  error: {
    type: String,
    default: "",
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  required: {
    type: Boolean,
    default: false,
  },
  max: {
    type: Number,
    default: 86400, // 24 heures en secondes
  },
});

const emit = defineEmits(["update:modelValue"]);

const handleInput = (e) => {
  const value = Math.min(Math.max(0, Number(e.target.value) || 0), props.max);
  emit("update:modelValue", value);
};

// Formater la durée pour affichage
const formattedDuration = computed(() => {
  const seconds = props.modelValue;
  if (seconds < 60) {
    return `${seconds}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}min ${remainingSeconds}s`
      : `${minutes}min`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}min`;
  }
  return `${hours}h`;
});
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

    <!-- Input Container -->
    <div class="flex items-center gap-3">
      <!-- Number Input -->
      <div class="relative flex-1">
        <input
          type="number"
          :value="modelValue"
          :disabled="disabled"
          :required="required"
          min="0"
          :max="max"
          placeholder="0"
          :class="[
            'w-full py-3 px-4 pr-12 bg-white/5 border text-white',
            'focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/20',
            'transition-all duration-200',
            '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
            error ? 'border-red-500/50' : 'border-white/10',
            { 'opacity-50 cursor-not-allowed': disabled },
          ]"
          @input="handleInput"
        />
        <span
          class="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 text-sm"
        >
          sec
        </span>
      </div>

      <!-- Formatted Display -->
      <div
        class="px-3 py-2 bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-sm font-mono min-w-[100px] text-center"
      >
        {{ formattedDuration }}
      </div>
    </div>

    <!-- Error Message -->
    <p v-if="error" class="mt-2 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>
