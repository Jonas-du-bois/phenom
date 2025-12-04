<template>
  <div class="image-manager relative group">
    <!-- Image Display -->
    <div class="relative overflow-hidden rounded-lg">
      <img
        :src="imageUrl"
        :alt="alt"
        class="w-full h-48 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
        @click="openLightbox"
        @error="handleImageError"
      />
      
      <!-- Image Source Badge -->
      <div 
        v-if="currentImage?.source"
        class="absolute top-2 left-2 px-2 py-1 text-xs font-medium rounded-full"
        :class="sourceClass"
      >
        {{ sourceLabel }}
      </div>

      <!-- Actions Overlay -->
      <div 
        v-if="showDelete"
        class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2"
      >
        <button
          @click.stop="$emit('delete', { observationId, imageId: currentImage?.publicId })"
          class="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors"
          title="Supprimer l'image"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Lightbox Modal -->
    <Teleport to="body">
      <div
        v-if="lightboxOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
        @click="closeLightbox"
      >
        <button
          @click="closeLightbox"
          class="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors"
        >
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img
          :src="fullImageUrl"
          :alt="alt"
          class="max-w-[90vw] max-h-[90vh] object-contain"
          @click.stop
        />
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  currentImage: {
    type: Object,
    required: true,
  },
  observationId: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: 'Observation image',
  },
  showDelete: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['update', 'delete']);

const lightboxOpen = ref(false);
const hasError = ref(false);

// Default placeholder image
const placeholderUrl = 'https://via.placeholder.com/400x300?text=Image+non+disponible';

// Compute image URL (thumbnail for display)
const imageUrl = computed(() => {
  if (hasError.value) return placeholderUrl;
  return props.currentImage?.thumbnailUrl || props.currentImage?.url || placeholderUrl;
});

// Full image URL for lightbox
const fullImageUrl = computed(() => {
  return props.currentImage?.url || props.currentImage?.thumbnailUrl || placeholderUrl;
});

// Source badge styling
const sourceClass = computed(() => {
  switch (props.currentImage?.source) {
    case 'ai':
      return 'bg-purple-600 text-white';
    case 'upload':
      return 'bg-blue-600 text-white';
    default:
      return 'bg-gray-600 text-white';
  }
});

const sourceLabel = computed(() => {
  switch (props.currentImage?.source) {
    case 'ai':
      return '🤖 IA';
    case 'upload':
      return '📷 Photo';
    default:
      return '📷';
  }
});

function openLightbox() {
  lightboxOpen.value = true;
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxOpen.value = false;
  document.body.style.overflow = '';
}

function handleImageError() {
  hasError.value = true;
}
</script>

<style scoped>
.image-manager {
  @apply rounded-lg overflow-hidden;
}
</style>
