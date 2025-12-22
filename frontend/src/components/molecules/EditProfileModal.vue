<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="modal relative surface-card rounded-2xl p-6 w-full max-w-md border border-white/10">
        <h3 class="text-lg font-semibold mb-3">Modifier le profil</h3>

        <div class="space-y-3">
          <TextInput v-model="local.name" placeholder="Nom" />
          <TextInput v-model="local.email" type="email" placeholder="Email" />
          <TextArea v-model="local.bio" placeholder="Bio" :rows="3" />
        </div>

        <div class="flex justify-end gap-2 mt-4">
          <BaseButton variant="ghost" @click="$emit('cancel')">Annuler</BaseButton>
          <BaseButton variant="primary" @click="onConfirm">Enregistrer</BaseButton>
        </div>
      </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { TextInput, TextArea, BaseButton } from '@/components/atoms';

const props = defineProps({ name: { type: String, default: '' }, bio: { type: String, default: '' }, email: { type: String, default: '' } });
const emit = defineEmits(['confirm','cancel']);

const local = reactive({ name: props.name, bio: props.bio, email: props.email });

const onConfirm = () => {
  emit('confirm', { name: local.name, bio: local.bio, email: local.email });
};
</script>

<style scoped>
.modal { background: var(--phenom-navy); }
</style>
