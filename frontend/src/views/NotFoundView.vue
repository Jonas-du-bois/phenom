<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4">
    <div class="max-w-2xl w-full text-center">
      <!-- Animation UFO -->
      <div class="mb-8 relative">
        <div class="animate-bounce">
          <svg class="w-32 h-32 mx-auto text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        
        <!-- Effet de lumière -->
        <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
      </div>

      <!-- Code erreur -->
      <h1 class="text-9xl font-black text-indigo-600 mb-4 animate-pulse">
        404
      </h1>

      <!-- Message principal -->
      <h2 class="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
        🛸 Cette page s'est envolée !
      </h2>

      <p class="text-lg text-gray-600 mb-8 max-w-md mx-auto">
        On dirait que cette page a été abductée par des extraterrestres... 
        ou qu'elle n'a jamais existé !
      </p>

      <!-- Informations utiles -->
      <div class="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-indigo-100">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">
          Que faire maintenant ?
        </h3>
        <ul class="text-left text-gray-600 space-y-3">
          <li class="flex items-start">
            <svg class="w-6 h-6 text-indigo-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <span>Vérifiez l'URL dans la barre d'adresse</span>
          </li>
          <li class="flex items-start">
            <svg class="w-6 h-6 text-indigo-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <span>Retournez à l'accueil et explorez les observations</span>
          </li>
          <li class="flex items-start">
            <svg class="w-6 h-6 text-indigo-600 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
            <span>Utilisez la carte pour découvrir les phénomènes</span>
          </li>
        </ul>
      </div>

      <!-- Boutons d'action -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <button 
          @click="goHome"
          class="group relative px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-indigo-700 transition-all duration-300 transform hover:scale-105"
        >
          <span class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Retour à l'accueil
          </span>
        </button>

        <button 
          @click="goBack"
          class="px-8 py-4 bg-white text-indigo-600 rounded-xl font-semibold shadow-lg hover:shadow-xl border-2 border-indigo-600 hover:bg-indigo-50 transition-all duration-300 transform hover:scale-105"
        >
          <span class="flex items-center">
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Page précédente
          </span>
        </button>
      </div>

      <!-- Lien vers la carte -->
      <div class="mt-8">
        <router-link 
          to="/map" 
          class="inline-flex items-center text-indigo-600 hover:text-indigo-700 font-medium group"
        >
          <svg class="w-5 h-5 mr-2 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Ou explorez la carte des observations
          <svg class="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </router-link>
      </div>

      <!-- Code d'erreur technique (petit) -->
      <div class="mt-12 text-xs text-gray-400">
        Erreur 404 - Page non trouvée
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}

const goBack = () => {
  // Si l'historique existe, retourner en arrière
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    // Sinon, aller à l'accueil
    router.push('/')
  }
}
</script>

<style scoped>
/* Animation personnalisée pour l'UFO */
@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-40px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
</style>
