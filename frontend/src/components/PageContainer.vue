<template>
  <div
    :class="['page-container', { 'no-padding': noPadding } , customClass]"
    :style="containerStyle"
  >
    <slot />
  </div>
</template>

<script setup>
const props = defineProps({
  maxWidth: {
    type: [String, Number],
    default: 1100,
  },
  noPadding: Boolean,
  customClass: {
    type: [String, Array, Object],
    default: '',
  },
})

const containerStyle = computed(() => ({
  maxWidth: typeof props.maxWidth === 'number' ? props.maxWidth + 'px' : props.maxWidth,
}))
</script>

<style scoped>
.page-container {
  margin: 2rem auto;
  padding: var(--phenom-space-4);
  display: block;
  width: 100%;
  box-sizing: border-box;
  background: var(--phenom-surface-glass-base);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--phenom-border-medium);
  border-radius: var(--phenom-radius-2xl);
  box-shadow: var(--phenom-shadow-lg);
}

.page-container.no-padding {
  padding: 0;
}
</style>