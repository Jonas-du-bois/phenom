<!-- Vue dashboard admin -->
<template>
  <div class="admin-dashboard-view">
    <AdminSidebar />
    <div class="admin-content">
      <AdminStatsGrid v-if="section === 'overview'" />
      <AdminPostsTable v-if="section === 'posts'" />
      <AdminUsersTable v-if="section === 'users'" />
    </div>
  </div>
</template>

<script setup>
// Gestion des sections admin
// Actions sur posts et users
</script>

<style scoped>
/* Admin layout avec sidebar */
</style>
