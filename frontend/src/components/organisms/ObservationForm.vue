<template>
  <form @submit.prevent="handleSubmit" class="observation-form space-y-6" novalidate>
    <!-- Image Section with AI Toggle -->
    <div class="space-y-4">
      <label class="text-sm font-medium text-white/60 uppercase tracking-wider">
        Photo / Vidéo
      </label>
      
      <!-- Toggle between Upload and AI -->
      <div class="flex gap-3 mb-4">
        <button
          type="button"
          @click="form.generateAiImage = false; removeMedia()"
          :class="[
            'flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all',
            !form.generateAiImage
              ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/30'
              : 'bg-[#12151C] text-white/60 hover:text-white border border-white/10'
          ]"
        >
          Upload photo
        </button>
        <button
          type="button"
          @click="form.generateAiImage = true; removeMedia()"
          :class="[
            'flex-1 px-4 py-3 rounded-xl text-sm font-medium transition-all',
            form.generateAiImage
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30'
              : 'bg-[#12151C] text-white/60 hover:text-white border border-white/10'
          ]"
        >
          Générer par IA
        </button>
      </div>

      <!-- Upload Section -->
      <div v-if="!form.generateAiImage">
        <div 
          v-if="!form.media"
          class="aspect-video bg-[#12151C] border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#00F0FF]/50 transition-colors"
          @click="openMediaPicker"
        >
          <svg class="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p class="text-white/40 text-sm">Cliquez pour ajouter une photo</p>
          <p class="text-white/30 text-xs">JPEG, PNG, WebP • Max 10 MB</p>
        </div>
        
        <div v-else class="relative aspect-video rounded-2xl overflow-hidden">
          <img 
            :src="mediaPreview" 
            alt="Aperçu" 
            class="w-full h-full object-cover"
          />
          <button 
            type="button"
            @click="removeMedia"
            class="absolute top-3 right-3 w-10 h-10 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <!-- AI Generation Info -->
      <div v-else class="p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl">
        <div class="flex items-start gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p class="text-purple-200 font-medium mb-1">✨ Génération IA avec Gemini</p>
            <p class="text-purple-300/80 text-sm">
              Une illustration sera automatiquement générée à partir de votre description et des phénomènes sélectionnés. L'image sera marquée avec <code class="bg-black/30 px-1.5 py-0.5 rounded text-xs">source: 'ai'</code>.
            </p>
          </div>
        </div>
      </div>
      
      <input 
        ref="mediaInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        class="hidden"
        @change="handleMediaSelect"
      />
    </div>
    
    <!-- Date & Time Section -->
    <div class="space-y-4">
      <label class="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
        <span>📅</span>
        <span>Date & Heure</span>
      </label>
      
      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <input
            v-model="form.date"
            type="date"
            :max="today"
            class="w-full px-4 py-3 bg-[#12151C] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
            required
          />
          <p v-if="errors.date" class="text-red-400 text-xs">{{ errors.date }}</p>
        </div>
        
        <div class="space-y-2">
          <input
            v-model="form.time"
            type="time"
            class="w-full px-4 py-3 bg-[#12151C] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
          />
          <p v-if="errors.time" class="text-red-400 text-xs">{{ errors.time }}</p>
        </div>
      </div>
    </div>

    <!-- Location Section -->
    <div class="space-y-4">
      <label class="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
        <span>📍</span>
        <span>Localisation</span>
      </label>
      
      <div class="flex gap-3">
        <input
          v-model="form.location"
          type="text"
          placeholder="Lieu de l'observation (ex: Lausanne, près du lac)"
          class="flex-1 px-4 py-3 bg-[#12151C] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
        />
        <button 
          type="button"
          @click="getCurrentLocation"
          class="w-12 h-12 bg-[#12151C] border border-white/10 rounded-xl flex items-center justify-center text-white/60 hover:text-[#00F0FF] hover:border-[#00F0FF]/30 transition-colors flex-shrink-0"
          :disabled="gettingLocation"
          title="Utiliser ma position actuelle"
        >
          <LoadingSpinner v-if="gettingLocation" size="sm" />
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <input
            v-model="form.country"
            type="text"
            placeholder="Pays (ex: Suisse)"
            class="w-full px-4 py-3 bg-[#12151C] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
            required
          />
          <p v-if="errors.country" class="text-red-400 text-xs">{{ errors.country }}</p>
        </div>
        
        <select 
          v-model="form.locale" 
          class="w-full px-4 py-3 bg-[#12151C] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00F0FF]/50 transition-colors appearance-none"
        >
          <option value="">Type de lieu...</option>
          <option v-for="opt in LOCALE_TYPES" :key="opt.code" :value="opt.code">
            {{ opt.icon }} {{ opt.label }}
          </option>
        </select>
      </div>
      
      <div class="grid grid-cols-2 gap-4">
        <input
          v-model.number="form.latitude"
          type="number"
          step="0.000001"
          placeholder="Latitude (ex: 46.5197)"
          class="w-full px-4 py-3 bg-[#12151C] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
        />
        <input
          v-model.number="form.longitude"
          type="number"
          step="0.000001"
          placeholder="Longitude (ex: 6.6323)"
          class="w-full px-4 py-3 bg-[#12151C] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
        />
      </div>
    </div>

    <!-- Description Section -->
    <div class="space-y-4">
      <label class="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
        <span>📝</span>
        <span>Description détaillée</span>
      </label>
      
      <div class="relative">
        <textarea
          v-model="form.description"
          placeholder="Décrivez précisément ce que vous avez observé... (min 10 caractères)"
          class="w-full px-4 py-3 bg-[#12151C] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF]/50 transition-colors resize-none"
          rows="5"
          maxlength="2000"
          required
        ></textarea>
        <div class="absolute bottom-3 right-3 text-xs text-white/30">
          {{ form.description.length }}/2000
        </div>
      </div>
      <p v-if="errors.description" class="text-red-400 text-xs">{{ errors.description }}</p>
    </div>

    <!-- Evaluation Section -->
    <div class="space-y-4">
      <label class="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
        <span>📊</span>
        <span>Évaluation</span>
      </label>
      
      <div class="grid grid-cols-3 gap-4">
        <div class="space-y-2">
          <label class="text-xs text-white/50">Crédibilité (0-15)</label>
          <input
            v-model.number="form.credibility"
            type="number"
            min="0"
            max="15"
            placeholder="5"
            class="w-full px-4 py-3 bg-[#12151C] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
          />
        </div>
        
        <div class="space-y-2">
          <label class="text-xs text-white/50">Étrangeté (0-10)</label>
          <input
            v-model.number="form.strangeness"
            type="number"
            min="0"
            max="10"
            placeholder="5"
            class="w-full px-4 py-3 bg-[#12151C] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
          />
        </div>
        
        <div class="space-y-2">
          <label class="text-xs text-white/50">Durée (secondes)</label>
          <input
            v-model.number="form.duration"
            type="number"
            min="0"
            placeholder="60"
            class="w-full px-4 py-3 bg-[#12151C] border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
          />
        </div>
      </div>
    </div>

    <!-- Classifications Section -->
    <div class="space-y-4">
      <label class="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
        <span>🏷️</span>
        <span>Classifications</span>
      </label>
      
      <!-- Global dropdown showing all possible choices -->
      <div class="mb-3">
        <label class="text-xs text-white/50">Voir toutes les options</label>
        <select v-model="allChoicesSelected" class="w-full px-4 py-3 bg-[#12151C] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00F0FF]/50 transition-colors">
          <option value="">-- Parcourir toutes les options --</option>
          <optgroup v-for="group in ALL_OPTIONS" :label="group.label" :key="group.label">
            <option v-for="opt in group.options" :key="group.label + opt.code" :value="group.key + '::' + opt.code">
              {{ (opt.icon ? opt.icon + ' ' : '') + opt.code + ' - ' + opt.label }}
            </option>
          </optgroup>
        </select>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="space-y-2">
          <label class="text-xs text-white/50">Types d'observateurs</label>
          <select
            v-model="form.observerTypes"
            multiple
            class="w-full px-4 py-3 bg-[#12151C] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
            style="height: 120px"
          >
            <option v-for="obs in OBSERVER_TYPES" :key="obs.code" :value="obs.code" class="py-1">
              {{ obs.icon }} {{ obs.code }} - {{ obs.label }}
            </option>
          </select>
        </div>
        
        <div class="space-y-2">
          <label class="text-xs text-white/50">Formes OVNI</label>
          <select
            v-model="form.ufoShapes"
            multiple
            class="w-full px-4 py-3 bg-[#12151C] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
            style="height: 120px"
          >
            <option v-for="shape in UFO_SHAPES" :key="shape.code" :value="shape.code" class="py-1">
              {{ shape.icon }} {{ shape.code }} - {{ shape.label }}
            </option>
          </select>
        </div>
        
        <div class="space-y-2">
          <label class="text-xs text-white/50">Phénomènes</label>
          <select
            v-model="form.phenomena"
            multiple
            class="w-full px-4 py-3 bg-[#12151C] border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#00F0FF]/50 transition-colors"
            style="height: 120px"
          >
            <option v-for="pheno in PHENOMENA" :key="pheno.code" :value="pheno.code" class="py-1">
              {{ pheno.icon }} {{ pheno.code }} - {{ pheno.label }}
            </option>
          </select>
        </div>
      </div>
      
      <p class="text-xs text-white/40 flex items-center gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Maintenez Ctrl (ou Cmd) et cliquez pour sélectionner plusieurs options
      </p>
    </div>
    
    <!-- Submit Button -->
    <div class="pt-6">
      <button
        type="submit"
        :disabled="!isValid || submitting"
        :class="[
          'w-full px-6 py-4 rounded-xl font-semibold text-white transition-all transform',
          isValid && !submitting
            ? 'bg-gradient-to-r from-[#00F0FF] to-[#00A3CC] hover:shadow-xl hover:shadow-[#00F0FF]/30 hover:scale-[1.02] active:scale-[0.98]'
            : 'bg-white/10 cursor-not-allowed opacity-50'
        ]"
      >
        <span v-if="submitting" class="flex items-center justify-center gap-3">
          <LoadingSpinner size="sm" />
          <span>Publication en cours...</span>
        </span>
        <span v-else class="flex items-center justify-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          {{ submitLabel }}
        </span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue'
import { LoadingSpinner } from '@/components/atoms'
import OBSERVER_TYPES from '@/constants/observerTypes'
import UFO_SHAPES from '@/constants/ufoShapes'
import LOCALE_TYPES from '@/constants/localeTypes'
import PHENOMENA from '@/constants/phenomena'

defineOptions({ name: 'ObservationForm' })

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  },
  submitting: {
    type: Boolean,
    default: false
  },
  submitLabel: {
    type: String,
    default: 'Publier l\'observation'
  }
})

const emit = defineEmits(['submit', 'media-change'])

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  date: today,
  time: '',
  location: '',
  country: 'Suisse',
  locale: '',
  description: '',
  credibility: 5,
  strangeness: 5,
  duration: null,
  observerTypes: [],
  ufoShapes: [],
  phenomena: [],
  latitude: null,
  longitude: null,
  weather: '',
  witnesses: 1,
  media: null,
  generateAiImage: false
})

const errors = reactive({
  date: '',
  time: '',
  location: '',
  country: '',
  description: ''
})

// Aggregated options for the dropdown
const ALL_OPTIONS = [
  { key: 'observer', label: 'Types d\'observateurs', options: OBSERVER_TYPES },
  { key: 'shapes', label: 'Formes OVNI', options: UFO_SHAPES },
  { key: 'phenomena', label: 'Phénomènes', options: PHENOMENA },
  { key: 'locale', label: 'Types de lieu', options: LOCALE_TYPES }
]

const allChoicesSelected = ref('')

// When the user selects an entry from the global dropdown, add it to the relevant form field
watch(allChoicesSelected, (val) => {
  if (!val) return
  const [groupKey, code] = val.split('::')

  if (groupKey === 'observer') {
    if (!form.observerTypes.includes(code)) form.observerTypes.push(code)
  } else if (groupKey === 'shapes') {
    if (!form.ufoShapes.includes(code)) form.ufoShapes.push(code)
  } else if (groupKey === 'phenomena') {
    if (!form.phenomena.includes(code)) form.phenomena.push(code)
  } else if (groupKey === 'locale') {
    form.locale = code
  }

  // Reset selection after applying
  allChoicesSelected.value = ''
})

const mediaInput = ref(null)
const mediaPreview = ref('')
const gettingLocation = ref(false)
let currentObjectUrl = null

onMounted(() => {
  if (props.initialData) {
    Object.assign(form, props.initialData)
  }
})

watch(() => props.initialData, (data) => {
  if (data) {
    Object.assign(form, data)
  }
}, { deep: true })

const isValid = computed(() => {
  return form.description.trim().length >= 10 &&
         form.date && 
         form.country && 
         form.country.trim().length > 0 &&
         (form.media || form.generateAiImage)
})

const openMediaPicker = () => {
  mediaInput.value?.click()
}

const handleMediaSelect = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const maxSize = 10 * 1024 * 1024

  if (!validTypes.includes(file.type)) {
    errors.media = 'Format non valide. Utilisez JPEG, PNG ou WebP.'
    e.target.value = ''
    return
  }

  if (file.size > maxSize) {
    errors.media = 'Fichier trop volumineux. Max: 10 MB.'
    e.target.value = ''
    return
  }

  form.media = file
  // mediaPreview will be updated by the watcher below
  emit('media-change', file)
}

const removeMedia = () => {
  form.media = null
  // revoke any created object URL
  if (currentObjectUrl) {
    try { URL.revokeObjectURL(currentObjectUrl) } catch (e) { /* ignore */ }
    currentObjectUrl = null
  }
  mediaPreview.value = ''
  if (mediaInput.value) {
    mediaInput.value.value = ''
  }
  emit('media-change', null)
}

// Keep mediaPreview in sync with form.media (File | string | { url })
watch(() => form.media, (val) => {
  // revoke previous URL
  if (currentObjectUrl) {
    try { URL.revokeObjectURL(currentObjectUrl) } catch (e) { /* ignore */ }
    currentObjectUrl = null
  }

  if (!val) {
    mediaPreview.value = ''
    return
  }

  if (val instanceof File) {
    currentObjectUrl = URL.createObjectURL(val)
    mediaPreview.value = currentObjectUrl
  } else if (typeof val === 'string') {
    mediaPreview.value = val
  } else if (val && val.url) {
    mediaPreview.value = val.url
  } else {
    mediaPreview.value = ''
  }
}, { immediate: true })

onUnmounted(() => {
  if (currentObjectUrl) {
    try { URL.revokeObjectURL(currentObjectUrl) } catch (e) { /* ignore */ }
    currentObjectUrl = null
  }
})

const getCurrentLocation = async () => {
  if (!navigator.geolocation) return
  
  gettingLocation.value = true
  
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      })
    })
    
    form.latitude = position.coords.latitude
    form.longitude = position.coords.longitude
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
      )
      const data = await response.json()
      if (data.display_name) {
        form.location = data.display_name.split(',').slice(0, 3).join(', ')
      }
      if (data.address?.country) {
        form.country = data.address.country
      }
    } catch {
      form.location = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`
    }
  } catch (error) {
    console.error('Erreur de géolocalisation:', error)
  } finally {
    gettingLocation.value = false
  }
}

const validate = () => {
  let valid = true
  
  Object.keys(errors).forEach(key => errors[key] = '')
  
  if (!form.description.trim() || form.description.length < 10) {
    errors.description = 'La description doit contenir au moins 10 caractères'
    valid = false
  }
  
  if (!form.date) {
    errors.date = 'La date est requise'
    valid = false
  }

  if (!form.country || !form.country.trim()) {
    errors.country = 'Le pays est requis'
    valid = false
  }
  
  return valid
}

const handleSubmit = () => {
  if (!validate()) return
  
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
    generateAiImage: form.generateAiImage
  }

  if (form.latitude && form.longitude) {
    submitData.coordinates = {
      lat: form.latitude,
      lng: form.longitude
    }
  }

  if (form.media) {
    submitData.imageFile = form.media
  }
  
  emit('submit', submitData)
}

defineExpose({ validate, form })
</script>

<style scoped>
/* Custom scrollbar for select elements */
select::-webkit-scrollbar {
  width: 8px;
}

select::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

select::-webkit-scrollbar-thumb {
  background: rgba(0, 240, 255, 0.3);
  border-radius: 4px;
}

select::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 240, 255, 0.5);
}

/* Custom select arrow */
select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.4)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 20px;
  padding-right: 40px;
}

/* Multiple select styling */
select[multiple] option {
  padding: 8px 12px;
  margin: 2px 0;
  border-radius: 4px;
}

select[multiple] option:checked {
  background: linear-gradient(135deg, rgba(0, 240, 255, 0.2), rgba(0, 163, 204, 0.2));
  color: #00F0FF;
}
</style>