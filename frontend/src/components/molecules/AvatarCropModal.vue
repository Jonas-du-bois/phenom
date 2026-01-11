<!--
  ============================================================================
  AvatarCropModal.vue - Modal for cropping avatar images
  ============================================================================
  
  PURPOSE:
  Full-screen modal dialog for cropping and adjusting avatar images before
  upload. Uses vue-advanced-cropper for circular avatar cropping with
  zoom and pan capabilities.
  
  FEATURES:
  - Circular stencil for avatar cropping
  - Drag to reposition image
  - Scroll/pinch to zoom
  - Generates PNG blob for upload
  - Caches cropped image locally for offline support
  - Loading state during processing
  - Backdrop click to cancel
  
  USAGE EXAMPLES:
  <AvatarCropModal
    :file="selectedFile"
    @confirm="handleCroppedAvatar"
    @cancel="closeModal"
  />
  
  PROPS:
  - file: File|Object - The image file to crop
  - src: String - Alternative: direct image source URL
  
  EVENTS:
  - @confirm({ file, cacheKey }) - Emitted with cropped File and cache key
  - @cancel - Emitted when user cancels or cropping fails
  ============================================================================
-->

<template>
  <div
    class="avatar-crop-modal fixed inset-0 z-50 flex items-center justify-center p-4"
  >
    <!-- Overlay - Blurred backdrop, click to cancel -->
    <div
      class="overlay absolute inset-0 bg-black/70 backdrop-blur-sm"
      @click="onCancel"
    ></div>

    <!-- Modal card -->
    <div
      class="modal relative surface-card rounded-2xl p-6 w-full max-w-md border border-white/10"
    >
      <!-- Header with title and close button -->
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-white flex items-center gap-2">
          <!-- Image icon -->
          <svg
            class="w-6 h-6 text-[#00F0FF]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          Ajuster l'avatar
        </h3>
        <!-- Close button -->
        <button
          class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          @click="onCancel"
          aria-label="Fermer la modale"
        >
          <svg
            class="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
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

        <p
          class="text-xs text-white/50 text-center mt-3 flex items-center justify-center gap-2"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
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
          <span
            v-if="confirming"
            class="flex items-center justify-center gap-2"
          >
            <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
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
/**
 * AvatarCropModal - Modal for cropping avatar images
 * Design System: Phenom Search - Dark theme with cyan accents
 * Uses vue-advanced-cropper library for image manipulation
 */
import { ref, watch } from "vue";
import { Cropper, CircleStencil } from "vue-advanced-cropper";
import "vue-advanced-cropper/dist/style.css";
import { saveCroppedImage } from "@/utils/avatarCache";

// ============================================================================
// PROPS DEFINITION
// ============================================================================
// file: The image File object to crop
// src: Alternative direct URL source for the image
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  file: [File, Object],
  src: String,
});

// ============================================================================
// EVENTS
// ============================================================================
const emit = defineEmits(["confirm", "cancel"]);

// ============================================================================
// LOCAL STATE
// ============================================================================
const imgSrc = ref(""); // Image source URL for the cropper
const cropperRef = ref(null); // Reference to the Cropper component
const confirming = ref(false); // Loading state during confirmation

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================
/**
 * Read a File object and convert it to a data URL for the cropper
 * @param {File} f - The file to read
 */
const readFile = (f) => {
  if (!f) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    imgSrc.value = e.target.result;
  };
  reader.readAsDataURL(f);
};

// ============================================================================
// WATCHERS
// ============================================================================
// Watch for file prop changes and load the image
watch(
  () => props.file,
  (f) => {
    if (f) readFile(f);
  },
  { immediate: true }
);

// Watch for src prop changes and use directly
watch(
  () => props.src,
  (s) => {
    if (s) imgSrc.value = s;
  },
  { immediate: true }
);

// ============================================================================
// EVENT HANDLERS
// ============================================================================
/**
 * Cancel the cropping operation
 */
const onCancel = () => emit("cancel");

/**
 * Confirm the cropping - extract the cropped area, save to cache,
 * and emit the result as a File object
 */
const confirm = async () => {
  confirming.value = true;

  try {
    // Get the cropped result from the cropper component
    const result = cropperRef.value?.getResult();
    const canvas = result?.canvas;
    if (!canvas) {
      emit("cancel");
      return;
    }

    // Convert canvas to blob
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png", 0.95)
    );

    confirming.value = false;

    if (!blob) return emit("cancel");

    // Try to cache the cropped image for offline support
    let cacheKey = null;
    try {
      cacheKey = await saveCroppedImage(blob);
    } catch (err) {
      console.warn("Impossible de sauvegarder dans le cache", err);
    }

    // Create a File object from the blob and emit
    const file = new File([blob], "avatar.png", { type: "image/png" });
    emit("confirm", { file, cacheKey });
  } catch (error) {
    console.error("Erreur de confirmation:", error);
    confirming.value = false;
    emit("cancel");
  }
};
</script>

<style scoped>
.avatar-crop-modal .modal {
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8);
}

.cropper {
  height: 300px;
  background: radial-gradient(
    circle,
    rgba(0, 240, 255, 0.05) 0%,
    rgba(0, 0, 0, 0.3) 100%
  );
}

:deep(.cropper-background) {
  background: #12151c;
}

:deep(.cropper-foreground) {
  background: rgba(0, 0, 0, 0.5);
}
</style>
