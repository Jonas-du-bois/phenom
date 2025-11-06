<template>
  <div class="not-found-view">
    <div class="not-found-container">
      <div class="ufo-animation">
        <div class="ufo">🛸</div>
        <div class="beam"></div>
      </div>
      
      <h1 class="error-code">404</h1>
      <h2 class="error-title">Page non trouvée</h2>
      <p class="error-message">
        Désolé, la page que vous recherchez semble avoir été enlevée par des extraterrestres... 👽
      </p>
      
      <div class="actions">
        <button @click="goHome" class="btn-primary">
          🏠 Retour à l'accueil
        </button>
        <button @click="goBack" class="btn-secondary">
          ← Retour en arrière
        </button>
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
  router.back()
}
</script>

<style scoped>
.not-found-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.not-found-container {
  text-align: center;
  color: white;
  max-width: 600px;
}

.ufo-animation {
  position: relative;
  height: 150px;
  margin-bottom: 2rem;
}

.ufo {
  font-size: 4rem;
  animation: float 3s ease-in-out infinite;
  display: inline-block;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(-5deg);
  }
  50% {
    transform: translateY(-20px) rotate(5deg);
  }
}

.beam {
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 50px solid transparent;
  border-right: 50px solid transparent;
  border-top: 80px solid rgba(255, 255, 255, 0.2);
  animation: beam-pulse 2s ease-in-out infinite;
}

@keyframes beam-pulse {
  0%, 100% {
    opacity: 0.3;
    transform: translateX(-50%) scaleY(1);
  }
  50% {
    opacity: 0.6;
    transform: translateX(-50%) scaleY(1.2);
  }
}

.error-code {
  font-size: 8rem;
  font-weight: bold;
  margin: 0;
  text-shadow: 4px 4px 8px rgba(0, 0, 0, 0.3);
  line-height: 1;
}

.error-title {
  font-size: 2rem;
  font-weight: 600;
  margin: 1rem 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.error-message {
  font-size: 1.125rem;
  margin: 1.5rem 0 2rem;
  opacity: 0.9;
  line-height: 1.6;
}

.actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
}

.btn-primary {
  background: white;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
}

@media (max-width: 640px) {
  .error-code {
    font-size: 5rem;
  }
  
  .error-title {
    font-size: 1.5rem;
  }
  
  .error-message {
    font-size: 1rem;
  }
  
  .actions {
    flex-direction: column;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
