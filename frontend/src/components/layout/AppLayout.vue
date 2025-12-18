<template>
  <div class="app-layout min-h-screen bg-[#000000] flex flex-col">
    <!-- Page Header slot -->
    <slot name="header" />
    
    <!-- Main content -->
    <main 
      class="flex-1 overflow-y-auto overscroll-contain"
      :class="{ 'pb-20': showTabBar }"
      :style="{ paddingBottom: showTabBar ? 'calc(4rem + env(safe-area-inset-bottom, 0px))' : undefined }"
    >
      <slot />
    </main>
    
    <!-- Bottom Tab Bar -->
    <BottomTabBar 
      v-if="showTabBar"
      :alert-count="alertCount"
    />
    
    <!-- Toast notifications -->
    <Teleport to="body">
      <TransitionGroup 
        name="toast" 
        tag="div" 
        class="fixed top-4 left-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
        :style="{ top: 'calc(1rem + env(safe-area-inset-top, 0px))' }"
      >
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item p-4 rounded-xl shadow-xl pointer-events-auto"
          :class="toastClasses[toast.type]"
        >
          <div class="flex items-start gap-3">
            <!-- Icon -->
            <div class="shrink-0 mt-0.5">
              <svg v-if="toast.type === 'success'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              <svg v-else-if="toast.type === 'error'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <svg v-else-if="toast.type === 'warning'" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <!-- Content -->
            <div class="flex-1 min-w-0">
              <p v-if="toast.title" class="font-medium">{{ toast.title }}</p>
              <p class="text-sm opacity-90">{{ toast.message }}</p>
            </div>
            
            <!-- Close button -->
            <button 
              @click="removeToast(toast.id)"
              class="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </Teleport>
    
    <!-- Global loading overlay -->
    <Teleport to="body">
      <Transition name="fade">
        <div 
          v-if="globalLoading"
          class="fixed inset-0 z-[9998] bg-black/80 backdrop-blur-sm flex items-center justify-center"
        >
          <div class="text-center">
            <LoadingSpinner size="lg" />
            <p v-if="loadingMessage" class="mt-4 text-white/60">{{ loadingMessage }}</p>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted } from 'vue'
import { BottomTabBar } from '@/components/organisms'
import { LoadingSpinner } from '@/components/atoms'

defineOptions({ name: 'AppLayout' })

const props = defineProps({
  showTabBar: {
    type: Boolean,
    default: true
  },
  alertCount: {
    type: Number,
    default: 0
  }
})

// Toast system
const toasts = ref([])
let toastId = 0

const toastClasses = {
  success: 'bg-green-500/90 text-white',
  error: 'bg-red-500/90 text-white',
  warning: 'bg-yellow-500/90 text-black',
  info: 'bg-[#00F0FF]/90 text-black'
}

const showToast = ({ type = 'info', title = '', message, duration = 4000 }) => {
  const id = ++toastId
  toasts.value.push({ id, type, title, message })
  
  if (duration > 0) {
    setTimeout(() => removeToast(id), duration)
  }
  
  return id
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index !== -1) {
    toasts.value.splice(index, 1)
  }
}

// Global loading
const globalLoading = ref(false)
const loadingMessage = ref('')

const setGlobalLoading = (loading, message = '') => {
  globalLoading.value = loading
  loadingMessage.value = message
}

// Provide to children
provide('toast', { show: showToast, remove: removeToast })
provide('loading', { set: setGlobalLoading })

// Handle safe area on iOS
onMounted(() => {
  document.documentElement.style.setProperty('--sat', 'env(safe-area-inset-top)')
  document.documentElement.style.setProperty('--sab', 'env(safe-area-inset-bottom)')
  document.documentElement.style.setProperty('--sal', 'env(safe-area-inset-left)')
  document.documentElement.style.setProperty('--sar', 'env(safe-area-inset-right)')
})
</script>

<style scoped>
/* Toast animations */
.toast-enter-active {
  transition: all 0.3s ease;
}

.toast-leave-active {
  transition: all 0.2s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}

/* Fade */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
