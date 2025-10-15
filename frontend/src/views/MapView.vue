<!-- Vue de la carte interactive -->
<template>
  <div class="map-view">
    <MapContainer />
    <MapControls />
    <MapLegend />
    <MapBottomSheet v-if="selectedArea" />
  </div>
</template>

<script setup>
// Gestion de la carte, markers, sélection
</script>

<style scoped>
/* Full screen map layout */
</style>
