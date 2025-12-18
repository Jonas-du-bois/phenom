<template>
  <header 
    class="sticky top-0 z-40 bg-[#080A0E]/95 backdrop-blur-xl border-b border-white/10"
    :style="{ paddingTop: 'env(safe-area-inset-top, 0px)' }"
  >
    <div class="flex items-center justify-between h-14 px-4">
      <!-- Left section -->
      <div class="flex items-center gap-3 min-w-[60px]">
        <button 
          v-if="showBack"
          type="button"
          aria-label="Retour"
          @click="handleBack"
          class="touch-target flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <button 
          v-if="showSearch"
          type="button"
          aria-label="Rechercher"
          @click="$emit('search')"
          class="touch-target flex items-center justify-center w-10 h-10 -ml-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 active:bg-white/20 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
        
        <slot name="left" />
      </div>
      
      <!-- Center / Title -->
      <div class="flex-1 flex items-center justify-center">
        <template v-if="$slots.title">
          <slot name="title" />
        </template>
        <template v-else-if="title">
          <h1 class="text-lg font-semibold text-white truncate">{{ title }}</h1>
        </template>
        <template v-else>
          <!-- Phenom logo -->
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 174 174" fill="none" class="flex-shrink-0">
              <path d="M115.576 86.6817H173.363" stroke="#00F0FF" stroke-width="1.4447"/>
              <path d="M111.704 101.129L161.749 130.022" stroke="#00F0FF" stroke-width="1.4447"/>
              <path d="M101.128 111.705L130.021 161.75" stroke="#00F0FF" stroke-width="1.4447"/>
              <path d="M86.6816 115.576V173.362" stroke="#00F0FF" stroke-width="1.4447"/>
              <path d="M72.2343 111.705L43.3408 161.75" stroke="#00F0FF" stroke-width="1.4447"/>
              <path d="M61.6582 101.129L11.6133 130.022" stroke="#00F0FF" stroke-width="1.4447"/>
              <path d="M57.7869 86.6817H0" stroke="#00F0FF" stroke-width="1.4447"/>
              <path d="M61.6582 72.2343L11.6133 43.3408" stroke="#00F0FF" stroke-width="1.4447"/>
              <path d="M72.2343 61.6582L43.3408 11.6132" stroke="#00F0FF" stroke-width="1.4447"/>
              <path d="M86.6816 57.7869L86.6816 0" stroke="#00F0FF" stroke-width="1.4447"/>
              <path d="M101.128 61.6583L130.021 11.6133" stroke="#00F0FF" stroke-width="1.4447"/>
              <path d="M111.704 72.2344L161.749 43.3409" stroke="#00F0FF" stroke-width="1.4447"/>
            </svg>
            <span class="text-lg font-bold tracking-tight text-white">Phenom sight</span>
          </div>
        </template>
      </div>
      
      <!-- Right section -->
      <div class="flex items-center gap-2 min-w-[60px] justify-end">
        <slot name="right" />
        
        <button 
          v-if="showMenu"
          @click="$emit('menu')"
          class="touch-target flex items-center justify-center w-10 h-10 -mr-2 rounded-full text-white/70 hover:text-white active:bg-white/10 transition-colors"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
    
    <!-- Optional subtitle/tabs slot -->
    <slot name="below" />
  </header>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineOptions({ name: 'PageHeader' })

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  showBack: {
    type: Boolean,
    default: false
  },
  showMenu: {
    type: Boolean,
    default: false
  },
  showSearch: {
    type: Boolean,
    default: false
  },
  backTo: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['back', 'menu', 'search'])
const router = useRouter()

const handleBack = () => {
  // Émettre l'événement pour permettre au parent de gérer la navigation si besoin
  emit('back')
  
  // Si backTo est fourni, naviguer vers cette route
  if (props.backTo) {
    router.push(props.backTo)
    return
  }
  
  // Sinon, revenir à la page précédente dans l'historique
  // Si pas d'historique, revenir à l'accueil
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>
