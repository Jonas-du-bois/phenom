<template>
  <div class="not-found-page min-h-screen bg-[#000000] flex items-center justify-center p-4">
    <div class="text-center">
      <!-- 404 illustration -->
      <div class="mb-8">
        <div class="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-[#00F0FF]/20 to-[#0066CC]/20 flex items-center justify-center">
          <svg class="w-16 h-16 text-[#00F0FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      <h1 class="text-6xl font-bold text-white mb-2">404</h1>
      <h2 class="text-xl font-semibold text-white mb-2">Page introuvable</h2>
      <p class="text-white/60 mb-8">
        Cette page semble avoir disparu dans une autre dimension.
      </p>
      
      <BaseButton 
        variant="primary"
        @click="$router.push('/feed')"
      >
        Retour à l'accueil
      </BaseButton>
    </div>
  </div>
</template>

<script setup>
import { BaseButton } from '@/components/atoms'

defineOptions({ name: 'NotFoundPage' })
</script>
