<template>
  <form @submit.prevent="handleSubmit" class="observation-form space-y-6">
    <!-- Image section -->
    <div class="space-y-3">
      <label class="text-sm font-medium text-white/60 uppercase tracking-wider">
        Photo / Vidéo
      </label>
      
      <div 
        v-if="!form.media"
        class="aspect-video bg-[#12151C] border-2 border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-[#00F0FF]/50 transition-colors"
        @click="openMediaPicker"
      >
        <svg class="w-12 h-12 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-white/40 text-sm">Ajouter un média</p>
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
          class="absolute top-3 right-3 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center text-white"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <input 
        ref="mediaInput"
        type="file"
        accept="image/*,video/*"
        class="hidden"
        @change="handleMediaSelect"
      />
    </div>
    
    <!-- Title -->
    <TextInput
      v-model="form.title"
      label="Titre"
      placeholder="Donnez un titre à votre observation"
      :error="errors.title"
      required
    />
    
    <!-- Description -->
    <TextArea
      v-model="form.description"
      label="Description"
      placeholder="Décrivez ce que vous avez observé..."
      :rows="4"
      :maxlength="2000"
      show-count
      :error="errors.description"
      required
    />
    
    <!-- Observation Type -->
    <div class="space-y-3">
      <label class="text-sm font-medium text-white/60 uppercase tracking-wider">
        Type d'observation
      </label>
      <BaseSelect
        v-model="form.type"
        :options="observationTypes"
        placeholder="Sélectionnez un type"
        :error="errors.type"
      />
    </div>
    
    <!-- Date & Time -->
    <div class="grid grid-cols-2 gap-4">
      <DatePicker
        v-model="form.date"
        label="Date"
        :max="today"
        :error="errors.date"
        required
      />
      <TimePicker
        v-model="form.time"
        label="Heure"
        :error="errors.time"
      />
    </div>
    
    <!-- Duration -->
    <DurationInput
      v-model="form.duration"
      label="Durée de l'observation"
    />
    
    <!-- Location -->
    <div class="space-y-3">
      <label class="text-sm font-medium text-white/60 uppercase tracking-wider">
        Localisation
      </label>
      
      <div class="flex gap-3">
        <TextInput
          v-model="form.location"
          placeholder="Lieu de l'observation"
          class="flex-1"
          :error="errors.location"
        />
        <button 
          type="button"
          @click="getCurrentLocation"
          class="w-12 h-12 bg-[#12151C] border border-white/10 rounded-xl flex items-center justify-center text-white/60 hover:text-[#00F0FF] hover:border-[#00F0FF]/30 transition-colors"
          :disabled="gettingLocation"
        >
          <LoadingSpinner v-if="gettingLocation" size="sm" />
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
      
      <!-- Mini map preview -->
      <div 
        v-if="form.coordinates"
        class="h-32 bg-[#12151C] rounded-xl overflow-hidden"
      >
        <div id="location-preview-map" class="w-full h-full" />
      </div>
    </div>
    
    <!-- Weather conditions -->
    <TextInput
      v-model="form.weather"
      label="Conditions météo"
      placeholder="Ciel dégagé, nuageux, orageux..."
    />
    
    <!-- Witnesses -->
    <TextInput
      v-model="form.witnesses"
      label="Nombre de témoins"
      type="number"
      :min="1"
      placeholder="1"
    />
    
    <!-- Submit button -->
    <div class="pt-4">
      <BaseButton 
        type="submit"
        variant="primary"
        class="w-full"
        :loading="submitting"
        :disabled="!isValid"
      >
        {{ submitLabel }}
      </BaseButton>
    </div>
  </form>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { TextInput, TextArea, BaseSelect, DatePicker, TimePicker, DurationInput, BaseButton, LoadingSpinner } from '@/components/atoms'

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

const observationTypes = [
  { value: 'ufo', label: 'UFO / OVNI' },
  { value: 'light', label: 'Lumière étrange' },
  { value: 'entity', label: 'Entité / Être' },
  { value: 'craft', label: 'Engin / Vaisseau' },
  { value: 'orb', label: 'Orbe / Sphère' },
  { value: 'other', label: 'Autre phénomène' }
]

const today = new Date().toISOString().split('T')[0]

const form = reactive({
  title: '',
  description: '',
  type: '',
  date: today,
  time: '',
  duration: 0,
  location: '',
  coordinates: null,
  weather: '',
  witnesses: 1,
  media: null
})

const errors = reactive({
  title: '',
  description: '',
  type: '',
  date: '',
  time: '',
  location: ''
})

const mediaInput = ref(null)
const mediaPreview = ref('')
const gettingLocation = ref(false)

// Init with initial data
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
  return form.title.trim().length >= 3 && 
         form.description.trim().length >= 10 &&
         form.date
})

const openMediaPicker = () => {
  mediaInput.value?.click()
}

const handleMediaSelect = (e) => {
  const file = e.target.files[0]
  if (file) {
    form.media = file
    mediaPreview.value = URL.createObjectURL(file)
    emit('media-change', file)
  }
}

const removeMedia = () => {
  form.media = null
  mediaPreview.value = ''
  if (mediaInput.value) {
    mediaInput.value.value = ''
  }
  emit('media-change', null)
}

const getCurrentLocation = async () => {
  if (!navigator.geolocation) return
  
  gettingLocation.value = true
  
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000
      })
    })
    
    form.coordinates = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }
    
    // Reverse geocode to get location name
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${position.coords.latitude}&lon=${position.coords.longitude}&format=json`
      )
      const data = await response.json()
      if (data.display_name) {
        form.location = data.display_name.split(',').slice(0, 3).join(',')
      }
    } catch {
      form.location = `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`
    }
  } catch (error) {
    console.error('Geolocation error:', error)
  } finally {
    gettingLocation.value = false
  }
}

const validate = () => {
  let isValid = true
  
  // Reset errors
  Object.keys(errors).forEach(key => errors[key] = '')
  
  if (!form.title.trim() || form.title.length < 3) {
    errors.title = 'Le titre doit contenir au moins 3 caractères'
    isValid = false
  }
  
  if (!form.description.trim() || form.description.length < 10) {
    errors.description = 'La description doit contenir au moins 10 caractères'
    isValid = false
  }
  
  if (!form.date) {
    errors.date = 'La date est requise'
    isValid = false
  }
  
  return isValid
}

const handleSubmit = () => {
  if (!validate()) return
  
  emit('submit', { ...form })
}

defineExpose({ validate, form })
</script>
