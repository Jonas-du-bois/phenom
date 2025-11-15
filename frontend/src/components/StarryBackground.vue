<template>
  <div class="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div
      v-for="star in stars"
      :key="star.id"
      class="absolute rounded-full bg-white animate-twinkle"
      :style="{
        left: `${star.x}%`,
        top: `${star.y}%`,
        width: `${star.size}px`,
        height: `${star.size}px`,
        opacity: star.opacity,
        animationDelay: `${star.delay}s`,
        animationDuration: '2s'
      }"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Générer 150 étoiles aléatoires
const stars = ref(
  Array.from({ length: 150 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 0.5,
    opacity: Math.random() * 0.5 + 0.3,
    delay: Math.random() * 3
  }))
)
</script>
