<template>
  <div id="app" class="min-h-screen relative overflow-x-hidden" style="background-color: #1E2640;">
    <StarryBackground />
    <router-view />
  </div>
</template>

<script setup>
import StarryBackground from './components/StarryBackground.vue'
</script>

<style>
#app {
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue",
    Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
