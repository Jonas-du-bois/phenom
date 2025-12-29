<template>
  <Teleport to="body">
    <Transition name="slide-up">
      <div v-if="isOpen" class="fixed inset-0 z-50">
        <!-- Backdrop (liquid glass subtle) -->
        <div
          class="absolute inset-0 bg-[rgba(255,255,255,0.02)] backdrop-blur-2xl"
          @click="$emit('close')"
        />

        <!-- Panel (liquid glass card) -->
        <div
          ref="panelRef"
          class="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-2xl overflow-hidden flex flex-col liquid-panel"
          :style="{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }"
          @touchstart="handleTouchStart"
          @touchmove="handleTouchMove"
          @touchend="handleTouchEnd"
        >
          <!-- Drag handle -->
          <div class="flex justify-center py-3">
            <div class="w-12 h-1.5 rounded-full drag-handle" />
          </div>

          <!-- Header -->
          <div class="flex items-center justify-between px-4 pb-4 header-row">
            <h2 class="text-lg font-semibold text-white/90">Filtres</h2>
            <button @click="handleReset" class="text-sm text-[#00F0FF] font-medium">
              Réinitialiser
            </button>
          </div>

          <!-- Scrollable content -->
          <div class="flex-1 overflow-y-auto overscroll-contain p-4 space-y-6">
            <!-- UFO Shapes -->
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

            <!-- Phenomena -->
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

            <!-- Observer Types -->
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

            <!-- Countries (if available) -->
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

            <!-- Date Range -->
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

            <!-- Credibility -->
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

            <!-- Strangeness -->
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

            <!-- Location radius -->
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

            <!-- Has media -->
            <div class="flex items-center justify-between py-2">
              <span class="text-white">Avec média uniquement</span>
              <BaseToggle v-model="filters.hasMedia" />
            </div>

            <!-- Verified only -->
            <div class="flex items-center justify-between py-2">
              <span class="text-white">Vérifiées uniquement</span>
              <BaseToggle v-model="filters.verifiedOnly" />
            </div>
          </div>

          <!-- Apply button (hidden when instant apply enabled) -->
          <div v-if="!props.instant" class="p-4 border-t border-transparent">
            <BaseButton variant="primary" class="w-full liquid-apply prominent" @click="handleApply">
              Appliquer les filtres
            </BaseButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
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

defineOptions({ name: "FilterPanel" });

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  // When true, filters are applied immediately on change and the Apply button is hidden
  instant: {
    type: Boolean,
    default: true,
  },
  initialFilters: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close", "apply", "reset"]);

const filterStore = useFilterStore();
const {
  ufoShapeOptions,
  phenomenaOptions,
  observerTypeOptions,
  countryOptions,
  loading,
} = storeToRefs(filterStore);

// Charger les filtres depuis l'API au mount
onMounted(async () => {
  if (!filterStore.isInitialized) {
    await filterStore.initialize();
  }
});

const defaultFilters = {
  ufoShapes: [],
  phenomena: [],
  observerTypes: [],
  countries: [],
  dateFrom: "",
  dateTo: "",
  minCredibility: 0,
  minStrangeness: 0,
  radius: 50,
  hasMedia: false,
  verifiedOnly: false,
};

const filters = reactive({ ...defaultFilters });
const panelRef = ref(null);
let touchStartY = 0;
let touchDeltaY = 0;

// Sync with initial filters
watch(
  () => props.initialFilters,
  (newFilters) => {
    Object.assign(filters, { ...defaultFilters, ...newFilters });
  },
  { immediate: true, deep: true },
);

const toggleUfoShape = (code) => {
  const index = filters.ufoShapes.indexOf(code);
  if (index === -1) {
    filters.ufoShapes.push(code);
  } else {
    filters.ufoShapes.splice(index, 1);
  }
};

const togglePhenomenon = (code) => {
  const index = filters.phenomena.indexOf(code);
  if (index === -1) {
    filters.phenomena.push(code);
  } else {
    filters.phenomena.splice(index, 1);
  }
};

const toggleObserverType = (code) => {
  const index = filters.observerTypes.indexOf(code);
  if (index === -1) {
    filters.observerTypes.push(code);
  } else {
    filters.observerTypes.splice(index, 1);
  }
};

const selectCountry = (code) => {
  // Un seul pays à la fois (comportement radio)
  if (filters.countries.includes(code)) {
    filters.countries = [];
  } else {
    filters.countries = [code];
  }
};

const handleReset = () => {
  Object.assign(filters, defaultFilters);
  emit("reset");
  if (props.instant) {
    emit("apply", { ...filters });
  }
};

const handleApply = () => {
  emit("apply", { ...filters });
  emit("close");
};

// Emit immediate apply on filters change when `instant` enabled
import { nextTick } from "vue";
let _initialized = false;
onMounted(async () => {
  await nextTick();
  _initialized = true;
});

watch(
  () => filters,
  (newVal) => {
    if (!props.instant) return;
    if (!_initialized) return;
    if (!props.isOpen) return;
    emit("apply", { ...newVal });
  },
  { deep: true },
);

// Swipe to close
const handleTouchStart = (e) => {
  touchStartY = e.touches[0].clientY;
};

const handleTouchMove = (e) => {
  touchDeltaY = e.touches[0].clientY - touchStartY;
  if (touchDeltaY > 0 && panelRef.value) {
    panelRef.value.style.transform = `translateY(${touchDeltaY}px)`;
  }
};

const handleTouchEnd = () => {
  if (touchDeltaY > 100) {
    emit("close");
  }
  if (panelRef.value) {
    panelRef.value.style.transform = "";
  }
  touchDeltaY = 0;
};
</script>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
}

.slide-up-enter-from > div:last-child,
.slide-up-leave-to > div:last-child {
  transform: translateY(100%);
}

/* Liquid glass styles */
.liquid-panel {
  background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
  border: 1px solid rgba(255,255,255,0.06);
  backdrop-filter: blur(18px) saturate(140%);
  -webkit-backdrop-filter: blur(18px) saturate(140%);
  box-shadow: 0 12px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.02);
}

.drag-handle {
  background: linear-gradient(90deg, rgba(255,255,255,0.12), rgba(255,255,255,0.04));
}

.header-row {
  border-bottom: 1px solid rgba(255,255,255,0.03);
  padding-bottom: 14px;
}

.header-row h2 {
  color: rgba(255,255,255,0.95);
}

.liquid-apply {
  background: linear-gradient(135deg, rgba(0,240,255,0.12), rgba(0,163,204,0.08));
  color: #001b1e;
  border-radius: 12px;
  padding: 12px 16px;
}

.liquid-apply:hover {
  transform: translateY(-2px);
}

.liquid-apply.prominent {
  background: linear-gradient(135deg, #00F0FF 0%, #00A3CC 100%);
  color: #001b1e;
  box-shadow: 0 8px 30px rgba(0,240,255,0.18), inset 0 1px 0 rgba(255,255,255,0.2);
  font-weight: 800;
  border-radius: 12px;
}

.liquid-apply.prominent:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0,240,255,0.22), inset 0 1px 0 rgba(255,255,255,0.25);
}

.flex-1::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}
</style>
