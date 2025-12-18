<script setup>
/**
 * BaseSelect - Sélecteur dropdown
 * Design System: Phenom Search
 */

defineOptions({ name: 'BaseSelect' })

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true
    // Format: [{ value: 'value', label: 'Label' }]
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Sélectionner...'
  },
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const handleChange = (e) => {
  emit('update:modelValue', e.target.value)
}
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
    
    <!-- Select Container -->
    <div class="relative">
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
          { 'opacity-50 cursor-not-allowed': disabled }
        ]"
        @change="handleChange"
      >
        <option value="" disabled class="bg-[#12151C] text-white/40">
          {{ placeholder }}
        </option>
        <option
          v-for="option in options"
          :key="option.value"
          :value="option.value"
          class="bg-[#12151C] text-white"
        >
          {{ option.label }}
        </option>
      </select>
      
      <!-- Chevron Icon -->
      <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </div>
    </div>
    
    <!-- Error Message -->
    <p
      v-if="error"
      class="mt-2 text-xs text-red-500"
    >
      {{ error }}
    </p>
  </div>
</template>
