<!--
  ============================================================================
  ChangePasswordModal.vue - Modal for changing user password
  ============================================================================
  
  PURPOSE:
  Modal dialog that allows authenticated users to change their password.
  Collects current password and new password with confirmation.
  
  FEATURES:
  - Current password input for verification
  - New password input with confirmation
  - Form validation handled by parent
  - Cancel/Confirm actions
  - Liquid glass design aesthetic
  
  USAGE EXAMPLES:
  <ChangePasswordModal
    @confirm="handlePasswordChange"
    @cancel="closeModal"
  />
  
  PROPS: None
  
  EVENTS:
  - @confirm({ currentPassword, newPassword, confirmPassword }) - Form data
  - @cancel - Emitted when user cancels the operation
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
      <h3 class="text-lg font-semibold mb-3">Changer le mot de passe</h3>

      <!-- Password change form -->
      <form @submit.prevent="onSubmit" class="space-y-3">
        <!-- Current password input -->
        <TextInput
          v-model="form.currentPassword"
          type="password"
          placeholder="Ancien mot de passe"
          autocomplete="current-password"
        />
        <!-- New password input -->
        <TextInput
          v-model="form.newPassword"
          type="password"
          placeholder="Nouveau mot de passe"
          autocomplete="new-password"
        />
        <!-- Confirm new password input -->
        <TextInput
          v-model="form.confirmPassword"
          type="password"
          placeholder="Confirmer le mot de passe"
          autocomplete="new-password"
        />

        <!-- Action buttons -->
        <div class="flex justify-end gap-2 mt-2">
          <BaseButton type="button" variant="ghost" @click="$emit('cancel')"
            >Annuler</BaseButton
          >
          <BaseButton type="submit" variant="primary">Changer</BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
/**
 * ChangePasswordModal - Password change form modal
 * Design System: Phenom Search - Dark theme with cyan accents
 */
import { reactive } from "vue";
import { TextInput, BaseButton } from "@/components/atoms";

// ============================================================================
// EVENTS
// ============================================================================
const emit = defineEmits(["confirm", "cancel"]);

// ============================================================================
// LOCAL STATE
// ============================================================================
// Form state for password fields
const form = reactive({
  currentPassword: "", // Current password for verification
  newPassword: "", // New password
  confirmPassword: "", // Password confirmation
});

// ============================================================================
// METHODS
// ============================================================================
/**
 * Handle form submission - emit all password fields to parent
 * Parent is responsible for validation and API call
 */
const onSubmit = () => {
  emit("confirm", {
    currentPassword: form.currentPassword,
    newPassword: form.newPassword,
    confirmPassword: form.confirmPassword,
  });
};
</script>

<style scoped>
/* Modal background using design system navy color */
.modal {
  background: var(--phenom-navy);
}
</style>
