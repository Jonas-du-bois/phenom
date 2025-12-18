<script setup>
/**
 * ObservationMeta - Métadonnées d'une observation
 * Design System: Phenom Search
 */
import { computed } from 'vue'
import BaseBadge from '../atoms/BaseBadge.vue'
import CredibilityGauge from '../atoms/CredibilityGauge.vue'
import StrangenessGauge from '../atoms/StrangenessGauge.vue'

defineOptions({ name: 'ObservationMeta' })

const props = defineProps({
  observation: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['locationClick'])

// Formater la durée
const formattedDuration = computed(() => {
  const seconds = props.observation.duration || 0
  if (seconds < 60) return `${seconds} secondes`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  if (minutes < 60) {
    return remainingSeconds > 0 
      ? `${minutes}min ${remainingSeconds}s`
      : `${minutes} minutes`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return `${hours}h ${remainingMinutes}min`
})

// Date et heure formatées
const formattedDateTime = computed(() => {
  const date = new Date(props.observation.date || props.observation.createdAt)
  const dateStr = date.toLocaleDateString('fr-FR', { 
    weekday: 'long',
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  })
  const timeStr = props.observation.time || date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  })
  return { date: dateStr, time: timeStr }
})
</script>

<template>
  <div class="px-4 py-4 space-y-4 bg-[#000000]">
    <!-- Jauges Crédibilité & Étrangeté -->
    <div class="flex items-center justify-center gap-8 py-4">
      <CredibilityGauge 
        :value="observation.credibility || 0" 
        size="lg"
      />
      <StrangenessGauge 
        :value="observation.strangeness || 0" 
        size="lg"
      />
    </div>
    
    <!-- Métadonnées en liste -->
    <div class="space-y-3">
      <!-- Localisation -->
      <button 
        class="w-full flex items-start gap-3 text-left hover:bg-white/5 p-2 -mx-2 transition-colors"
        @click="emit('locationClick')"
      >
        <span class="text-lg">📍</span>
        <div>
          <p class="text-xs uppercase tracking-wider text-white/40 mb-1">Localisation</p>
          <p class="text-sm text-white">
            {{ observation.location || observation.country }}
          </p>
          <p v-if="observation.locale" class="text-xs text-[#00F0FF]">
            {{ observation.locale }}
          </p>
        </div>
      </button>
      
      <!-- Date & Heure -->
      <div class="flex items-start gap-3 p-2 -mx-2">
        <span class="text-lg">📅</span>
        <div>
          <p class="text-xs uppercase tracking-wider text-white/40 mb-1">Date & Heure</p>
          <p class="text-sm text-white capitalize">{{ formattedDateTime.date }}</p>
          <p class="text-sm text-white/60">{{ formattedDateTime.time }}</p>
        </div>
      </div>
      
      <!-- Durée -->
      <div v-if="observation.duration" class="flex items-start gap-3 p-2 -mx-2">
        <span class="text-lg">⏱️</span>
        <div>
          <p class="text-xs uppercase tracking-wider text-white/40 mb-1">Durée</p>
          <p class="text-sm text-white">{{ formattedDuration }}</p>
        </div>
      </div>
    </div>
    
    <!-- Formes UFO -->
    <div v-if="observation.ufoShapes?.length" class="pt-2">
      <p class="text-xs uppercase tracking-wider text-white/40 mb-3">🛸 Formes observées</p>
      <div class="flex flex-wrap gap-2">
        <BaseBadge 
          v-for="shape in observation.ufoShapes" 
          :key="shape"
          variant="cyan"
        >
          {{ shape }}
        </BaseBadge>
      </div>
    </div>
    
    <!-- Types d'observateurs -->
    <div v-if="observation.observerTypes?.length" class="pt-2">
      <p class="text-xs uppercase tracking-wider text-white/40 mb-3">👁️ Types d'observateurs</p>
      <div class="flex flex-wrap gap-2">
        <BaseBadge 
          v-for="type in observation.observerTypes" 
          :key="type"
          variant="default"
        >
          {{ type }}
        </BaseBadge>
      </div>
    </div>
    
    <!-- Phénomènes -->
    <div v-if="observation.phenomena?.length" class="pt-2">
      <p class="text-xs uppercase tracking-wider text-white/40 mb-3">✨ Phénomènes</p>
      <div class="flex flex-wrap gap-2">
        <BaseBadge 
          v-for="phenomenon in observation.phenomena" 
          :key="phenomenon"
          variant="default"
        >
          {{ phenomenon }}
        </BaseBadge>
      </div>
    </div>
  </div>
</template>
