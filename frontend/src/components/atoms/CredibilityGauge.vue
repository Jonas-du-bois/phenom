<script setup>
import { computed } from 'vue'

/**
 * CredibilityGauge - Jauge de crédibilité (0-15)
 * Design System: Phenom Search
 */

defineOptions({ name: 'CredibilityGauge' })

const props = defineProps({
  value: {
    type: Number,
    required: true,
    validator: (v) => v >= 0 && v <= 15
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v)
  },
  showLabel: {
    type: Boolean,
    default: true
  }
})

// Calcul du pourcentage
const percentage = computed(() => (props.value / 15) * 100)

// Couleur basée sur la valeur
const gaugeColor = computed(() => {
  if (props.value >= 10) return '#00F0FF' // Cyan - haute crédibilité
  if (props.value >= 5) return '#f59e0b' // Amber - moyenne
  return '#ef4444' // Rouge - faible
})

// Dimensions selon la taille
const dimensions = {
  sm: { outer: 40, inner: 32, stroke: 4, text: '0.7rem' },
  md: { outer: 60, inner: 48, stroke: 6, text: '1rem' },
  lg: { outer: 80, inner: 64, stroke: 8, text: '1.25rem' }
}

const dim = computed(() => dimensions[props.size])

// Calcul du cercle SVG
const circumference = computed(() => 2 * Math.PI * (dim.value.inner / 2))
const offset = computed(() => circumference.value - (percentage.value / 100) * circumference.value)
</script>

<template>
  <div class="flex flex-col items-center gap-1">
    <!-- Gauge Circle -->
    <div class="relative" :style="{ width: `${dim.outer}px`, height: `${dim.outer}px` }">
      <svg :width="dim.outer" :height="dim.outer" class="-rotate-90">
        <!-- Background circle -->
        <circle
          :cx="dim.outer / 2"
          :cy="dim.outer / 2"
          :r="dim.inner / 2"
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          :stroke-width="dim.stroke"
        />
        
        <!-- Progress circle -->
        <circle
          :cx="dim.outer / 2"
          :cy="dim.outer / 2"
          :r="dim.inner / 2"
          fill="none"
          :stroke="gaugeColor"
          :stroke-width="dim.stroke"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="offset"
          stroke-linecap="round"
          class="transition-all duration-500"
        />
      </svg>
      
      <!-- Value -->
      <div 
        class="absolute inset-0 flex items-center justify-center font-light"
        :style="{ fontSize: dim.text, color: gaugeColor }"
      >
        {{ value }}
      </div>
    </div>
    
    <!-- Label -->
    <span
      v-if="showLabel"
      class="text-[0.65rem] uppercase tracking-wider text-white/40"
    >
      Crédibilité
    </span>
  </div>
</template>
