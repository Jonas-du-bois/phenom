<template>
  <div class="home-view min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-violet-mystique mb-4">
        🛸 Phenom
      </h1>
      <p class="text-xl text-gray-300">
        Application d'observation de phénomènes OVNI
      </p>
      <p class="text-sm text-gray-400 mt-4">
        Backend API: {{ apiUrl }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const apiUrl = computed(() => import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000')
</script>

<style scoped>
.home-view {
  background: linear-gradient(135deg, #111826 0%, #1E2640 100%);
}
</style>
