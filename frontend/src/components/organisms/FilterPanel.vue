<template>
  <!-- ========================================================================
       FILTER PANEL - Bottom sheet with observation filters
       Uses Teleport to render at body level for proper z-index stacking
       ======================================================================== -->
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="isOpen" class="fixed inset-0 z-50">
        <!-- ================================================================
             BACKDROP - Blurred overlay that closes panel on click
             ================================================================ -->
        <div
          class="absolute inset-0 bg-[rgba(255,255,255,0.02)] backdrop-blur-2xl"
          @click="$emit('close')"
        />

        <!-- ================================================================
             MAIN PANEL - Liquid glass bottom sheet with swipe-to-close
             ================================================================ -->
        <div
          ref="panelRef"
          class="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-2xl overflow-hidden flex flex-col liquid-panel"
          :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <!-- Drag handle indicator for swipe gesture -->
          <div class="flex justify-center py-3">
            <div class="w-12 h-1.5 rounded-full drag-handle" />
          </div>

          <!-- Header with title and reset button -->
          <div class="flex items-center justify-between px-4 pb-4 header-row">
            <h2 class="text-lg font-semibold text-white/90">Filtres</h2>
            <button
              @click="handleReset"
              class="text-sm text-[#00F0FF] font-medium"
            >
              Réinitialiser
            </button>
          </div>

          <!-- ================================================================
               SCROLLABLE FILTER CONTENT
               Contains all filter sections with vertical scrolling
               ================================================================ -->
          <div class="flex-1 overflow-y-auto overscroll-contain p-4 space-y-6">
            <!-- ==============================================================
                 UFO SHAPES FILTER - Multi-select chips
                 ============================================================== -->
            <div class="space-y-3">
              <label
                class="text-sm font-medium text-white/60 uppercase tracking-wider"
              >
                Formes observées
              </label>
              <div class="flex flex-wrap gap-2">
                <FilterChip
                  v-for="shape in ufoShapeOptions"
                  :key="shape.value"
                  :label="shape.label"
                  :active="filters.ufoShapes.includes(shape.value)"
                  @click="toggleUfoShape(shape.value)"
                />
              </div>
            </div>

            <!-- ==============================================================
                 PHENOMENA FILTER - Multi-select chips (lights, sounds, etc.)
                 ============================================================== -->
            <div class="space-y-3">
              <label
                class="text-sm font-medium text-white/60 uppercase tracking-wider"
              >
                Phénomènes
              </label>
              <div class="flex flex-wrap gap-2">
                <FilterChip
                  v-for="phenomenon in phenomenaOptions"
                  :key="phenomenon.value"
                  :label="phenomenon.label"
                  :active="filters.phenomena.includes(phenomenon.value)"
                  @click="togglePhenomenon(phenomenon.value)"
                />
              </div>
            </div>

            <!-- ==============================================================
                 OBSERVER TYPES FILTER - Multi-select (pilot, military, etc.)
                 ============================================================== -->
            <div class="space-y-3">
              <label
                class="text-sm font-medium text-white/60 uppercase tracking-wider"
              >
                Types d'observateurs
              </label>
              <div class="flex flex-wrap gap-2">
                <FilterChip
                  v-for="observerType in observerTypeOptions"
                  :key="observerType.value"
                  :label="observerType.label"
                  :active="filters.observerTypes.includes(observerType.value)"
                  @click="toggleObserverType(observerType.value)"
                />
              </div>
            </div>

            <!-- ==============================================================
                 COUNTRY FILTER - Single-select (radio behavior)
                 Only shows first 20 countries, scrollable
                 ============================================================== -->
            <div v-if="countryOptions.length > 0" class="space-y-3">
              <label
                class="text-sm font-medium text-white/60 uppercase tracking-wider"
              >
                Pays (un seul à la fois)
              </label>
              <div class="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                <FilterChip
                  v-for="country in countryOptions.slice(0, 20)"
                  :key="country.value"
                  :label="country.label"
                  :active="filters.countries.includes(country.value)"
                  @click="selectCountry(country.value)"
                />
              </div>
            </div>

            <!-- ==============================================================
                 DATE RANGE FILTER - From/To date pickers
                 ============================================================== -->
            <div class="space-y-3">
              <label
                class="text-sm font-medium text-white/60 uppercase tracking-wider"
              >
                Période
              </label>
              <div class="grid grid-cols-2 gap-3">
                <DatePicker v-model="filters.dateFrom" label="Du" />
                <DatePicker v-model="filters.dateTo" label="Au" />
              </div>
            </div>

            <!-- ==============================================================
                 CREDIBILITY SLIDER - Minimum credibility score (0-15)
                 ============================================================== -->
            <div class="space-y-3">
              <label
                class="text-sm font-medium text-white/60 uppercase tracking-wider"
              >
                Crédibilité minimum
              </label>
              <RangeInput
                v-model="filters.minCredibility"
                :min="0"
                :max="15"
                :step="1"
              />
              <div class="flex justify-between text-xs text-white/40">
                <span>0</span>
                <span>15</span>
              </div>
            </div>

            <!-- ==============================================================
                 STRANGENESS SLIDER - Minimum strangeness score (0-10)
                 ============================================================== -->
            <div class="space-y-3">
              <label
                class="text-sm font-medium text-white/60 uppercase tracking-wider"
              >
                Étrangeté minimum
              </label>
              <RangeInput
                v-model="filters.minStrangeness"
                :min="0"
                :max="10"
                :step="1"
              />
              <div class="flex justify-between text-xs text-white/40">
                <span>0</span>
                <span>10</span>
              </div>
            </div>

            <!-- ==============================================================
                 LOCATION RADIUS SLIDER - Search radius in kilometers (1-100)
                 ============================================================== -->
            <div class="space-y-3">
              <label
                class="text-sm font-medium text-white/60 uppercase tracking-wider"
              >
                Rayon de recherche
              </label>
              <div class="flex items-center gap-3">
                <RangeInput
                  v-model="filters.radius"
                  :min="1"
                  :max="100"
                  :step="1"
                  class="flex-1"
                />
                <span class="text-sm text-white/60 min-w-[50px]"
                  >{{ filters.radius }} km</span
                >
              </div>
            </div>

            <!-- ==============================================================
                 BOOLEAN TOGGLES - Media and verification filters
                 ============================================================== -->
            <!-- Filter: Only show observations with images/videos -->
            <div class="flex items-center justify-between py-2">
              <span class="text-white">Avec média uniquement</span>
              <BaseToggle v-model="filters.hasMedia" />
            </div>

            <!-- Filter: Only show verified observations -->
            <div class="flex items-center justify-between py-2">
              <span class="text-white">Vérifiées uniquement</span>
              <BaseToggle v-model="filters.verifiedOnly" />
            </div>
          </div>

          <!-- ================================================================
               APPLY BUTTON - Only shown when instant mode is disabled
               In instant mode, filters are applied immediately on change
               ================================================================ -->
          <div v-if="!props.instant" class="p-4 border-t border-transparent">
            <BaseButton
              variant="primary"
              class="w-full liquid-apply prominent"
              @click="handleApply"
            >
              Appliquer les filtres
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
/**
 * FilterPanel - Bottom sheet component for filtering observations
 *
 * Features:
 * - Swipe-to-close gesture support
 * - Multiple filter types: chips, sliders, date pickers, toggles
 * - Instant apply mode (filters apply immediately) or manual apply
 * - Syncs with filter store for available options
 * - Liquid glass design with backdrop blur
 */

// ============================================================================
// IMPORTS
// ============================================================================
import { ref, reactive, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { FilterChip } from "@/components/molecules";
import {
  DatePicker,
  RangeInput,
  BaseToggle,
  BaseButton,
} from "@/components/atoms";
import { useFilterStore } from "@/stores/filter";

// ============================================================================
// COMPONENT OPTIONS
// ============================================================================
defineOptions({ name: "FilterPanel" });

// ============================================================================
// PROPS
// ============================================================================
const props = defineProps({
  /** Controls panel visibility */
  isOpen: {
    type: Boolean,
    default: false,
  },
  /** When true, filters apply immediately on change (hides Apply button) */
  instant: {
    type: Boolean,
    default: true,
  },
  /** Initial filter values to populate the form */
  initialFilters: {
    type: Object,
    default: () => ({}),
  },
});

// ============================================================================
// EMITS
// ============================================================================
const emit = defineEmits(["close", "apply", "reset"]);

// ============================================================================
// STORE
// ============================================================================
const filterStore = useFilterStore();

// Extract reactive references from filter store
const {
  ufoShapeOptions, // Available UFO shape options from API
  phenomenaOptions, // Available phenomena options from API
  observerTypeOptions, // Available observer type options from API
  countryOptions, // Available country options from API
  loading, // POTENTIALLY UNUSED: Loading state is extracted but not used in template
} = storeToRefs(filterStore);

// Load filter options from API on component mount
onMounted(async () => {
  if (!filterStore.isInitialized) {
    await filterStore.initialize();
  }
});

// ============================================================================
// LOCAL STATE
// ============================================================================

/** Default filter values used for initialization and reset */
const defaultFilters = {
  ufoShapes: [], // Selected UFO shape codes
  phenomena: [], // Selected phenomenon codes
  observerTypes: [], // Selected observer type codes
  countries: [], // Selected country codes (max 1)
  dateFrom: "", // Start date for date range filter
  dateTo: "", // End date for date range filter
  minCredibility: 0, // Minimum credibility score (0-15)
  minStrangeness: 0, // Minimum strangeness score (0-10)
  radius: 50, // Search radius in kilometers
  hasMedia: false, // Only show observations with media
  verifiedOnly: false, // Only show verified observations
};

/** Reactive filter state object */
const filters = reactive({ ...defaultFilters });

/** Reference to the panel DOM element for swipe animations */
const panelRef = ref(null);

// Touch tracking variables for swipe-to-close gesture
let touchStartY = 0;
let touchDeltaY = 0;

// ============================================================================
// WATCHERS
// ============================================================================

/**
 * Sync local filters with initialFilters prop
 * Runs immediately and whenever initialFilters changes
 */
watch(
  () => props.initialFilters,
  (newFilters) => {
    Object.assign(filters, { ...defaultFilters, ...newFilters });
  },
  { immediate: true, deep: true }
);

// ============================================================================
// FILTER TOGGLE METHODS
// ============================================================================

/**
 * Toggle a UFO shape in the selection (multi-select)
 * @param {string} code - The shape code to toggle
 */
const toggleUfoShape = (code) => {
  const index = filters.ufoShapes.indexOf(code);
  if (index === -1) {
    filters.ufoShapes.push(code);
  } else {
    filters.ufoShapes.splice(index, 1);
  }
};

/**
 * Toggle a phenomenon in the selection (multi-select)
 * @param {string} code - The phenomenon code to toggle
 */
const togglePhenomenon = (code) => {
  const index = filters.phenomena.indexOf(code);
  if (index === -1) {
    filters.phenomena.push(code);
  } else {
    filters.phenomena.splice(index, 1);
  }
};

/**
 * Toggle an observer type in the selection (multi-select)
 * @param {string} code - The observer type code to toggle
 */
const toggleObserverType = (code) => {
  const index = filters.observerTypes.indexOf(code);
  if (index === -1) {
    filters.observerTypes.push(code);
  } else {
    filters.observerTypes.splice(index, 1);
  }
};

/**
 * Select a country (single-select / radio behavior)
 * Clicking the same country deselects it
 * @param {string} code - The country code to select
 */
const selectCountry = (code) => {
  if (filters.countries.includes(code)) {
    filters.countries = [];
  } else {
    filters.countries = [code];
  }
};

// ============================================================================
// ACTION HANDLERS
// ============================================================================

/**
 * Reset all filters to default values
 * Emits reset event and applies if in instant mode
 */
const handleReset = () => {
  Object.assign(filters, defaultFilters);
  emit("reset");
  if (props.instant) {
    emit("apply", { ...filters });
  }
};

/**
 * Apply current filters and close the panel
 * Only used when instant mode is disabled
 */
const handleApply = () => {
  emit("apply", { ...filters });
  emit("close");
};

// ============================================================================
// INSTANT APPLY MODE
// Automatically emit apply event when filters change
// ============================================================================
import { nextTick } from "vue";

/** Flag to prevent apply on initial mount */
let _initialized = false;

onMounted(async () => {
  await nextTick();
  _initialized = true;
});

/**
 * Watch for filter changes and emit apply in instant mode
 * Skips emission if not initialized, not in instant mode, or panel is closed
 */
watch(
  () => filters,
  (newVal) => {
    if (!props.instant) return; // Only in instant mode
    if (!_initialized) return; // Skip initial mount
    if (!props.isOpen) return; // Skip if panel is closed
    emit("apply", { ...newVal });
  },
  { deep: true }
);

// ============================================================================
// SWIPE-TO-CLOSE GESTURE HANDLING
// ============================================================================

/**
 * Record touch start position for swipe gesture
 * @param {TouchEvent} e - Touch start event
 */
const handleTouchStart = (e) => {
  touchStartY = e.touches[0].clientY;
};

/**
 * Handle touch move - translate panel as user swipes down
 * @param {TouchEvent} e - Touch move event
 */
const handleTouchMove = (e) => {
  touchDeltaY = e.touches[0].clientY - touchStartY;
  // Only allow downward swipe (positive delta)
  if (touchDeltaY > 0 && panelRef.value) {
    panelRef.value.style.transform = `translateY(${touchDeltaY}px)`;
  }
};

/**
 * Handle touch end - close panel if swiped far enough, otherwise reset
 * Threshold: 100px swipe distance triggers close
 */
const handleTouchEnd = () => {
  if (touchDeltaY > 100) {
    emit("close");
  }
  // Reset panel position
  if (panelRef.value) {
    panelRef.value.style.transform = "";
  }
  touchDeltaY = 0;
};
</script>

<!-- ============================================================================
     SCOPED STYLES - Liquid glass design and animations
     ============================================================================ -->
<style scoped>
/* ===========================================================================
   SLIDE-UP TRANSITION
   Animation for panel enter/leave
   =========================================================================== */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}

/* Panel slides up from bottom */
.slide-up-enter-from > div:last-child,
.slide-up-leave-to > div:last-child {
  transform: translateY(100%);
}

/* ===========================================================================
   LIQUID GLASS PANEL STYLES
   Glassmorphism effect with blur and subtle gradients
   =========================================================================== */
.liquid-panel {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.02),
    rgba(255, 255, 255, 0.01)
  );
  border: 1px solid rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  box-shadow:
    0 12px 30px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.02);
}

/* Drag handle indicator at top of panel */
.drag-handle {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.12),
    rgba(255, 255, 255, 0.04)
  );
}

/* Header row with subtle border */
.header-row {
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  padding-bottom: 14px;
}

.header-row h2 {
  color: rgba(255, 255, 255, 0.95);
}

/* ===========================================================================
   APPLY BUTTON STYLES
   Gradient button with hover effects
   =========================================================================== */
.liquid-apply {
  background: linear-gradient(
    135deg,
    rgba(0, 240, 255, 0.12),
    rgba(0, 163, 204, 0.08)
  );
  color: #001b1e;
  border-radius: 12px;
  padding: 12px 16px;
}

.liquid-apply:hover {
  transform: translateY(-2px);
}

/* Prominent variant - solid gradient background */
.liquid-apply.prominent {
  background: linear-gradient(135deg, #00f0ff 0%, #00a3cc 100%);
  color: #001b1e;
  box-shadow:
    0 8px 30px rgba(0, 240, 255, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.2);
  font-weight: 800;
  border-radius: 12px;
}

.liquid-apply.prominent:hover {
  transform: translateY(-4px);
  box-shadow:
    0 12px 40px rgba(0, 240, 255, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
}

/* Custom scrollbar sizing */
.flex-1::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
</style>
