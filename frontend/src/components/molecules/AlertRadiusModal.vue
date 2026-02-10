<!--
  ============================================================================
  AlertRadiusModal.vue - Modal for configuring alert radius
  ============================================================================
  
  PURPOSE:
  Modal dialog that allows users to configure the radius around their location
  for receiving observation alerts. Users can set a distance in kilometers
  to define their alert zone.
  
  FEATURES:
  - Range slider for radius selection (1-200 km by default)
  - Two-way binding with v-model support
  - Cancel/Confirm actions
  - Liquid glass design aesthetic
  
  USAGE EXAMPLES:
  <AlertRadiusModal
    :value="50"
    :min="1"
    :max="200"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
  
  PROPS:
  - value: Number (default: 50) - Current radius value in km
  - min: Number (default: 1) - Minimum radius value
  - max: Number (default: 200) - Maximum radius value
  - step: Number (default: 1) - Step increment for slider
  
  EVENTS:
  - @confirm(value) - Emitted when user clicks save with the new radius value
  - @cancel - Emitted when user clicks cancel
  - @update:value(value) - Emitted when radius value changes (v-model support)
  ============================================================================
-->

<template>
  <!-- Full-screen modal overlay with centered content -->
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Modal card with liquid glass styling -->
    <div
      class="modal relative surface-card rounded-2xl p-6 w-full max-w-md border border-white/10"
    >
      <!-- Modal title -->
      <h3 class="text-lg font-semibold mb-3">Rayon d'alerte</h3>

      <div class="space-y-4">
        <RangeInput
          v-model="localValue"
          :min="min"
          :max="max"
          :step="step"
          label="Rayon (km)"
        />
        <p class="text-sm text-white/60">
          Le rayon détermine la distance autour de vous pour recevoir des
          alertes.
        </p>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <BaseButton variant="ghost" @click="$emit('cancel')"
          >Annuler</BaseButton
        >
        <BaseButton variant="primary" @click="confirm">Enregistrer</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * AlertRadiusModal - Modal component for alert radius configuration
 * Design System: Phenom Search - Dark theme with cyan accents
 */
import { ref, watch } from "vue";
import { RangeInput, BaseButton } from "@/components/atoms";

// ============================================================================
// PROPS DEFINITION
// ============================================================================
// value: Current radius value in kilometers
// min/max: Range boundaries for the slider
// step: Increment step for the slider
// eslint-disable-next-line no-unused-vars
const props = defineProps({
  value: { type: Number, default: 50 },
  min: { type: Number, default: 1 },
  max: { type: Number, default: 200 },
  step: { type: Number, default: 1 },
});

// ============================================================================
// EVENTS
// ============================================================================
const emit = defineEmits(["confirm", "cancel", "update:value"]);

// ============================================================================
// LOCAL STATE
// ============================================================================
// Local copy of the value to allow changes without immediately affecting parent
const localValue = ref(props.value);

// ============================================================================
// WATCHERS
// ============================================================================
// Sync local value when prop changes from parent
watch(
  () => props.value,
  (v) => {
    localValue.value = v;
  },
);

// Emit update event when local value changes (v-model support)
watch(localValue, (v) => emit("update:value", v));

// ============================================================================
// METHODS
// ============================================================================
/**
 * Confirm the radius selection and emit the value to parent
 */
const confirm = () => {
  emit("confirm", localValue.value);
};
</script>

<style scoped>
.modal {
  background: var(--phenom-navy);
}
</style>
