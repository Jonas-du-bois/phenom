<script setup>
/**
 * MapMarker - Marqueur de carte personnalisé
 * Design System: Phenom Search
 */
import { computed } from 'vue'

defineOptions({ name: 'MapMarker' })

const props = defineProps({
  observation: {
    type: Object,
    required: true
  },
  selected: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

// Couleur basée sur la crédibilité
const markerColor = computed(() => {
  const credibility = props.observation.credibility || 0
  if (credibility >= 10) return '#00F0FF' // Cyan
  if (credibility >= 5) return '#f59e0b' // Amber
  return '#ef4444' // Red
})
</script>

<template>
  <div 
    :class="[
      'relative cursor-pointer transition-transform',
      { 'scale-125 z-10': selected }
    ]"
    @click="emit('click', observation)"
  >
    <!-- Pin -->
    <svg 
      width="32" 
      height="40" 
      viewBox="0 0 32 40" 
      fill="none"
      class="drop-shadow-lg"
    >
      <!-- Pin body -->
      <path 
        d="M16 0C7.163 0 0 7.163 0 16c0 12 16 24 16 24s16-12 16-24c0-8.837-7.163-16-16-16z" 
        :fill="markerColor"
      />
      <!-- Inner circle -->
      <circle 
        cx="16" 
        cy="16" 
        r="8" 
        fill="black" 
        fill-opacity="0.3"
      />
      <!-- UFO icon -->
      <path
        d="M16 11c-3.5 0-6 1.5-6 3.5s2.5 3.5 6 3.5 6-1.5 6-3.5-2.5-3.5-6-3.5zm0 5c-1.1 0-2-.45-2-1s.9-1 2-1 2 .45 2 1-.9 1-2 1z"
        fill="white"
      />
    </svg>
    
    <!-- Pulse animation when selected -->
    <div 
      v-if="selected"
      class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full animate-ping"
      :style="{ backgroundColor: `${markerColor}30` }"
    />
  </div>
</template>
