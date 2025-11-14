<template>
  <div class="loading-container" :class="`loading-${variant}`">
    <div class="spinner" :class="`spinner-${size}`"></div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'white'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  text: String
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
}

.spinner {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Sizes */
.spinner-sm {
  width: 1.5rem;
  height: 1.5rem;
  border-width: 2px;
}

.spinner-md {
  width: 2.5rem;
  height: 2.5rem;
}

.spinner-lg {
  width: 4rem;
  height: 4rem;
  border-width: 4px;
}

.spinner-xl {
  width: 6rem;
  height: 6rem;
  border-width: 5px;
}

/* Variants */
.loading-primary .spinner {
  border-top-color: #667eea;
}

.loading-secondary .spinner {
  border-top-color: #6b7280;
}

.loading-white .spinner {
  border-color: rgba(255, 255, 255, 0.3);
  border-top-color: white;
}

.loading-text {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
}

.loading-white .loading-text {
  color: white;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
