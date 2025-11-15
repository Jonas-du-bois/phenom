<template>
  <div class="create-view">
    <!-- Progress indicator -->
    <div class="progress-bar">
      <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
    </div>

  <PageContainer class="create-container" :maxWidth="700">
      <!-- Step 1: Information -->
      <div v-show="currentStep === 1" class="step">
        <h2 class="step-title">Informations de l'observation</h2>

        <test-BaseInput
          v-model="form.title"
          label="Titre *"
          placeholder="Titre de votre observation"
          :error="errors.title"
          required
        />

        <div class="form-group">
          <label class="form-label">Type d'observation *</label>
          <select
            v-model="form.type"
            class="select-input"
            :class="{ error: errors.type }"
          >
            <option value="">Sélectionnez un type...</option>
            <option
              v-for="type in observationTypes"
              :key="type.value"
              :value="type.value"
            >
              {{ type.label }}
            </option>
          </select>
          <p
            v-if="
              form.type &&
              observationTypes.find((t) => t.value === form.type)?.description
            "
            class="text-sm text-gray-400 mt-1"
          >
            {{
              observationTypes.find((t) => t.value === form.type)?.description
            }}
          </p>
          <p v-if="errors.type" class="error-text">{{ errors.type }}</p>
        </div>

        <div class="form-group">
          <label for="description" class="form-label">Description *</label>
          <textarea
            id="description"
            v-model="form.description"
            placeholder="Décrivez ce que vous avez observé..."
            rows="5"
            class="textarea"
            :class="{ error: errors.description }"
          ></textarea>
          <p v-if="errors.description" class="error-text">
            {{ errors.description }}
          </p>
        </div>
      </div>

      <!-- Step 2: Location -->
      <div v-show="currentStep === 2" class="step">
        <h2 class="step-title">Localisation</h2>

        <div class="location-info">
          <p class="info-text">
            Sélectionnez l'emplacement de votre observation sur la carte
          </p>
        </div>

        <div id="create-map" ref="mapContainer" class="mini-map"></div>

        <test-BaseButton
          variant="outline"
          fullWidth
          @click="useCurrentLocation"
          :loading="loadingLocation"
        >
          <template #icon-left>
            <svg fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              />
            </svg>
          </template>
          Utiliser ma position actuelle
        </test-BaseButton>

        <p v-if="errors.location" class="error-text">{{ errors.location }}</p>
      </div>

      <!-- Step 3: Photos -->
      <div v-show="currentStep === 3" class="step">
        <h2 class="step-title">Photos</h2>

        <div class="upload-zone" @click="triggerFileInput">
          <input
            ref="fileInput"
            type="file"
            accept="image/*"
            multiple
            hidden
            @change="handleFileSelect"
          />

          <div v-if="selectedFiles.length === 0" class="upload-placeholder">
            <svg
              class="upload-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            <p class="upload-text">Ajoutez des photos</p>
            <p class="upload-hint">Cliquez pour sélectionner (optionnel)</p>
          </div>

          <div v-else class="preview-grid">
            <div
              v-for="(file, index) in selectedFiles"
              :key="index"
              class="preview-item"
            >
              <img
                :src="file.preview"
                :alt="`Photo ${index + 1}`"
                class="preview-image"
              />
              <button class="remove-btn" @click.stop="removeFile(index)">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <button class="add-more-btn" @click.stop="triggerFileInput">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Ajouter</span>
            </button>
          </div>
        </div>

        <p
          v-if="uploadProgress > 0 && uploadProgress < 100"
          class="upload-progress"
        >
          Upload en cours: {{ uploadProgress }}%
        </p>
      </div>

      <!-- Navigation buttons -->
      <div class="step-navigation">
        <test-BaseButton
          v-if="currentStep > 1"
          variant="outline"
          @click="previousStep"
          :disabled="submitting"
        >
          Précédent
        </test-BaseButton>

        <test-BaseButton v-if="currentStep < 3" @click="nextStep" fullWidth>
          Suivant
        </test-BaseButton>

        <test-BaseButton
          v-else
          @click="submitObservation"
          :loading="submitting"
          fullWidth
        >
          Publier l'observation
        </test-BaseButton>
      </div>
  </PageContainer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import PageContainer from "../components/PageContainer.vue";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useMap } from "../composables/useMap";
import { useImageUpload } from "../composables/useImageUpload";
import { observationService } from "../services/observationService";
import { OBSERVATION_TYPE_OPTIONS } from "../constants/observationTypes";
import TestBaseInput from "../components/test_BaseInput.vue";
import TestBaseButton from "../components/test_BaseButton.vue";

const router = useRouter();

const currentStep = ref(1);
const submitting = ref(false);
const loadingLocation = ref(false);

const form = ref({
  title: "",
  type: "",
  description: "",
  location: null,
});

const errors = ref({});
const selectedFiles = ref([]);
const fileInput = ref(null);
const mapContainer = ref(null);
const locationMarker = ref(null);

// Utiliser les types backend compatibles (codes à 3 lettres)
const observationTypes = OBSERVATION_TYPE_OPTIONS;

const { initMap, getUserLocation, map } = useMap();
const { uploadProgress } = useImageUpload();

const progress = computed(() => {
  return (currentStep.value / 3) * 100;
});

onMounted(async () => {
  // Map will be initialized when step 2 is shown
});

const nextStep = async () => {
  if (validateStep(currentStep.value)) {
    currentStep.value++;

    // Initialize map on step 2
    if (currentStep.value === 2 && mapContainer.value && !map.value) {
      // Wait for next tick to ensure DOM is ready
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Create Leaflet map
      const leafletMap = L.map(mapContainer.value).setView(
        [46.603354, 1.888334],
        6,
      );

      // Add tile layer
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "© OpenStreetMap contributors",
        },
      ).addTo(leafletMap);

      // Initialize map in composable
      initMap(leafletMap);

      // Add click listener to set location
      leafletMap.on("click", (e) => {
        form.value.location = {
          type: "Point",
          coordinates: [e.latlng.lng, e.latlng.lat],
        };

        // Add marker at clicked location
        // Remove old marker if exists
        if (locationMarker.value) {
          leafletMap.removeLayer(locationMarker.value);
        }

        locationMarker.value = L.marker([
          e.latlng.lat,
          e.latlng.lng,
        ]).addTo(leafletMap);
      });
    }
  }
};

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  }
};

const validateStep = (step) => {
  errors.value = {};

  if (step === 1) {
    if (!form.value.title.trim()) {
      errors.value.title = "Le titre est requis";
    }
    if (!form.value.type) {
      errors.value.type = "Sélectionnez un type d'observation";
    }
    if (!form.value.description.trim()) {
      errors.value.description = "La description est requise";
    }
  }

  if (step === 2) {
    if (!form.value.location) {
      errors.value.location = "Sélectionnez un emplacement sur la carte";
    }
  }

  return Object.keys(errors.value).length === 0;
};

const useCurrentLocation = async () => {
  loadingLocation.value = true;
  try {
    await getUserLocation();
    const userLoc = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const coords = {
      lat: userLoc.coords.latitude,
      lng: userLoc.coords.longitude,
    };

    form.value.location = {
      type: "Point",
      coordinates: [coords.lng, coords.lat],
    };

    // Add marker
    if (map.value) {
      if (locationMarker.value) {
        map.value.removeLayer(locationMarker.value);
      }
      locationMarker.value = L.marker([coords.lat, coords.lng]).addTo(
        map.value,
      );
      map.value.setView([coords.lat, coords.lng], 13);
    }
  } catch (error) {
    console.error("Erreur géolocalisation:", error);
    errors.value.location = "Impossible d'obtenir votre position";
  } finally {
    loadingLocation.value = false;
  }
};

const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event) => {
  const files = Array.from(event.target.files);

  files.forEach((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      selectedFiles.value.push({
        file,
        preview: e.target.result,
      });
    };
    reader.readAsDataURL(file);
  });

  // Reset input
  event.target.value = "";
};

const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};

const submitObservation = async () => {
  if (!validateStep(2)) return;

  submitting.value = true;

  try {
    // Create observation
    const obsData = {
      title: form.value.title,
      type: form.value.type,
      description: form.value.description,
      location: form.value.location,
    };

    console.log("📤 Données observation:", obsData);

    const response = await observationService.create(obsData);
    console.log("📥 Réponse création:", response);

    const observationId = response.data._id;

    // Upload images if any
    if (selectedFiles.value.length > 0) {
      console.log(`📸 Upload de ${selectedFiles.value.length} image(s)...`);
      const formData = new FormData();
      selectedFiles.value.forEach(({ file }, index) => {
        console.log(`  - Image ${index + 1}: ${file.name} (${(file.size / 1024).toFixed(2)} KB)`);
        formData.append("images", file);
      });

      const uploadResponse = await observationService.addImages(observationId, formData);
      console.log('✅ Images uploadées:', uploadResponse);
    }

    // Redirect to observation detail
    router.push(`/observations/${observationId}`);
  } catch (error) {
    console.error("Erreur création observation:", error);
    console.error("Détails erreur:", error.response?.data);
    console.error("Details validation:", error.response?.data?.details);

    // Afficher les erreurs de validation
    if (error.response?.data?.details) {
      error.response.data.details.forEach((detail) => {
        console.error(`❌ ${detail.field}: ${detail.message}`);
      });
    }

    errors.value.submit =
      error.response?.data?.message ||
      error.message ||
      "Erreur lors de la création";
  } finally {
    submitting.value = false;
  }
};

onUnmounted(() => {
  // Cleanup
  selectedFiles.value.forEach((file) => {
    URL.revokeObjectURL(file.preview);
  });
});
</script>

<style scoped>
.create-view {
    min-height: 100vh;
    background: var(--phenom-bg-primary);
}

.progress-bar {
  height: 4px;
  background: #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transition: width 0.3s ease;
}

.create-container {
    max-width: 700px;
    margin: 2rem auto;
    padding: 1.5rem;
    background: var(--phenom-surface-glass-base);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--phenom-border-medium);
    border-radius: var(--phenom-radius-2xl);
    box-shadow: var(--phenom-shadow-lg);
}

.step {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--phenom-text-primary);
    margin: 0 0 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.select-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 1rem;
  transition: all 0.2s;
  background: white;
  cursor: pointer;
}

.select-input:hover {
  border-color: #667eea;
}

.select-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.select-input.error {
  border-color: #ef4444;
}

.textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: all 0.2s;
}

.textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.textarea.error {
  border-color: #ef4444;
}

.error-text {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.location-info {
  margin-bottom: 1rem;
}

.info-text {
  color: #6b7280;
  font-size: 0.9375rem;
}

.mini-map {
  width: 100%;
  height: 300px;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  overflow: hidden;
  border: 2px solid #e5e7eb;
}

.upload-zone {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
  margin-bottom: 1rem;
}

.upload-zone:hover {
  border-color: #667eea;
  background: #f9fafb;
}

.upload-placeholder {
  text-align: center;
}

.upload-icon {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 1rem;
  color: #9ca3af;
}

.upload-text {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.25rem;
}

.upload-hint {
  font-size: 0.875rem;
  color: #9ca3af;
  margin: 0;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 0.5rem;
  overflow: hidden;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 2rem;
  height: 2rem;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.8);
}

.remove-btn svg {
  width: 1rem;
  height: 1rem;
}

.add-more-btn {
  aspect-ratio: 1;
  border: 2px dashed #d1d5db;
  background: white;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  color: #9ca3af;
  font-size: 0.875rem;
}

.add-more-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.add-more-btn svg {
  width: 1.5rem;
  height: 1.5rem;
}

.upload-progress {
  text-align: center;
  color: #667eea;
  font-size: 0.875rem;
  font-weight: 500;
}

.step-navigation {
  display: flex;
  gap: 0.75rem;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

@media (max-width: 640px) {
  .create-container {
    padding: 1rem;
  }

  .step-title {
    font-size: 1.5rem;
  }

  .preview-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
