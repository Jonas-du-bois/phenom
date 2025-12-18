<template>
  <div class="observation-detail-page min-h-screen bg-[#000000]">
    <!-- Loading state -->
    <template v-if="loading">
      <div class="flex items-center justify-center h-screen">
        <LoadingSpinner size="lg" />
      </div>
    </template>
    
    <!-- Error state -->
    <template v-else-if="error">
      <div class="flex items-center justify-center h-screen px-4">
        <ErrorState 
          :title="error"
          description="L'observation n'a pas pu être chargée."
        >
          <template #action>
            <BaseButton variant="secondary" @click="goBack">
              Retour
            </BaseButton>
          </template>
        </ErrorState>
      </div>
    </template>
    
    <!-- Content -->
    <template v-else-if="observation">
      <!-- Header -->
      <ObservationHeader
        :user="observation.userId || observation.user || observation.author"
        :date="observation.createdAt"
        :verified="observation.verified"
        show-back
        show-menu
        @back="goBack"
        @menu="showMenu = true"
      />
      
      <!-- Image gallery -->
      <ImageGallery
        v-if="images.length"
        :images="images"
        @image-click="openFullscreen"
      />
      
      <!-- Observation info -->
      <div class="px-4 py-4 space-y-4">
        <!-- Title -->
        <h1 class="text-xl font-semibold text-white">
          {{ observation.title }}
        </h1>
        
        <!-- Type badge -->
        <div class="flex items-center gap-2">
          <BaseBadge :variant="typeBadgeVariant">
            {{ observation.type?.toUpperCase() || 'OBSERVATION' }}
          </BaseBadge>
          <BaseBadge v-if="observation.verified" variant="success">
            Vérifié
          </BaseBadge>
        </div>
        
        <!-- Description -->
        <p class="text-white/80 text-base leading-relaxed whitespace-pre-wrap">
          {{ observation.description }}
        </p>
        
        <!-- Metadata -->
        <ObservationMeta :observation="observation" />
        
        <!-- Map preview -->
        <div 
          v-if="observation.location?.coordinates"
          class="h-40 rounded-xl overflow-hidden"
          @click="$router.push({ path: '/map', query: { focus: observation._id } })"
        >
          <div class="w-full h-full bg-[#12151C] flex items-center justify-center">
            <div class="text-center">
              <svg class="w-8 h-8 mx-auto text-[#00F0FF] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p class="text-sm text-white/60">Voir sur la carte</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Divider -->
      <div class="h-2 bg-[#080A0E]" />
      
      <!-- Comments section -->
      <div class="px-4 py-4" id="comments">
        <h2 class="text-lg font-semibold text-white mb-4">
          Commentaires
          <span v-if="comments.length" class="text-white/40 font-normal">
            ({{ comments.length }})
          </span>
        </h2>
        
        <CommentList
          :comments="comments"
          :loading="false"
          :loading-more="false"
          :has-more="false"
          :current-user-id="currentUserId"
          @delete="deleteComment"
          @user-click="goToProfile"
        />
      </div>
      
      <!-- Comment form (sticky bottom) -->
      <CommentForm
        v-if="isAuthenticated"
        :loading="submittingComment"
        @submit="submitComment"
      />
      
      <!-- Options menu -->
      <Teleport to="body">
        <Transition name="fade">
          <div 
            v-if="showMenu"
            class="fixed inset-0 z-50"
          >
            <div 
              class="absolute inset-0 bg-black/60"
              @click="showMenu = false"
            />
            
            <div 
              class="absolute bottom-0 left-0 right-0 bg-[#12151C] rounded-t-2xl overflow-hidden"
              :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }"
            >
              <div class="py-2">
                <button 
                  @click="shareObservation"
                  class="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-white/5"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Partager</span>
                </button>
                
                <button 
                  @click="reportObservation"
                  class="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-white/5"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                  </svg>
                  <span>Signaler</span>
                </button>
                
                <template v-if="isOwner">
                  <button 
                    @click="editObservation"
                    class="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-white/5"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Modifier</span>
                  </button>
                  
                  <button 
                    @click="confirmDelete"
                    class="w-full px-4 py-3 flex items-center gap-3 text-red-400 hover:bg-white/5"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Supprimer</span>
                  </button>
                </template>
              </div>
              
              <button 
                @click="showMenu = false"
                class="w-full px-4 py-4 text-center text-white/60 border-t border-white/10"
              >
                Annuler
              </button>
            </div>
          </div>
        </Transition>
        
        <!-- Fullscreen Gallery Modal -->
        <Transition name="fade">
          <div 
            v-if="showFullscreenGallery && images.length"
            class="fixed inset-0 z-50 bg-black flex items-center justify-center"
            @click="closeFullscreen"
          >
            <!-- Close button -->
            <button 
              class="absolute top-4 right-4 z-10 p-2 text-white/80 hover:text-white"
              @click="closeFullscreen"
            >
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <!-- Image counter -->
            <div class="absolute top-4 left-4 text-white/60 text-sm">
              {{ fullscreenIndex + 1 }} / {{ images.length }}
            </div>
            
            <!-- Image -->
            <img 
              :src="images[fullscreenIndex]"
              :alt="`Image ${fullscreenIndex + 1}`"
              class="max-w-full max-h-full object-contain"
              @click.stop
            />
            
            <!-- Navigation arrows -->
            <button 
              v-if="fullscreenIndex > 0"
              class="absolute left-4 p-2 text-white/80 hover:text-white"
              @click.stop="fullscreenIndex--"
            >
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <button 
              v-if="fullscreenIndex < images.length - 1"
              class="absolute right-4 p-2 text-white/80 hover:text-white"
              @click.stop="fullscreenIndex++"
            >
              <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </Transition>
      </Teleport>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { LoadingSpinner, ErrorState, BaseButton, BaseBadge } from '@/components/atoms'
import { ObservationHeader, ObservationMeta, ImageGallery, CommentForm } from '@/components/molecules'
import { CommentList } from '@/components/organisms'
import { useObservationStore } from '@/stores/observation'
import { useCommentStore } from '@/stores/comment'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { storeToRefs } from 'pinia'

defineOptions({ name: 'ObservationDetailPage' })

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()
const observationStore = useObservationStore()
const commentStore = useCommentStore()

const { currentObservation: observation, loading, error } = storeToRefs(observationStore)
const { isAuthenticated, user: authUser } = storeToRefs(authStore)

// État local
const comments = ref([])
const submittingComment = ref(false)
const showMenu = ref(false)
const showFullscreenGallery = ref(false)
const fullscreenIndex = ref(0)

// Synchroniser les commentaires quand l'observation change
watch(observation, (newObs) => {
  if (newObs?.comments) {
    comments.value = newObs.comments
  }
}, { immediate: true })

const currentUserId = computed(() => authUser.value?._id || authUser.value?.id)

const isOwner = computed(() => {
  const obsUserId = observation.value?.userId?._id || observation.value?.user?._id || observation.value?.author?._id
  return currentUserId.value && obsUserId === currentUserId.value
})

const images = computed(() => {
  if (!observation.value) return []
  
  const imgs = []
  
  if (observation.value.imageUrl) {
    imgs.push(observation.value.imageUrl)
  }
  
  if (observation.value.images?.length) {
    imgs.push(...observation.value.images)
  }
  
  return imgs
})

const typeBadgeVariant = computed(() => {
  const type = observation.value?.type?.toLowerCase()
  if (type === 'ufo') return 'cyan'
  if (type === 'entity') return 'warning'
  return 'default'
})

// Forcer le scroll en haut immédiatement lors de la création du composant
// Ceci s'exécute de manière synchrone avant le rendu
if (!route.hash) {
  window.scrollTo({ top: 0, behavior: 'instant' })
}

onMounted(async () => {
  // Charger l'observation
  await fetchObservation()
  
  // Scroller vers le hash si présent (ex: #comments) avec animation douce
  if (route.hash) {
    // Attendre que le DOM soit complètement rendu et que le contenu soit chargé
    setTimeout(() => {
      const element = document.querySelector(route.hash)
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start',
          inline: 'nearest'
        })
      }
    }, 500)
  }
})

// Watch le route pour mettre à jour le scroll si le hash change
watch(() => route.hash, (newHash) => {
  if (newHash) {
    setTimeout(() => {
      const element = document.querySelector(newHash)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 300)
  } else {
    // Si le hash est supprimé, remonter en haut
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
})

const fetchObservation = async () => {
  try {
    await observationStore.fetchObservationById(route.params.id)
    comments.value = observation.value?.comments || []
  } catch {
    // Error handled by store
  }
}

const submitComment = async (text) => {
  submittingComment.value = true
  
  try {
    const newComment = await commentStore.addComment(route.params.id, text)
    comments.value.unshift(newComment)
    toast.success('Commentaire ajouté')
  } catch {
    toast.error('Erreur lors de l\'ajout du commentaire')
  } finally {
    submittingComment.value = false
  }
}

const deleteComment = async (comment) => {
  try {
    await commentStore.removeComment(route.params.id, comment._id || comment.id)
    comments.value = comments.value.filter(c => (c._id || c.id) !== (comment._id || comment.id))
    toast.success('Commentaire supprimé')
  } catch {
    toast.error('Erreur lors de la suppression')
  }
}

const goToProfile = (user) => {
  router.push(`/profile/${user._id || user.id}`)
}

const openFullscreen = (index) => {
  fullscreenIndex.value = index
  showFullscreenGallery.value = true
}

const closeFullscreen = () => {
  showFullscreenGallery.value = false
}

const shareObservation = async () => {
  showMenu.value = false
  
  try {
    if (navigator.share) {
      await navigator.share({
        title: observation.value?.title,
        text: observation.value?.description?.slice(0, 100),
        url: window.location.href
      })
    } else {
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Lien copié dans le presse-papier')
    }
  } catch {
    // User cancelled share
  }
}

const reportObservation = () => {
  showMenu.value = false
  toast.info('La fonctionnalité de signalement sera bientôt disponible')
}

const editObservation = () => {
  showMenu.value = false
  router.push(`/observation/${route.params.id}/edit`)
}

const confirmDelete = async () => {
  showMenu.value = false
  
  if (confirm('Êtes-vous sûr de vouloir supprimer cette observation ?')) {
    try {
      await observationStore.deleteObservation(route.params.id)
      toast.success('Observation supprimée')
      router.push('/feed')
    } catch {
      toast.error('Erreur lors de la suppression')
    }
  }
}

// Fonction pour retourner à la page précédente
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
