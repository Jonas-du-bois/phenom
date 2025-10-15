<!-- Modal/Dialog réutilisable -->
<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay">
      <div class="modal-content">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<script setup>
// Props pour isOpen, événements close
</script>

<style scoped>
/* Styles du modal avec backdrop blur */
</style>
