<script setup>
/**
 * MapPopup - Popup d'information pour la carte
 * Design System: Phenom Search
 */
import { computed } from 'vue'

defineOptions({ name: 'MapPopup' })

const props = defineProps({
  observation: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['view', 'close'])

// Image principale
const mainImage = computed(() => {
  const images = props.observation.images || []
  if (images.length > 0) {
    return images[0].url || images[0]
  }
  return null
})

// Date formatée
const formattedDate = computed(() => {
  const date = new Date(props.observation.date || props.observation.createdAt)
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short',
    year: 'numeric'
  })
})
</script>

<template>
  <div class="relative w-72 backdrop-blur-md bg-gradient-to-br from-[#12151C]/80 to-[#0A0C0F]/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden group">
    <!-- Close Button -->
    <button
      @click="emit('close')"
      class="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200 hover:scale-110 backdrop-blur-sm"
      aria-label="Fermer"
    >
      <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>

    <!-- Image -->
    <div v-if="mainImage" class="relative aspect-video bg-black overflow-hidden">
      <img 
        :src="mainImage" 
        :alt="observation.description"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
    </div>
    
    <!-- Content -->
    <div class="p-4 space-y-3">
      <!-- Location & Date -->
      <div class="flex items-center justify-between gap-2">
        <span class="text-xs text-[#00F0FF] font-semibold truncate">
          📍 {{ observation.location || observation.country }}
        </span>
        <span class="text-xs text-white/50 whitespace-nowrap">
          {{ formattedDate }}
        </span>
      </div>
      
      <!-- Description -->
      <p class="text-sm text-white/70 line-clamp-2 leading-relaxed">
        {{ observation.description }}
      </p>
      
      <!-- Credibility & Actions -->
      <div class="flex items-center justify-between pt-1">
        <span class="text-xs text-white/50">
          Crédibilité: 
          <span class="text-[#00F0FF] font-bold">{{ observation.credibility || 0 }}/15</span>
        </span>
        
        <!-- View Button -->
        <button
          class="px-3 py-1.5 bg-gradient-to-r from-[#00F0FF] to-[#0099FF] text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:from-[#00D0DF] hover:to-[#0077CC] transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          @click="emit('view', observation)"
        >
          Voir
        </button>
      </div>
    </div>
  </div>
</template>
