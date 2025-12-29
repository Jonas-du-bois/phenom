<script setup>
/**
 * ObservationHeader - Header d'une observation détaillée
 * Design System: Phenom Search - Liquid Glass Style
 */
import { computed } from "vue";
import BaseAvatar from "../atoms/BaseAvatar.vue";

defineOptions({ name: "ObservationHeader" });

const props = defineProps({
  // Peut recevoir soit un objet user, soit une observation complète
  user: {
    type: Object,
    default: null,
  },
  observation: {
    type: Object,
    default: null,
  },
  date: {
    type: String,
    default: "",
  },
  verified: {
    type: Boolean,
    default: false,
  },
  showBack: {
    type: Boolean,
    default: true,
  },
  showMenu: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["back", "menu"]);

// Formater la date
const formattedDate = computed(() => {
  const dateValue =
    props.date || props.observation?.date || props.observation?.createdAt;
  if (!dateValue) return "";
  const date = new Date(dateValue);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
});

// Récupérer l'utilisateur depuis user prop ou observation
const userData = computed(() => {
  if (props.user) return props.user;
  return props.observation?.userId || props.observation?.user || null;
});

const userName = computed(() => {
  return userData.value?.name || "Anonyme";
});

const userAvatar = computed(() => {
  return userData.value?.avatar || "";
});
</script>

<template>
  <header
    class="fixed top-4 left-0 right-0 z-40 mx-5"
    :style="{ paddingTop: 'env(safe-area-inset-top, 0px)' }"
  >
    <div class="liquid-glass-header rounded-2xl">
      <div class="flex items-center justify-between px-4 py-2">
        <!-- Back Button -->
        <button
          v-if="showBack"
          class="touch-target p-2 -ml-2 text-white/70 hover:text-white transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 active:bg-white/20"
          aria-label="Retour"
          @click="emit('back')"
        >
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <!-- User Info -->
        <div class="flex items-center gap-3 flex-1 px-4">
          <BaseAvatar :src="userAvatar" :name="userName" size="sm" />
          <div>
            <p class="text-sm font-medium text-white">{{ userName }}</p>
            <p class="text-xs text-white/50">{{ formattedDate }}</p>
          </div>
        </div>

        <!-- Menu Button -->
        <button
          v-if="showMenu"
          class="touch-target p-2 -mr-2 text-white/70 hover:text-white transition-colors flex items-center justify-center w-10 h-10 rounded-full hover:bg-white/10 active:bg-white/20"
          aria-label="Menu"
          @click="emit('menu')"
        >
          <svg
            class="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="1" fill="currentColor" />
            <circle cx="12" cy="5" r="1" fill="currentColor" />
            <circle cx="12" cy="19" r="1" fill="currentColor" />
          </svg>
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Liquid glass header - exact same style as navbar */
.liquid-glass-header {
  position: relative;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.03),
    rgba(255, 255, 255, 0.01)
  );
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 10px 30px rgba(2, 6, 23, 0.6);
  overflow: hidden;
}

/* Overlay gradient for depth - exact same as navbar */
.liquid-glass-header::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.06),
    rgba(255, 255, 255, 0)
  );
  mix-blend-mode: overlay;
}

/* Button hover effects with glass style */
.touch-target {
  position: relative;
  z-index: 1;
}

.touch-target:hover {
  background: rgba(255, 255, 255, 0.1);
}

.touch-target:active {
  background: rgba(255, 255, 255, 0.2);
}
</style>