<script setup>
/**
 * ImageGallery - Galerie d'images avec swipe
 * Design System: Phenom Search
 */
import { ref, computed } from 'vue'

defineOptions({ name: 'ImageGallery' })

const props = defineProps({
  images: {
    type: Array,
    required: true
    // Format: [{ url: 'string', alt?: 'string' }] ou ['url1', 'url2']
  },
  aspectRatio: {
    type: String,
    default: '4/3'
  }
})

const emit = defineEmits(['imageClick'])

const currentIndex = ref(0)

// Normaliser les images
const normalizedImages = computed(() => {
  return props.images.map((img, index) => {
    if (typeof img === 'string') {
      return { url: img, alt: `Image ${index + 1}` }
    }
    return { url: img.url, alt: img.alt || `Image ${index + 1}` }
  })
})

// Navigation tactile
const touchStartX = ref(0)
const touchEndX = ref(0)

const handleTouchStart = (e) => {
  touchStartX.value = e.touches[0].clientX
}

const handleTouchMove = (e) => {
  touchEndX.value = e.touches[0].clientX
}

const handleTouchEnd = () => {
  const diff = touchStartX.value - touchEndX.value
  const threshold = 50
  
  if (Math.abs(diff) > threshold) {
    if (diff > 0 && currentIndex.value < normalizedImages.value.length - 1) {
      // Swipe left -> next
      currentIndex.value++
    } else if (diff < 0 && currentIndex.value > 0) {
      // Swipe right -> prev
      currentIndex.value--
    }
  }
}

const goTo = (index) => {
  currentIndex.value = index
}
</script>

<template>
  <div class="relative bg-[#12151C] overflow-hidden">
    <!-- Images Container -->
    <div 
      class="relative w-full"
      :style="{ aspectRatio }"
      @touchstart="handleTouchStart"
      @touchmove="handleTouchMove"
      @touchend="handleTouchEnd"
    >
      <!-- Current Image -->
      <img
        :src="normalizedImages[currentIndex]?.url"
        :alt="normalizedImages[currentIndex]?.alt"
        class="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
        @click="emit('imageClick', currentIndex)"
      />
    </div>
    
    <!-- Indicators (dots) -->
    <div 
      v-if="normalizedImages.length > 1"
      class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2"
    >
      <button
        v-for="(_, index) in normalizedImages"
        :key="index"
        :class="[
          'w-2 h-2 rounded-full transition-all',
          currentIndex === index 
            ? 'bg-[#00F0FF] w-4' 
            : 'bg-white/30 hover:bg-white/50'
        ]"
        :aria-label="`Voir image ${index + 1}`"
        @click="goTo(index)"
      />
    </div>
    
    <!-- Counter -->
    <div 
      v-if="normalizedImages.length > 1"
      class="absolute top-3 right-3 px-2 py-1 bg-black/50 text-xs text-white/70"
    >
      {{ currentIndex + 1 }} / {{ normalizedImages.length }}
    </div>
  </div>
</template>
