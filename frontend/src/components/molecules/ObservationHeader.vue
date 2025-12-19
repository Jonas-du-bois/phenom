<script setup>
/**
 * ObservationHeader - Header d'une observation détaillée
 * Design System: Phenom Search
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
    class="sticky top-0 z-20 flex items-center justify-between px-4 mt-2 py-3 bg-[#000000] border-b border-white/10 safe-area-top"
  >
    <!-- Back Button -->
    <button
      v-if="showBack"
      class="p-2 -ml-2 text-white/70 hover:text-white transition-colors touch-target"
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
        <path d="M19 12H5M12 19l-7-7 7-7" />
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
      class="p-2 -mr-2 text-white/70 hover:text-white transition-colors touch-target"
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
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="19" r="1" />
      </svg>
    </button>
  </header>
</template>
