<script setup>
import { computed } from 'vue'

/**
 * TextArea - Zone de texte multi-ligne
 * Design System: Phenom Search
 */

defineOptions({ name: 'TextArea' })

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
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
  },
  rows: {
    type: Number,
    default: 4
  },
  maxlength: {
    type: Number,
    default: null
  },
  minlength: {
    type: Number,
    default: null
  },
  showCount: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const handleInput = (e) => {
  emit('update:modelValue', e.target.value)
}

const charCount = computed(() => props.modelValue?.length || 0)
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
    
    <!-- Textarea -->
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
        { 'opacity-50 cursor-not-allowed': disabled }
      ]"
      @input="handleInput"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />
    
    <!-- Footer -->
    <div class="flex items-center justify-between mt-2">
      <!-- Error Message -->
      <p
        v-if="error"
        class="text-xs text-red-500"
      >
        {{ error }}
      </p>
      <span v-else />
      
      <!-- Character Count -->
      <p
        v-if="showCount && maxlength"
        :class="[
          'text-xs',
          charCount >= maxlength ? 'text-red-500' : 'text-white/40'
        ]"
      >
        {{ charCount }}/{{ maxlength }}
      </p>
    </div>
  </div>
</template>
