<template>
  <div class="avatar-crop-modal fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Overlay -->
    <div 
      class="overlay absolute inset-0 bg-black/70 backdrop-blur-sm"
      @click="onCancel"
    ></div>
    
    <!-- Modal -->
    <div class="modal relative surface-card rounded-2xl p-6 w-full max-w-md border border-white/10">
      <!-- Header -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-white flex items-center gap-2">
          <svg class="w-6 h-6 text-[#00F0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Ajuster l'avatar
        </h3>
        <button 
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          @click="onCancel"
          aria-label="Fermer la modale"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Cropper -->
      <div class="crop-container mb-6">
        <Cropper
          ref="cropperRef"
          class="cropper rounded-xl overflow-hidden border-2 border-white/10"
          :src="imgSrc"
          :stencil-props="{
            aspectRatio: 1,
            movable: true,
            resizable: false,
          }"
          :stencil-component="CircleStencil"
          background-class="cropper-background"
          foreground-class="cropper-foreground"
        />
        
        <p class="text-xs text-white/50 text-center mt-3 flex items-center justify-center gap-2">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Glissez pour repositionner • Scroll pour zoomer
        </p>
      </div>

      <!-- Actions -->
      <div class="flex gap-3">
        <button 
          class="flex-1 px-4 py-3 text-sm font-medium text-white/80 hover:text-white bg-surface-600 hover:bg-surface-500 rounded-xl border border-white/10 transition-all"
          @click="onCancel"
        >
          Annuler
        </button>
        <button 
          class="flex-1 px-4 py-3 text-sm font-bold bg-gradient-to-r from-[#00F0FF] to-[#00A3CC] hover:from-[#00D4E6] hover:to-[#0090B8] text-black rounded-xl transition-all shadow-md"
          @click="confirm"
          :disabled="confirming"
        >
          <span v-if="confirming" class="flex items-center justify-center gap-2">
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Traitement...
          </span>
          <span v-else>Confirmer</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Cropper, CircleStencil } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { saveCroppedImage } from '@/utils/avatarCache'

const props = defineProps({ 
  file: [File, Object], 
  src: String 
})

const emit = defineEmits(['confirm', 'cancel'])

const imgSrc = ref('')
const cropperRef = ref(null)
const confirming = ref(false)

const readFile = (f) => {
  if (!f) return
  const reader = new FileReader()
  reader.onload = (e) => { 
    imgSrc.value = e.target.result 
  }
  reader.readAsDataURL(f)
}

watch(() => props.file, (f) => {
  if (f) readFile(f)
}, { immediate: true })

watch(() => props.src, (s) => {
  if (s) imgSrc.value = s
}, { immediate: true })

const onCancel = () => emit('cancel')

const confirm = async () => {
  confirming.value = true

  try {
    const result = cropperRef.value?.getResult()
    const canvas = result?.canvas
    if (!canvas) {
      emit('cancel')
      return
    }

    const blob = await new Promise((resolve) => 
      canvas.toBlob(resolve, 'image/png', 0.95)
    )
    
    confirming.value = false
    
    if (!blob) return emit('cancel')

    let cacheKey = null
    try {
      cacheKey = await saveCroppedImage(blob)
    } catch (err) {
      console.warn('Impossible de sauvegarder dans le cache', err)
    }

    const file = new File([blob], 'avatar.png', { type: 'image/png' })
    emit('confirm', { file, cacheKey })
  } catch (error) {
    console.error('Erreur de confirmation:', error)
    confirming.value = false
    emit('cancel')
  }
}
</script>

<style scoped>
.avatar-crop-modal .modal {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.cropper {
  height: 300px;
  background: radial-gradient(circle, rgba(0, 240, 255, 0.05) 0%, rgba(0, 0, 0, 0.3) 100%);
}

:deep(.cropper-background) {
  background: #12151C;
}

:deep(.cropper-foreground) {
  background: rgba(0, 0, 0, 0.5);
}
</style>