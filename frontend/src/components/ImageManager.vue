<template>
  <div class="image-manager">
    <!-- Affichage de l'image existante -->
    <div v-if="currentImage" class="image-container">
      <img :src="currentImage.url" :alt="alt" class="current-image" />

      <div class="image-actions">
        <!-- Bouton pour modifier l'image -->
        <label class="btn-modify">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            @change="handleImageChange"
            class="hidden"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="icon"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
            />
          </svg>
          Modifier
        </label>

        <!-- Bouton pour supprimer l'image -->
        <button
          v-if="showDelete"
          @click="handleDelete"
          class="btn-delete"
          :disabled="loading"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="icon"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
            />
          </svg>
          Supprimer
        </button>
      </div>
    </div>

    <!-- Upload d'une nouvelle image (si pas d'image actuelle) -->
    <div v-else class="upload-container">
      <label class="upload-label">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          @change="handleImageChange"
          class="hidden"
        />
        <div class="upload-content">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="upload-icon"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
            />
          </svg>
          <p class="upload-text">{{ uploadText }}</p>
          <p class="upload-hint">JPEG, PNG, WebP - Max 10MB</p>
        </div>
      </label>
    </div>

    <!-- Indicateur de chargement -->
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>{{ loadingText }}</p>
    </div>

    <!-- Message d'erreur -->
    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  currentImage: {
    type: Object,
    default: null,
  },
  observationId: {
    type: String,
    required: true,
  },
  alt: {
    type: String,
    default: "Image de l'observation",
  },
  showDelete: {
    type: Boolean,
    default: true,
  },
  uploadText: {
    type: String,
    default: "Cliquez pour ajouter une image",
  },
});

const emit = defineEmits(["upload", "update", "delete"]);

const loading = ref(false);
const error = ref(null);
const loadingText = ref("");

const handleImageChange = async (event) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    error.value = null;
    loading.value = true;

    if (props.currentImage) {
      // Modification d'une image existante
      loadingText.value = "Modification de l'image...";
      emit("update", {
        observationId: props.observationId,
        publicId: props.currentImage.publicId,
        file,
      });
    } else {
      // Upload d'une nouvelle image
      loadingText.value = "Upload de l'image...";
      emit("upload", {
        observationId: props.observationId,
        file,
      });
    }
  } catch (err) {
    error.value = err.message || "Erreur lors du traitement de l'image";
  } finally {
    // Le parent gèrera le loading
    loading.value = false;
    event.target.value = ""; // Reset input
  }
};

const handleDelete = () => {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette image ?")) {
    loading.value = true;
    loadingText.value = "Suppression de l'image...";
    emit("delete", {
      observationId: props.observationId,
      publicId: props.currentImage.publicId,
    });
  }
};
</script>

<style scoped>
.image-manager {
  position: relative;
}

.image-container {
  position: relative;
  border-radius: 0.5rem;
  overflow: hidden;
}

.current-image {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 0.5rem;
}

.image-actions {
  position: absolute;
  bottom: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.5rem;
}

.btn-modify,
.btn-delete {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.btn-modify {
  background-color: #3b82f6;
  color: white;
}

.btn-modify:hover {
  background-color: #2563eb;
}

.btn-delete {
  background-color: #ef4444;
  color: white;
}

.btn-delete:hover:not(:disabled) {
  background-color: #dc2626;
}

.btn-delete:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.icon {
  width: 1rem;
  height: 1rem;
}

.upload-container {
  border: 2px dashed #d1d5db;
  border-radius: 0.5rem;
  padding: 2rem;
  transition: border-color 0.2s;
}

.upload-container:hover {
  border-color: #3b82f6;
}

.upload-label {
  display: block;
  cursor: pointer;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  color: #9ca3af;
}

.upload-text {
  font-weight: 500;
  color: #374151;
}

.upload-hint {
  font-size: 0.875rem;
  color: #6b7280;
}

.hidden {
  display: none;
}

.loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.5rem;
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background-color: #fee2e2;
  color: #dc2626;
  border-radius: 0.375rem;
  font-size: 0.875rem;
}
</style>
