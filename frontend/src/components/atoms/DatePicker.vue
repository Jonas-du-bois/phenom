<script setup>
/**
 * DatePicker - Sélecteur de date natif stylisé
 * Design System: Phenom Search
 */

defineOptions({ name: "DatePicker" });

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
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
  min: {
    type: String,
    default: "",
  },
  max: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);

const handleInput = (e) => {
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

    <!-- Date Input -->
    <div class="relative">
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

    <!-- Error Message -->
    <p v-if="error" class="mt-2 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
/* Style pour le picker de date sur mobile */
input[type="date"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}
</style>
