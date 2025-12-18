<template>
  <AppLayout>
    <template #header>
      <PageHeader title="Alertes">
        <template #right>
          <IconButton 
            v-if="alerts.length"
            variant="ghost" 
            size="sm"
            aria-label="Marquer tout comme lu"
            @click="markAllRead"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7" />
            </svg>
          </IconButton>
        </template>
      </PageHeader>
    </template>
    
    <div class="alerts-page">
      <!-- Location permission banner -->
      <div 
        v-if="!locationEnabled"
        class="mx-4 mt-4 p-4 bg-[#12151C] border border-white/10 rounded-xl"
      >
        <div class="flex items-start gap-3">
          <svg class="w-6 h-6 text-[#00F0FF] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div class="flex-1">
            <h3 class="text-white font-medium">Activez la localisation</h3>
            <p class="text-white/60 text-sm mt-1">
              Pour recevoir des alertes sur les observations proches de vous.
            </p>
          </div>
        </div>
        <BaseButton 
          variant="primary" 
          size="sm"
          class="w-full mt-3"
          @click="requestLocation"
        >
          Activer
        </BaseButton>
      </div>
      
      <!-- Radius selector -->
      <div v-if="locationEnabled" class="px-4 py-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-white/60">Rayon d'alerte</span>
          <span class="text-sm text-[#00F0FF] font-medium">{{ alertRadius }} km</span>
        </div>
        <RangeInput
          v-model="alertRadius"
          :min="5"
          :max="100"
          :step="5"
        />
      </div>
      
      <!-- Loading -->
      <template v-if="loading">
        <div class="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      </template>
      
      <!-- Empty state -->
      <template v-else-if="!alerts.length">
        <div class="flex items-center justify-center py-12 px-4">
          <EmptyState
            icon="bell"
            title="Aucune alerte"
            description="Vous serez notifié des observations proches de vous."
          />
        </div>
      </template>
      
      <!-- Alerts list -->
      <template v-else>
        <div class="divide-y divide-white/5">
          <div
            v-for="alert in alerts"
            :key="alert.id"
            class="alert-item px-4 py-4 flex gap-3 transition-colors"
            :class="{ 'bg-[#00F0FF]/5': !alert.read }"
            @click="viewAlert(alert)"
          >
            <!-- Observation thumbnail -->
            <div class="w-16 h-16 rounded-xl overflow-hidden bg-[#12151C] shrink-0">
              <img 
                v-if="alert.observation?.imageUrl"
                :src="alert.observation.imageUrl"
                alt=""
                class="w-full h-full object-cover"
              />
              <div 
                v-else
                class="w-full h-full flex items-center justify-center"
              >
                <svg class="w-6 h-6 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span 
                  v-if="!alert.read"
                  class="w-2 h-2 rounded-full bg-[#00F0FF] shrink-0"
                />
                <h3 class="text-white font-medium truncate">
                  {{ alert.observation?.title || 'Nouvelle observation' }}
                </h3>
              </div>
              
              <p class="text-white/60 text-sm mt-1 line-clamp-2">
                {{ alert.message }}
              </p>
              
              <div class="flex items-center gap-3 mt-2 text-xs text-white/40">
                <span class="flex items-center gap-1">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {{ alert.distance }}km
                </span>
                <span>{{ formatTime(alert.createdAt) }}</span>
              </div>
            </div>
            
            <!-- Arrow -->
            <svg class="w-5 h-5 text-white/30 shrink-0 self-center" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { AppLayout } from '@/components/layout'
import { PageHeader } from '@/components/organisms'
import { IconButton, BaseButton, RangeInput, LoadingSpinner, EmptyState } from '@/components/atoms'

defineOptions({ name: 'AlertsPage' })

const router = useRouter()

const alerts = ref([])
const loading = ref(true)
const locationEnabled = ref(false)
const alertRadius = ref(50)
const userLocation = ref(null)

onMounted(async () => {
  // Check if location is already enabled
  if (navigator.geolocation) {
    navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
      locationEnabled.value = result.state === 'granted'
      if (locationEnabled.value) {
        getCurrentLocation()
      }
    })
  }
  
  await fetchAlerts()
})

const getCurrentLocation = () => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      userLocation.value = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }
      fetchAlerts()
    },
    (error) => {
      console.error('Location error:', error)
    }
  )
}

const requestLocation = async () => {
  try {
    const position = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000
      })
    })
    
    userLocation.value = {
      lat: position.coords.latitude,
      lng: position.coords.longitude
    }
    locationEnabled.value = true
    
    await fetchAlerts()
  } catch (error) {
    console.error('Location permission denied:', error)
  }
}

const fetchAlerts = async () => {
  loading.value = true
  
  try {
    // TODO: Replace with actual API call
    // const response = await alertService.getAlerts({
    //   lat: userLocation.value?.lat,
    //   lng: userLocation.value?.lng,
    //   radius: alertRadius.value
    // })
    
    // Mock data for now
    alerts.value = []
    
  } catch (error) {
    console.error('Fetch alerts error:', error)
  } finally {
    loading.value = false
  }
}

const viewAlert = (alert) => {
  // Mark as read
  alert.read = true
  
  // Navigate to observation
  if (alert.observation?._id || alert.observationId) {
    router.push(`/observation/${alert.observation?._id || alert.observationId}`)
  }
}

const markAllRead = () => {
  alerts.value.forEach(alert => {
    alert.read = true
  })
  // TODO: API call to mark all read
}

const formatTime = (date) => {
  if (!date) return ''
  
  const now = new Date()
  const d = new Date(date)
  const diff = Math.floor((now - d) / 1000)
  
  if (diff < 60) return 'À l\'instant'
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)}min`
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`
  
  return d.toLocaleDateString('fr-FR')
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
