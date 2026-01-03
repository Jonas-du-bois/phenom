<!--
  ============================================================================
  EditProfileModal.vue - Modal for editing user profile
  ============================================================================
  
  PURPOSE:
  Modal dialog that allows users to edit their profile information
  including name, email, and bio. Changes are sent to parent on confirm.
  
  FEATURES:
  - Name input field
  - Email input field
  - Bio textarea for longer text
  - Cancel/Confirm actions
  - Local state to allow editing without immediate parent update
  - Liquid glass design aesthetic
  
  USAGE EXAMPLES:
  <EditProfileModal
    :name="user.name"
    :email="user.email"
    :bio="user.bio"
    @confirm="handleProfileUpdate"
    @cancel="closeModal"
  />
  
  PROPS:
  - name: String (default: '') - Current user name
  - email: String (default: '') - Current user email
  - bio: String (default: '') - Current user bio
  
  EVENTS:
  - @confirm({ name, email, bio }) - Emitted with updated profile data
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
      <h3 class="text-lg font-semibold mb-3">Modifier le profil</h3>

      <!-- Profile edit form -->
      <div class="space-y-3">
        <!-- Name input -->
        <TextInput v-model="local.name" placeholder="Nom" />
        <!-- Email input -->
        <TextInput v-model="local.email" type="email" placeholder="Email" />
        <!-- Bio textarea -->
        <TextArea v-model="local.bio" placeholder="Bio" :rows="3" />
      </div>

      <!-- Action buttons -->
      <div class="flex justify-end gap-2 mt-4">
        <BaseButton variant="ghost" @click="$emit('cancel')"
          >Annuler</BaseButton
        >
        <BaseButton variant="primary" @click="onConfirm"
          >Enregistrer</BaseButton
        >
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * EditProfileModal - Profile editing modal component
 * Design System: Phenom Search - Dark theme with cyan accents
 */
import { reactive } from "vue";
import { TextInput, TextArea, BaseButton } from "@/components/atoms";

// ============================================================================
// PROPS DEFINITION
// ============================================================================
const props = defineProps({
  name: { type: String, default: "" }, // User's display name
  bio: { type: String, default: "" }, // User's bio/description
  email: { type: String, default: "" }, // User's email address
});

// ============================================================================
// EVENTS
// ============================================================================
const emit = defineEmits(["confirm", "cancel"]);

// ============================================================================
// LOCAL STATE
// ============================================================================
// Local copy of profile data for editing without affecting parent until confirm
const local = reactive({
  name: props.name,
  bio: props.bio,
  email: props.email,
});

// ============================================================================
// METHODS
// ============================================================================
/**
 * Confirm the profile changes and emit updated data to parent
 */
const onConfirm = () => {
  emit("confirm", {
    name: local.name,
    bio: local.bio,
    email: local.email,
  });
};
</script>

<style scoped>
/* Modal background using design system navy color */
.modal {
  background: var(--phenom-navy);
}
</style>
