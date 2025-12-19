<script setup>
/**
 * EmptyState - État vide avec message
 * Design System: Phenom Search
 */

defineOptions({ name: "EmptyState" });

const props = defineProps({
  title: {
    type: String,
    default: "Aucun résultat",
  },
  message: {
    type: String,
    default: "",
  },
  icon: {
    type: String,
    default: "search",
    validator: (v) =>
      ["search", "observations", "comments", "alerts", "map"].includes(v),
  },
  showAction: {
    type: Boolean,
    default: false,
  },
  actionLabel: {
    type: String,
    default: "Réessayer",
  },
});

const emit = defineEmits(["action"]);
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <!-- Icon -->
    <div class="w-16 h-16 mb-6 text-white/20">
      <!-- Search Icon -->
      <svg
        v-if="icon === 'search'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <circle cx="11" cy="11" r="8" />
        <path d="M21 21l-4.35-4.35" />
      </svg>

      <!-- Observations Icon -->
      <svg
        v-else-if="icon === 'observations'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <circle cx="12" cy="12" r="10" />
        <circle cx="12" cy="12" r="4" />
        <line x1="12" y1="2" x2="12" y2="4" />
        <line x1="12" y1="20" x2="12" y2="22" />
        <line x1="2" y1="12" x2="4" y2="12" />
        <line x1="20" y1="12" x2="22" y2="12" />
      </svg>

      <!-- Comments Icon -->
      <svg
        v-else-if="icon === 'comments'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
      </svg>

      <!-- Alerts Icon -->
      <svg
        v-else-if="icon === 'alerts'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>

      <!-- Map Icon -->
      <svg
        v-else-if="icon === 'map'"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    </div>

    <!-- Title -->
    <h3 class="text-lg font-medium text-white/70 mb-2">
      {{ title }}
    </h3>

    <!-- Message -->
    <p v-if="message" class="text-sm text-white/40 max-w-xs">
      {{ message }}
    </p>

    <!-- Action Button -->
    <button
      v-if="showAction"
      class="mt-6 px-4 py-2 border border-white/20 text-white/60 text-sm uppercase tracking-wider hover:text-[#00F0FF] hover:border-[#00F0FF] transition-colors"
      @click="emit('action')"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
