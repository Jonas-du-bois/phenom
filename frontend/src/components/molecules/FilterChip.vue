<script setup>

defineOptions({ name: 'FilterChip' })

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  },
  selected: {
    type: Boolean,
    default: false
  },
  removable: {
    type: Boolean,
    default: false
  },
  count: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['click', 'remove'])

const isActive = () => props.active || props.selected
</script>

<template>
  <button
    type="button"
    :class="[
      'inline-flex items-center gap-2 px-4 py-2 border text-sm rounded-full',
      'uppercase tracking-wider transition-all duration-200 whitespace-nowrap flex-shrink-0',
      isActive() 
        ? 'bg-[#00F0FF]/10 border-[#00F0FF]/50 text-[#00F0FF]' 
        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20 hover:text-white/80'
    ]"
    @click="emit('click')"
  >
    {{ label }}
    <span 
      v-if="count !== null" 
      :class="[
        'text-xs',
        isActive() ? 'text-[#00F0FF]/70' : 'text-white/40'
      ]"
    >
      ({{ count }})
    </span>
    <!-- Remove button -->
    <span 
      v-if="removable && isActive()"
      class="ml-1 hover:text-red-400 transition-colors"
      @click.stop="emit('remove')"
    >
      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </span>
  </button>
</template>
