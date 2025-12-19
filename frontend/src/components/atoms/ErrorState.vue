<script setup>
/**
 * ErrorState - État d'erreur avec message
 * Design System: Phenom Search
 */

defineOptions({ name: "ErrorState" });

const props = defineProps({
  title: {
    type: String,
    default: "Une erreur est survenue",
  },
  message: {
    type: String,
    default: "Veuillez réessayer plus tard",
  },
  showRetry: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["retry"]);
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <!-- Icon -->
    <div class="w-20 h-20 mb-6 text-red-500/80">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>

    <!-- Title -->
    <h3 class="text-lg font-medium text-white/70 mb-2">
      {{ title }}
    </h3>

    <!-- Message -->
    <p class="text-sm text-white/40 max-w-xs mb-6">
      {{ message }}
    </p>

    <!-- Retry Button -->
    <button
      v-if="showRetry"
      class="px-6 py-3 bg-[#00F0FF] text-black text-sm font-medium uppercase tracking-wider hover:bg-[#00D0DF] transition-colors"
      @click="emit('retry')"
    >
      Réessayer
    </button>
  </div>
</template>
