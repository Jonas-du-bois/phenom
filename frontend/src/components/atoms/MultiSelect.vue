<script setup>
/**
 * MultiSelect - Sélecteur multiple avec chips
 * Design System: Phenom Search
 */
import { ref, computed } from 'vue'

defineOptions({ name: 'MultiSelect' })

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  },
  options: {
    type: Array,
    required: true
    // Format: [{ value: 'value', label: 'Label', icon?: 'iconName' }]
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
  maxItems: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)

// Options disponibles (non sélectionnées)
const availableOptions = computed(() => {
  return props.options.filter(opt => !props.modelValue.includes(opt.value))
})

// Options sélectionnées avec leurs labels
const selectedOptions = computed(() => {
  return props.modelValue.map(value => {
    const opt = props.options.find(o => o.value === value)
    return opt || { value, label: value }
  })
})

// Peut encore ajouter des items
const canAddMore = computed(() => {
  if (!props.maxItems) return true
  return props.modelValue.length < props.maxItems
})

const toggleOption = (value) => {
  if (props.disabled) return
  
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(value)
  
  if (index === -1 && canAddMore.value) {
    newValue.push(value)
  } else if (index !== -1) {
    newValue.splice(index, 1)
  }
  
  emit('update:modelValue', newValue)
}

const removeOption = (value) => {
  const newValue = props.modelValue.filter(v => v !== value)
  emit('update:modelValue', newValue)
}

// Fermer au clic extérieur
const handleClickOutside = () => {
  isOpen.value = false
}
</script>

<template>
  <div class="w-full relative" v-click-outside="handleClickOutside">
    <!-- Label -->
    <label
      v-if="label"
      class="block mb-2 text-xs uppercase tracking-wider text-white/60"
    >
      {{ label }}
    </label>
    
    <!-- Trigger -->
    <button
      type="button"
      :disabled="disabled"
      :class="[
        'w-full min-h-[48px] px-4 py-2 bg-white/5 border text-left',
        'focus:outline-none focus:border-[#00F0FF] focus:ring-1 focus:ring-[#00F0FF]/20',
        'transition-all duration-200',
        error ? 'border-red-500/50' : 'border-white/10',
        { 'opacity-50 cursor-not-allowed': disabled }
      ]"
      @click="isOpen = !isOpen"
    >
      <!-- Selected Items -->
      <div v-if="selectedOptions.length > 0" class="flex flex-wrap gap-2">
        <span
          v-for="opt in selectedOptions"
          :key="opt.value"
          class="inline-flex items-center gap-1 px-2 py-1 bg-[#00F0FF]/10 border border-[#00F0FF]/30 text-[#00F0FF] text-xs"
        >
          {{ opt.label }}
          <button
            type="button"
            class="hover:text-white transition-colors"
            @click.stop="removeOption(opt.value)"
          >
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </span>
      </div>
      
      <!-- Placeholder -->
      <span v-else class="text-white/40">
        {{ placeholder }}
      </span>
    </button>
    
    <!-- Dropdown -->
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
            { 'opacity-50 cursor-not-allowed': !canAddMore }
          ]"
          @click="toggleOption(option.value)"
        >
          {{ option.label }}
        </button>
      </div>
    </Transition>
    
    <!-- Error Message -->
    <p
      v-if="error"
      class="mt-2 text-xs text-red-500"
    >
      {{ error }}
    </p>
  </div>
</template>
