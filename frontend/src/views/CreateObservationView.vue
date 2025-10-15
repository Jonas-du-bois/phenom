<!-- Vue création d'observation -->
<template>
  <div class="create-observation-view">
    <PageContainer>
      <CameraInterface v-if="step === 'camera'" />
      <ObservationForm v-else />
    </PageContainer>
  </div>
</template>

<script setup>
// Gestion des étapes: camera -> form
// Submit observation
</script>

<style scoped>
/* Page layout */
</style>
