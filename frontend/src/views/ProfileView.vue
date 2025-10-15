<!-- Vue profil utilisateur -->
<template>
  <div class="profile-view">
    <ProfileHeader />
    <ProfileStats />
    <ActivityList />
    <AdminAccessButton v-if="isAdmin" />
    <BottomNav />
  </div>
</template>

<script setup>
// Récupération profil utilisateur
// Navigation vers admin si admin
</script>

<style scoped>
/* Profile layout */
</style>
