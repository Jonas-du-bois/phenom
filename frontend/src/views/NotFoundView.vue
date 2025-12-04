<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-violet-900 to-gray-900 flex items-center justify-center p-4">
    <div class="text-center">
      <!-- 404 Icon -->
      <div class="text-8xl mb-6">🛸</div>
      
      <!-- Title -->
      <h1 class="text-6xl font-bold text-white mb-4">404</h1>
      <h2 class="text-2xl font-semibold text-gray-300 mb-4">Page non trouvée</h2>
      
      <!-- Description -->
      <p class="text-gray-400 mb-8 max-w-md mx-auto">
        Le phénomène que vous cherchez semble avoir disparu dans une autre dimension...
      </p>
      
      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link
          to="/"
          class="px-6 py-3 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors"
        >
          🏠 Retour à l'accueil
        </router-link>
        <button
          @click="goBack"
          class="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
        >
          ← Page précédente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
}
</script>
