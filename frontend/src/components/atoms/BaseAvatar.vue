<script setup>
import { computed, ref } from 'vue'

/**
 * Avatar - Composant avatar utilisateur
 * Design System: Phenom Search
 */

defineOptions({ name: 'BaseAvatar' })

const props = defineProps({
  src: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(v)
  }
})

// Générer les initiales à partir du nom
const initials = computed(() => {
  if (!props.name) return '?'
  return props.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
})

// État de chargement de l'image
const imageError = ref(false)

const sizeClasses = {
  xs: 'w-6 h-6 text-[0.5rem]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl'
}
</script>

<template>
  <div
    :class="[
      'relative flex items-center justify-center',
      'bg-white/10 border border-white/20 rounded-full',
      'overflow-hidden',
      sizeClasses[size]
    ]"
  >
    <!-- Image -->
    <img
      v-if="src && !imageError"
      :src="src"
      :alt="name"
      class="w-full h-full object-cover"
      @error="imageError = true"
    />
    
    <!-- Fallback: Initiales -->
    <span
      v-else
      class="font-medium text-white/60 uppercase"
    >
      {{ initials }}
    </span>
  </div>
</template>
