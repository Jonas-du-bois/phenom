<template>
  <form @submit.prevent="handleSubmit" class="observation-form" novalidate>
    <div class="liquid-glass-card">
      <!-- Image toggle -->
      <div class="form-section">
        <label class="section-label">Photo / Vidéo</label>

        <div class="toggle-group">
          <button
            type="button"
            class="toggle-btn" 
            :class="{ active: !form.generateAiImage }"
            @click="(form.generateAiImage = false), removeMedia()"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
            </svg>
            Upload
          </button>
          <button
            type="button"
            class="toggle-btn"
            :class="{ active: form.generateAiImage }"
            @click="(form.generateAiImage = true), removeMedia()"
          >
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 16V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/>
              <polyline points="7 10 12 15 17 10"/>
            </svg>
            Générer IA
          </button>
        </div>

        <div v-if="!form.generateAiImage" class="media-zone" @click="openMediaPicker">
          <template v-if="!form.media">
            <div class="upload-placeholder">
              <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <p>Cliquez pour ajouter une photo</p>
              <span class="upload-hint">JPEG, PNG, WebP • Max 10MB</span>
            </div>
          </template>
          <template v-else>
            <div class="media-preview-container">
              <img :src="mediaPreview" alt="Aperçu" class="media-img" />
              <button type="button" class="remove-media-btn" @click.stop="removeMedia">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
          </template>
        </div>

        <div v-else class="ai-badge">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
          Une image sera générée par IA à partir de la description
        </div>

        <input ref="mediaInput" type="file" accept="image/jpeg,image/png,image/webp" class="file-input" @change="handleMediaSelect" />
      </div>

      <!-- Date & Time -->
      <div class="form-section">
        <label class="section-label">Date & Heure</label>
        <div class="input-row">
          <input class="liquid-input" v-model="form.date" type="date" :max="today" required />
          <input class="liquid-input" v-model="form.time" type="time" />
        </div>
        <p v-if="errors.date" class="error-msg">{{ errors.date }}</p>
      </div>

      <!-- Location -->
      <div class="form-section">
        <label class="section-label">Localisation</label>
        <div class="input-row">
          <input class="liquid-input flex-1" v-model="form.location" type="text" placeholder="Lieu (ex: Lausanne)" />
          <button type="button" class="geo-btn" @click="getCurrentLocation" :disabled="gettingLocation">
            <LoadingSpinner v-if="gettingLocation" size="sm" />
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </button>
        </div>

        <div class="input-row mt-3">
          <input class="liquid-input" v-model="form.country" type="text" placeholder="Pays" required />
          <select class="liquid-input" v-model="form.locale">
            <option value="">Type de lieu...</option>
            <option v-for="opt in LOCALE_TYPES" :key="opt.code" :value="opt.code">{{ opt.icon }} {{ opt.label }}</option>
          </select>
        </div>

        <div class="input-row mt-3">
          <input class="liquid-input" v-model.number="form.latitude" type="number" step="0.000001" placeholder="Latitude" />
          <input class="liquid-input" v-model.number="form.longitude" type="number" step="0.000001" placeholder="Longitude" />
        </div>
      </div>

      <!-- Description -->
      <div class="form-section">
        <label class="section-label">Description</label>
        <textarea 
          class="liquid-textarea" 
          v-model="form.description" 
          rows="5" 
          maxlength="2000" 
          placeholder="Décrivez en détail votre observation... (minimum 10 caractères)" 
          required
        ></textarea>
        <div class="char-counter">{{ form.description.length }} / 2000</div>
        <p v-if="errors.description" class="error-msg">{{ errors.description }}</p>
      </div>

      <!-- Ratings -->
      <div class="form-section">
        <label class="section-label">Évaluation</label>
        <div class="rating-grid">
          <div class="rating-item">
            <label class="rating-label">Crédibilité</label>
            <input class="liquid-input" v-model.number="form.credibility" type="number" min="0" max="15" placeholder="0-15" />
          </div>
          <div class="rating-item">
            <label class="rating-label">Étrangeté</label>
            <input class="liquid-input" v-model.number="form.strangeness" type="number" min="0" max="10" placeholder="0-10" />
          </div>
          <div class="rating-item">
            <label class="rating-label">Durée (secondes)</label>
            <input class="liquid-input" v-model.number="form.duration" type="number" min="0" placeholder="Durée" />
          </div>
        </div>
      </div>

      <!-- Classifications avec chips -->
      <div class="form-section">
        <label class="section-label">Types d'observateurs</label>
        <div class="chips-container">
          <button
            v-for="obs in OBSERVER_TYPES"
            :key="obs.code"
            type="button"
            class="chip"
            :class="{ selected: form.observerTypes.includes(obs.code) }"
            @click="toggleSelection('observerTypes', obs.code)"
          >
            <span class="chip-icon">{{ obs.icon }}</span>
            <span class="chip-label">{{ obs.label }}</span>
          </button>
        </div>
      </div>

      <div class="form-section">
        <label class="section-label">Formes d'OVNI</label>
        <div class="chips-container">
          <button
            v-for="shape in UFO_SHAPES"
            :key="shape.code"
            type="button"
            class="chip"
            :class="{ selected: form.ufoShapes.includes(shape.code) }"
            @click="toggleSelection('ufoShapes', shape.code)"
          >
            <span class="chip-icon">{{ shape.icon }}</span>
            <span class="chip-label">{{ shape.label }}</span>
          </button>
        </div>
      </div>

      <div class="form-section">
        <label class="section-label">Phénomènes observés</label>
        <div class="chips-container">
          <button
            v-for="pheno in PHENOMENA"
            :key="pheno.code"
            type="button"
            class="chip"
            :class="{ selected: form.phenomena.includes(pheno.code) }"
            @click="toggleSelection('phenomena', pheno.code)"
          >
            <span class="chip-icon">{{ pheno.icon }}</span>
            <span class="chip-label">{{ pheno.label }}</span>
          </button>
        </div>
      </div>

      <!-- Submit button -->
      <div class="form-section">
        <button type="submit" :disabled="!isValid || submitting" class="submit-button">
          <span v-if="submitting">
            <svg class="spinner" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" opacity="0.25"/>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
            </svg>
            Publication en cours...
          </span>
          <span v-else>{{ submitLabel }}</span>
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from "vue";
import { LoadingSpinner } from "@/components/atoms";
import OBSERVER_TYPES from "@/constants/observerTypes";
import UFO_SHAPES from "@/constants/ufoShapes";
import LOCALE_TYPES from "@/constants/localeTypes";
import PHENOMENA from "@/constants/phenomena";

defineOptions({ name: "ObservationForm" });

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({}),
  },
  submitting: {
    type: Boolean,
    default: false,
  },
  submitLabel: {
    type: String,
    default: "Publier l'observation",
  },
});

const emit = defineEmits(["submit", "media-change"]);

const today = new Date().toISOString().split("T")[0];

const form = reactive({
  date: today,
  time: "",
  location: "",
  country: "Suisse",
  locale: "",
  description: "",
  credibility: 5,
  strangeness: 5,
  duration: null,
  observerTypes: [],
  ufoShapes: [],
  phenomena: [],
  latitude: null,
  longitude: null,
  weather: "",
  witnesses: 1,
  media: null,
  generateAiImage: false,
});

const errors = reactive({
  date: "",
  time: "",
  location: "",
  country: "",
  description: "",
});

const mediaInput = ref(null);
const mediaPreview = ref("");
const gettingLocation = ref(false);
let currentObjectUrl = null;

onMounted(() => {
  if (props.initialData) {
    Object.assign(form, props.initialData);
  }
});

watch(
  () => props.initialData,
  (data) => {
    if (data) {
      Object.assign(form, data);
    }
  },
  { deep: true },
);

const isValid = computed(() => {
  return (
    form.description.trim().length >= 10 &&
    form.date &&
    form.country &&
    form.country.trim().length > 0 &&
    (form.media || form.generateAiImage)
  );
});

const toggleSelection = (field, code) => {
  const index = form[field].indexOf(code);
  if (index > -1) {
    form[field].splice(index, 1);
  } else {
    form[field].push(code);
  }
};

const openMediaPicker = () => {
  mediaInput.value?.click();
};

const handleMediaSelect = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const validTypes = ["image/jpeg", "image/png", "image/webp"];
  const maxSize = 10 * 1024 * 1024;

  if (!validTypes.includes(file.type)) {
    errors.media = "Format non valide. Utilisez JPEG, PNG ou WebP.";
    e.target.value = "";
    return;
  }

  if (file.size > maxSize) {
    errors.media = "Fichier trop volumineux. Max: 10 MB.";
    e.target.value = "";
    return;
  }

  form.media = file;
  emit("media-change", file);
};

const removeMedia = () => {
  form.media = null;
  if (currentObjectUrl) {
    try {
      URL.revokeObjectURL(currentObjectUrl);
    } catch (e) {
      /* ignore */
    }
    currentObjectUrl = null;
  }
  mediaPreview.value = "";
  if (mediaInput.value) {
    mediaInput.value.value = "";
  }
  emit("media-change", null);
};

watch(
  () => form.media,
  (val) => {
    if (currentObjectUrl) {
      try {
        URL.revokeObjectURL(currentObjectUrl);
      } catch (e) {
        /* ignore */
      }
      currentObjectUrl = null;
    }

    if (!val) {
      mediaPreview.value = "";
      return;
    }

    if (val instanceof File) {
      currentObjectUrl = URL.createObjectURL(val);
      mediaPreview.value = currentObjectUrl;
    } else if (typeof val === "string") {
      mediaPreview.value = val;
    } else if (val && val.url) {
      mediaPreview.value = val.url;
    } else {
      mediaPreview.value = "";
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (currentObjectUrl) {
    try {
      URL.revokeObjectURL(currentObjectUrl);
    } catch (e) {
      /* ignore */
    }
    currentObjectUrl = null;
  }
});

const getCurrentLocation = async () => {
  if (!navigator.geolocation) return;

  gettingLocation.value = true;

  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    });

    form.latitude = position.coords.latitude;
    form.longitude = position.coords.longitude;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`,
      );
      const data = await response.json();
      if (data.display_name) {
        form.location = data.display_name.split(",").slice(0, 3).join(", ");
      }
      if (data.address?.country) {
        form.country = data.address.country;
      }
    } catch {
      form.location = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
    }
  } catch (error) {
    console.error("Erreur de géolocalisation:", error);
  } finally {
    gettingLocation.value = false;
  }
};

const validate = () => {
  let valid = true;

  Object.keys(errors).forEach((key) => (errors[key] = ""));

  if (!form.description.trim() || form.description.length < 10) {
    errors.description = "La description doit contenir au moins 10 caractères";
    valid = false;
  }

  if (!form.date) {
    errors.date = "La date est requise";
    valid = false;
  }

  if (!form.country || !form.country.trim()) {
    errors.country = "Le pays est requis";
    valid = false;
  }

  return valid;
};

const handleSubmit = () => {
  if (!validate()) return;

  const submitData = {
    description: form.description,
    date: form.date,
    time: form.time,
    location: form.location,
    country: form.country,
    locale: form.locale,
    credibility: form.credibility,
    strangeness: form.strangeness,
    duration: form.duration,
    observerTypes: form.observerTypes,
    ufoShapes: form.ufoShapes,
    phenomena: form.phenomena,
    weather: form.weather,
    witnesses: form.witnesses,
    generateAiImage: form.generateAiImage,
  };

  if (form.latitude && form.longitude) {
    submitData.coordinates = {
      lat: form.latitude,
      lng: form.longitude,
    };
  }

  if (form.media) {
    submitData.imageFile = form.media;
  }

  emit("submit", submitData);
};

defineExpose({ validate, form });
</script>

<style scoped>
/* === LIQUID GLASS CORE === */
.liquid-glass-card {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.03) 0%,
    rgba(255, 255, 255, 0.01) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: clamp(16px, 4vw, 32px);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 0 1px rgba(0, 240, 255, 0.05);
  position: relative;
  overflow: hidden;
}

.liquid-glass-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(0, 240, 255, 0.3),
    transparent
  );
  animation: shimmer 3s infinite;
}

@keyframes shimmer {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.8; }
}

/* === FORM SECTIONS === */
.form-section {
  margin-bottom: 28px;
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* === INPUTS === */
.liquid-input,
.liquid-textarea {
  width: 100%;
  padding: 14px 18px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.04),
    rgba(255, 255, 255, 0.02)
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  color: #ffffff;
  font-size: 15px;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.liquid-input::placeholder,
.liquid-textarea::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.liquid-input:focus,
.liquid-textarea:focus {
  outline: none;
  border-color: rgba(0, 240, 255, 0.4);
  background: linear-gradient(
    135deg,
    rgba(0, 240, 255, 0.08),
    rgba(0, 163, 204, 0.04)
  );
  box-shadow: 
    0 0 0 3px rgba(0, 240, 255, 0.1),
    0 4px 20px rgba(0, 240, 255, 0.15);
}

.liquid-textarea {
  resize: vertical;
  min-height: 120px;
  font-family: inherit;
  line-height: 1.6;
}

/* === INPUT ROWS === */
.input-row {
  display: flex;
  gap: 12px;
  align-items: stretch;
}

.input-row .liquid-input {
  flex: 1;
}

.flex-1 {
  flex: 1;
}

.mt-3 {
  margin-top: 12px;
}

/* === TOGGLE BUTTONS === */
.toggle-group {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.toggle-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 20px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.01)
  );
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn .icon {
  width: 18px;
  height: 18px;
}

.toggle-btn.active {
  background: linear-gradient(
    135deg,
    rgba(0, 240, 255, 0.15),
    rgba(0, 163, 204, 0.1)
  );
  border-color: rgba(0, 240, 255, 0.3);
  color: #00F0FF;
  box-shadow: 
    0 4px 16px rgba(0, 240, 255, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

.toggle-btn:hover:not(.active) {
  border-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.8);
}

/* === MEDIA UPLOAD === */
.media-zone {
  margin-top: 12px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
}

.upload-placeholder {
  padding: 48px 24px;
  text-align: center;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.02),
    rgba(255, 255, 255, 0.005)
  );
  border: 2px dashed rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.upload-placeholder:hover {
  border-color: rgba(0, 240, 255, 0.3);
  background: linear-gradient(
    135deg,
    rgba(0, 240, 255, 0.05),
    rgba(0, 163, 204, 0.02)
  );
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: rgba(255, 255, 255, 0.4);
}

.upload-placeholder p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 15px;
  font-weight: 500;
  margin-bottom: 8px;
}

.upload-hint {
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
}

.media-preview-container {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
}

.media-img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 14px;
}

.remove-media-btn {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.2s ease;
}

.remove-media-btn:hover {
  background: rgba(255, 59, 48, 0.8);
  transform: scale(1.05);
}

.remove-media-btn svg {
  width: 18px;
  height: 18px;
}

.file-input {
  display: none;
}

/* === AI BADGE === */
.ai-badge {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 18px;
  margin-top: 12px;
  background: linear-gradient(
    135deg,
    rgba(138, 43, 226, 0.1),
    rgba(255, 105, 180, 0.05)
  );
  border: 1px solid rgba(138, 43, 226, 0.2);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
}

.ai-badge .icon {
  width: 20px;
  height: 20px;
  color: rgba(138, 43, 226, 0.8);
}

/* === GEO BUTTON === */
.geo-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.04),
    rgba(255, 255, 255, 0.02)
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
}

.geo-btn:hover:not(:disabled) {
  border-color: rgba(0, 240, 255, 0.3);
  color: #00F0FF;
  background: linear-gradient(
    135deg,
    rgba(0, 240, 255, 0.1),
    rgba(0, 163, 204, 0.05)
  );
}

.geo-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.geo-btn svg {
  width: 22px;
  height: 22px;
}

/* === RATING GRID === */
.rating-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
}

.rating-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rating-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  font-weight: 500;
}

/* === CHIPS === */
.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.04),
    rgba(255, 255, 255, 0.02)
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chip:hover {
  border-color: rgba(0, 240, 255, 0.3);
  transform: translateY(-2px);
}

.chip.selected {
  background: linear-gradient(
    135deg,
    rgba(0, 240, 255, 0.2),
    rgba(0, 163, 204, 0.15)
  );
  border-color: rgba(0, 240, 255, 0.4);
  color: #00F0FF;
  box-shadow: 
    0 4px 16px rgba(0, 240, 255, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.15);
}

.chip-icon {
  font-size: 16px;
  line-height: 1;
}

.chip-label {
  line-height: 1;
}

/* === SUBMIT BUTTON === */
.submit-button {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #00F0FF 0%, #00A3CC 100%);
  border: none;
  border-radius: 14px;
  color: #021014;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 20px rgba(0, 240, 255, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 
    0 6px 28px rgba(0, 240, 255, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spinner {
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* === UTILITIES === */
.char-counter {
  text-align: right;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 8px;
}

.error-msg {
  color: #ff7b7b;
  font-size: 13px;
  margin-top: 8px;
  font-weight: 500;
}

/* === RESPONSIVE === */
@media (max-width: 640px) {
  .liquid-glass-card {
    border-radius: 20px;
    padding: 20px;
  }

  .rating-grid {
    grid-template-columns: 1fr;
  }

  .toggle-btn {
    font-size: 13px;
    padding: 10px 14px;
  }

  .chip {
    font-size: 13px;
    padding: 8px 14px;
  }
}

/* === SELECT STYLING === */
select.liquid-input {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.5)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 18px;
  padding-right: 44px;
  cursor: pointer;
}

select.liquid-input:focus {
  cursor: pointer;
}
</style>
