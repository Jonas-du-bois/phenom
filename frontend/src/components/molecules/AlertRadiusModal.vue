<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="modal relative surface-card rounded-2xl p-6 w-full max-w-md border border-white/10">
      <h3 class="text-lg font-semibold mb-3">Rayon d'alerte</h3>

      <div class="space-y-4">
        <RangeInput v-model="localValue" :min="min" :max="max" :step="step" label="Rayon (km)" />
        <p class="text-sm text-white/60">Le rayon détermine la distance autour de vous pour recevoir des alertes.</p>
      </div>

      <div class="flex justify-end gap-2 mt-4">
        <BaseButton variant="ghost" @click="$emit('cancel')">Annuler</BaseButton>
        <BaseButton variant="primary" @click="confirm">Enregistrer</BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { RangeInput, BaseButton } from '@/components/atoms';

const props = defineProps({ value: { type: Number, default: 50 }, min: { type: Number, default: 1 }, max: { type: Number, default: 200 }, step: { type: Number, default: 1 } });
const emit = defineEmits(['confirm','cancel','update:value']);

const localValue = ref(props.value);

watch(() => props.value, (v) => { localValue.value = v; });
watch(localValue, (v) => emit('update:value', v));

const confirm = () => {
  emit('confirm', localValue.value);
};
</script>

<style scoped>
.modal { background: var(--phenom-navy); }
</style>
