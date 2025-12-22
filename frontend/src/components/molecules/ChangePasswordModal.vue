<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="modal relative surface-card rounded-2xl p-6 w-full max-w-md border border-white/10">
      <h3 class="text-lg font-semibold mb-3">Changer le mot de passe</h3>

      <form @submit.prevent="onSubmit" class="space-y-3">
        <TextInput v-model="form.currentPassword" type="password" placeholder="Ancien mot de passe" autocomplete="current-password" />
        <TextInput v-model="form.newPassword" type="password" placeholder="Nouveau mot de passe" autocomplete="new-password" />
        <TextInput v-model="form.confirmPassword" type="password" placeholder="Confirmer le mot de passe" autocomplete="new-password" />

        <div class="flex justify-end gap-2 mt-2">
          <BaseButton type="button" variant="ghost" @click="$emit('cancel')">Annuler</BaseButton>
          <BaseButton type="submit" variant="primary">Changer</BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import { TextInput, BaseButton } from '@/components/atoms';
const emit = defineEmits(['confirm','cancel']);
const form = reactive({ currentPassword: '', newPassword: '', confirmPassword: '' });

const onSubmit = () => {
  emit('confirm', { currentPassword: form.currentPassword, newPassword: form.newPassword, confirmPassword: form.confirmPassword });
};
</script>

<style scoped>
.modal { background: var(--phenom-navy); }
</style>
