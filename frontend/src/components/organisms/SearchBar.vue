<!-- ========================================================================
     SEARCH BAR - Full-featured search input with suggestions
     
     Features:
     - Real-time search input with debouncing
     - Suggestions dropdown (appears after 2+ characters)
     - Recent searches history display
     - Toggle search on/off via icon click
     - Keyboard support (Enter to submit, Escape to clear)
     - v-model support for two-way binding
     
     Props:
     - modelValue: Current search query (v-model)
     - placeholder: Input placeholder text
     - suggestions: Array of search suggestions
     - recentSearches: Array of recent search terms
     - debounce: Debounce delay in milliseconds
     
     Events:
     - update:modelValue: Two-way binding update
     - search: Triggered on search submit
     - clear: Triggered when search cleared
     - clear-recent: Triggered to clear recent searches
     ======================================================================== -->
<template>
  <div class="relative">
    <!-- Search input container -->
    <div class="relative">
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        :placeholder="placeholder"
        class="w-full h-12 pl-12 pr-12 bg-[#12151C] border border-white/10 rounded-xl text-white placeholder-white/40 focus:border-[#00F0FF] focus:outline-none focus:ring-1 focus:ring-[#00F0FF]/30 transition-colors"
        @input="handleInput"
        @focus="isFocused = true"
        @blur="handleBlur"
        @keydown.enter="handleSubmit"
        @keydown.escape="handleClear"
      />

      <!-- Search icon (now clickable to toggle search) -->
      <button
        type="button"
        @click="toggleSearch"
        class="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-white/40"
        aria-label="Toggle search"
      >
        <svg
          class="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </button>

      <!-- clear button removed: use search icon to toggle/close -->
    </div>

    <!-- Suggestions dropdown -->
    <Transition name="fade">
      <div
        v-if="showSuggestions && suggestions.length > 0"
        class="absolute top-full left-0 right-0 mt-2 bg-[#12151C] border border-white/10 rounded-xl overflow-hidden shadow-xl z-10"
      >
        <button
          v-for="(suggestion, index) in suggestions"
          :key="index"
          class="w-full px-4 py-3 text-left text-white hover:bg-white/5 active:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-b-0"
          @mousedown.prevent="selectSuggestion(suggestion)"
        >
          <svg
            class="w-4 h-4 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <span>{{ suggestion }}</span>
        </button>
      </div>
    </Transition>

    <!-- Recent searches -->
    <Transition name="fade">
      <div
        v-if="showRecent && !query && recentSearches.length > 0"
        class="absolute top-full left-0 right-0 mt-2 bg-[#12151C] border border-white/10 rounded-xl overflow-hidden shadow-xl z-10"
      >
        <div
          class="flex items-center justify-between px-4 py-2 border-b border-white/10"
        >
          <span class="text-xs text-white/40 uppercase tracking-wider"
            >Récentes</span
          >
          <button @click="clearRecent" class="text-xs text-[#00F0FF]">
            Effacer
          </button>
        </div>
        <button
          v-for="(search, index) in recentSearches"
          :key="index"
          class="w-full px-4 py-3 text-left text-white hover:bg-white/5 active:bg-white/10 transition-colors flex items-center gap-3 border-b border-white/5 last:border-b-0"
          @mousedown.prevent="selectSuggestion(search)"
        >
          <svg
            class="w-4 h-4 text-white/40"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{{ search }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

defineOptions({ name: "SearchBar" });

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "Rechercher...",
  },
  suggestions: {
    type: Array,
    default: () => [],
  },
  recentSearches: {
    type: Array,
    default: () => [],
  },
  debounce: {
    type: Number,
    default: 300,
  },
});

const emit = defineEmits([
  "update:modelValue",
  "search",
  "clear",
  "clear-recent",
]);

const inputRef = ref(null);
const query = ref(props.modelValue);
const isFocused = ref(false);
let debounceTimer = null;

const showSuggestions = computed(
  () => isFocused.value && query.value.length >= 2
);
const showRecent = computed(() => isFocused.value && !query.value);

watch(
  () => props.modelValue,
  (val) => {
    query.value = val;
  }
);

const handleInput = () => {
  emit("update:modelValue", query.value);
  // Ne pas lancer la recherche automatiquement, uniquement sur validation
};

const handleSubmit = () => {
  if (query.value) {
    emit("search", query.value);
    inputRef.value?.blur();
  }
};

const handleClear = () => {
  query.value = "";
  emit("update:modelValue", "");
  emit("clear");
};

const toggleSearch = () => {
  if (isFocused.value) {
    // close search: clear query and blur
    handleClear();
    inputRef.value?.blur();
    isFocused.value = false;
    emit("close");
  } else {
    inputRef.value?.focus();
    isFocused.value = true;
  }
};

const handleBlur = () => {
  setTimeout(() => {
    isFocused.value = false;
  }, 150);
};

const selectSuggestion = (suggestion) => {
  query.value = suggestion;
  emit("update:modelValue", suggestion);
  emit("search", suggestion);
  isFocused.value = false;
};

const clearRecent = () => {
  emit("clear-recent");
};

// Expose focus method
defineExpose({
  focus: () => inputRef.value?.focus(),
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
